import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications", user.uid, "items"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  async function markRead(id) {
    await updateDoc(
      collection(db, "notifications", user.uid, "items").doc
        ? collection(db, "notifications", user.uid, "items").doc(id)
        : null,
      { read: true }
    ).catch(() => {});
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">Notifications</h2>
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-[#8B6F47]/70">No notifications yet.</div>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={
                "bg-white/90 rounded-xl p-3 border " +
                (n.read ? "border-transparent" : "border-[#E2B887]/60")
              }
              onClick={() => markRead(n.id)}
            >
              {n.type === "follow" ? (
                <div className="flex items-center gap-3">
                  <img
                    src={n.fromPhoto || "https://i.pravatar.cc/40?img=11"}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-[#8B6F47]">
                    <b>{n.fromName || "Someone"}</b> started following you.
                  </div>
                </div>
              ) : (
                <div className="text-[#8B6F47]">Notification</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}