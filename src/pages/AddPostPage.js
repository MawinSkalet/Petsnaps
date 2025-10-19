import React from "react";
import { Plus } from "lucide-react";

function AddPostPage() {
  return (
    <div className="flex h-[600px] bg-white rounded-3xl shadow-lg overflow-hidden items-center justify-center">
      <div className="text-center p-8">
        <Plus className="w-20 h-20 text-[#E2B887]/50 mx-auto mb-4" />
        <p className="text-xl text-[#8B6F47]/60 font-semibold">
          Post creation functionality is currently disabled.
        </p>
        <p className="text-[#8B6F47]/50 mt-2">
          This feature requires a backend session.
        </p>
      </div>
    </div>
  );
}

export default AddPostPage;
