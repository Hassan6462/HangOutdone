import React, { useState } from 'react';
import { UserProfile, HangoutCard, Conversation } from '../types';
import { storage } from '../services/storage';
import { X, MessageSquare, Users, MessageCircle, Clock, ChevronRight } from 'lucide-react';

interface InboxModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectHangoutChat: (hangout: HangoutCard) => void;
  onSelectDm: (conversation: Conversation) => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectHangoutChat,
  onSelectDm,
}) => {
  const [tab, setTab] = useState<'hangouts' | 'dms'>('hangouts');

  if (!isOpen) return null;

  // Hangout chats where current user is approved participant or host
  const allHangouts = storage.getHangouts();
  const joinedHangouts = allHangouts.filter((h) =>
    storage.isParticipantApproved(h.id, currentUser.uid)
  );

  // 1-on-1 DMs (FR-C3)
  const conversations = storage.getConversations(currentUser.uid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-[85vh] max-h-[640px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#FF7E5F]" />
            <h2 className="text-base font-bold text-white">Messages Inbox</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle (FR-C3) */}
        <div className="grid grid-cols-2 p-2 bg-[#F8F7F4] border-b border-gray-200 shrink-0">
          <button
            onClick={() => setTab('hangouts')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              tab === 'hangouts'
                ? 'bg-white text-[#2D2640] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#FF7E5F]" />
            <span>Hangout Groups ({joinedHangouts.length})</span>
          </button>

          <button
            onClick={() => setTab('dms')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              tab === 'dms'
                ? 'bg-white text-[#2D2640] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#FF7E5F]" />
            <span>Direct Messages ({conversations.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === 'hangouts' ? (
            joinedHangouts.length === 0 ? (
              <div className="text-center py-16 px-4 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No active group chats</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  When you host or get approved to join a hangout, the group chat appears here!
                </p>
              </div>
            ) : (
              joinedHangouts.map((h) => {
                const msgs = storage.getHangoutMessages(h.id);
                const lastMsg = msgs[msgs.length - 1];

                return (
                  <div
                    key={h.id}
                    onClick={() => {
                      onSelectHangoutChat(h);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#FBF9F6] hover:bg-[#F3EFEA] border border-gray-200/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] flex items-center justify-center text-white text-base font-bold shadow-xs shrink-0">
                        {h.activityType.split(' ')[0] || '🎉'}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-[#2D2640] group-hover:text-[#FF7E5F] transition truncate">
                            {h.title || h.activityType}
                          </span>
                          <span className="text-[10px] text-gray-400">({h.currentPeople}p)</span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                  </div>
                );
              })
            )
          ) : (
            conversations.length === 0 ? (
              <div className="text-center py-16 px-4 text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No direct messages yet</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  You can message members you have shared a hangout with from their profile!
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherUid = conv.participantIds.find((id) => id !== currentUser.uid) || '';
                const otherDetails = conv.participantDetails[otherUid] || { name: 'Member', photo: '' };
                const unread = conv.unreadCount[currentUser.uid] || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectDm(conv);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#FBF9F6] hover:bg-[#F3EFEA] border border-gray-200/80 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {otherDetails.photo ? (
                          <img src={otherDetails.photo} alt={otherDetails.name} className="w-full h-full object-cover" />
                        ) : (
                          otherDetails.name.charAt(0)
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D2640] group-hover:text-[#FF7E5F] transition truncate">
                            {otherDetails.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#FF7E5F] text-white text-[10px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};
