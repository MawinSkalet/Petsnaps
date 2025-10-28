import React from "react";
import { useAuth } from "../context/AuthContext";
import ProfileView from "../components/ProfileView";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user)
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center text-[#8B6F47]">
        Please sign in.
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <ProfileView uid={user.uid} />
    </div>
  );
}
