import React from 'react';
import { HangoutCard, JoinRequestStatus } from '../types';
import { Clock, MapPin, Users, MessageSquare, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HangoutCardItemProps {
  card: HangoutCard;
  isOwner: boolean;
  joinStatus: JoinRequestStatus | 'none';
  commentsCount: number;
  onCardClick: (card: HangoutCard) => void;
  onJoin: (card: HangoutCard) => void;
  onOpenChat: (card: HangoutCard) => void;
  onViewProfile: (userId: string) => void;
}

export const HangoutCardItem: React.FC<HangoutCardItemProps> = ({
  card,
  isOwner,
  joinStatus,
  commentsCount,
  onCardClick,
  onJoin,
  onOpenChat,
  onViewProfile,
}) => {
  const spotsLeft = Math.max(0, card.maxPeople - card.currentPeople);
  const isFull = spotsLeft === 0;

  const hasPhoto = card.photoUrls && card.photoUrls.length > 0;

  return (
    <div
      onClick={() => onCardClick(card)}
      className="bg-white rounded-2xl p-4 mb-3.5 border border-[#ede9e3] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition cursor-pointer group relative overflow-hidden"
    >
      {/* Top row: Activity + Time + Rules */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#FFF0EB] text-[#FF7E5F] text-xs font-bold tracking-tight">
            {card.activityType}
          </span>

          {card.rules?.sameGenderOnly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-100">
              Same Gender Only
            </span>
          )}

          {card.rules?.verifiedOnly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Verified Only
            </span>
          )}
        </div>

        <span className="flex items-center text-xs text-[#999999] font-medium shrink-0 ml-2">
          <Clock className="w-3 h-3 mr-1 text-[#bbb]" />
          {card.timeWindow}
        </span>
      </div>

      {/* Main Content with Optional Photo Thumbnail (FR-F3) */}
      <div className="flex gap-3 mb-2.5">
        <div className="flex-1">
          {/* Card Title (FR-H7) */}
          <h3 className="text-base font-bold text-[#2D2640] mb-1 group-hover:text-[#FF7E5F] transition leading-snug">
            {card.title || `${card.postedByName} wants to ${card.activityType.replace(/^[^\w\s]+\s*/, '').toLowerCase()}`}
          </h3>

          {/* Description Snippet */}
          {card.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
              {card.description}
            </p>
          )}

          {/* Host byline & trust score */}
          <div
            className="flex items-center space-x-2 text-xs text-[#666666] mb-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(card.postedByUid);
            }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] overflow-hidden flex items-center justify-center text-white text-[10px] font-bold">
              {card.postedByPhoto ? (
                <img src={card.postedByPhoto} alt={card.postedByName} className="w-full h-full object-cover" />
              ) : (
                card.postedByName.charAt(0)
              )}
            </div>
            <span className="font-semibold text-gray-700 hover:underline">{card.postedByName}</span>
            <span className="text-amber-500 flex items-center text-[11px] font-bold">
              <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> 4.9
            </span>
          </div>
        </div>

        {/* Thumbnail Image (FR-F3) */}
        {hasPhoto && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
            <img
              src={card.photoUrls![0]}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        )}
      </div>

      {/* Location Area Label (FR-H6: Exact meeting point hidden from strangers) */}
      <p className="flex items-center text-xs text-[#666666] mb-3">
        <MapPin className="w-3.5 h-3.5 mr-1 text-[#FF7E5F] shrink-0" />
        <span className="truncate">{card.locationLabel}</span>
      </p>

      {/* Divider */}
      <div className="h-[1px] bg-[#F0F0F0] mb-3" />

      {/* Bottom row: spots left + comments + join action */}
      <div
        className="flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 text-xs text-[#888888]">
          <span className="flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-[#aaa]" />
            {isFull ? (
              <span className="text-red-500 font-bold">Full</span>
            ) : spotsLeft === 1 ? (
              <span className="text-amber-600 font-semibold">1 spot left</span>
            ) : (
              <span>{spotsLeft} spots left</span>
            )}
            <span className="text-[11px] text-[#bbb] ml-1">
              ({card.currentPeople}/{card.maxPeople})
            </span>
          </span>

          {commentsCount > 0 && (
            <span className="flex items-center text-[11px] text-gray-500">
              <MessageSquare className="w-3 h-3 mr-1 text-gray-400" />
              {commentsCount}
            </span>
          )}
        </div>

        <div>
          {isOwner ? (
            <button
              onClick={() => onOpenChat(card)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2D2640] text-white hover:bg-[#3d3455] transition"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Host Chat</span>
            </button>
          ) : joinStatus === 'approved' ? (
            <button
              onClick={() => onOpenChat(card)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chat Open</span>
            </button>
          ) : joinStatus === 'pending' ? (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-default"
            >
              Requested (Waiting)
            </button>
          ) : isFull ? (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Group Full
            </button>
          ) : (
            <button
              onClick={() => onJoin(card)}
              className="px-5 py-1.5 rounded-full text-xs font-bold bg-[#FF7E5F] hover:bg-[#ff6844] active:scale-95 text-white transition shadow-xs shadow-[#FF7E5F]/20 cursor-pointer"
            >
              I'm in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
