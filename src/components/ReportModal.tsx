import React, { useState } from 'react';
import { UserProfile, Report } from '../types';
import { storage } from '../services/storage';
import { X, Flag, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  targetType: 'user' | 'card' | 'comment' | 'message' | 'photo';
  targetId: string;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'misuse_for_dating', label: 'Misuse for dating / Unwanted romantic advances (HangOut is for friendship only)' },
  { id: 'harassment_or_bullying', label: 'Harassment, disrespectful behavior or bullying' },
  { id: 'safety_concern', label: 'Safety concern or suspicious meetup request' },
  { id: 'no_show_or_scam', label: 'No-show / Fake profile / Commercial solicitation' },
  { id: 'inappropriate_content', label: 'Inappropriate or offensive content' },
  { id: 'spam', label: 'Spam, advertising, or repetitive posts' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  currentUser,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState<Report['reason']>('misuse_for_dating');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    storage.submitReport({
      reporterId: currentUser?.uid || 'anonymous',
      reporterName: currentUser?.fullName || 'Anonymous',
      targetType,
      targetId,
      reason,
      description: description.trim(),
    });

    alert(
      'Report submitted to our moderation queue. Your identity is completely hidden from the reported member. Thank you for protecting our community!'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557]">
          <div className="flex items-center space-x-2">
            <Flag className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold">Report Content / Member</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              HangOut strictly enforces safety and zero tolerance for dating advances or harassment. Your report is 100% confidential.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Select Reason</label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start space-x-2 p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                    reason === r.id
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === r.id}
                    onChange={() => setReason(r.id as any)}
                    className="mt-0.5 text-[#FF7E5F] focus:ring-[#FF7E5F]"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Provide any context to help moderators review..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
          >
            Submit Confidential Report
          </button>
        </form>
      </div>
    </div>
  );
};
