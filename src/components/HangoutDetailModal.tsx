import React, { useState } from 'react';
import { HangoutCard, UserProfile, JoinRequest, Comment } from '../types';
import { storage } from '../services/storage';
import {
  X,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageCircle,
  Star,
  Send,
  Trash2,
  Flag,
  AlertTriangle,
  UserCheck,
  UserX,
  Heart,
  Share2,
} from 'lucide-react';

interface HangoutDetailModalProps {
  hangout: HangoutCard;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (card: HangoutCard) => void;
  onOpenChat: (card: HangoutCard) => void;
  onViewProfile: (userId: string) => void;
  onReport: (targetType: 'card' | 'user' | 'comment', targetId: string) => void;
  onHangoutUpdated: () => void;
}

export const HangoutDetailModal: React.FC<HangoutDetailModalProps> = ({
  hangout,
  currentUser,
  isOpen,
  onClose,
  onJoin,
  onOpenChat,
  onViewProfile,
  onReport,
  onHangoutUpdated,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  if (!isOpen) return null;

  const isOwner = currentUser?.uid === hangout.postedByUid;
  const joinRequests = storage.getJoinRequests(hangout.id);
  const approvedRequests = joinRequests.filter((r) => r.status === 'approved');
  const pendingRequests = joinRequests.filter((r) => r.status === 'pending');
  const userRequest = currentUser
    ? joinRequests.find((r) => r.userId === currentUser.uid)
    : null;
  const isApproved = isOwner || userRequest?.status === 'approved';
  const isPending = userRequest?.status === 'pending';
  const comments = storage.getComments(hangout.id);
  const spotsLeft = Math.max(0, hangout.maxPeople - hangout.currentPeople);
  const isFull = spotsLeft === 0;

  const handleApprove = (reqId: string) => {
    storage.approveJoinRequest(reqId);
    onHangoutUpdated();
  };

  const handleDecline = (reqId: string) => {
    storage.declineJoinRequest(reqId);
    onHangoutUpdated();
  };

  const handleLeave = () => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to leave this hangout?')) {
      storage.leaveHangout(hangout.id, currentUser.uid);
      onHangoutUpdated();
    }
  };

  const handleRemoveParticipant = (uid: string) => {
    if (confirm('Remove this participant from the hangout?')) {
      storage.removeParticipant(hangout.id, uid);
      onHangoutUpdated();
    }
  };

  const handleCancelHangout = () => {
    if (confirm('Are you sure you want to cancel this hangout? All participants will be notified.')) {
      storage.cancelHangout(hangout.id);
      onHangoutUpdated();
      onClose();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to comment');
      return;
    }
    if (!commentText.trim()) return;

    storage.addComment({
      hangoutId: hangout.id,
      authorId: currentUser.uid,
      authorName: currentUser.fullName,
      authorPhoto: currentUser.photoUri,
      text: commentText.trim(),
      parentId: replyingTo?.id,
    });

    setCommentText('');
    setReplyingTo(null);
    onHangoutUpdated();
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      storage.deleteComment(commentId);
      onHangoutUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#2D2640] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#FFF0EB] text-[#FF7E5F] text-xs font-bold">
              {hangout.activityType}
            </span>
            <span className="text-xs text-[#CCC3E8] flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" />
              {hangout.timeWindow}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReport('card', hangout.id)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-amber-400 transition"
              title="Report Hangout"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Photos Carousel/Header */}
          {hangout.photoUrls && hangout.photoUrls.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 max-h-64 sm:max-h-72">
              <img
                src={hangout.photoUrls[0]}
                alt={hangout.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Description (FR-H7) */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D2640] leading-tight">
              {hangout.title || `${hangout.postedByName}'s Hangout`}
            </h2>

            {/* Rules badges */}
            <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-1">
              {hangout.rules?.sameGenderOnly && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                  👭 Same Gender Only
                </span>
              )}
              {hangout.rules?.verifiedOnly && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Members Only
                </span>
              )}
              {hangout.rules?.ageRangeMin && hangout.rules?.ageRangeMax && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  Ages {hangout.rules.ageRangeMin} - {hangout.rules.ageRangeMax}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {hangout.description || 'No additional details provided. Meet up and have fun!'}
            </p>
          </div>

          {/* Host Card */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE9E3] flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => onViewProfile(hangout.postedByUid)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] overflow-hidden flex items-center justify-center text-white text-base font-bold shadow-xs">
                {hangout.postedByPhoto ? (
                  <img src={hangout.postedByPhoto} alt={hangout.postedByName} className="w-full h-full object-cover" />
                ) : (
                  hangout.postedByName.charAt(0)
                )}
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-gray-400 block">Host</span>
                <span className="text-sm font-bold text-[#2D2640] group-hover:text-[#FF7E5F] transition flex items-center">
                  {hangout.postedByName}
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 ml-1.5" />
                  <span className="text-xs font-bold text-gray-700 ml-0.5">4.9</span>
                </span>
                <span className="text-xs text-gray-500 block">Tap to view host profile & trust score</span>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={handleCancelHangout}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
              >
                Cancel Hangout
              </button>
            )}
          </div>

          {/* Location & Exact Meeting Point (FR-H6, FR-J3, NFR-3) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-5 h-5 text-[#FF7E5F] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Location Area
                </span>
                <p className="text-sm font-bold text-[#2D2640]">{hangout.locationLabel}</p>

                {/* Exact meeting point reveal */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  {isApproved ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-xs font-bold text-emerald-800 flex items-center mb-0.5">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Exact Meeting Point (Approved Only)
                      </span>
                      <p className="text-xs text-emerald-950 font-medium">
                        {hangout.exactMeetingPoint || hangout.locationLabel}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-800">
                        Exact pin & meeting point are revealed only after the host approves your join request.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Public Meeting Spot Safety Banner (FR-J7) */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong className="font-semibold">HangOut Safety Rule:</strong> Always meet at open, public spots (cafes, public parks, community courts). Never agree to meet at private residences.
            </p>
          </div>

          {/* Approved Participants List (FR-J3, FR-J6) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-[#2D2640] flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-[#FF7E5F]" /> Confirmed Attendees ({hangout.currentPeople}/{hangout.maxPeople})
              </h3>
              <span className="text-xs text-gray-500">
                {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots remaining`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Host entry */}
              <div
                onClick={() => onViewProfile(hangout.postedByUid)}
                className="p-2.5 rounded-xl bg-[#F8F7F4] border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                    {hangout.postedByPhoto ? (
                      <img src={hangout.postedByPhoto} alt={hangout.postedByName} className="w-full h-full object-cover" />
                    ) : (
                      hangout.postedByName.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">{hangout.postedByName}</span>
                    <span className="text-[10px] text-[#FF7E5F] font-semibold">Organizer</span>
                  </div>
                </div>
              </div>

              {/* Other approved members */}
              {approvedRequests
                .filter((r) => r.userId !== hangout.postedByUid)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl bg-[#F8F7F4] border border-gray-200 flex items-center justify-between"
                  >
                    <div
                      onClick={() => onViewProfile(req.userId)}
                      className="flex items-center space-x-2.5 cursor-pointer hover:underline"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                        {req.userPhoto ? (
                          <img src={req.userPhoto} alt={req.userName} className="w-full h-full object-cover" />
                        ) : (
                          req.userName.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">{req.userName}</span>
                        <span className="text-[10px] text-gray-500">Attendee</span>
                      </div>
                    </div>

                    {/* Host can remove participant (FR-J6) */}
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveParticipant(req.userId)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        title="Remove attendee"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Pending Requests Section (HOST ONLY, FR-J2) */}
          {isOwner && pendingRequests.length > 0 && (
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" /> Pending Join Requests ({pendingRequests.length})
              </h3>
              <p className="text-xs text-amber-800 mb-3">
                Review profiles and trust scores before approving. HangOut is for friendship, ensure they are a good match!
              </p>

              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between"
                  >
                    <div
                      onClick={() => onViewProfile(req.userId)}
                      className="flex items-center space-x-2.5 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF7E5F] overflow-hidden flex items-center justify-center text-white text-sm font-bold">
                        {req.userPhoto ? (
                          <img src={req.userPhoto} alt={req.userName} className="w-full h-full object-cover" />
                        ) : (
                          req.userName.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block hover:underline">
                          {req.userName}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                          {req.userAge && <span>{req.userAge} yrs</span>}
                          <span className="flex items-center text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {req.userTrustScore || 5.0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isFull}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Comments Section (FR-M1 to FR-M5) */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-[#2D2640] mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-1.5 text-[#FF7E5F]" /> Public Discussion ({comments.length})
            </h3>

            {/* Comment input */}
            <form onSubmit={handleAddComment} className="mb-4">
              {replyingTo && (
                <div className="mb-1 text-xs text-[#FF7E5F] flex items-center justify-between bg-[#FFF0EB] px-3 py-1 rounded-lg">
                  <span>Replying to {replyingTo.authorName}</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="underline">
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={currentUser ? 'Ask a question about this hangout...' : 'Sign in to comment'}
                  disabled={!currentUser}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F3EE] border border-gray-200 text-xs focus:outline-none focus:border-[#FF7E5F]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || !currentUser}
                  className="p-2.5 rounded-xl bg-[#FF7E5F] hover:bg-[#ff6844] text-white disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comments list */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet. Have a question for the host?</p>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border ${
                      comm.parentId ? 'ml-6 bg-[#FAFAF8] border-gray-100' : 'bg-[#F9F8F5] border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div
                        onClick={() => onViewProfile(comm.authorId)}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-white text-[10px] font-bold">
                          {comm.authorPhoto ? (
                            <img src={comm.authorPhoto} alt={comm.authorName} className="w-full h-full object-cover" />
                          ) : (
                            comm.authorName.charAt(0)
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-800 hover:underline">{comm.authorName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setReplyingTo(comm)}
                          className="text-[10px] text-gray-500 hover:text-[#FF7E5F] font-semibold px-1"
                        >
                          Reply
                        </button>
                        {(currentUser?.uid === comm.authorId || isOwner) && (
                          <button
                            onClick={() => handleDeleteComment(comm.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onReport('comment', comm.id)}
                          className="p-1 text-gray-400 hover:text-amber-500 transition"
                          title="Report abusive comment"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 ml-8">{comm.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
          <div>
            {isApproved ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(hangout);
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#2D2640] hover:bg-[#3d3455] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#FF7E5F]" />
                <span>Open Group Chat</span>
              </button>
            ) : isPending ? (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                ⏳ Requested (Awaiting host approval)
              </span>
            ) : isFull ? (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                Hangout is full
              </span>
            ) : (
              <button
                onClick={() => onJoin(hangout)}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-[#FF7E5F] hover:bg-[#ff6844] active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-[#FF7E5F]/30 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span>I'm in (Request to Join)</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isOwner && isApproved && (
              <button
                onClick={handleLeave}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 px-2 py-1"
              >
                Leave
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
