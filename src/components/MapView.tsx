import React, { useState } from 'react';
import { HangoutCard } from '../types';
import { MapPin, Navigation, Users, Clock } from 'lucide-react';

interface MapViewProps {
  hangouts: HangoutCard[];
  currentUserId: string;
  onJoin: (card: HangoutCard) => void;
  onOpenChat: (card: HangoutCard) => void;
  onViewProfile: (userId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  hangouts,
  currentUserId,
  onJoin,
  onOpenChat,
  onViewProfile,
}) => {
  const [selectedHangout, setSelectedHangout] = useState<HangoutCard | null>(
    hangouts[0] || null
  );

  // Approximate relative grid placements for pins on the stylized local map
  const getPinCoordinates = (index: number) => {
    // Generate pleasant dispersed coords within 15% to 85%
    const angles = [
      { x: 35, y: 32 },
      { x: 68, y: 45 },
      { x: 42, y: 65 },
      { x: 75, y: 28 },
      { x: 22, y: 55 },
      { x: 58, y: 78 },
    ];
    return angles[index % angles.length] || { x: 50 + ((index * 17) % 35) - 15, y: 50 + ((index * 23) % 35) - 15 };
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#ede9e3] shadow-inner bg-[#EAE7DC]">
      {/* Map Graphic Background Simulation */}
      <div className="absolute inset-0 bg-[#E8E6DF] opacity-90 overflow-hidden pointer-events-none">
        {/* Stylized streets / waterways / parks */}
        <svg className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCD7CE" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Roads */}
          <path d="M -20 180 Q 250 120 600 320 T 900 480" fill="none" stroke="#FFFFFF" strokeWidth="16" />
          <path d="M 140 -20 Q 220 250 320 600" fill="none" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M 450 -20 Q 520 280 620 600" fill="none" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M -20 380 Q 300 420 850 210" fill="none" stroke="#FAF7F2" strokeWidth="10" />
          {/* Park area */}
          <rect x="25%" y="22%" width="22%" height="30%" rx="18" fill="#D5E8D4" stroke="#C4DAC3" strokeWidth="2" opacity="0.8" />
          <text x="28%" y="30%" fill="#729671" fontSize="11" fontWeight="600">Central Green</text>
          {/* River / lake */}
          <path d="M 78% 0 Q 72% 260 88% 600" fill="none" stroke="#CBE4F7" strokeWidth="32" opacity="0.75" />
          <text x="80%" y="15%" fill="#88AEC9" fontSize="10" fontWeight="600">River Walk</text>
        </svg>
      </div>

      {/* User Current Location Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-ping" />
          <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px]">
            <Navigation className="w-2.5 h-2.5 transform -rotate-45" />
          </span>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-700 px-1.5 py-0.5 rounded shadow-xs">
          You are here
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1 bg-white rounded-xl shadow-md p-1 border border-gray-200">
        <button
          onClick={() => setSelectedHangout(hangouts[0] || null)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 text-xs font-semibold"
          title="Recenter"
        >
          <Navigation className="w-4 h-4 text-[#FF7E5F]" />
        </button>
      </div>

      {/* Hangout Pins */}
      {hangouts.map((hangout, index) => {
        const coords = getPinCoordinates(index);
        const isSelected = selectedHangout?.id === hangout.id;
        const emoji = hangout.activityType.split(' ')[0] || '📍';

        return (
          <button
            key={hangout.id}
            onClick={() => setSelectedHangout(hangout)}
            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-200 cursor-pointer ${
              isSelected ? 'scale-125 z-30' : 'hover:scale-110'
            }`}
          >
            <div className="relative flex flex-col items-center">
              {/* Pin bubble */}
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full shadow-lg border-2 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-[#2D2640] text-white border-[#FF7E5F]'
                    : 'bg-white text-[#2D2640] border-[#FF7E5F]/50 hover:border-[#FF7E5F]'
                }`}
              >
                <span>{emoji}</span>
                <span className="hidden sm:inline font-medium text-[11px] truncate max-w-[70px]">
                  {hangout.postedByName}
                </span>
              </div>
              {/* Pointer triangle */}
              <div
                className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
                  isSelected ? 'border-t-[#2D2640]' : 'border-t-white'
                }`}
              />
            </div>
          </button>
        );
      })}

      {/* Selected Hangout Card Floating Preview at Bottom */}
      {selectedHangout && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-gray-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FFF0EB] text-[#FF7E5F] text-[11px] font-bold">
                  {selectedHangout.activityType}
                </span>
                <span className="text-[11px] text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-0.5 text-gray-400" />
                  {selectedHangout.timeWindow}
                </span>
              </div>
              <h4
                onClick={() => onViewProfile(selectedHangout.postedByUid)}
                className="text-sm font-bold text-[#2D2640] hover:text-[#FF7E5F] cursor-pointer truncate"
              >
                {selectedHangout.postedByName}'s Hangout
              </h4>
              <p className="text-xs text-gray-600 flex items-center mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-[#FF7E5F] mr-1 shrink-0" />
                {selectedHangout.locationLabel}
              </p>
            </div>

            <div className="flex flex-col items-end space-y-1.5 shrink-0">
              <div className="text-[11px] text-gray-500 flex items-center">
                <Users className="w-3 h-3 mr-1 text-gray-400" />
                {selectedHangout.maxPeople - selectedHangout.currentPeople} spots left
              </div>
              {selectedHangout.postedByUid === currentUserId ? (
                <button
                  onClick={() => onOpenChat(selectedHangout)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2D2640] text-white hover:bg-[#3e3557] transition"
                >
                  Your Chat
                </button>
              ) : (
                <button
                  onClick={() => onJoin(selectedHangout)}
                  className="px-4 py-1 rounded-full text-xs font-bold bg-[#FF7E5F] hover:bg-[#ff6844] text-white transition shadow-sm"
                >
                  I'm in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
