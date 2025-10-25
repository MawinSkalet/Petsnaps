import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

const chatIdFor = (a, b) => [a, b].sort().join("_");

/** Ensure a 1:1 chat exists and return {id, ref} */
export async function ensureChat(uidA, uidB) {
  const id = chatIdFor(uidA, uidB);
  const ref = doc(db, "chats", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      members: [uidA, uidB],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }
  return { id, ref };
}

/** Live list of chats for a user (ordered by lastMessageAt desc) */
export function listenToMyChats(uid, cb) {
  const q = query(
    collection(db, "chats"),
    where("members", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Live messages in a chat (ascending by time) */
export function listenToMessages(chatId, cb) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Send a message and update chat preview */
export async function sendMessage(chatId, senderId, text) {
  const msgRef = await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
  return msgRef.id;
}