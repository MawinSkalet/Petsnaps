import React, { useState, useRef } from "react";
import {
  Camera,
  Search,
  Home,
  MapPin,
  Plus,
  MessageCircle,
  Settings,
  User,
  Flag,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function NavButton({ icon: Icon, to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        [
          "p-3 rounded-full transition-all flex items-center justify-center",
          isActive
            ? "bg-[#E2B887]/20 text-[#8B6F47]"
            : "text-[#8B6F47]/60 hover:bg-[#E2B887]/10",
        ].join(" ")
      }
    >
      <Icon className="w-6 h-6" />
    </NavLink>
  );
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const filePicker = useRef(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFE7CC] flex flex-col">
      {/* Header */}
      <header className="bg-[#FFE7CC] border-b border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E2B887] to-[#B5EAD7] rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/Pawsnap.png"
                className="w-full h-full object-contain scale-150"
              />
            </div>
            <span className="text-2xl font-bold text-[#8B6F47]">PawSnap</span>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <Search className="w-5 h-5 text-[#8B6F47] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/60 border-2 border-[#E2B887]/30 rounded-full text-sm focus:outline-none focus:border-[#E2B887] transition"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">{children}</div>
      </main>

      <nav className="bg-white border-t border-[#E2B887]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-7 gap-4 place-items-center">
          {/* Left 3 */}
          <NavButton icon={Home} to="/" end label="Home" />
          <NavButton icon={User} to="/profile" label="Profile" />
          <NavButton icon={MessageCircle} to="/chat" label="Messages" />

          {/* Center + */}
          <button
            aria-label="Create"
            onClick={() => setOpen((v) => !v)}
            className="p-3 rounded-full bg-gradient-to-r from-[#E2B887] to-[#B5EAD7] text-white shadow-lg scale-110"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Right 3 */}
          <NavButton icon={MapPin} to="/map" label="Map" />
          <NavButton icon={Flag} to="/report" label="Report" />
          <NavButton icon={Settings} to="/settings" label="Settings" />
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white rounded-2xl shadow-xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setOpen(false);
                navigate("/add"); // go to composer
              }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#FFF4E6] text-[#8B6F47] font-medium"
            >
              Create post
            </button>

            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-3 rounded-xl text-[#8B6F47]/70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input (keep for future “quick photo” flows) */}
      <input ref={filePicker} type="file" className="hidden" />
    </div>
  );
}