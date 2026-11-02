import React, { useState } from 'react';
import { UserProfile, HangoutCard } from '../types';
import { storage } from '../services/storage';
import { X, Star, ThumbsUp, ThumbsDown, Check, ShieldCheck } from 'lucide-react';

interface ReviewModalProps {
  hangout: HangoutCard;
  currentUser: UserProfile;
  targetUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

const REVIEW_TAGS = [
  'Fun', 'On time', 'Felt safe', 'Friendly host',
  'Great communication', 'Welcoming group', 'Clean space',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  hangout,
  currentUser,
  targetUser,
  isOpen,
  onClose,
  onReviewed,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [thumbsUp, setThumbsUp] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fun', 'Felt safe']);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    storage.submitReview({
      hangoutId: hangout.id,
      hangoutTitle: hangout.title || hangout.activityType,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.fullName,
      reviewerPhoto: currentUser.photoUri,
      revieweeId: targetUser.uid,
      rating,
      thumbsUp,
      tags: selectedTags,
      comment: comment.trim(),
      isAnonymous,
    });

    alert(`Review submitted! Thank you for helping keep HangOut trusted.`);
    onReviewed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557]">
          <div>
            <h2 className="text-base font-bold flex items-center">
              <Star className="w-4 h-4 mr-1.5 text-amber-400 fill-amber-400" /> Review {targetUser.firstName}
            </h2>
            <p className="text-[11px] text-[#CCC3E8]">{hangout.title || hangout.activityType}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1-5 Star Rating (FR-R2) */}
          <div className="text-center">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Overall Experience</label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Thumbs up / down */}
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={() => setThumbsUp(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
                thumbsUp
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Would hangout again</span>
            </button>
            <button
              type="button"
              onClick={() => setThumbsUp(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition ${
                !thumbsUp
                  ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Had issues</span>
            </button>
          </div>

          {/* Quick tags (FR-R2) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Quick Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {REVIEW_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-[#2D2640] text-white border-[#2D2640]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Short Review Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="e.g. Friendly organizer, brought equipment and made everyone feel welcome!"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F] resize-none"
            />
          </div>

          {/* Anonymous option (FR-R6) */}
          <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
            />
            <span>Post review anonymously on {targetUser.firstName}'s profile</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#FF7E5F] hover:bg-[#ff6844] text-white text-xs font-bold shadow-md transition"
          >
            Submit Review & Trust Rating
          </button>
        </form>
      </div>
    </div>
  );
};
