import React from "react";
import { Link } from "react-router-dom";

// simple grid renderer; you can fancy this up later
function ImagesGrid({ images = [] }) {
  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0].url}
        alt="post"
        className="w-full rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={`post-${i}`}
          className="w-full h-48 object-cover rounded-xl"
        />
      ))}
    </div>
  );
}

export default function PostCard({ post, author }) {
  return (
    <div className="bg-white/90 rounded-2xl shadow p-4 space-y-3">
      {/* header */}
      <div className="flex items-center gap-3">
        <img
          src={author?.photoURL || "https://i.pravatar.cc/48?img=5"}
          alt={author?.displayName || "user"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="leading-tight">
          <Link to="/profile" className="font-semibold text-[#8B6F47] hover:underline">
            {author?.displayName || "Unknown"}
          </Link>
          <div className="text-xs text-[#8B6F47]/60">
            {post?.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleString()
              : ""}
          </div>
        </div>
      </div>

      {/* caption */}
      {post?.caption && <p className="text-[#634f2f]">{post.caption}</p>}

      {/* images */}
      <ImagesGrid images={post?.images || []} />
    </div>
  );
}