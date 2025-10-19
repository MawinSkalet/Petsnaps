import React from "react";
import { MapPin } from "lucide-react";

function MapView() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 h-[600px] flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-20 h-20 text-[#E2B887] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#8B6F47] mb-2">map</h3>
        <p className="text-[#8B6F47]/60">Map feature coming soon!</p>
      </div>
    </div>
  );
}

export default MapView;
