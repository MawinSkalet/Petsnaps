// src/pages/ChatPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  addDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { Send } from "lucide-react";
import { storage } from "../firebase";
import { getDownloadURL, ref as sref, uploadBytes } from "firebase/storage";

// helpers
const chatIdFor = (a, b) => [a, b].sort().join("_");
const debounce = (fn, ms = 600) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

export default function ChatPage() {
  const { user } = useAuth();

  const [allUsers, setAllUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Image preview
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingURL, setPendingURL] = useState("");

  // load users (exclude me)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.uid !== user.uid);
      setAllUsers(list);
    })();
  }, [user]);

  // ensure chat + open
  async function openChatWith(other) {
    if (!user || !other?.uid) return;

    const id = chatIdFor(user.uid, other.uid);
    setSelectedChatUser(other);
    setActiveChatId(id);

    await setDoc(
      doc(db, "chats", id),
      {
        members: [user.uid, other.uid],
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
      },
      { merge: true }
    );

    markSeen(id, user.uid).catch(() => {});
  }

  // live messages
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(
      collection(db, "chats", activeChatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          _ts: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          seenBy: Array.isArray(data.seenBy) ? data.seenBy : [],
        };
      });
      setMessages(rows);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);

      if (activeChatId && user) {
        markSeen(activeChatId, user.uid).catch(() => {});
      }
    });

    return unsub;
  }, [activeChatId, user]);

  // listen typing
  useEffect(() => {
    if (!activeChatId || !user) return;
    const chatRef = doc(db, "chats", activeChatId);
    const unsub = onSnapshot(chatRef, (snap) => {
      const typing = snap.data()?.typing || {};
      const otherTyping = Object.keys(typing).some(
        (uid) => uid !== user.uid && typing[uid] === true
      );
      setIsOtherTyping(otherTyping);
    });
    return unsub;
  }, [activeChatId, user]);

  // mark seen
  async function markSeen(chatId, myUid) {
    const msgsQ = query(
      collection(db, "chats", chatId, "messages"),
      where("senderId", "!=", myUid)
    );
    const snap = await getDocs(msgsQ);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.forEach((d) => {
      const data = d.data();
      const seenBy = Array.isArray(data.seenBy) ? data.seenBy : [];
      if (!seenBy.includes(myUid)) {
        batch.update(d.ref, { seenBy: [...seenBy, myUid] });
      }
    });
    await batch.commit();
  }

  // send text
  async function handleSendMessage(e) {
    e?.preventDefault?.();
    if (!newMessage.trim() || !activeChatId || !user) return;

    const text = newMessage.trim();
    setNewMessage("");

    updateDoc(doc(db, "chats", activeChatId), {
      [`typing.${user.uid}`]: false,
    }).catch(() => {});

    await addDoc(collection(db, "chats", activeChatId, "messages"), {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      seenBy: [user.uid],
    });

    await updateDoc(doc(db, "chats", activeChatId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
  }

  // send image
  async function handleSendImage(file) {
    if (!file || !activeChatId || !user) return;

    const path = `chats/${activeChatId}/${user.uid}/${Date.now()}_${file.name}`;
    const r = sref(storage, path);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);

    await addDoc(collection(db, "chats", activeChatId, "messages"), {
      senderId: user.uid,
      imageUrl: url,
      createdAt: serverTimestamp(),
      seenBy: [user.uid],
    });

    await updateDoc(doc(db, "chats", activeChatId), {
      lastMessage: "📷 Photo",
      lastMessageAt: serverTimestamp(),
    });
  }

  const debouncedStopTyping = useMemo(
    () =>
      debounce(() => {
        if (activeChatId && user) {
          updateDoc(doc(db, "chats", activeChatId), {
            [`typing.${user.uid}`]: false,
          }).catch(() => {});
        }
      }, 1000),
    [activeChatId, user]
  );

  // render
  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl shadow overflow-hidden">
      {/* Left list */}
      <div className="w-1/3 border-r border-[#E2B887]/30 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-[#8B6F47] mb-3">Messages</h2>
        {allUsers.length === 0 ? (
          <p className="text-[#8B6F47]/60">No other users yet.</p>
        ) : (
          <ul className="space-y-2">
            {allUsers.map((u) => (
              <li key={u.uid}>
                <button
                  onClick={() => openChatWith(u)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#FFF4E6] transition ${
                    selectedChatUser?.uid === u.uid ? "bg-[#FFF4E6]" : ""
                  }`}
                >
                  <img
                    src={u.photoURL || "https://i.pravatar.cc/48?img=1"}
                    alt={u.displayName || u.email || "user"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="text-[#8B6F47] font-semibold">
                      {u.displayName || u.email}
                    </div>
                    <div className="text-xs text-[#8B6F47]/60">{u.email}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: chat */}
      <div className="w-2/3 flex flex-col">
        {selectedChatUser ? (
          <>
            <div className="bg-[#F5F5F5] p-4 border-b border-[#E2B887]/30 flex items-center space-x-3">
              <img
                src={selectedChatUser.photoURL || "https://i.pravatar.cc/40?img=2"}
                alt={selectedChatUser.displayName || selectedChatUser.petName || "user"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-xl font-bold text-[#8B6F47]">
                {selectedChatUser.petName ||
                  selectedChatUser.displayName ||
                  selectedChatUser.email}
              </h3>
              {isOtherTyping && (
                <span className="text-xs text-[#8B6F47]/70 ml-2">typing…</span>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-[#8B6F47]/60">Start a conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        msg.senderId === user.uid
                          ? "bg-[#E2B887] text-white"
                          : "bg-[#F5F5F5] text-[#8B6F47]"
                      }`}
                    >
                      {msg.imageUrl ? (
                        <img
                          src={msg.imageUrl}
                          alt="sent"
                          className="rounded-lg w-full max-w-[200px] object-cover"
                        />
                      ) : (
                        <p>{msg.text}</p>
                      )}

                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(msg._ts)}
                      </span>

                      {msg.senderId === user.uid &&
                        Array.isArray(msg.seenBy) &&
                        msg.seenBy.length > 1 && (
                          <span className="text-[10px] opacity-70 mt-1 block text-right">
                            Seen
                          </span>
                        )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {pendingImage && (
              <div className="px-4 pt-3 pb-2 border-t border-[#E2B887]/30 bg-[#FFF8EF] flex items-center gap-3 justify-between">
                <img
                  src={pendingURL}
                  alt="preview"
                  className="w-20 h-20 rounded-lg object-cover border shadow-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const f = pendingImage;
                      setPendingImage(null);
                      setPendingURL("");
                      await handleSendImage(f);
                    }}
                    className="px-4 py-2 bg-[#E2B887] text-white rounded-lg hover:bg-[#D4A77C]"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      if (pendingURL) URL.revokeObjectURL(pendingURL);
                      setPendingImage(null);
                      setPendingURL("");
                    }}
                    className="px-4 py-2 border border-[#E2B887]/60 rounded-lg text-[#8B6F47] hover:bg-[#FFF1DF]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#E2B887]/30 flex items-center space-x-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (activeChatId && user) {
                    updateDoc(doc(db, "chats", activeChatId), {
                      [`typing.${user.uid}`]: true,
                    }).catch(() => {});
                    debouncedStopTyping();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 p-3 border border-[#E2B887]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2B887] text-[#8B6F47] placeholder-[#8B6F47]/50"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setPendingImage(f);
                  const url = URL.createObjectURL(f);
                  setPendingURL(url);
                }}
                className="hidden"
                id="chat-upload"
              />
              <label
                htmlFor="chat-upload"
                className="cursor-pointer bg-[#FFE7CC] text-[#8B6F47] px-3 py-3 rounded-full border border-[#E2B887]/60"
                title="Send photo"
              >
                📷
              </label>
              <button
                type="submit"
                className="bg-[#E2B887] text-white p-3 rounded-full hover:bg-[#D4A77C] transition-colors"
                title="Send"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-[#8B6F47]/60">
            <p className="text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}