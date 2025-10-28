import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HopeHubPage() {
  const [open, setOpen] = useState(false); // Read Me drawer
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFE7CC]">
      {/* Local page header (keeps your global Layout intact) */}
      <div className="sticky top-0 z-10 bg-[#FFE7CC]/95 backdrop-blur border-b border-[#E2B887]/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Contacts (same size as Read Me) */}
          <button
            onClick={() => navigate("/chat")}
            className="px-3 py-1.5 rounded-full text-[#8B6F47] border border-[#E2B887]/50 bg-white/70 hover:bg-white transition text-sm"
          >
            Contacts
          </button>

          {/* Center: HOPE HUB (big + centered) */}
          <div className="text-2xl font-extrabold text-[#8B6F47]">
            HOPE HUB
          </div>

          {/* Right: Read Me toggle (same size as Contacts) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-1.5 rounded-full text-[#8B6F47] border border-[#E2B887]/50 bg-white/70 hover:bg-white transition flex items-center gap-2 text-sm"
            aria-expanded={open}
          >
            Read Me {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Read Me drawer */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <div className="bg-white/80 rounded-xl shadow border border-[#E2B887]/40 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <Info className="w-5 h-5 text-[#8B6F47]" />
                </div>
                <div className="text-[#8B6F47] leading-relaxed">
                  <p className="font-semibold mb-1">🐾 Welcome to Hope Corner</p>
                  <p>
                    A place where care meets action. 
                    If you’ve <b>lost or found a pet</b>, or see an <b>animal
                    needing help</b>, share it here.
                    Bring hope closer. Together, we make sure no paw is left behind. 
                  </p>
                  <p className="mt-3 font-semibold">— @PawSnap Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {}}
            className="px-4 py-2 rounded-full bg-[#E2B887] text-white hover:brightness-95"
          >
            + Create Report
          </button>
          <div className="text-[#8B6F47]/70 text-sm">
            (Coming soon: Lost / Found / Needs Help filters & feed)
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl shadow p-6 border border-[#E2B887]/30 text-[#8B6F47]/70">
        </div>
      </div>
    </div>
  );
}