import React, { useState, useEffect } from 'react';
import {
  HangoutCard,
  UserProfile,
  Conversation,
  AppNotification,
  JoinRequestStatus,
} from './types';
import { storage } from './services/storage';
import { Header } from './components/Header';
import { HangoutCardItem } from './components/HangoutCardItem';
import { MapView } from './components/MapView';
import { HangoutDetailModal } from './components/HangoutDetailModal';
import { PostHangoutModal } from './components/PostHangoutModal';
import { ChatModal } from './components/ChatModal';
import { InboxModal } from './components/InboxModal';
import { DirectMessageModal } from './components/DirectMessageModal';
import { UserProfileModal } from './components/UserProfileModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ReviewModal } from './components/ReviewModal';
import { ReportModal } from './components/ReportModal';
import { SafetyFeaturesModal } from './components/SafetyFeaturesModal';
import { SettingsModal } from './components/SettingsModal';
import { ModeratorModal } from './components/ModeratorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LoginModal } from './components/LoginModal';
import {
  Plus,
  List,
  Map as MapIcon,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const App: React.FC = () => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return storage.getCurrentUser();
  });

  // Hangouts state
  const [hangouts, setHangouts] = useState<HangoutCard[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'soonest' | 'newest'>('soonest');
  const [sameGenderFilter, setSameGenderFilter] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [detailHangout, setDetailHangout] = useState<HangoutCard | null>(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeratorOpen, setIsModeratorOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [activeChatHangout, setActiveChatHangout] = useState<HangoutCard | null>(null);
  const [activeDmConversation, setActiveDmConversation] = useState<Conversation | null>(null);
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);

  // Review & Report states
  const [reviewState, setReviewState] = useState<{
    hangout: HangoutCard;
    targetUser: UserProfile;
  } | null>(null);
  const [reportState, setReportState] = useState<{
    targetType: 'card' | 'user' | 'comment' | 'message';
    targetId: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    const list = storage.getActiveHangouts();
    setHangouts(list);
    if (currentUser) {
      const refreshedUser = storage.getUser(currentUser.uid);
      if (refreshedUser) setCurrentUser(refreshedUser);
    }
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 6000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Categories list
  const categories = ['All', 'Sports', 'Coffee', 'Food', 'Gaming', 'Walk', 'Study', 'Music'];

  // Blocked users filter (FR-S3: blocked users cannot see cards or interact)
  const blockedUids = currentUser ? storage.getBlockedUsers(currentUser.uid) : [];

  // Filter & Search (FR-F4, FR-F5, FR-F6)
  const filteredHangouts = hangouts
    .filter((h) => {
      if (blockedUids.includes(h.postedByUid)) return false;

      // Category filter
      if (selectedCategory !== 'All') {
        const matchesCat = h.activityType.toLowerCase().includes(selectedCategory.toLowerCase());
        if (!matchesCat) return false;
      }

      // Same gender filter (FR-S7)
      if (sameGenderFilter && !h.rules?.sameGenderOnly) {
        return false;
      }

      // Keyword search in title, activity, description (FR-F6)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = h.title?.toLowerCase().includes(query);
        const inActivity = h.activityType.toLowerCase().includes(query);
        const inDesc = h.description?.toLowerCase().includes(query);
        const inLocation = h.locationLabel?.toLowerCase().includes(query);
        if (!inTitle && !inActivity && !inDesc && !inLocation) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'soonest') {
        return (a.startAt || a.expiresAt) - (b.startAt || b.expiresAt);
      }
      return b.createdAt - a.createdAt;
    });

  const handleJoinHangout = (card: HangoutCard) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    if (card.postedByUid === currentUser.uid) {
      showToast('This is your own hangout!');
      setActiveChatHangout(card);
      return;
    }

    // Check rules: verified only
    if (card.rules?.verifiedOnly && !currentUser.isVerified) {
      alert('This hangout requires a verified profile to join.');
      return;
    }

    // Send join request (FR-J1)
    storage.addJoinRequest({
      hangoutId: card.id,
      userId: currentUser.uid,
      userName: currentUser.fullName,
      userPhoto: currentUser.photoUri,
      userAge: currentUser.age,
      userTrustScore: currentUser.trustScore,
      userInterests: currentUser.interests,
      status: 'pending',
    });

    showToast(`Join request sent to ${card.postedByName}! 🎉 You will be notified when approved.`);
    refreshData();
  };

  const handleViewProfile = (userId: string) => {
    const user = storage.getUser(userId);
    if (user) {
      setInspectedUser(user);
    } else {
      showToast('Profile not found.');
    }
  };

  const handleStartDm = (targetUser: UserProfile) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const conv = storage.getOrCreateConversation(currentUser, targetUser);
    setActiveDmConversation(conv);
  };

  const handleSignOut = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  // Counts for header badges
  const unreadNotifications = currentUser
    ? storage.getNotifications(currentUser.uid).filter((n) => !n.read)
    : [];

  const unreadMessagesCount = currentUser
    ? storage
        .getConversations(currentUser.uid)
        .reduce((sum, c) => sum + (c.unreadCount[currentUser.uid] || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col selection:bg-[#FF7E5F] selection:text-white pb-12">
      {/* Top App Header with SRS actions */}
      <Header
        currentUser={currentUser}
        onOpenProfile={(u) => setInspectedUser(u)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenModerator={() => setIsModeratorOpen(true)}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotifications={unreadNotifications}
        activeCount={hangouts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 sm:py-5">
        {/* Search Bar (FR-F6) */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hangouts by keyword, activity, or place..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8E4DC] text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:border-[#FF7E5F] shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* List / Map toggle + Pull to refresh */}
        <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-[#EBE7DF] mb-3 flex items-center justify-between">
          <div className="grid grid-cols-2 gap-1 w-full sm:w-60">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'list'
                  ? 'bg-[#2D2640] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>📋 List</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'map'
                  ? 'bg-[#2D2640] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>🗺️ Map</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 pr-2">
            {/* Sort toggle (FR-F5) */}
            <button
              onClick={() => setSortBy(sortBy === 'soonest' ? 'newest' : 'soonest')}
              className="text-[11px] font-semibold text-gray-600 hover:text-[#2D2640] flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200"
              title="Sort order"
            >
              <ArrowUpDown className="w-3 h-3 mr-1 text-[#FF7E5F]" />
              <span>{sortBy === 'soonest' ? 'Soonest first' : 'Newest first'}</span>
            </button>

            {/* Refresh button (FR-F7) */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF7E5F] hover:bg-gray-50 transition"
              title="Refresh hangouts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF7E5F]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter categories & optional rules (FR-F4, FR-S7) */}
        <div className="flex items-center justify-between pb-3 mb-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-gray-400 pl-1 pr-1 flex items-center shrink-0">
              <Filter className="w-3 h-3 mr-1" />
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-[#FF7E5F] text-white border-[#FF7E5F] shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Same gender filter toggle (FR-S7) */}
          <button
            onClick={() => setSameGenderFilter(!sameGenderFilter)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border ml-2 transition ${
              sameGenderFilter
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Same Gender
          </button>
        </div>

        {/* Main View Mode */}
        {activeTab === 'list' ? (
          <div>
            {filteredHangouts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#EDE9E3] my-4 shadow-xs">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FFF0EB] flex items-center justify-center text-3xl">
                  🎈
                </div>
                <h3 className="text-base font-bold text-[#2D2640] mb-1">
                  No hangouts match your filters
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Start something spontaneous! Post a card for sports, coffee, study, or whatever you are doing right now.
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) setIsLoginOpen(true);
                    else setIsPostOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF7E5F] hover:bg-[#ff6844] text-white transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Hangout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredHangouts.map((card) => {
                  const joinStatus: JoinRequestStatus | 'none' = currentUser
                    ? storage.getUserJoinStatus(card.id, currentUser.uid)
                    : 'none';
                  const comments = storage.getComments(card.id);

                  return (
                    <HangoutCardItem
                      key={card.id}
                      card={card}
                      isOwner={currentUser?.uid === card.postedByUid}
                      joinStatus={joinStatus}
                      commentsCount={comments.length}
                      onCardClick={(c) => setDetailHangout(c)}
                      onJoin={handleJoinHangout}
                      onOpenChat={(c) => setActiveChatHangout(c)}
                      onViewProfile={handleViewProfile}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <MapView
            hangouts={filteredHangouts}
            currentUserId={currentUser?.uid || ''}
            onJoin={handleJoinHangout}
            onOpenChat={(c) => setActiveChatHangout(c)}
            onViewProfile={handleViewProfile}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) for Posting Hangout */}
      <button
        onClick={() => {
          if (!currentUser) setIsLoginOpen(true);
          else setIsPostOpen(true);
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full bg-[#FF7E5F] hover:bg-[#ff6844] active:scale-95 text-white shadow-xl shadow-[#FF7E5F]/35 flex items-center justify-center transition cursor-pointer group"
        title="Post a hangout"
      >
        <Plus className="w-7 h-7 transform group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* MODALS */}

      {/* 1. Hangout Detail Modal (FR-F8) */}
      {detailHangout && (
        <HangoutDetailModal
          hangout={detailHangout}
          currentUser={currentUser}
          isOpen={!!detailHangout}
          onClose={() => setDetailHangout(null)}
          onJoin={handleJoinHangout}
          onOpenChat={(c) => setActiveChatHangout(c)}
          onViewProfile={handleViewProfile}
          onReport={(type, id) => setReportState({ targetType: type as any, targetId: id })}
          onHangoutUpdated={refreshData}
        />
      )}

      {/* 2. Post Hangout Modal (FR-H1 to FR-H13) */}
      {currentUser && (
        <PostHangoutModal
          currentUser={currentUser}
          isOpen={isPostOpen}
          onClose={() => setIsPostOpen(false)}
          onCreated={(newCard) => {
            refreshData();
            showToast('Hangout posted! 🎉 People nearby will see it right now.');
            setActiveChatHangout(newCard);
          }}
        />
      )}

      {/* 3. Hangout Chat Modal (FR-C1 to FR-C13) */}
      {activeChatHangout && currentUser && (
        <ChatModal
          hangout={activeChatHangout}
          currentUser={currentUser}
          isOpen={!!activeChatHangout}
          onClose={() => setActiveChatHangout(null)}
          onViewProfile={handleViewProfile}
          onReportMessage={(msgId) =>
            setReportState({ targetType: 'message', targetId: msgId })
          }
        />
      )}

      {/* 4. Messages Inbox Modal (FR-C3) */}
      {currentUser && (
        <InboxModal
          currentUser={currentUser}
          isOpen={isInboxOpen}
          onClose={() => setIsInboxOpen(false)}
          onSelectHangoutChat={(h) => setActiveChatHangout(h)}
          onSelectDm={(conv) => setActiveDmConversation(conv)}
        />
      )}

      {/* 5. Direct Message Modal (FR-C2) */}
      {activeDmConversation && currentUser && (
        <DirectMessageModal
          conversation={activeDmConversation}
          currentUser={currentUser}
          isOpen={!!activeDmConversation}
          onClose={() => setActiveDmConversation(null)}
          onViewProfile={handleViewProfile}
        />
      )}

      {/* 6. User Profile Modal (FR-P1 to FR-P9) */}
      {inspectedUser && (
        <UserProfileModal
          user={inspectedUser}
          currentUser={currentUser}
          userHangouts={hangouts.filter((h) => h.postedByUid === inspectedUser.uid)}
          isOpen={!!inspectedUser}
          onClose={() => setInspectedUser(null)}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onStartDm={handleStartDm}
          onReport={(type, id) => setReportState({ targetType: type, targetId: id })}
          onSelectHangout={(card) => setDetailHangout(card)}
          onUserUpdated={refreshData}
        />
      )}

      {/* 7. Edit Profile Modal (FR-P2, FR-P3, FR-P8) */}
      {currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            refreshData();
            showToast('Profile updated!');
          }}
        />
      )}

      {/* 8. Post-Hangout Review Modal (FR-R1 to FR-R4) */}
      {reviewState && currentUser && (
        <ReviewModal
          hangout={reviewState.hangout}
          currentUser={currentUser}
          targetUser={reviewState.targetUser}
          isOpen={!!reviewState}
          onClose={() => setReviewState(null)}
          onReviewed={refreshData}
        />
      )}

      {/* 9. Report Content / Member Modal (FR-S1, FR-S6) */}
      {reportState && (
        <ReportModal
          targetType={reportState.targetType}
          targetId={reportState.targetId}
          currentUser={currentUser}
          isOpen={!!reportState}
          onClose={() => setReportState(null)}
        />
      )}

      {/* 10. Safety Center & Panic Check-In (FR-S4, FR-S5) */}
      {currentUser && (
        <SafetyFeaturesModal
          currentUser={currentUser}
          isOpen={isSafetyOpen}
          onClose={() => setIsSafetyOpen(false)}
        />
      )}

      {/* 11. Settings Modal (FR-T1, FR-T2, FR-A7) */}
      {currentUser && (
        <SettingsModal
          currentUser={currentUser}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onSignOut={handleSignOut}
          onAccountDeleted={() => {
            setCurrentUser(null);
            refreshData();
            showToast('Account and all data deleted.');
          }}
        />
      )}

      {/* 12. Safety & Moderation Queue (Admin) (FR-S2) */}
      <ModeratorModal
        isOpen={isModeratorOpen}
        onClose={() => setIsModeratorOpen(false)}
        onUpdated={refreshData}
      />

      {/* 13. Notifications Center Modal (FR-N1 to FR-N6) */}
      {currentUser && (
        <NotificationsModal
          userId={currentUser.uid}
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectNotification={(notif) => {
            if (notif.targetId) {
              const h = storage.getHangout(notif.targetId);
              if (h) setDetailHangout(h);
            }
          }}
          onUpdated={refreshData}
        />
      )}

      {/* 14. Login & Onboarding Modal (FR-A1 to FR-A10) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome to HangOut, ${user.firstName}! 🎉`);
          refreshData();
        }}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2640] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[#483c66] flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#FF7E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
