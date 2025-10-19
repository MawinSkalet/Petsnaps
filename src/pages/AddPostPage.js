import React, { useState } from "react";
import { Plus, Image, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

function AddPostPage() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const { addPost, uploadFile, loadPosts } = useData();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!image) {
      setError("Please select an image for your post.");
      return;
    }
    if (!caption.trim()) {
      setError("Please add a caption for your post.");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadFile(image, `posts/${user.uid}/${image.name}`);
      await addPost({
        userId: user.uid,
        caption,
        imageUrl,
      });
      setCaption("");
      setImage(null);
      setImagePreview(null);
      loadPosts(); // Refresh posts on home page
      navigate("/home");
    } catch (err) {
      console.error("Error adding post:", err);
      setError("Failed to add post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-[#8B6F47] text-center mb-6">
        Create New Post
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="border-2 border-dashed border-[#E2B887] rounded-xl p-6 text-center relative">
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 w-full object-cover rounded-lg mb-4"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-md"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </>
          ) : (
            <label htmlFor="image-upload" className="cursor-pointer block">
              <Image className="w-16 h-16 text-[#E2B887]/50 mx-auto mb-3" />
              <p className="text-[#8B6F47]/60 text-lg font-semibold">
                Click to upload image
              </p>
              <p className="text-sm text-[#8B6F47]/50 mt-1">
                (PNG, JPG, GIF up to 10MB)
              </p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Caption Input */}
        <div>
          <label
            htmlFor="caption"
            className="block text-lg font-semibold text-[#8B6F47] mb-2"
          >
            Caption
          </label>
          <textarea
            id="caption"
            className="w-full p-3 border border-[#E2B887]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2B887] text-[#8B6F47] placeholder-[#8B6F47]/50"
            rows="4"
            placeholder="What's on your pet's mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          ></textarea>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#E2B887] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#D4A77C] transition-colors duration-300 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          {loading ? "Posting..." : "Add Post"}
        </button>
      </form>
    </div>
  );
}

export default AddPostPage;
