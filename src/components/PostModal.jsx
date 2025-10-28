import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { listenLikes, toggleLike } from "../services/likesApi";

// tiny icon buttons
function IconBtn({ children, title, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium 
                  border border-[#E2B887]/50 text-[#8B6F47] hover:bg-[#FFF4E6] ${className}`}
    >
      {children}
    </button>
  );
}

export default function PostModal({ postId, onClose }) {
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [i, setI] = useState(0); // current image index
  const [text, setText] = useState("");

  const panelRef = useRef(null);

  const images = useMemo(
    () => (Array.isArray(post?.images) && post.images.length > 0 ? post.images : []),
    [post]
  );

  const isOwner = user?.uid && post?.uid && user.uid === post.uid;

  //data listeners 
  useEffect(() => {
    if (!postId) return;
    const unsub = onSnapshot(doc(db, "posts", postId), (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [postId]);

  useEffect(() => {
    if (!postId || !user) return;
    return listenLikes(postId, user.uid, setLikes);
  }, [postId, user]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, images, i]);

  // prevent scroll behind the modal
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  // actions 
  async function handleComment(e) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    await addDoc(collection(db, "posts", postId, "comments"), {
      text: text.trim(),
      author: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
      createdAt: serverTimestamp(),
    });
    setText("");
  }

  const handleToggleLike = () => {
    if (!user) return;
    toggleLike(postId, user.uid, likes.liked);
  };

  async function handleDelete() {
    if (!isOwner) return;
    if (window.confirm("Delete this post?")) {
      await deleteDoc(doc(db, "posts", postId));
      onClose?.();
    }
  }

  function next() {
    if (images.length <= 1) return;
    setI((v) => (v + 1) % images.length);
  }
  function prev() {
    if (images.length <= 1) return;
    setI((v) => (v - 1 + images.length) % images.length);
  }

  if (!post) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        {/* LEFT: media */}
        <div className="relative bg-black">
          {images.length > 0 ? (
            <>
              <img
                src={images[i]}
                alt={`post media ${i + 1}`}
                className="w-full max-h-[80vh] object-contain bg-black"
                loading="lazy"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9"
                    aria-label="Next"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-5 rounded-full ${
                          idx === i ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-[60vh] flex items-center justify-center text-white/60">
              No image
            </div>
          )}
        </div>

        {/* RIGHT: details */}
        <div className="flex flex-col max-h-[80vh]">
          {/* header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <img
              src={post.author?.photoURL || "/default-avatar.png"}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#8B6F47]">
                {post.author?.displayName || "User"}
              </div>
              <div className="text-xs text-[#8B6F47]/60">
                {post.createdAt?.toDate
                  ? post.createdAt.toDate().toLocaleString()
                  : ""}
              </div>
            </div>
            <IconBtn title="Close" onClick={onClose}>✕</IconBtn>
          </div>

          {/* caption */}
          <div className="px-4 pt-3 pb-2 text-sm text-[#8B6F47]">
            {post.text || <span className="opacity-60">(no caption)</span>}
          </div>

          {/* counters + actions */}
          <div className="px-4 pb-2 flex items-center gap-2">
            <IconBtn
              title="Like / Unlike"
              onClick={handleToggleLike}
              className={likes.liked ? "!bg-red-100 !text-red-500" : ""}
            >
              ❤️ <span className="ml-2">{likes.count}</span>
            </IconBtn>
            {isOwner && (
              <IconBtn
                title="Delete post"
                onClick={handleDelete}
                className="!text-white !bg-red-500 !border-red-500 hover:!bg-red-600"
              >
                Delete
              </IconBtn>
            )}
          </div>

          {/* comments list */}
          <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
            {comments.length === 0 ? (
              <div className="text-sm text-[#8B6F47]/60">No comments yet.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-semibold">{c.author?.displayName || "User"}</span>{" "}
                  <span className="text-[#8B6F47]">{c.text}</span>
                </div>
              ))
            )}
          </div>

          {/* add comment */}
          {user && (
            <form onSubmit={handleComment} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 p-2 rounded-lg border border-[#E2B887]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B887]"
              />
              <button
                className="px-4 py-2 rounded-lg bg-[#E2B887] text-white text-sm hover:bg-[#D4A77C]"
                type="submit"
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
