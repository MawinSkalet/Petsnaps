import React from "react";
import { Camera, Search, Home, MapPin, Plus, MessageCircle, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function NavButton({ icon: Icon, to, isCenter, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative p-3 rounded-full transition-all flex items-center justify-center ${
          isCenter
            ? "bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white scale-110 shadow-lg"
            : isActive
            ? "bg-[#E2B887]/20 text-[#8B6F47]"
            : "text-[#8B6F47]/60 hover:bg-[#E2B887]/10"
        }`
      }
    >
      <Icon className="w-6 h-6" />
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function Layout({ children }) {
  const { userProfile } = useAuth();
  const { friendRequests } = useData();

  return (
    <div className="min-h-screen bg-[#FFE7CC] flex flex-col">
      {/* Top Header */}
      <header className="bg-[#FFE7CC] border-b border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E2B887] to-[#B5EAD7] rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#8B6F47]">PawSnap</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-[#8B6F47] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/60 border-2 border-[#E2B887]/30 rounded-full text-sm focus:outline-none focus:border-[#E2B887] transition"
              />
            </div>

            {userProfile && (
              <div className="flex items-center space-x-2">
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.petName}
                  className="w-8 h-8 rounded-full border-2 border-[#E2B887] object-cover"
                />
                <span className="text-sm font-medium text-[#8B6F47]">
                  {userProfile.petName}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-around">
          <NavButton icon={Home} to="/" />
          <NavButton icon={MapPin} to="/map" />
          <NavButton icon={Plus} to="/add" isCenter />
          <NavButton icon={MessageCircle} to="/chat" />
          <NavButton
            icon={Settings}
            to="/settings"
            badge={friendRequests.length > 0 ? friendRequests.length : null}
          />
        </div>
      </nav>
    </div>
  );
}

export default Layout;
