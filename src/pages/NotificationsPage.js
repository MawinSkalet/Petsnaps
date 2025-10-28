import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listenNotifications, markAllRead, markNotifRead } from "../services/notificationsApi";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function NotifModal({ notif, onClose }) {
  const nav = useNavigate();
  const [cover, setCover] = useState(notif?.postImage || null);
  const [text, setText] = useState(notif?.commentText || "");

  useEffect(() => {
    if (!notif?.postId || cover) return;
    (async () => {
      const snap = await getDoc(doc(db, "posts", notif.postId));
      const d = snap.data();
      if (d?.images?.[0]) setCover(d.images[0]);
    })();
  }, [notif?.postId, cover]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b">
          {notif.actor?.avatar && <img src={notif.actor.avatar} className="w-9 h-9 rounded-full" alt="" />}
          <div className="font-semibold text-[#8B6F47]">{notif.message}</div>
        </div>

        <div className="p-4">
          <div className="rounded-xl bg-[#FFF5E8] aspect-video flex items-center justify-center overflow-hidden">
            {cover ? (
              <img src={cover} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[#8B6F47]/50">No preview</span>
            )}
          </div>

          {text && (
            <div className="mt-3 text-sm text-[#8B6F47] bg-[#FFF5E8] rounded-xl px-3 py-2">
              {text}
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end gap-2 border-t">
          {notif.url && (
            <button
              onClick={() => nav(notif.url)}
              className="px-4 py-2 rounded-xl bg-[#E2B887] text-white"
            >
              View
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    return listenNotifications(user.uid, setItems);
  }, [user?.uid]);

  const grouped = useMemo(() => {
    const today = [];
    const earlier = [];
    const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
    for (const n of items) {
      const ts = n.createdAt?.toDate?.() ?? new Date(0);
      (ts >= startOfToday ? today : earlier).push(n);
    }
    return { today, earlier };
  }, [items]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">Notifications</h2>

      {["Today", "Earlier"].map((section, idx) => {
        const list = idx === 0 ? grouped.today : grouped.earlier;
        if (!list.length) return null;
        return (
          <section key={section} className="mb-6">
            <div className="text-sm text-[#8B6F47]/70 mb-2">{section}</div>
            <ul className="space-y-2">
              {list.map(n => (
                <li key={n.id}>
                  <button
                    onClick={() => setOpen(n)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition
                      ${n.isRead ? "bg-white" : "bg-[#FFF7EC] border-[#F3D7A2]"}`}
                  >
                    {n.actor?.avatar && (
                      <img src={n.actor.avatar} alt="" className="w-9 h-9 rounded-full" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-[#8B6F47]">
                        <b>{n.actor?.name || "Someone"}</b> {n.message?.replace(/^.*? /, "")}
                      </div>
                      <div className="text-xs text-[#8B6F47]/60">
                        {n.type} • {n.createdAt?.toDate?.().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {n.postImage && (
                      <img src={n.postImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {open && (
        <NotifModal
          notif={open}
          onClose={async () => {
            setOpen(null);
            // mark read on close
            try { await markNotifRead(user.uid, open.id); } catch {}
          }}
        />
      )}
    </div>
  );
}
