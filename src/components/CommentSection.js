// src/components/CommentSection.js
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
// Import the separate CSS file
import '../styles/commentSection.css'; 

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
    if (!text.trim() || !user) return; 

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
    <div className="comment-section">
      <h3 className="section-title">Comments</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="comment-input"
        />
        <button
          type="submit"
          className="comment-post-button"
        >
          Post
        </button>
      </form>

      <div className="comments-list">
        {comments.map((c) => (
          <div
            key={c.id}
            className="comment-item" // The main container for one comment
          >
            <img
              src={c.author?.photoURL || "https://i.pravatar.cc/40?img=8"}
              alt=""
              className="comment-avatar"
            />
            <div className="comment-content">
              <div className="comment-author">{c.author?.displayName || "User"}</div>
              <div className="comment-body">
                <span>{c.text}</span>
                {/* Check if current user is the comment author */}
                {c.author?.uid === user?.uid && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="delete-button" // Button styled by CSS file
                    title="Delete comment"
                  >
                    <Trash2 className="icon-trash" />
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