import React, { useState } from 'react';
import { UserProfile, AppNotification } from '../types';
import {
  LogIn,
  MapPin,
  MessageSquare,
  Bell,
  Shield,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenProfile: (user: UserProfile) => void;
  onOpenLogin: () => void;
  onOpenInbox: () => void;
  onOpenNotifications: () => void;
  onOpenSafety: () => void;
  onOpenSettings: () => void;
  onOpenModerator: () => void;
  unreadMessagesCount: number;
  unreadNotifications: AppNotification[];
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenProfile,
  onOpenLogin,
  onOpenInbox,
  onOpenNotifications,
  onOpenSafety,
  onOpenSettings,
  onOpenModerator,
  unreadMessagesCount,
  unreadNotifications,
  activeCount,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#2D2640] text-white shadow-md border-b border-[#3e3557]">
      {/* Top Banner: Non-Dating & Friendship First (SRS Section 1.1 & 4.10) */}
      <div className="bg-gradient-to-r from-[#FF7E5F] via-[#FF6B6B] to-[#FFB86B] py-1 px-4 text-center text-[11px] font-bold text-white tracking-wide flex items-center justify-center space-x-1 shadow-xs">
        <Users className="w-3.5 h-3.5 mr-1" />
        <span>For friendship and shared activities &middot; Strictly not a dating app</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7E5F] to-[#FFB86B] shadow-inner overflow-hidden p-1">
            <img
              src="/logo_hangout.png"
              alt="HangOut"
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                HangOut
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7E5F]/25 text-[#FF9E85] border border-[#FF7E5F]/35">
                v2.0
              </span>
            </div>
            <p className="text-xs text-[#CCC3E8] mt-0.5 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-[#FF7E5F]" /> What's happening nearby ({activeCount} active)
            </p>
          </div>
        </div>

        {/* Action icons & User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {currentUser ? (
            <>
              {/* Messages Inbox Button (FR-C3) */}
              <button
                onClick={onOpenInbox}
                className="relative p-2 rounded-xl bg-[#3B3254] hover:bg-[#473C65] text-[#CCC3E8] hover:text-white transition"
                title="Messages Inbox"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF7E5F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-[#2D2640]">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Notifications Button (FR-N1 to N6) */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-[#3B3254] hover:bg-[#473C65] text-[#CCC3E8] hover:text-white transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF7E5F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-[#2D2640] animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Safety & Panic Check-in (FR-S4, FR-S5) */}
              <button
                onClick={onOpenSafety}
                className="p-2 rounded-xl bg-[#3B3254] hover:bg-[#473C65] text-emerald-400 hover:text-emerald-300 transition"
                title="Safety Center & Panic Check-in"
              >
                <Shield className="w-4 h-4" />
              </button>

              {/* Settings (FR-T1) */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-[#3B3254] hover:bg-[#473C65] text-[#CCC3E8] hover:text-white transition"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => onOpenProfile(currentUser)}
                  className="flex items-center space-x-2 py-1 px-2 sm:px-2.5 rounded-full bg-[#3B3254] hover:bg-[#473C65] transition border border-[#524474] text-left"
                  title="View your profile"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-1 ring-white/20 shrink-0">
                    {currentUser.photoUri ? (
                      <img
                        src={currentUser.photoUri}
                        alt={currentUser.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.firstName.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white hidden md:inline truncate max-w-[80px]">
                    {currentUser.firstName}
                  </span>
                </button>
              </div>

              {/* Moderator / Admin shortcut */}
              <button
                onClick={onOpenModerator}
                className="p-1.5 text-xs text-[#CCC3E8] hover:text-amber-400 transition"
                title="Moderation Queue (Admin)"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center space-x-1.5 bg-[#FF7E5F] hover:bg-[#f66d4c] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
