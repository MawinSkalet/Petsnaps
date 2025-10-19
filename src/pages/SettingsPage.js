import React, { useState, useRef } from "react";
import { Edit, UserPlus, UserCheck, UserX, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import {
  logout,
  uploadFile,
  updateUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../firebase/api";

function SettingsPage() {
  const { user, userProfile, setUserProfile } = useAuth();
  const { posts, friendRequests, allUsers, loadAllUsers } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [newPetName, setNewPetName] = useState(userProfile?.petName || "");
  const [newFile, setNewFile] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestStatus, setRequestStatus] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setNewPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      let photoURL = userProfile.photoURL;
      if (newFile) {
        const filePath = `avatars/${user.uid}/${newFile.name}`;
        photoURL = await uploadFile(newFile, filePath);
      }

      await updateUserProfile(user.uid, {
        petName: newPetName,
        photoURL: photoURL,
      });

      // Update the userProfile in AuthContext
      setUserProfile((prev) => ({
        ...prev,
        petName: newPetName,
        photoURL: photoURL,
      }));

      setIsEditing(false);
      setNewFile(null);
      setNewPhotoPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    setRequestStatus((prev) => ({ ...prev, [receiverId]: "sending" }));
    await sendFriendRequest(user.uid, receiverId);
    setRequestStatus((prev) => ({ ...prev, [receiverId]: "sent" }));
  };

  const handleAcceptRequest = async (requestId, senderId, receiverId) => {
    try {
      await acceptFriendRequest(requestId, senderId, receiverId);
      loadAllUsers(); // Refresh users to update friend lists
      setUserProfile((prev) => ({
        ...prev,
        friends: [...(prev.friends || []), senderId],
      }));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      // No need to refresh users, friendRequests will update via listener
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // AuthContext will handle setting user to null and redirecting
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const friendsList = userProfile?.friends || [];
  const usersWhoSentRequests = friendRequests.map((req) => req.senderId);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.id !== user.uid &&
      !friendsList.includes(u.id) &&
      u.petName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userPosts = posts.filter((p) => p.userId === user.uid);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#8B6F47] text-center">
        Settings & Profile
      </h2>

      {/* Profile Section */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#8B6F47]">My Profile</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-[#8B6F47] hover:bg-[#E2B887]/20 rounded-xl"
          >
            {isEditing ? "Cancel" : <Edit className="w-5 h-5" />}
          </button>
        </div>

        {!isEditing ? (
          <div className="flex items-center space-x-4">
            <img
              src={userProfile.photoURL}
              alt={userProfile.petName}
              className="w-20 h-20 rounded-full border-4 border-[#E2B887] object-cover"
            />
            <div>
              <p className="text-2xl font-bold text-[#8B6F47]">
                {userProfile.petName}
              </p>
              <p className="text-sm text-[#8B6F47]/60">{userProfile.email}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={newPhotoPreview || userProfile.photoURL}
                alt="Profile preview"
                className="w-20 h-20 rounded-full border-4 border-[#E2B887] object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#E2B887]/30 text-[#8B6F47] rounded-xl font-medium hover:bg-[#E2B887]/50"
              >
                Change Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <input
              type="text"
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E2B887]/30 rounded-2xl focus:border-[#E2B887] focus:outline-none transition"
              placeholder="New Pet Name"
            />
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-100 text-red-600 py-3 rounded-2xl font-semibold hover:bg-red-200 transition"
        >
          Logout
        </button>
      </div>

      {/* Friend Requests Section */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-[#8B6F47] mb-4">
          Friend Requests ({friendRequests.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {friendRequests.length === 0 ? (
            <p className="text-[#8B6F47]/60 text-center py-4">
              No new friend requests.
            </p>
          ) : (
            friendRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-[#FFE7CC]/30 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={req.senderPhoto}
                    alt={req.senderName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-medium text-[#8B6F47]">{req.senderName}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleAcceptRequest(req.id, req.senderId, req.receiverId)
                    }
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Find Friends Section */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-[#8B6F47] mb-4">Find Friends</h3>
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-[#8B6F47]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-[#E2B887]/30 rounded-2xl focus:border-[#E2B887] focus:outline-none transition"
          />
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-[#8B6F47]/60 text-center py-4">No pets found.</p>
          ) : (
            filteredUsers.map((u) => {
              const hasSentRequest = usersWhoSentRequests.includes(u.id);
              const requestSent = requestStatus[u.id] === "sent";
              const isSending = requestStatus[u.id] === "sending";
              let button;

              if (hasSentRequest) {
                button = (
                  <span className="text-sm font-medium text-[#8B6F47]/70">
                    Request received
                  </span>
                );
              } else if (requestSent) {
                button = (
                  <button disabled className="p-2 text-gray-400">
                    <UserCheck className="w-5 h-5" />
                  </button>
                );
              } else {
                button = (
                  <button
                    onClick={() => handleSendRequest(u.id)}
                    disabled={isSending}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                );
              }

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-[#FFE7CC]/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.photoURL}
                      alt={u.petName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="font-medium text-[#8B6F47]">{u.petName}</p>
                  </div>
                  {button}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* My Posts Section */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-[#8B6F47] mb-4">
          My Posts ({userPosts.length})
        </h3>
        {userPosts.length === 0 ? (
          <p className="text-[#8B6F47]/60 text-center py-4">
            You haven't posted anything yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPosts.map((post) => (
              <img
                key={post.id}
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
