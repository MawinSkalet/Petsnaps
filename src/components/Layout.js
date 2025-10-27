import React from "react";
import { Camera, Search, Home, Bell, Plus, MessageCircle, Settings, User, Flag } from "lucide-react";
import { NavLink } from "react-router-dom";

function NavButton({ icon: Icon, to, isCenter }) {
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
    </NavLink>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFE7CC] flex flex-col">
      {/* Top Header */}
      <header className="bg-[#FFE7CC] border-b border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E2B887] to-[#B5EAD7] rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/Pawsnap.png"
                className="w-full h-full object-contain scale-150"
              />
            </div>
            <span className="text-2xl font-bold text-[#8B6F47]">PetSnap</span>
          </div>

          <div className="flex items-center">
            <NavLink to="/hope" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border-2 border-[#E2B887]/40 text-[#8B6F47] hover:bg-white transition">
            <Flag className="w-5 h-5" />
            <span className="font-medium">Hope Hub</span>
          </NavLink>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">{children}</div>
        </div>
      </div>

      {/* Bottom Navigation: Home / Profile / Message  (+)  Search / Notifications / Settings */}
      <nav className="bg-white border-t border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-around">
          <NavButton icon={Home} to="/home" />
          <NavButton icon={User} to="/profile" />
          <NavButton icon={MessageCircle} to="/chat" />

          <NavButton icon={Plus} to="/add" isCenter />

          <NavButton icon={Search} to="/search" />
          <NavButton icon={Bell} to="/notifications" />
          <NavButton icon={Settings} to="/settings" />
        </div>
      </nav>
    </div>
  );
}

export default Layout;