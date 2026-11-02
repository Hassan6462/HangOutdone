import React, { useState } from 'react';
import { UserProfile, AppSettings } from '../types';
import { storage } from '../services/storage';
import {
  X,
  Settings as SettingsIcon,
  Bell,
  Lock,
  UserX,
  FileText,
  LogOut,
  Trash2,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditProfile: () => void;
  onSignOut: () => void;
  onAccountDeleted: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOpenEditProfile,
  onSignOut,
  onAccountDeleted,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() =>
    storage.getBlockedUsers(currentUser.uid)
  );
  const [showGuidelines, setShowGuidelines] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleUnblock = (uid: string) => {
    storage.unblockUser(currentUser.uid, uid);
    setBlockedUsers(storage.getBlockedUsers(currentUser.uid));
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        '⚠️ Are you sure you want to permanently delete your account and all associated data?\n\nThis cannot be undone.'
      )
    ) {
      storage.deleteAccount(currentUser.uid);
      onAccountDeleted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-[#FF7E5F]" />
            <h2 className="text-base font-bold">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-gray-700">
          {/* Profile Shortcut */}
          <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-2xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FF7E5F] overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                {currentUser.photoUri ? (
                  <img src={currentUser.photoUri} alt={currentUser.firstName} className="w-full h-full object-cover" />
                ) : (
                  currentUser.firstName.charAt(0)
                )}
              </div>
              <div>
                <span className="font-bold text-[#2D2640] block">{currentUser.fullName}</span>
                <span className="text-[11px] text-gray-500">Manage bio, photo, interests</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenEditProfile();
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 font-bold hover:bg-gray-50 text-xs text-[#2D2640]"
            >
              Edit
            </button>
          </div>

          {/* Notifications Controls (FR-N6) */}
          <div className="space-y-2">
            <h3 className="font-bold text-[#2D2640] uppercase tracking-wider text-[11px] text-gray-400 flex items-center">
              <Bell className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" /> Notification Preferences
            </h3>
            <div className="space-y-2 bg-[#FBF9F6] p-3 rounded-2xl border border-gray-200/80">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Join request alerts</span>
                <input
                  type="checkbox"
                  checked={settings.joinRequestAlerts}
                  onChange={() => handleToggle('joinRequestAlerts')}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Chat message notifications</span>
                <input
                  type="checkbox"
                  checked={settings.chatMessageAlerts}
                  onChange={() => handleToggle('chatMessageAlerts')}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Nearby hangouts matching interests</span>
                <input
                  type="checkbox"
                  checked={settings.interestMatchAlerts}
                  onChange={() => handleToggle('interestMatchAlerts')}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Upcoming hangout reminders</span>
                <input
                  type="checkbox"
                  checked={settings.hangoutReminders}
                  onChange={() => handleToggle('hangoutReminders')}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
              </label>
            </div>
          </div>

          {/* Blocked Users (FR-S3) */}
          <div>
            <h3 className="font-bold text-[#2D2640] uppercase tracking-wider text-[11px] text-gray-400 mb-2 flex items-center">
              <UserX className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" /> Blocked Users ({blockedUsers.length})
            </h3>
            {blockedUsers.length === 0 ? (
              <p className="text-gray-400 italic">No blocked users.</p>
            ) : (
              <div className="space-y-1.5">
                {blockedUsers.map((uid) => {
                  const u = storage.getUser(uid);
                  return (
                    <div
                      key={uid}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <span className="font-medium">{u ? u.fullName : `User (${uid})`}</span>
                      <button
                        onClick={() => handleUnblock(uid)}
                        className="text-xs text-[#FF7E5F] font-bold hover:underline"
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Terms & Community Guidelines (FR-T2) */}
          <div className="space-y-2">
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="w-full text-left font-bold text-[#2D2640] flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" /> Community Guidelines & Safety Rules
              </span>
              <span className="text-xs text-[#FF7E5F]">{showGuidelines ? 'Hide' : 'Read'}</span>
            </button>

            {showGuidelines && (
              <div className="p-3.5 bg-white rounded-2xl border border-gray-200 text-[11px] text-gray-600 leading-relaxed space-y-1.5 animate-in fade-in">
                <p><strong>1. Friendship Only:</strong> HangOut is created to reduce loneliness and foster shared activities (sports, coffee, studies). It is never for dating or romantic solicitation.</p>
                <p><strong>2. Public Meetups Only:</strong> All initial gatherings must take place in public, visible areas.</p>
                <p><strong>3. Mutual Respect:</strong> Disrespect, harassment, hate speech, or offensive content will lead to immediate permanent ban.</p>
                <p><strong>4. Age Requirement:</strong> Members must be at least 15 years old.</p>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-300 font-bold hover:bg-gray-50 flex items-center justify-center space-x-2 text-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account & Data (FR-A7)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
