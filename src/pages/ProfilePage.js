import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { Trash2 } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getFollowCounts } from "../services/socialApi";
import { deletePost } from "../services/firebaseApi";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

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
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      setProfile(
        snap.exists()
          ? snap.data()
          : { displayName: user.displayName, photoURL: user.photoURL }
      );

      // needs index: posts where uid== and orderBy createdAt desc
      try {
        const q1 = query(
          collection(db, "posts"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const ds = await getDocs(q1);
        setPosts(ds.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {
        // fallback without orderBy if index not created yet
        const q2 = query(collection(db, "posts"), where("uid", "==", user.uid));
        const ds = await getDocs(q2);
        setPosts(
          ds.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            )
        );
      }

      // counts
      const { followersCount, followingCount } = await getFollowCounts(
        user.uid
      );
      setCounts({ followers: followersCount, following: followingCount });
    })();
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
                  onClick={() => navigate("/chat")}
                  className="px-3 py-1 text-sm rounded-full border border-[#E2B887]/60 text-[#8B6F47]"
                >
                  Message
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
                <b>{counts.followers}</b> followers
              </span>
              <span>
                <b>{counts.following}</b> following
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center text-[#8B6F47]/70">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => (
              <div
                key={p.id}
                className="relative bg-white/90 rounded-xl shadow overflow-hidden"
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
                  <div className="px-3 py-2 text-sm text-[#8B6F47] line-clamp-2">
                    {p.text}
                  </div>
                )}
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(p.id)}
                  className="absolute bottom-0.5 right-2 p-2 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
