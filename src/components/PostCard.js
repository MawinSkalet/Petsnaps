import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deletePost } from "../services/firebaseApi";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import { listenLikes, toggleLike } from "../services/likesApi";

function PostCard({ post, onReload }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likes, setLikes] = useState({ count: 0, liked: false });
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!post.id || !user?.uid) return;
    const unsub = listenLikes(post.id, user.uid, (data) => setLikes(data));
    return () => unsub();
  }, [post.id, user?.uid]);

  const handleLike = () => {
    if (!user) return;
    toggleLike(post.id, user.uid, likes.liked);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post.id);
        onReload();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const goToProfile = () => {
    if (post.uid === user.uid) {
      navigate("/profile");
    } else {
      navigate(`/u/${post.uid}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition"
          onClick={goToProfile}
        >
          <img
            src={post.author?.photoURL || "https://i.pravatar.cc/48?img=5"}
            alt={post.author?.displayName || "user"}
            className="w-12 h-12 rounded-full border-2 border-[#E2B887] object-cover"
          />
          <div>
            <p className="font-bold text-[#8B6F47] hover:text-[#E2B887]">
              {post.author?.displayName || "User"}
            </p>
            <p className="text-sm text-[#8B6F47]/60">
              {post.createdAt?.toDate
                ? new Date(post.createdAt.toDate()).toLocaleDateString()
                : "Just now"}
            </p>
          </div>
        </div>
        {post.uid === user.uid && (
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {Array.isArray(post.images) && post.images.length > 0 && (
        <img
          src={post.images[0].url || post.images[0]}
          alt="Pet post"
          className="w-full h-96 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition ${
              likes.liked ? "text-red-500" : "text-[#8B6F47] hover:text-red-500"
            }`}
          >
            <Heart className={`w-7 h-7 ${likes.liked ? "fill-current" : ""}`} />
            <span className="font-semibold">{likes.count}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-[#8B6F47] hover:text-[#E2B887]"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        </div>
        {post.text && (
          <p className="text-[#8B6F47]">
            <span
              className="font-bold mr-2 cursor-pointer hover:text-[#E2B887] transition"
              onClick={goToProfile}
            >
              {post.author?.displayName}
            </span>
            {post.text}
          </p>
        )}

        {/* Comment Section */}
        {showComments && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
}

export default PostCard;
