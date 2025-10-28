import React from "react";
import { useParams } from "react-router-dom";
import ProfileView from "../components/ProfileView";

export default function UserProfilePage() {
  const { uid } = useParams();
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      <ProfileView uid={uid} />
    </div>
  );
}
