import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PostPage() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "posts", postId));
      setPost(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    })();
  }, [postId]);

  if (post === null) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center text-[#8B6F47]/60">
        Loading…
      </div>
    );
  }
  if (!post) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center text-[#8B6F47]">
        Post not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => nav(-1)} className="mb-3 text-[#8B6F47]">← Back</button>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {Array.isArray(post.images) && post.images[0] && (
          <img src={post.images[0]} alt="" className="w-full object-cover" />
        )}
        {post.text && (
          <div className="p-4 text-[#8B6F47] border-t">{post.text}</div>
        )}
      </div>
    </div>
  );
}
