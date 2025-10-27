import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Trash2 } from "lucide-react";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(list);
    });
    return unsubscribe;
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return; // user check hinzugefügt

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: text.trim(),
      createdAt: serverTimestamp(),
      author: {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });

    setText("");
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        await deleteDoc(doc(db, "posts", postId, "comments", commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#8B6F47]">Comments</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 border border-[#E2B887]/40 rounded-lg text-sm text-[#8B6F47] placeholder-[#8B6F47]/40"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#E2B887] text-white rounded-lg text-sm hover:bg-[#D4A77C]"
        >
          Post
        </button>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {comments.map((c) => (
          <div
            key={c.id}
            // ZUÄUSSEREM CONTAINER HINZUGEFÜGT
            className="flex items-start gap-3 text-sm hover:bg-[#F9F6F2] p-2 rounded-lg transition group" 
          >
            <img
              src={c.author?.photoURL || "https://i.pravatar.cc/40?img=8"}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium text-[#8B6F47]">{c.author?.displayName || "User"}</div>
              <div className="flex items-center justify-between text-[#8B6F47]/80">
                <span>{c.text}</span>
                {c.author?.uid === user?.uid && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-500 hover:bg-red-50 rounded-md p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}