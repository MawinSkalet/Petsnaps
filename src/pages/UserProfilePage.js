import React from "react";
import { useParams } from "react-router-dom";
import ProfileView from "../components/ProfileView";

export default function UserProfilePage() {
  const { uid } = useParams();
  console.log("UserProfilePage: Rendering with uid:", uid);

  if (!uid) {
    return <div className="p-6 text-center">No user ID provided</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <ProfileView uid={uid} />
    </div>
  );
}
