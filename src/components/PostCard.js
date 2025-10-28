import React, { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { deletePost } from "../services/mockApi"; 
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { listenLikes, toggleLike } from "../services/likesApi";

function PostCard({ post }) {
  const { user } = useAuth();
  const { loadPosts } = useData();

  //  Likes 
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount || post.likes || 0);

  useEffect(() => {
    if (!post?.id || !user?.uid) return;
    return listenLikes(post.id, user.uid, ({ count, liked }) => {
      setLikes(count);
      setLiked(liked);
    });
  }, [post?.id, user?.uid]);

  //  Comments 
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [cText, setCText] = useState("");

  useEffect(() => {
    if (!post?.id) return;
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [post?.id]);

  
  const authorName = post?.author?.displayName || "User";
  const authorPhoto = post?.author?.photoURL || "https://i.pravatar.cc/48?img=5";
  const firstImage = Array.isArray(post?.images) && post.images.length > 0
    ? (post.images[0]?.url || post.images[0])
    : null;

  const createdAtText = useMemo(() => {
    try {
      if (post?.createdAt?.toDate) {
        const d = post.createdAt.toDate();
        return d.toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      if (typeof post?.createdAt === "string") {
        return new Date(post.createdAt).toLocaleString();
      }
    } catch {}
    return "Just now";
  }, [post?.createdAt]);

  // ------- Actions -------
  const onLike = async () => {
    if (!user?.uid || !post?.id) return;
    setLiked((v) => !v);
    setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1));
    try {
      await toggleLike(post.id, user.uid, liked);
    } catch (e) {
      setLiked((v) => !v);
      setLikes((n) => (liked ? n + 1 : Math.max(0, n - 1)));
      console.error("Like failed:", e);
    }
  };

  const onDelete = async () => {
    if (!user?.uid || post?.uid !== user.uid) return;
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post.id);
      loadPosts?.();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleAddComment = async () => {
    const text = cText.trim();
    if (!user?.uid || !post?.id || !text) return;
    try {
      const ref = await addDoc(collection(db, "posts", post.id, "comments"), {
        text,
        createdAt: serverTimestamp(),
        author: {
          uid: user.uid,
          displayName: user.displayName || "User",
          photoURL: user.photoURL || "",
        },
      });
      setCText("");


    } catch (e) {
      console.error("Add comment failed:", e);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={authorPhoto}
            alt={authorName}
            className="w-12 h-12 rounded-full border-2 border-[#E2B887] object-cover"
          />
          <div>
            <p className="font-bold text-[#8B6F47]">{authorName}</p>
            <p className="text-sm text-[#8B6F47]/60">{createdAtText}</p>
          </div>
        </div>

        {post?.uid === user?.uid && (
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
            title="Delete post"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Media */}
      {firstImage && (
        <img
          src={firstImage}
          alt="Pet post"
          className="w-full max-h-[560px] object-cover"
        />
      )}

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onLike}
            className={`flex items-center space-x-2 transition ${
              liked ? "text-red-500" : "text-[#8B6F47] hover:text-red-500"
            }`}
            title={liked ? "Unlike" : "Like"}
          >
            <Heart className={`w-7 h-7 ${liked ? "fill-current" : ""}`} />
            <span className="font-semibold">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center space-x-2 text-[#8B6F47] hover:text-[#E2B887]"
            title="Comments"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="text-sm">
              {comments.length > 0 ? `${comments.length}` : ""}
            </span>
          </button>
        </div>

        {/* Caption */}
        {post?.text && (
          <p className="text-[#8B6F47]">
            <span className="font-bold mr-2">{authorName}</span>
            {post.text}
          </p>
        )}

        {/* Comments drawer */}
        {showComments && (
          <div className="mt-3">
            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-sm text-[#8B6F47]/60">No comments yet.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <img
                      src={c.author?.photoURL || "https://i.pravatar.cc/40?img=8"}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="bg-[#FFF3E0] px-3 py-1.5 rounded-xl text-sm text-[#8B6F47]">
                      <b>{c.author?.displayName || "User"}</b> {c.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            {user && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a comment…"
                  value={cText}
                  onChange={(e) => setCText(e.target.value)}
                  className="flex-1 border border-[#E2B887]/40 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E2B887]"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-[#E2B887] text-white rounded-full text-sm hover:bg-[#D4A77C]"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;
