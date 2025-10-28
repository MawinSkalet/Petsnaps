// src/pages/ChatPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  directChatId,
  ensureDirectChat,
  listenMessages,
  listenMyChats,
  sendMessage,
  sendImageMessage,
  setTyping,
  setLastSeen,
} from "../services/chatApi";

const formatTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

const debounce = (fn, ms = 800) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function ChatPage() {
  const { user } = useAuth();
  const me = user?.uid;

  const [allUsers, setAllUsers] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [other, setOther] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingURL, setPendingURL] = useState("");
  const endRef = useRef(null);

  // Load users (simple directory)
  useEffect(() => {
    if (!me) return;
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.uid !== me);
      setAllUsers(list);
    })();
  }, [me]);

  // My chat list
  useEffect(() => {
    if (!me) return;
    return listenMyChats(me, setChatList);
  }, [me]);

  // Open chat with another user (ensures chat doc exists)
  async function openChatWith(targetUser) {
    if (!me || !targetUser?.uid) return;
    setOther(targetUser);
    const { id } = await ensureDirectChat(me, targetUser.uid);
    setChatId(id);
    await setLastSeen(id, me);                 // mark seen immediately
  }

  // Live messages in active chat
  useEffect(() => {
    if (!chatId) return;
    const unsub = listenMessages(chatId, (rows) => {
      setMessages(rows);
      // scroll to bottom
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
      // update my lastSeen on every new message
      if (me) setLastSeen(chatId, me).catch(() => {});
    });
    return unsub;
  }, [chatId, me]);

  // Typing indicator from chat doc
  useEffect(() => {
    if (!chatId || !me) return;
    const unsub = onSnapshot(doc(db, "chats", chatId), (snap) => {
      const typing = snap.data()?.typing || {};
      const someoneElseTyping = Object.entries(typing).some(([uid, val]) => uid !== me && val);
      setTypingIndicator(someoneElseTyping);
    });
    return unsub;
  }, [chatId, me]);

  const stopTypingDebounced = useMemo(
    () => debounce(() => chatId && me && setTyping(chatId, me, false), 1000),
    [chatId, me]
  );

  // Compute "Seen" using chat.lastSeen[otherUid] >= msg.createdAt
  const otherSeenMap = useMemo(() => {
    // subscribe to chat doc to read lastSeen map
    // (reuse the same snapshot from typing effect)
    return null;
  }, [chatId]);

  async function handleSend(e) {
    e?.preventDefault?.();
    if (!text.trim() || !chatId || !me) return;
    await sendMessage(chatId, { senderId: me, text: text.trim() });
    setText("");
    await setTyping(chatId, me, false);
  }

  async function handleImageSend(file) {
    if (!file || !chatId || !me) return;
    const path = `chats/${chatId}/${me}/${Date.now()}_${file.name}`;
    const r = sref(storage, path);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await sendImageMessage(chatId, { senderId: me, imageUrl: url });
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl shadow overflow-hidden">
      {/* Left: users + my chats */}
      <div className="w-1/3 border-r border-[#E2B887]/30 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-[#8B6F47] mb-3">Messages</h2>

        {/* People directory */}
        <div className="mb-4">
          <div className="text-xs text-[#8B6F47]/60 mb-1">Start new chat</div>
          <ul className="space-y-1">
            {allUsers.map(u => (
              <li key={u.uid}>
                <button
                  onClick={() => openChatWith(u)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#FFF4E6]"
                >
                  <img src={u.photoURL || "https://i.pravatar.cc/48?img=1"} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm text-[#8B6F47]">{u.displayName || u.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* My recent chats */}
        <div>
          <div className="text-xs text-[#8B6F47]/60 mb-1">Recent</div>
          <ul className="space-y-1">
            {chatList.map(c => {
              const others = (c.participants || []).filter(id => id !== me).join(", ");
              return (
                <li key={c.id}>
                  <button
                    onClick={() => openChatWith({ uid: directChatId(...(c.participants || [])).replace(`${me}_`, "").replace(`_${me}`, "") })} // best-effort
                    className={`w-full text-left p-2 rounded hover:bg-[#FFF4E6] ${c.id === chatId ? "bg-[#FFF4E6]" : ""}`}
                  >
                    <div className="text-sm text-[#8B6F47]">{others || "Chat"}</div>
                    <div className="text-xs text-[#8B6F47]/60">{c.lastMessageText || ""}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Right: active chat */}
      <div className="w-2/3 flex flex-col">
        {other ? (
          <>
            <div className="bg-[#F5F5F5] p-4 border-b border-[#E2B887]/30 flex items-center gap-3">
              <img
                src={other.photoURL || "https://i.pravatar.cc/40?img=2"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-xl font-bold text-[#8B6F47]">
                {other.displayName || other.email || "User"}
              </h3>
              {typingIndicator && <span className="text-xs text-[#8B6F47]/70 ml-2">typing…</span>}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-[#8B6F47]/60">Start a conversation!</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === me ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl ${m.senderId === me ? "bg-[#E2B887] text-white" : "bg-[#F5F5F5] text-[#8B6F47]"}`}>
                      {m.imageUrl ? (
                        <img src={m.imageUrl} className="rounded-lg w-full max-w-[220px] object-cover" />
                      ) : (
                        <p>{m.text}</p>
                      )}
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(m.createdAt?.toDate?.() || m.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* pending image preview */}
            {pendingImage && (
              <div className="px-4 pt-3 pb-2 border-t border-[#E2B887]/30 bg-[#FFF8EF] flex items-center gap-3 justify-between">
                <img src={pendingURL} className="w-20 h-20 rounded-lg object-cover border shadow-sm" />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const f = pendingImage;
                      setPendingImage(null); setPendingURL("");
                      await handleImageSend(f);
                    }}
                    className="px-4 py-2 bg-[#E2B887] text-white rounded-lg hover:bg-[#D4A77C]"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      if (pendingURL) URL.revokeObjectURL(pendingURL);
                      setPendingImage(null); setPendingURL("");
                    }}
                    className="px-4 py-2 border border-[#E2B887]/60 rounded-lg text-[#8B6F47] hover:bg-[#FFF1DF]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* composer */}
            <form
              onSubmit={async (e) => { e.preventDefault(); await handleSend(); }}
              className="p-4 border-t border-[#E2B887]/30 flex items-center gap-3"
            >
              <input
                className="flex-1 p-3 border border-[#E2B887]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2B887] text-[#8B6F47] placeholder-[#8B6F47]/50"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (chatId && me) { setTyping(chatId, me, true).catch(()=>{}); stopTypingDebounced(); }
                }}
              />
              <input
                type="file"
                accept="image/*"
                id="chat-file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setPendingImage(f);
                  setPendingURL(URL.createObjectURL(f));
                }}
              />
              <label htmlFor="chat-file" className="cursor-pointer bg-[#FFE7CC] text-[#8B6F47] px-3 py-3 rounded-full border border-[#E2B887]/60">📷</label>
              <button className="bg-[#E2B887] text-white px-4 py-3 rounded-full hover:bg-[#D4A77C]">Send</button>
            </form>
          </>
        ) : (
          <div className="w-full h-full grid place-items-center text-[#8B6F47]/60">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
