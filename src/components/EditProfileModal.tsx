import React, { useState } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';
import { X, Camera, Save, Lock } from 'lucide-react';

interface EditProfileModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

const INTERESTS_LIST = [
  '⚽ Sports', '🎬 Movies', '📺 TV Shows', '☕ Coffee',
  '🍕 Food', '✈️ Travel', '🎵 Music', '🎮 Gaming',
  '📚 Reading', '🏃 Fitness', '🎨 Art', '🧘 Wellness',
  '🌿 Outdoors', '🎭 Theatre', '🏖️ Beach', '🎤 Live Events',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [photoUri, setPhotoUri] = useState(currentUser.photoUri || '');
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [showLastName, setShowLastName] = useState<boolean>(currentUser.showLastName !== false);
  const [showAge, setShowAge] = useState<boolean>(currentUser.showAge !== false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert('First name cannot be empty');
      return;
    }
    if (interests.length < 2) {
      alert('Please select at least 2 interests');
      return;
    }

    const updated: UserProfile = {
      ...currentUser,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      bio: bio.trim(),
      photoUri: photoUri.trim(),
      interests,
      showLastName,
      showAge,
    };

    storage.saveUserProfile(updated);
    storage.setCurrentUser(updated);
    onProfileUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <h2 className="text-base font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Profile Photo URL</label>
            <input
              type="url"
              value={photoUri}
              onChange={(e) => setPhotoUri(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Short Bio (Max 200 characters)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Share what activities you enjoy or what you're down to do..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F] resize-none"
            />
          </div>

          {/* Privacy Controls (FR-P8) */}
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-gray-700 block flex items-center">
              <Lock className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" /> Privacy Settings
            </span>
            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showLastName}
                onChange={(e) => setShowLastName(e.target.checked)}
                className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
              />
              <span>Show my full last name on my profile</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showAge}
                onChange={(e) => setShowAge(e.target.checked)}
                className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
              />
              <span>Show my age on my profile</span>
            </label>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Interests (Select at least 2)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {INTERESTS_LIST.map((int) => {
                const isSelected = interests.includes(int);
                return (
                  <button
                    key={int}
                    type="button"
                    onClick={() => toggleInterest(int)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-[#FF7E5F] text-white border-[#FF7E5F]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {int}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#FF7E5F] hover:bg-[#ff6844] text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};
