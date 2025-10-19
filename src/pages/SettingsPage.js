import React, { useState, useEffect } from "react";
import { Settings, User, Mail, Image, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const { user, logout } = useAuth();
  const { fetchUserProfile, updateUserProfile, uploadFile } = useData();
  const navigate = useNavigate();

  const [petName, setPetName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        if (profile) {
          setPetName(profile.petName || "");
          setEmail(profile.email || "");
          setPhotoURL(profile.photoURL || "");
        }
      }
    };
    loadUserData();
  }, [user, fetchUserProfile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPhotoURL(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let updatedPhotoURL = photoURL;
      if (newPhoto) {
        updatedPhotoURL = await uploadFile(newPhoto, `profile_pictures/${user.uid}/${newPhoto.name}`);
      }

      await updateUserProfile(user.uid, {
        petName,
        email,
        photoURL: updatedPhotoURL,
      });
      setSuccess("Profile updated successfully!");
      setNewPhoto(null); // Clear new photo after upload
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out.");
    }
  };

  if (!user) {
    return (
      <div className="flex h-[600px] bg-white rounded-3xl shadow-lg overflow-hidden items-center justify-center">
        <div className="text-center p-8">
          <Settings className="w-20 h-20 text-[#E2B887]/50 mx-auto mb-4" />
          <p className="text-xl text-[#8B6F47]/60 font-semibold">
            Please log in to view settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-[#8B6F47] text-center mb-6">
        Settings
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={photoURL || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=placeholder"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#E2B887]"
          />
          <label htmlFor="profile-photo-upload" className="cursor-pointer bg-[#E2B887] text-white px-4 py-2 rounded-full hover:bg-[#D4A77C] transition-colors flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Change Photo</span>
            <input
              id="profile-photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Pet Name */}
        <div>
          <label htmlFor="petName" className="block text-lg font-semibold text-[#8B6F47] mb-2">
            <User className="inline-block w-5 h-5 mr-2 text-[#E2B887]" />
            Pet Name
          </label>
          <input
            id="petName"
            type="text"
            className="w-full p-3 border border-[#E2B887]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2B887] text-[#8B6F47] placeholder-[#8B6F47]/50"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
        </div>

        {/* Email (Read-only for now) */}
        <div>
          <label htmlFor="email" className="block text-lg font-semibold text-[#8B6F47] mb-2">
            <Mail className="inline-block w-5 h-5 mr-2 text-[#E2B887]" />
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-3 border border-[#E2B887]/50 rounded-lg bg-gray-100 cursor-not-allowed text-[#8B6F47]/70"
            value={email}
            readOnly
          />
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        {/* Save Changes Button */}
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
            <Settings className="w-5 h-5 mr-2" />
          )}
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </form>
    </div>
  );
}

export default SettingsPage;
