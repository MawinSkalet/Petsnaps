import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { Trash2 } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { listenFollowCounts } from "../services/socialApi";
import { deletePost } from "../services/firebaseApi";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({
    followersCount: 0,
    followingCount: 0,
  });

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId)); // locally update
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    // Realtime profile
    const profileUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile({ displayName: user.displayName, photoURL: user.photoURL });
      }
    });

    // Realtime posts
    const q = query(
      collection(db, "posts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const postsUnsub = onSnapshot(q, (snap) => {
      console.log("ProfilePage posts count:", snap.size);
      console.log("ProfilePage posts data:", snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("ProfilePage posts error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    });

    // Realtime follow counts
    const countsUnsub = listenFollowCounts(user.uid, (newCounts) => {
      setCounts((prev) => ({ ...prev, ...newCounts }));
    });

    return () => {
      profileUnsub();
      postsUnsub();
      countsUnsub();
    };
  }, [user]);

  const name = useMemo(() => profile?.displayName || "", [profile]);

  if (!user) return <div className="p-6">Please sign in</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-6 bg-[#FFE7CC]">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 rounded-2xl shadow p-6 flex items-center gap-5">
          <img
            src={profile?.photoURL || "https://i.pravatar.cc/120?img=5"}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#8B6F47]">{name}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/add-post")}
                  className="px-3 py-1 text-sm rounded-full bg-[#E2B887] text-white"
                >
                  Create post
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="px-3 py-1 text-sm rounded-full border border-[#E2B887]/60 text-[#8B6F47]"
                >
                  Edit profile
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-6 text-sm text-[#8B6F47]">
              <span>
                <b>{posts.length}</b> posts
              </span>
              <span>
                <b>{counts.followersCount}</b> followers
              </span>
              <span>
                <b>{counts.followingCount}</b> following
              </span>
            </div>
            {profile?.bio && (
              <p className="mt-2 text-[#8B6F47]/80">{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center text-[#8B6F47]/70">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => (
              <div
                key={p.id}
                className="relative bg-white/90 rounded-xl shadow overflow-hidden group"
              >
                {Array.isArray(p.images) && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-[#F5F5F5]" />
                )}
                {p.text && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 pointer-events-none line-clamp-1">
                    {p.text}
                  </div>
                )}
                {/* Delete Button - shows on hover */}
                <button
                  onClick={() => handleDelete(p.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
