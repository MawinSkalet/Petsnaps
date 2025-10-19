import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { uploadFile, addPost } from "../firebase/api";

function AddPostPage() {
  const { user, userProfile } = useAuth();
  const { loadPosts } = useData();
  const [newPost, setNewPost] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newPost.trim()) return;

    setUploading(true);
    try {
      const fileExtension = selectedFile.name.split(".").pop();
      const filePath = `posts/${user.uid}/${Date.now()}.${fileExtension}`;
      const imageUrl = await uploadFile(selectedFile, filePath);

      await addPost({
        userId: user.uid,
        petName: userProfile?.petName || "Anonymous",
        userPhoto: userProfile?.photoURL || "",
        imageUrl,
        caption: newPost,
      });

      setNewPost("");
      setSelectedFile(null);
      setSelectedImagePreview(null);
      loadPosts(); // Refresh posts after adding a new one
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#8B6F47] mb-6">
        Share Your Pet's Moment! 🐾
      </h2>

      <form onSubmit={handlePostSubmit} className="space-y-4">
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#E2B887] rounded-2xl p-8 text-center hover:bg-[#FFE7CC]/30 transition"
          >
            <Camera className="w-12 h-12 text-[#E2B887] mx-auto mb-2" />
            <p className="text-[#8B6F47] font-medium">
              {selectedFile ? "Change Photo" : "Click to upload a photo"}
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {selectedImagePreview && (
          <div>
            <img
              src={selectedImagePreview}
              alt="Selected"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a caption for your pet..."
          className="w-full px-4 py-3 border-2 border-[#E2B887]/30 rounded-2xl focus:border-[#E2B887] focus:outline-none transition resize-none"
          rows="3"
        />

        <button
          type="submit"
          disabled={!selectedFile || !newPost.trim() || uploading}
          className="w-full bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg"
        >
          {uploading ? "Posting..." : "🐾 Post"}
        </button>
      </form>
    </div>
  );
}

export default AddPostPage;
