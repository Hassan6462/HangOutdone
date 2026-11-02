import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, UserProfile } from '../types';
import { storage } from '../services/storage';
import { ArrowLeft, Send, Image as ImageIcon, Smile, Shield, CheckCheck } from 'lucide-react';

interface DirectMessageModalProps {
  conversation: Conversation;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  conversation,
  currentUser,
  isOpen,
  onClose,
  onViewProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUid = conversation.participantIds.find((id) => id !== currentUser.uid) || '';
  const otherDetails = conversation.participantDetails[otherUid] || { name: 'Member', photo: '' };

  const loadMessages = () => {
    const list = storage.getDmMessages(conversation.id, currentUser.uid);
    setMessages(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversation.id, currentUser.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    storage.sendDmMessage(conversation.id, {
      senderId: currentUser.uid,
      senderName: currentUser.firstName,
      text: inputText.trim(),
      type: 'text',
    });

    setInputText('');
    loadMessages();
  };

  const handleSendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      storage.sendDmMessage(conversation.id, {
        senderId: currentUser.uid,
        senderName: currentUser.firstName,
        text: '📷 Photo',
        type: 'image',
        mediaUrl: base64,
      });
      loadMessages();
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-lg h-[90vh] max-h-[700px] bg-[#F7F5F2] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white px-4 py-3 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div
              onClick={() => onViewProfile(otherUid)}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                {otherDetails.photo ? (
                  <img src={otherDetails.photo} alt={otherDetails.name} className="w-full h-full object-cover" />
                ) : (
                  otherDetails.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight hover:underline">
                  {otherDetails.name}
                </h3>
                <span className="text-[10px] text-[#CCC3E8]">Direct Message</span>
              </div>
            </div>
          </div>
        </div>

        {/* Friendly banner */}
        <div className="bg-amber-50/80 px-4 py-1.5 text-[11px] text-amber-900 border-b border-amber-200/60 flex items-center space-x-1.5 shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>HangOut chats are for friendship and shared activities only.</span>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm font-semibold text-gray-600">Start a conversation</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Send a friendly hello to plan your next hangout together!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.uid;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-xs text-sm ${
                      isMe
                        ? 'bg-gradient-to-tr from-[#FF7E5F] to-[#FF6B6B] text-white rounded-tr-xs'
                        : 'bg-white text-[#2D2640] rounded-tl-xs border border-gray-100'
                    }`}
                  >
                    {msg.type === 'image' && msg.mediaUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-xs">
                        <img
                          src={msg.mediaUrl}
                          alt="Attachment"
                          className="w-full h-auto max-h-60 object-cover rounded-xl"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${
                        isMe ? 'text-white/80' : 'text-gray-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 shrink-0"
        >
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
            className="p-2 rounded-full text-gray-500 hover:text-[#FF7E5F] transition"
            title="Attach Photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${otherDetails.name.split(' ')[0]}...`}
            className="flex-1 bg-[#F5F3EE] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#2D2640] placeholder-gray-400 focus:outline-none focus:border-[#FF7E5F] border border-transparent"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#FF7E5F] hover:bg-[#ff6844] disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 transform -translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
