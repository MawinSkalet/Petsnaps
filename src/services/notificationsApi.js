import { collection, query, orderBy, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Live stream of notifications (newest first)
export function listenNotifications(uid, cb) {
  if (!uid) return () => {};
  const q = query(
    collection(db, "notifications", uid, "items"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// Unread counter for navbar badge
export function listenUnreadCount(uid, cb) {
  if (!uid) return () => {};
  const q = query(
    collection(db, "notifications", uid, "items"),
    where("isRead", "==", false)
  );
  return onSnapshot(q, (snap) => cb(snap.size));
}

// Mark a single notification as read
export async function markNotifRead(uid, id) {
  await updateDoc(doc(db, "notifications", uid, "items", id), { isRead: true });
}

// Mark all currently visible items as read (optional helper)
export async function markAllRead(uid, items) {
  const updates = items.map(n =>
    updateDoc(doc(db, "notifications", uid, "items", n.id), { isRead: true })
  );
  await Promise.allSettled(updates);
}