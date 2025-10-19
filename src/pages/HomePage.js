import React from "react";
import { Camera } from "lucide-react";
import { useData } from "../context/DataContext";
import PostCard from "../components/PostCard";

function HomePage() {
  const { posts, dataLoading } = useData();

  if (dataLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#E2B887] mb-4 animate-pulse shadow-xl mx-auto" />
        <p className="text-[#8B6F47] text-lg">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-[#8B6F47]">Home</h2>
        <p className="text-[#8B6F47]/70 mt-2">
          See what your pet friends are up to
        </p>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <Camera className="w-16 h-16 text-[#E2B887] mx-auto mb-4" />
            <p className="text-[#8B6F47] text-lg">
              No posts yet. Be the first to share! 🐾
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default HomePage;
