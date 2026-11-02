import React from 'react';
import { AppNotification } from '../types';
import { storage } from '../services/storage';
import { X, Bell, CheckCheck, Sparkles, MessageSquare, UserCheck, AlertCircle } from 'lucide-react';

interface NotificationsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  onUpdated: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectNotification,
  onUpdated,
}) => {
  if (!isOpen) return null;

  const notifications = storage.getNotifications(userId);

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead(userId);
    onUpdated();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'join_request':
        return <UserCheck className="w-4 h-4 text-[#FF7E5F]" />;
      case 'request_approved':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-[80vh] max-h-[580px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#FF7E5F]" />
            <h2 className="text-base font-bold">Notifications</h2>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#CCC3E8] hover:text-white underline mr-2"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-bold text-gray-600">No notifications yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Activity on your hangouts and chats will show up here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  storage.markNotificationAsRead(notif.id);
                  onSelectNotification(notif);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                  notif.read
                    ? 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                    : 'bg-[#FFF9F6] border-[#FFE4DC] text-[#2D2640] hover:bg-[#FFF3EE]'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5 border border-gray-100">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.body}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#FF7E5F] shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
