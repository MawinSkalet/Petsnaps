import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [qtext, setQtext] = useState("");
  const [users, setUsers] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      // simple: load first ~100 users; client-filter
      const snap = await getDocs(query(collection(db, "users"), orderBy("displayName"), limit(100)));
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = qtext.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) =>
      (u.displayName || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t)
    );
  }, [qtext, users]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">Search</h2>
        <input
          value={qtext}
          onChange={(e) => setQtext(e.target.value)}
          placeholder="Search users by name or email"
          className="w-full p-3 rounded-2xl border-2 border-[#E2B887]/40 focus:border-[#E2B887] outline-none bg-white/90"
        />
        <div className="mt-4 space-y-2">
          {filtered.map((u) => (
            <button
              key={u.uid}
              onClick={() => nav(`/u/${u.uid}`)}
              className="w-full flex items-center gap-3 p-3 bg-white/90 rounded-xl hover:bg-white border border-[#E2B887]/30"
            >
              <img
                src={u.photoURL || "https://i.pravatar.cc/40?img=9"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="text-[#8B6F47] font-semibold">{u.displayName || "Unknown"}</div>
                <div className="text-xs text-[#8B6F47]/70">{u.email}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-[#8B6F47]/70">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
