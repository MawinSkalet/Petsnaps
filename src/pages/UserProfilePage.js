import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/FollowButton";
import { useUserCounters } from "../hooks/useUserCounters";

export default function UserProfilePage() {
  const { uid } = useParams();                 // profile owner
  const { user: me } = useAuth();              // signed-in user
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  // realtime counters maintained by Cloud Functions
  const { followersCount, followingCount } = useUserCounters(uid);

  const viewingOwn = me?.uid === uid;
  const name = useMemo(() => profile?.displayName || "User", [profile]);

  useEffect(() => {
    if (!uid) return;

    (async () => {
      // profile
      const p = await getDoc(doc(db, "users", uid));
      setProfile(p.exists() ? p.data() : { displayName: "User" });

      // posts by this user (newest first). If index missing, fallback without orderBy.
      try {
        const q1 = query(
          collection(db, "posts"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );
        const ds = await getDocs(q1);
        setPosts(ds.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        const q2 = query(collection(db, "posts"), where("uid", "==", uid));
        const ds = await getDocs(q2);
        setPosts(ds.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    })();
  }, [uid]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white/90 rounded-2xl shadow p-6 flex items-center gap-5">
          <img
            src={profile?.photoURL || "https://i.pravatar.cc/120?img=6"}
            className="w-20 h-20 rounded-full object-cover border"
            alt=""
          />

          <div className="flex-1">
            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#8B6F47]">{name}</h1>

              {viewingOwn ? (
                <>
                  <button
                    onClick={() => nav("/add-post")}
                    className="px-3 py-1.5 rounded-full bg-[#E2C299] text-white text-sm"
                  >
                    Create post
                  </button>
                  <button
                    onClick={() => nav("/settings")}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#E2B887]/60 text-[#8B6F47] text-sm"
                  >
                    Edit profile
                  </button>
                </>
              ) : (
                <>
                  <FollowButton
                    me={{ uid: me?.uid, displayName: me?.displayName, photoURL: me?.photoURL }}
                    target={{ uid, displayName: profile?.displayName, photoURL: profile?.photoURL }}
                  />
                  <button
                    onClick={() => nav("/chat")}
                    className="px-3 py-1.5 rounded-full bg-[#FFE7CC] border border-[#E2B887]/60 text-[#8B6F47] text-sm"
                  >
                    Message
                  </button>
                </>
              )}
            </div>

            {/* COUNTS */}
            <div className="mt-1 flex gap-6 text-[#8B6F47]">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{followersCount}</b> followers</span>
              <span><b>{followingCount}</b> following</span>
            </div>

            {profile?.bio && <p className="mt-2 text-[#8B6F47]/80">{profile.bio}</p>}
          </div>
        </div>

        {/* POSTS GRID */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center text-[#8B6F47]/70">No posts yet.</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="bg-white/90 rounded-xl shadow overflow-hidden">
                {Array.isArray(p.images) && p.images[0] ? (
                  <img src={p.images[0]} alt="" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-[#F5F5F5]" />
                )}
                {p.text && <div className="px-3 py-2 text-sm text-[#8B6F47] line-clamp-2">{p.text}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}