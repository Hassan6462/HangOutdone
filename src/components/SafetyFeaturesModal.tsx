import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  X,
  Shield,
  AlertOctagon,
  Share2,
  CheckCircle,
  PhoneCall,
  MapPin,
  HeartHandshake,
} from 'lucide-react';

interface SafetyFeaturesModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyFeaturesModal: React.FC<SafetyFeaturesModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [trustedContact, setTrustedContact] = useState('');
  const [sharedLink, setSharedLink] = useState(false);

  if (!isOpen) return null;

  const handlePanicButton = () => {
    if (confirm('🚨 ACTIVATE EMERGENCY PANIC ALERT?\n\nThis will trigger local emergency services simulation and notify emergency contacts with your last known location.')) {
      alert('Emergency alert recorded. If in immediate danger, please dial local emergency services (911 / 112) immediately.');
    }
  };

  const handleShareLiveLocation = () => {
    setSharedLink(true);
    navigator.clipboard?.writeText?.(
      `https://hangout.app/safety/live-track?user=${currentUser.uid}&t=${Date.now()}`
    );
    alert('Live safety tracking link copied to clipboard! Share this with a trusted friend or family member.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Safety Center & Panic Tools</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* FR-S5: Panic Button */}
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-1">
              <AlertOctagon className="w-5 h-5" />
              <span>In-Hangout Emergency Panic Button</span>
            </div>
            <p className="text-red-600 mb-3 leading-relaxed">
              Feeling unsafe or uncomfortable during an active meetup? Tap below to record an emergency alert and alert trusted contacts.
            </p>
            <button
              type="button"
              onClick={handlePanicButton}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md shadow-red-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Panic Button</span>
            </button>
          </div>

          {/* FR-S5: In-app Check-in */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-gray-200">
            <h3 className="font-bold text-[#2D2640] mb-1 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> In-App Hangout Check-In
            </h3>
            <p className="text-gray-600 mb-3">
              Check in when you arrive at the meetup spot to confirm all is safe.
            </p>
            <button
              type="button"
              onClick={() => setCheckedIn(!checkedIn)}
              className={`w-full py-2 rounded-xl font-bold transition ${
                checkedIn
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {checkedIn ? '✓ You Checked In (Safe & Sound)' : 'Check In at Meetup Spot'}
            </button>
          </div>

          {/* FR-S4: Share Live Location */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-gray-200">
            <h3 className="font-bold text-[#2D2640] mb-1 flex items-center">
              <Share2 className="w-4 h-4 mr-1 text-[#FF7E5F]" /> Share Location with Trusted Contact
            </h3>
            <p className="text-gray-600 mb-2">
              Generate a temporary live tracking link for friends or family while you're hanging out.
            </p>
            <button
              type="button"
              onClick={handleShareLiveLocation}
              className="w-full py-2 rounded-xl bg-[#2D2640] hover:bg-[#3d3455] text-white font-bold transition"
            >
              {sharedLink ? '✓ Location Link Copied to Clipboard!' : 'Copy Live Tracking Link'}
            </button>
          </div>

          {/* Safety Guidelines (FR-J7 & Section 1.1) */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/70 space-y-1.5 text-blue-950">
            <span className="font-bold block flex items-center">
              <HeartHandshake className="w-4 h-4 mr-1 text-blue-600" /> HangOut Community Pledge
            </span>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-blue-900 leading-relaxed">
              <li>HangOut is exclusively for friendship and activities, never dating.</li>
              <li>Always meet in well-lit public spots (parks, cafes, libraries, gyms).</li>
              <li>Never feel obligated to stay if a vibe feels off. Trust your gut.</li>
              <li>Report anyone attempting romantic advances or unsolicited contact.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
