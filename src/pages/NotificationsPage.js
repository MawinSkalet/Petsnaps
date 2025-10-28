import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listenNotifications, markNotifRead, markAllRead } from "../services/notificationsApi";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    return listenNotifications(user.uid, setItems);
  }, [user?.uid]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          className="text-sm text-blue-600"
          onClick={() => markAllRead(user.uid, items)}
        >Mark all read</button>
      </div>

      {items.length === 0 && <p className="text-gray-500">No notifications yet.</p>}

      <ul className="space-y-2">
        {items.map(n => (
          <li
            key={n.id}
            className={`p-3 rounded border ${n.isRead ? "bg-white" : "bg-yellow-50"}`}
          >
            <div className="flex gap-3 items-center">
              {n.actor?.avatar && <img src={n.actor.avatar} alt="" className="w-8 h-8 rounded-full" />}
              <div className="flex-1">
                <div className="text-sm">
                  <b>{n.actor?.name || "Someone"}</b> — {n.message}
                </div>
                <div className="text-xs text-gray-500">{n.type}</div>
              </div>
              {!n.isRead && (
                <button
                  className="text-xs text-blue-600"
                  onClick={() => markNotifRead(user.uid, n.id)}
                >
                  mark read
                </button>
              )}
              {n.url && (
                <button
                  className="text-xs text-green-700"
                  onClick={() => nav(n.url)}
                >
                  open
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}