import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      // If Firestore asks for an index, create it (posts: orderBy createdAt desc)
      let q1 = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q1);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div key={p.id} className="bg-white/90 rounded-2xl shadow p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={p?.author?.photoURL || "https://i.pravatar.cc/40?img=7"}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="font-semibold text-[#8B6F47]">
              {p?.author?.displayName || "User"}
            </div>
          </div>

          {Array.isArray(p.images) && p.images.length > 0 && (
            <img src={p.images[0]} alt="" className="w-full rounded-xl object-cover" />
          )}
          {p.text && <p className="mt-3 text-[#8B6F47]">{p.text}</p>}
        </div>
      ))}
    </div>
  );
}