import React, { useState, useEffect, useRef } from 'react';
import { HangoutCard, Message, UserProfile } from '../types';
import { storage } from '../services/storage';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Smile,
  MapPin,
  Trash2,
  Reply,
  Flag,
  ShieldAlert,
  Info,
  CheckCheck,
  Video,
  X,
  Shield,
} from 'lucide-react';

interface ChatModalProps {
  hangout: HangoutCard;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onReportMessage: (msgId: string, senderId: string) => void;
}

const EMOJI_PALETTE = [
  '😄', '👍', '🔥', '❤️', '😂', '🎉', '👏', '😎',
  '🤝', '⚽', '☕', '🍕', '🏃', '🏸', '🎮', '📚',
  '🎬', '✈️', '🎵', '🙌', '✨', '👋', '🥳', '💯',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  hangout,
  currentUser,
  isOpen,
  onClose,
  onViewProfile,
  onReportMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = () => {
    const list = storage.getHangoutMessages(hangout.id, currentUser.uid);
    setMessages(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen, hangout.id, currentUser.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    storage.addHangoutMessage(hangout.id, {
      senderId: currentUser.uid,
      senderName: currentUser.firstName,
      senderPhoto: currentUser.photoUri,
      text,
      type: 'text',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
          }
        : undefined,
    });

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    loadMessages();
  };

  const handleSendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      storage.addHangoutMessage(hangout.id, {
        senderId: currentUser.uid,
        senderName: currentUser.firstName,
        senderPhoto: currentUser.photoUri,
        text: '📷 Photo',
        type: 'image',
        mediaUrl: base64,
      });
      loadMessages();
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FR-X5: Video size and length limit preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      storage.addHangoutMessage(hangout.id, {
        senderId: currentUser.uid,
        senderName: currentUser.firstName,
        senderPhoto: currentUser.photoUri,
        text: '🎥 Video clip',
        type: 'video',
        mediaUrl: base64,
      });
      loadMessages();
    };
    reader.readAsDataURL(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // FR-C7: Delete for me
  const handleDeleteForMe = (msgId: string) => {
    storage.deleteMessageForMe(hangout.id, msgId, currentUser.uid);
    setActiveMessageMenu(null);
    loadMessages();
  };

  // FR-C8: Delete for everyone
  const handleDeleteForEveryone = (msgId: string) => {
    storage.deleteMessageForEveryone(hangout.id, msgId);
    setActiveMessageMenu(null);
    loadMessages();
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-xl h-[92vh] max-h-[740px] bg-[#F7F5F2] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Chat Header */}
        <div className="bg-[#2D2640] text-white px-4 py-3 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {hangout.activityType}
                </h3>
                <span className="text-[10px] bg-[#FF7E5F]/25 text-[#FF9E85] px-2 py-0.5 rounded-full border border-[#FF7E5F]/35 font-semibold">
                  {hangout.timeWindow}
                </span>
              </div>
              <p className="text-xs text-[#CCC3E8] flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-[#FF7E5F] shrink-0" />
                <span className="truncate max-w-[200px]">{hangout.locationLabel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onViewProfile(hangout.postedByUid)}
            className="text-xs text-[#FF9E85] hover:text-white font-medium underline px-2 py-1"
          >
            Host details
          </button>
        </div>

        {/* FR-J7: Public Meeting Spot Suggestion Banner */}
        <div className="bg-amber-50 px-4 py-1.5 text-[11px] text-amber-900 border-b border-amber-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>Public spot only:</strong> Always meet in open public spots. Never share home addresses.
            </span>
          </div>
          <span className="text-[10px] text-amber-700 ml-2 font-medium shrink-0">
            {hangout.currentPeople}/{hangout.maxPeople} joined
          </span>
        </div>

        {/* Messages List (FR-C9) */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          onClick={() => setActiveMessageMenu(null)}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <span className="text-3xl mb-2">👋</span>
              <p className="text-sm font-semibold text-gray-600">Hangout Group Chat</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Welcome everyone! Coordinate meeting times, equipment, and say hello.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.uid;
              const isDeleted = msg.deletedForEveryone;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col relative group ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name for Others */}
                  {!isMe && (
                    <button
                      onClick={() => onViewProfile(msg.senderId)}
                      className="text-[11px] font-bold text-[#6D6582] mb-1 ml-1 hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>{msg.senderName}</span>
                    </button>
                  )}

                  {/* Reply bubble snippet (FR-C10) */}
                  {msg.replyTo && (
                    <div
                      className={`text-[10px] px-2.5 py-1 mb-1 rounded-lg border max-w-[75%] truncate ${
                        isMe
                          ? 'bg-orange-100/40 text-gray-700 border-orange-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <span className="font-bold mr-1">Replying to {msg.replyTo.senderName}:</span>
                      <span>{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id);
                    }}
                    className={`max-w-[82%] rounded-2xl p-3 shadow-xs text-sm relative cursor-pointer select-none transition ${
                      isDeleted
                        ? 'bg-gray-200/80 text-gray-500 italic'
                        : isMe
                        ? 'bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] text-white rounded-tr-xs'
                        : 'bg-white text-[#2D2640] rounded-tl-xs border border-gray-200/60'
                    }`}
                  >
                    {/* Media Attachments: Image (FR-C5) or Video (FR-C6) */}
                    {!isDeleted && msg.type === 'image' && msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-xs">
                        <img
                          src={msg.mediaUrl}
                          alt="Photo attachment"
                          className="w-full h-auto max-h-60 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {!isDeleted && msg.type === 'video' && msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-xs">
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="w-full h-auto max-h-60 rounded-xl bg-black"
                        />
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.text}
                    </p>

                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${
                        isMe ? 'text-white/80' : 'text-gray-400'
                      }`}
                    >
                      <span>{formatTime(msg.sentAt)}</span>
                      {isMe && !isDeleted && (
                        <CheckCheck className="w-3 h-3 text-white/90 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Context Actions Menu (FR-C7, FR-C8, FR-C10, FR-C12) */}
                  {activeMessageMenu === msg.id && (
                    <div
                      className={`absolute z-30 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 text-xs text-gray-700 min-w-[150px] ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setReplyingTo(msg);
                          setActiveMessageMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Reply className="w-3.5 h-3.5 text-blue-500" />
                        <span>Reply</span>
                      </button>

                      <button
                        onClick={() => handleDeleteForMe(msg.id)}
                        className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>Delete for me</span>
                      </button>

                      {isMe && !isDeleted && (
                        <button
                          onClick={() => handleDeleteForEveryone(msg.id)}
                          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-red-600 flex items-center space-x-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete for everyone</span>
                        </button>
                      )}

                      {!isMe && (
                        <button
                          onClick={() => {
                            setActiveMessageMenu(null);
                            onReportMessage(msg.id, msg.senderId);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-amber-600 flex items-center space-x-2"
                        >
                          <Flag className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report message</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Replying Banner (FR-C10) */}
        {replyingTo && (
          <div className="px-4 py-2 bg-white/90 border-t border-gray-200 flex items-center justify-between text-xs text-gray-700">
            <div className="flex items-center space-x-2 truncate">
              <Reply className="w-3.5 h-3.5 text-[#FF7E5F] shrink-0" />
              <span className="truncate">
                Replying to <strong>{replyingTo.senderName}</strong>: {replyingTo.text}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emoji Palette Drawer (FR-C4) */}
        {showEmojiPicker && (
          <div className="p-3 bg-white border-t border-gray-200 grid grid-cols-8 gap-2 shrink-0 animate-in slide-in-from-bottom-2 duration-150">
            {EMOJI_PALETTE.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-lg flex items-center justify-center transition active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar (FR-C13) */}
        <form
          onSubmit={handleSendText}
          className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 shrink-0"
        >
          {/* Photo attachment (FR-C5) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleSendImage}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-gray-500 hover:text-[#FF7E5F] hover:bg-[#FFF0EB] transition cursor-pointer"
            title="Attach Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Video attachment (FR-C6) */}
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            className="hidden"
            onChange={handleSendVideo}
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="p-2 rounded-full text-gray-500 hover:text-[#FF7E5F] hover:bg-[#FFF0EB] transition cursor-pointer"
            title="Attach Short Video"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Emoji toggle (FR-C4) */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition cursor-pointer ${
              showEmojiPicker
                ? 'text-[#FF7E5F] bg-[#FFF0EB]'
                : 'text-gray-500 hover:text-[#FF7E5F] hover:bg-[#FFF0EB]'
            }`}
            title="Emoji Picker"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Coordinate your meetup..."
            className="flex-1 bg-[#F5F3EE] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#2D2640] placeholder-gray-400 border border-transparent focus:outline-none focus:border-[#FF7E5F] focus:bg-white transition"
          />

          {/* Send */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#FF7E5F] hover:bg-[#ff6844] active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 transform -translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
