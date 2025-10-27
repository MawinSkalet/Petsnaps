import React, { useState } from "react";

export default function ReportPage() {
  const [text, setText] = useState("");

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-[#8B6F47] mb-4">Report a problem</h2>
      <p className="text-[#8B6F47]/80 mb-4">
        Tell us what went wrong. We’ll review it shortly.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[140px] p-3 border-2 border-[#E2B887]/30 rounded-xl focus:border-[#E2B887] focus:outline-none"
        placeholder="Describe the issue, include steps to reproduce…"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            if (!text.trim()) return;
            alert("Thanks! (Hook this to Firestore later.)");
            setText("");
          }}
          className="px-5 py-2 rounded-xl bg-[#E2B887] text-white hover:brightness-95"
        >
          Submit
        </button>
        <button
          onClick={() => setText("")}
          className="px-5 py-2 rounded-xl border border-[#E2B887]/40 text-[#8B6F47]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}