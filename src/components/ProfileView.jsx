import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { onSnapshot, doc, query, collection, where, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUserCounters } from "../hooks/useUserCounters";
import FollowButton from "./FollowButton";
import PostModal from "./PostModal";
import { useAuth } from "../context/AuthContext";

export default function ProfileView({ uid }) {
  const { user: me } = useAuth();
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const { followersCount, followingCount } = useUserCounters(uid);
  const viewingOwn = me?.uid === uid;
  const name = useMemo(() => profile?.displayName || "User", [profile]);

  // realtime profile
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
    });
    return unsub;
  }, [uid]);

  // realtime posts
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const q = query(
      collection(db, "posts"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl shadow p-6 flex items-center gap-5">
        <img
          src={profile?.photoURL || "/default-avatar.png"}
          className="w-20 h-20 rounded-full object-cover border"
          alt=""
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#8B6F47]">{name}</h1>

            {viewingOwn ? (
              <button
                onClick={() => nav("/settings")}
                className="px-3 py-1.5 rounded-full bg-white border border-[#E2B887]/60 text-[#8B6F47] text-sm"
              >
                Edit profile
              </button>
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

          <div className="mt-1 flex gap-6 text-[#8B6F47]">
            <span><b>{posts.length}</b> posts</span>
            <span><b>{followersCount}</b> followers</span>
            <span><b>{followingCount}</b> following</span>
          </div>

          {profile?.bio && <p className="mt-2 text-[#8B6F47]/80">{profile.bio}</p>}
        </div>
      </div>

      {/* Posts grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#f2e7d9] animate-pulse" />
          ))
        ) : posts.length === 0 ? (
          <div className="col-span-full text-center text-[#8B6F47]/70">No posts yet.</div>
        ) : (
          posts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPost(p.id)}
              className="relative block bg-white/90 rounded-xl shadow overflow-hidden text-left"
            >
              {Array.isArray(p.images) && p.images[0] ? (
                <img src={p.images[0]} alt="" className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-[#F5F5F5]" />
              )}
              {p.text && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 pointer-events-none line-clamp-1">
                  {p.text}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {selectedPost && (
        <PostModal postId={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
