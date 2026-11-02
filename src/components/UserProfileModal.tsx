import React, { useState } from 'react';
import { UserProfile, HangoutCard, Review } from '../types';
import { storage } from '../services/storage';
import {
  ArrowLeft,
  Star,
  Calendar,
  Heart,
  UserPlus,
  UserCheck,
  MessageCircle,
  Flag,
  ShieldAlert,
  Edit3,
  Image as ImageIcon,
  ThumbsUp,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  currentUser: UserProfile | null;
  userHangouts: HangoutCard[];
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onStartDm: (targetUser: UserProfile) => void;
  onReport: (targetType: 'user', targetId: string) => void;
  onSelectHangout?: (card: HangoutCard) => void;
  onUserUpdated: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  userHangouts,
  isOpen,
  onClose,
  onEditProfile,
  onStartDm,
  onReport,
  onSelectHangout,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'hangouts' | 'reviews' | 'gallery'>('hangouts');

  if (!isOpen) return null;

  const isMe = currentUser?.uid === user.uid;
  const isFriend = currentUser ? storage.isFriend(currentUser.uid, user.uid) : false;
  const isBlocked = currentUser ? storage.getBlockedUsers(currentUser.uid).includes(user.uid) : false;
  const reviews = storage.getReviewsForUser(user.uid);

  const handleToggleFriend = () => {
    if (!currentUser) return;
    if (isFriend) {
      // Remove friend
      alert(`${user.firstName} is in your friends circle.`);
    } else {
      storage.addFriend(currentUser.uid, user.uid);
      alert(`Added ${user.firstName} as a friend! You will see each other's hangout posts first.`);
      onUserUpdated();
    }
  };

  const handleBlockUser = () => {
    if (!currentUser) return;
    if (confirm(`Block ${user.firstName}? You will no longer see each other's hangouts, comments, or messages.`)) {
      storage.blockUser(currentUser.uid, user.uid);
      alert(`${user.firstName} has been blocked.`);
      onUserUpdated();
      onClose();
    }
  };

  // Name with privacy rule (FR-P8: user can control who sees last name)
  const displayName = isMe || user.showLastName !== false
    ? user.fullName
    : `${user.firstName} ${user.lastName ? user.lastName.charAt(0) + '.' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold tracking-wide">
            {isMe ? 'My Profile' : `${user.firstName}'s Profile`}
          </span>

          <div className="flex items-center space-x-1">
            {!isMe && (
              <>
                <button
                  onClick={() => onReport('user', user.uid)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-amber-400 transition"
                  title="Report Profile"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBlockUser}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-red-400 transition"
                  title="Block Member"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </>
            )}
            {isMe && (
              <button
                onClick={onEditProfile}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
                title="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Top Profile Card */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] p-1 shadow-md mb-2.5">
              {user.photoUri ? (
                <img
                  src={user.photoUri}
                  alt={user.fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#3B3254] flex items-center justify-center text-white text-3xl font-bold">
                  {user.firstName.charAt(0)}
                </div>
              )}
              {user.isVerified && (
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[#2D2640] flex items-center justify-center space-x-1.5">
              <span>{displayName}</span>
              {user.isVerified && (
                <span title="Verified identity">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </span>
              )}
            </h2>

            {/* Age & Bio (FR-P3, FR-P8) */}
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {user.showAge !== false && user.age > 0 ? `${user.age} years old` : 'Verified Member'}
            </p>

            {user.bio && (
              <p className="text-xs text-gray-700 max-w-sm mt-2 leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-gray-200/80">
                "{user.bio}"
              </p>
            )}

            {/* Trust Score & Stats Badges (FR-R4, FR-R5) */}
            <div className="flex items-center justify-center space-x-2 mt-3">
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#FF7E5F] text-xs font-bold border border-[#FFE1D6]">
                <Star className="w-3.5 h-3.5 fill-[#FF7E5F]" />
                <span>{user.reviewCount >= 2 ? `${user.trustScore} Trust Score` : 'New member · Trusted'}</span>
                {user.reviewCount > 0 && (
                  <span className="text-[11px] text-gray-500 font-normal">({user.reviewCount})</span>
                )}
              </div>

              <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                {user.hostedCount || userHangouts.length} hosted &middot; {user.attendedCount || 0} joined
              </div>
            </div>

            {/* Action Buttons for other users: Add Friend (FR-L1), Send DM (FR-C2) */}
            {!isMe && (
              <div className="flex items-center justify-center space-x-2.5 mt-4 w-full max-w-xs">
                <button
                  onClick={handleToggleFriend}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    isFriend
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#2D2640] hover:bg-[#3d3455] text-white shadow-xs'
                  }`}
                >
                  {isFriend ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Friends</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStartDm(user)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#FF7E5F] hover:bg-[#ff6844] text-white shadow-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send DM</span>
                </button>
              </div>
            )}
          </div>

          {/* Interests Tags (FR-P1) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center">
              <Heart className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" /> Shared Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-[#F5F3EE] text-gray-800 border border-gray-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Tab Selector: Hangouts / Reviews (FR-R6) / Photo Gallery (FR-P7) */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('hangouts')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'hangouts'
                    ? 'border-[#FF7E5F] text-[#FF7E5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Hangouts ({userHangouts.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'reviews'
                    ? 'border-[#FF7E5F] text-[#FF7E5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'gallery'
                    ? 'border-[#FF7E5F] text-[#FF7E5F]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Gallery ({user.galleryPhotos?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'hangouts' && (
            <div className="space-y-2">
              {userHangouts.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center italic">No active hangouts right now.</p>
              ) : (
                userHangouts.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      if (onSelectHangout) onSelectHangout(h);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F0EEE8] transition border border-gray-200 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#2D2640] block group-hover:text-[#FF7E5F] transition">
                        {h.title || h.activityType}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {h.timeWindow} &middot; {h.locationLabel}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#FF7E5F] bg-[#FFF0EB] px-2.5 py-1 rounded-lg">
                      {h.currentPeople}/{h.maxPeople} joined
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center italic">
                  No post-hangout reviews yet. Reviews are submitted by verified participants after an activity ends.
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-[#FAF8F5] rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-800">
                          {rev.isAnonymous ? 'Anonymous Member' : rev.reviewerName}
                        </span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mb-2 leading-relaxed">{rev.comment}</p>

                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-white text-[10px] text-gray-600 border border-gray-200 font-medium"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              {user.galleryPhotos && user.galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {user.galleryPhotos.map((photo, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-square border border-gray-100 shadow-xs">
                      <img src={photo} alt="Hangout memory" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                  <p className="text-xs">No photos shared from past hangouts yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
