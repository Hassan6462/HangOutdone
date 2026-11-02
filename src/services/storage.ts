import {
  HangoutCard,
  Message,
  UserProfile,
  JoinRequest,
  Comment,
  Review,
  Report,
  Conversation,
  AppNotification,
  AppSettings,
  JoinRequestStatus,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'hangout_current_user',
  USERS: 'hangout_users',
  HANGOUTS: 'hangout_posts',
  JOIN_REQUESTS: 'hangout_join_requests',
  COMMENTS: 'hangout_comments',
  HANGOUT_MESSAGES: 'hangout_messages',
  DM_CONVERSATIONS: 'hangout_dm_conversations',
  DM_MESSAGES: 'hangout_dm_messages',
  REVIEWS: 'hangout_reviews',
  REPORTS: 'hangout_reports',
  BLOCKS: 'hangout_blocks',
  NOTIFICATIONS: 'hangout_notifications',
  SETTINGS: 'hangout_settings',
};

// Seed users
const INITIAL_USERS: Record<string, UserProfile> = {
  'user_ahmed_1': {
    uid: 'user_ahmed_1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    fullName: 'Ahmed Khan',
    dobDay: 15,
    dobMonth: 5,
    dobYear: 2002,
    age: 24,
    bio: 'Avid football player and weekend trekker. Looking for friendly 5-a-side games and coffee chats!',
    photoUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
    ],
    interests: ['⚽ Sports', '☕ Coffee', '🎮 Gaming', '🏃 Fitness'],
    profileComplete: true,
    trustScore: 4.9,
    reviewCount: 8,
    hostedCount: 5,
    attendedCount: 12,
    gender: 'male',
    showLastName: true,
    showAge: true,
    friends: ['user_sara_2'],
    createdAt: Date.now() - 86400000 * 30,
    isVerified: true,
  },
  'user_sara_2': {
    uid: 'user_sara_2',
    firstName: 'Sara',
    lastName: 'Jenkins',
    fullName: 'Sara Jenkins',
    dobDay: 22,
    dobMonth: 8,
    dobYear: 2003,
    age: 23,
    bio: 'Art director & specialty coffee addict. Love indie cinema, bookstore crawls, and local park picnics.',
    photoUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    ],
    interests: ['☕ Coffee', '🍕 Food', '🎬 Movies', '🌿 Outdoors'],
    profileComplete: true,
    trustScore: 5.0,
    reviewCount: 14,
    hostedCount: 9,
    attendedCount: 18,
    gender: 'female',
    showLastName: false,
    showAge: true,
    friends: ['user_ahmed_1', 'user_liam_3'],
    createdAt: Date.now() - 86400000 * 45,
    isVerified: true,
  },
  'user_liam_3': {
    uid: 'user_liam_3',
    firstName: 'Liam',
    lastName: 'Chen',
    fullName: 'Liam Chen',
    dobDay: 10,
    dobMonth: 2,
    dobYear: 2001,
    age: 25,
    bio: 'Badminton doubles player and sci-fi book club organizer. Always down for pizza or smash matches.',
    photoUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    ],
    interests: ['🏸 Badminton', '📚 Reading', '🎵 Music', '🍕 Food'],
    profileComplete: true,
    trustScore: 4.8,
    reviewCount: 6,
    hostedCount: 3,
    attendedCount: 9,
    gender: 'male',
    showLastName: true,
    showAge: true,
    friends: ['user_sara_2'],
    createdAt: Date.now() - 86400000 * 20,
    isVerified: false,
  },
  'user_maya_4': {
    uid: 'user_maya_4',
    firstName: 'Maya',
    lastName: 'Patel',
    fullName: 'Maya Patel',
    dobDay: 18,
    dobMonth: 11,
    dobYear: 2004,
    age: 22,
    bio: 'Computer science junior. Love board game cafes, evening jogs, and photography walks.',
    photoUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    interests: ['🎮 Gaming', '🏃 Fitness', '☕ Coffee', '🎨 Art'],
    profileComplete: true,
    trustScore: 4.9,
    reviewCount: 4,
    hostedCount: 2,
    attendedCount: 6,
    gender: 'female',
    showLastName: false,
    showAge: true,
    friends: [],
    createdAt: Date.now() - 86400000 * 12,
    isVerified: true,
  },
};

const getInitialHangouts = (): HangoutCard[] => {
  const now = Date.now();
  return [
    {
      id: 'h_1',
      postedByName: 'Ahmed',
      postedByUid: 'user_ahmed_1',
      postedByPhoto: INITIAL_USERS['user_ahmed_1'].photoUri,
      title: 'Casual 5v5 Football Friendly',
      activityType: '⚽ Football',
      description: 'Looking for 3 more friendly players for a casual kickabout. All skill levels welcome! Please bring sneakers or cleats. Meeting right by the main goalposts.',
      timeWindow: 'In 1 hour',
      startAt: now + 3600 * 1000,
      endAt: now + 2.5 * 3600 * 1000,
      locationLabel: 'Central Park Turf Pitch (North Meadow)',
      exactMeetingPoint: 'North Meadow Pitch #3, near the red water fountain',
      lat: 40.785091,
      lng: -73.968285,
      maxPeople: 4,
      currentPeople: 2,
      photoUrls: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80',
      ],
      rules: {
        sameGenderOnly: false,
        ageRangeMin: 18,
        ageRangeMax: 35,
        verifiedOnly: false,
      },
      status: 'active',
      createdAt: now - 20 * 60 * 1000,
      expiresAt: now + 3 * 3600 * 1000,
    },
    {
      id: 'h_2',
      postedByName: 'Sara',
      postedByUid: 'user_sara_2',
      postedByPhoto: INITIAL_USERS['user_sara_2'].photoUri,
      title: 'Outdoor Coffee & Sketch Session',
      activityType: '☕ Coffee',
      description: 'Grabbing an iced oat latte on the sunny patio at Artisan Roast. Bring your notebook, tablet, or just good conversation. Strictly friendly hangout!',
      timeWindow: 'Right now',
      startAt: now + 15 * 60 * 1000,
      endAt: now + 2 * 3600 * 1000,
      locationLabel: 'Artisan Roast Cafe on 5th Ave',
      exactMeetingPoint: 'Table #4 on the outdoor patio under the green awning',
      lat: 40.7736,
      lng: -73.9654,
      maxPeople: 3,
      currentPeople: 1,
      photoUrls: [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      ],
      rules: {
        sameGenderOnly: false,
        verifiedOnly: false,
      },
      status: 'active',
      createdAt: now - 15 * 60 * 1000,
      expiresAt: now + 45 * 60 * 1000,
    },
    {
      id: 'h_3',
      postedByName: 'Liam',
      postedByUid: 'user_liam_3',
      postedByPhoto: INITIAL_USERS['user_liam_3'].photoUri,
      title: 'Badminton Doubles Match',
      activityType: '🏸 Badminton',
      description: 'Indoor court #2 booked for 6:30 PM. We have extra rackets and shuttles. Need 1 more player for high-energy doubles games!',
      timeWindow: 'This evening',
      startAt: now + 4 * 3600 * 1000,
      endAt: now + 6 * 3600 * 1000,
      locationLabel: 'Westside Community Center Court #2',
      exactMeetingPoint: 'Court entrance behind the main gym reception desk',
      lat: 40.7915,
      lng: -73.9740,
      maxPeople: 4,
      currentPeople: 3,
      photoUrls: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
      ],
      rules: {
        sameGenderOnly: false,
        verifiedOnly: false,
      },
      status: 'active',
      createdAt: now - 35 * 60 * 1000,
      expiresAt: now + 7 * 3600 * 1000,
    },
    {
      id: 'h_4',
      postedByName: 'Maya',
      postedByUid: 'user_maya_4',
      postedByPhoto: INITIAL_USERS['user_maya_4'].photoUri,
      title: 'Sunset Walk & Photography',
      activityType: '🚶 Walk',
      description: 'Taking a peaceful sunset walk along the riverside promenade. Bring a camera or phone camera. Girls only meetup for an evening stroll.',
      timeWindow: 'This evening',
      startAt: now + 5 * 3600 * 1000,
      endAt: now + 7 * 3600 * 1000,
      locationLabel: 'Riverside Promenade at Pier 45',
      exactMeetingPoint: 'In front of the river overlook gazebo',
      lat: 40.7328,
      lng: -74.0118,
      maxPeople: 4,
      currentPeople: 2,
      photoUrls: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      ],
      rules: {
        sameGenderOnly: true,
        verifiedOnly: false,
      },
      status: 'active',
      createdAt: now - 10 * 60 * 1000,
      expiresAt: now + 6 * 3600 * 1000,
    },
  ];
};

const getInitialJoinRequests = (): JoinRequest[] => {
  const now = Date.now();
  return [
    {
      id: 'jr_1',
      hangoutId: 'h_1',
      userId: 'user_sara_2',
      userName: 'Sara Jenkins',
      userPhoto: INITIAL_USERS['user_sara_2'].photoUri,
      userAge: 23,
      userTrustScore: 5.0,
      userInterests: ['☕ Coffee', '🍕 Food', '🎬 Movies'],
      status: 'approved',
      joinedAt: now - 10 * 60 * 1000,
    },
    {
      id: 'jr_2',
      hangoutId: 'h_3',
      userId: 'user_ahmed_1',
      userName: 'Ahmed Khan',
      userPhoto: INITIAL_USERS['user_ahmed_1'].photoUri,
      userAge: 24,
      userTrustScore: 4.9,
      userInterests: ['⚽ Sports', '🏃 Fitness'],
      status: 'approved',
      joinedAt: now - 20 * 60 * 1000,
    },
    {
      id: 'jr_3',
      hangoutId: 'h_3',
      userId: 'user_maya_4',
      userName: 'Maya Patel',
      userPhoto: INITIAL_USERS['user_maya_4'].photoUri,
      userAge: 22,
      userTrustScore: 4.9,
      userInterests: ['🏃 Fitness', '🎮 Gaming'],
      status: 'approved',
      joinedAt: now - 15 * 60 * 1000,
    },
  ];
};

const getInitialComments = (): Comment[] => {
  const now = Date.now();
  return [
    {
      id: 'c_1',
      hangoutId: 'h_1',
      authorId: 'user_liam_3',
      authorName: 'Liam Chen',
      authorPhoto: INITIAL_USERS['user_liam_3'].photoUri,
      text: 'Is there parking nearby the north meadow?',
      createdAt: now - 18 * 60 * 1000,
    },
    {
      id: 'c_2',
      hangoutId: 'h_1',
      authorId: 'user_ahmed_1',
      authorName: 'Ahmed Khan',
      authorPhoto: INITIAL_USERS['user_ahmed_1'].photoUri,
      text: 'Yes! The parking lot on 106th street is usually open and a 3-minute walk.',
      parentId: 'c_1',
      createdAt: now - 12 * 60 * 1000,
    },
    {
      id: 'c_3',
      hangoutId: 'h_2',
      authorId: 'user_maya_4',
      authorName: 'Maya Patel',
      authorPhoto: INITIAL_USERS['user_maya_4'].photoUri,
      text: 'Such a great cafe! Wish I could join, hope you have a great session Sara.',
      createdAt: now - 5 * 60 * 1000,
    },
  ];
};

const getInitialReviews = (): Review[] => {
  const now = Date.now();
  return [
    {
      id: 'rev_1',
      hangoutId: 'h_old_1',
      hangoutTitle: 'Saturday Morning 5k Run',
      reviewerId: 'user_sara_2',
      reviewerName: 'Sara Jenkins',
      reviewerPhoto: INITIAL_USERS['user_sara_2'].photoUri,
      revieweeId: 'user_ahmed_1',
      rating: 5,
      thumbsUp: true,
      tags: ['Fun', 'On time', 'Felt safe', 'Friendly host'],
      comment: 'Ahmed was an amazing organizer! He kept the pace welcoming for everyone and picked a great scenic route.',
      createdAt: now - 86400000 * 3,
    },
    {
      id: 'rev_2',
      hangoutId: 'h_old_2',
      hangoutTitle: 'Board Games & Bubble Tea',
      reviewerId: 'user_ahmed_1',
      reviewerName: 'Ahmed Khan',
      reviewerPhoto: INITIAL_USERS['user_ahmed_1'].photoUri,
      revieweeId: 'user_sara_2',
      rating: 5,
      thumbsUp: true,
      tags: ['Fun', 'Great conversation', 'Felt safe'],
      comment: 'Sara is super friendly and welcoming. Great hangout and good vibes only.',
      createdAt: now - 86400000 * 7,
    },
  ];
};

const getInitialMessages = (): Record<string, Message[]> => {
  const now = Date.now();
  return {
    'h_1': [
      {
        id: 'm_1_1',
        senderId: 'user_ahmed_1',
        senderName: 'Ahmed',
        text: 'Welcome team! ⚽ Meeting near pitch #3. Bringing 2 match balls and cones. See you all soon!',
        type: 'text',
        sentAt: now - 18 * 60 * 1000,
      },
      {
        id: 'm_1_2',
        senderId: 'user_sara_2',
        senderName: 'Sara',
        text: 'Awesome, on my way! Bringing extra water bottles too.',
        type: 'text',
        sentAt: now - 9 * 60 * 1000,
      },
    ],
    'h_2': [
      {
        id: 'm_2_1',
        senderId: 'user_sara_2',
        senderName: 'Sara',
        text: 'Sitting outside under the green canopy! Ordering an oat cortado if anyone has requests.',
        type: 'text',
        sentAt: now - 12 * 60 * 1000,
      },
    ],
    'h_3': [
      {
        id: 'm_3_1',
        senderId: 'user_liam_3',
        senderName: 'Liam',
        text: 'Court #2 is confirmed from 6:30 PM. Ahmed and Maya are locked in!',
        type: 'text',
        sentAt: now - 22 * 60 * 1000,
      },
    ],
  };
};

const getInitialConversations = (): Record<string, Conversation> => {
  const now = Date.now();
  return {
    'dm_user_ahmed_1_user_sara_2': {
      id: 'dm_user_ahmed_1_user_sara_2',
      participantIds: ['user_ahmed_1', 'user_sara_2'],
      participantDetails: {
        'user_ahmed_1': { name: 'Ahmed Khan', photo: INITIAL_USERS['user_ahmed_1'].photoUri },
        'user_sara_2': { name: 'Sara Jenkins', photo: INITIAL_USERS['user_sara_2'].photoUri },
      },
      lastMessage: 'Great game yesterday! Let me know if you want to play again next week.',
      lastMessageAt: now - 3600 * 1000 * 2,
      lastSenderId: 'user_ahmed_1',
      unreadCount: {
        'user_sara_2': 1,
        'user_ahmed_1': 0,
      },
    },
  };
};

const getInitialDmMessages = (): Record<string, Message[]> => {
  const now = Date.now();
  return {
    'dm_user_ahmed_1_user_sara_2': [
      {
        id: 'dmm_1',
        senderId: 'user_sara_2',
        senderName: 'Sara',
        text: 'Hey Ahmed, thanks for organizing the football session!',
        type: 'text',
        sentAt: now - 3600 * 1000 * 3,
      },
      {
        id: 'dmm_2',
        senderId: 'user_ahmed_1',
        senderName: 'Ahmed',
        text: 'Great game yesterday! Let me know if you want to play again next week.',
        type: 'text',
        sentAt: now - 3600 * 1000 * 2,
      },
    ],
  };
};

const getInitialNotifications = (): AppNotification[] => {
  const now = Date.now();
  return [
    {
      id: 'notif_1',
      userId: 'user_ahmed_1',
      title: 'New join request!',
      body: 'Sara requested to join "Casual 5v5 Football Friendly"',
      type: 'join_request',
      targetId: 'h_1',
      read: true,
      createdAt: now - 10 * 60 * 1000,
    },
    {
      id: 'notif_2',
      userId: 'user_sara_2',
      title: 'Request Approved! 🎉',
      body: 'Ahmed approved your request to join "Casual 5v5 Football Friendly"',
      type: 'request_approved',
      targetId: 'h_1',
      read: false,
      createdAt: now - 8 * 60 * 1000,
    },
  ];
};

export const storage = {
  // Current user
  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      const defaultUser = INITIAL_USERS['user_ahmed_1'];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS['user_ahmed_1'];
    }
  },

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.saveUserProfile(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Users
  getUsers(): Record<string, UserProfile> {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  getUser(uid: string): UserProfile | null {
    const users = this.getUsers();
    return users[uid] || null;
  },

  saveUserProfile(profile: UserProfile): void {
    const users = this.getUsers();
    users[profile.uid] = profile;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  deleteAccount(uid: string): void {
    const users = this.getUsers();
    delete users[uid];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Remove user hangouts
    const hangouts = this.getHangouts().filter((h) => h.postedByUid !== uid);
    localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(hangouts));

    this.setCurrentUser(null);
  },

  // Hangouts
  getHangouts(): HangoutCard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HANGOUTS);
    if (!raw) {
      const initial = getInitialHangouts();
      localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const initial = getInitialHangouts();
      localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(initial));
      return initial;
    }
  },

  getActiveHangouts(): HangoutCard[] {
    const hangouts = this.getHangouts();
    const now = Date.now();
    // Non-cancelled and unexpired
    const active = hangouts.filter((h) => h.status !== 'cancelled' && h.expiresAt > now);
    if (active.length === 0) {
      const refreshed = getInitialHangouts();
      localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(refreshed));
      return refreshed;
    }
    return active;
  },

  getHangout(id: string): HangoutCard | null {
    const hangouts = this.getHangouts();
    return hangouts.find((h) => h.id === id) || null;
  },

  addHangout(hangout: Omit<HangoutCard, 'id' | 'createdAt'>): HangoutCard {
    const hangouts = this.getHangouts();
    const newCard: HangoutCard = {
      ...hangout,
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    hangouts.unshift(newCard);
    localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(hangouts));

    // Automatically create approved request for host
    this.addJoinRequest({
      hangoutId: newCard.id,
      userId: newCard.postedByUid,
      userName: newCard.postedByName,
      userPhoto: newCard.postedByPhoto,
      status: 'approved',
    });

    return newCard;
  },

  updateHangout(id: string, updates: Partial<HangoutCard>): HangoutCard | null {
    const hangouts = this.getHangouts();
    const index = hangouts.findIndex((h) => h.id === id);
    if (index === -1) return null;

    hangouts[index] = { ...hangouts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.HANGOUTS, JSON.stringify(hangouts));
    return hangouts[index];
  },

  cancelHangout(id: string): boolean {
    const res = this.updateHangout(id, { status: 'cancelled' });
    return !!res;
  },

  getUserActiveHangoutCount(uid: string): number {
    const now = Date.now();
    return this.getHangouts().filter(
      (h) => h.postedByUid === uid && h.status === 'active' && h.expiresAt > now
    ).length;
  },

  // Join Requests
  getJoinRequests(hangoutId?: string): JoinRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOIN_REQUESTS);
    let list: JoinRequest[] = [];
    if (!raw) {
      list = getInitialJoinRequests();
      localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = getInitialJoinRequests();
      }
    }
    if (hangoutId) {
      return list.filter((r) => r.hangoutId === hangoutId);
    }
    return list;
  },

  addJoinRequest(data: Omit<JoinRequest, 'id' | 'joinedAt'>): JoinRequest {
    const list = this.getJoinRequests();
    // Check if already requested
    const existing = list.find((r) => r.hangoutId === data.hangoutId && r.userId === data.userId);
    if (existing) return existing;

    const newReq: JoinRequest = {
      ...data,
      id: `jr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: Date.now(),
    };
    list.push(newReq);
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));

    // Notify host if pending
    if (data.status === 'pending') {
      const hangout = this.getHangout(data.hangoutId);
      if (hangout) {
        this.addNotification({
          userId: hangout.postedByUid,
          title: 'New join request!',
          body: `${data.userName} wants to join "${hangout.title || hangout.activityType}"`,
          type: 'join_request',
          targetId: hangout.id,
        });
      }
    }

    return newReq;
  },

  approveJoinRequest(requestId: string): boolean {
    const list = this.getJoinRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) return false;

    const hangout = this.getHangout(req.hangoutId);
    if (!hangout || hangout.currentPeople >= hangout.maxPeople) {
      return false;
    }

    req.status = 'approved';
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));

    // Increment count
    hangout.currentPeople += 1;
    this.updateHangout(hangout.id, { currentPeople: hangout.currentPeople });

    // Notify approved user
    this.addNotification({
      userId: req.userId,
      title: 'Request Approved! 🎉',
      body: `You are in for "${hangout.title || hangout.activityType}"! Chat is now open.`,
      type: 'request_approved',
      targetId: hangout.id,
    });

    return true;
  },

  declineJoinRequest(requestId: string): boolean {
    const list = this.getJoinRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'declined';
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));

    const hangout = this.getHangout(req.hangoutId);
    if (hangout) {
      this.addNotification({
        userId: req.userId,
        title: 'Hangout Update',
        body: `Your request for "${hangout.title || hangout.activityType}" could not be accommodated.`,
        type: 'request_declined',
        targetId: hangout.id,
      });
    }

    return true;
  },

  leaveHangout(hangoutId: string, userId: string): boolean {
    const list = this.getJoinRequests();
    const index = list.findIndex((r) => r.hangoutId === hangoutId && r.userId === userId);
    if (index === -1) return false;

    const wasApproved = list[index].status === 'approved';
    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.JOIN_REQUESTS, JSON.stringify(list));

    if (wasApproved) {
      const hangout = this.getHangout(hangoutId);
      if (hangout && hangout.currentPeople > 1) {
        this.updateHangout(hangout.id, { currentPeople: hangout.currentPeople - 1 });
      }
    }
    return true;
  },

  removeParticipant(hangoutId: string, participantUid: string): boolean {
    return this.leaveHangout(hangoutId, participantUid);
  },

  isParticipantApproved(hangoutId: string, userId: string): boolean {
    const hangout = this.getHangout(hangoutId);
    if (hangout && hangout.postedByUid === userId) return true;
    const reqs = this.getJoinRequests(hangoutId);
    return reqs.some((r) => r.userId === userId && r.status === 'approved');
  },

  getUserJoinStatus(hangoutId: string, userId: string): JoinRequestStatus | 'none' {
    const hangout = this.getHangout(hangoutId);
    if (hangout && hangout.postedByUid === userId) return 'approved';
    const reqs = this.getJoinRequests(hangoutId);
    const found = reqs.find((r) => r.userId === userId);
    return found ? found.status : 'none';
  },

  // Comments
  getComments(hangoutId: string): Comment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    let list: Comment[] = [];
    if (!raw) {
      list = getInitialComments();
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = getInitialComments();
      }
    }
    return list.filter((c) => c.hangoutId === hangoutId);
  },

  addComment(data: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const list: Comment[] = raw ? JSON.parse(raw) : getInitialComments();
    const newComment: Comment = {
      ...data,
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    list.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(list));

    // Notify host
    const hangout = this.getHangout(data.hangoutId);
    if (hangout && hangout.postedByUid !== data.authorId) {
      this.addNotification({
        userId: hangout.postedByUid,
        title: 'New comment on your hangout',
        body: `${data.authorName}: "${data.text.slice(0, 50)}..."`,
        type: 'new_comment',
        targetId: hangout.id,
      });
    }

    return newComment;
  },

  deleteComment(commentId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!raw) return false;
    let list: Comment[] = JSON.parse(raw);
    list = list.filter((c) => c.id !== commentId && c.parentId !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(list));
    return true;
  },

  // Hangout Chat Messages
  getHangoutMessages(hangoutId: string, currentUserId?: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HANGOUT_MESSAGES);
    let all: Record<string, Message[]> = {};
    if (!raw) {
      all = getInitialMessages();
      localStorage.setItem(STORAGE_KEYS.HANGOUT_MESSAGES, JSON.stringify(all));
    } else {
      try {
        all = JSON.parse(raw);
      } catch {
        all = getInitialMessages();
      }
    }
    const msgs = all[hangoutId] || [];
    if (currentUserId) {
      // Filter out messages deleted for this user (FR-C7)
      return msgs.filter((m) => !m.deletedFor?.includes(currentUserId));
    }
    return msgs;
  },

  addHangoutMessage(hangoutId: string, message: Omit<Message, 'id' | 'sentAt'>): Message {
    const raw = localStorage.getItem(STORAGE_KEYS.HANGOUT_MESSAGES);
    let all: Record<string, Message[]> = raw ? JSON.parse(raw) : getInitialMessages();
    if (!all[hangoutId]) all[hangoutId] = [];

    const newMsg: Message = {
      ...message,
      id: `hm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: Date.now(),
    };
    all[hangoutId].push(newMsg);
    localStorage.setItem(STORAGE_KEYS.HANGOUT_MESSAGES, JSON.stringify(all));

    // Notify other approved participants
    const reqs = this.getJoinRequests(hangoutId).filter(
      (r) => r.status === 'approved' && r.userId !== message.senderId
    );
    const hangout = this.getHangout(hangoutId);
    reqs.forEach((r) => {
      this.addNotification({
        userId: r.userId,
        title: `${hangout?.title || 'Hangout Chat'}`,
        body: `${message.senderName}: ${message.text}`,
        type: 'new_message',
        targetId: hangoutId,
      });
    });

    return newMsg;
  },

  deleteMessageForMe(hangoutId: string, messageId: string, userId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.HANGOUT_MESSAGES);
    if (!raw) return false;
    const all: Record<string, Message[]> = JSON.parse(raw);
    const list = all[hangoutId];
    if (!list) return false;
    const msg = list.find((m) => m.id === messageId);
    if (!msg) return false;

    if (!msg.deletedFor) msg.deletedFor = [];
    if (!msg.deletedFor.includes(userId)) {
      msg.deletedFor.push(userId);
    }
    localStorage.setItem(STORAGE_KEYS.HANGOUT_MESSAGES, JSON.stringify(all));
    return true;
  },

  deleteMessageForEveryone(hangoutId: string, messageId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.HANGOUT_MESSAGES);
    if (!raw) return false;
    const all: Record<string, Message[]> = JSON.parse(raw);
    const list = all[hangoutId];
    if (!list) return false;
    const msg = list.find((m) => m.id === messageId);
    if (!msg) return false;

    msg.deletedForEveryone = true;
    msg.text = '🚫 This message was deleted';
    msg.mediaUrl = undefined;
    localStorage.setItem(STORAGE_KEYS.HANGOUT_MESSAGES, JSON.stringify(all));
    return true;
  },

  // Direct Messages & Inbox
  getConversations(userId: string): Conversation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DM_CONVERSATIONS);
    let all: Record<string, Conversation> = {};
    if (!raw) {
      all = getInitialConversations();
      localStorage.setItem(STORAGE_KEYS.DM_CONVERSATIONS, JSON.stringify(all));
    } else {
      try {
        all = JSON.parse(raw);
      } catch {
        all = getInitialConversations();
      }
    }
    return Object.values(all)
      .filter((c) => c.participantIds.includes(userId))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },

  getOrCreateConversation(user1: UserProfile, user2: UserProfile): Conversation {
    const convId = [user1.uid, user2.uid].sort().join('_');
    const fullId = `dm_${convId}`;
    const raw = localStorage.getItem(STORAGE_KEYS.DM_CONVERSATIONS);
    const all: Record<string, Conversation> = raw ? JSON.parse(raw) : getInitialConversations();

    if (!all[fullId]) {
      all[fullId] = {
        id: fullId,
        participantIds: [user1.uid, user2.uid],
        participantDetails: {
          [user1.uid]: { name: user1.fullName, photo: user1.photoUri },
          [user2.uid]: { name: user2.fullName, photo: user2.photoUri },
        },
        lastMessage: 'Started a private conversation',
        lastMessageAt: Date.now(),
        lastSenderId: user1.uid,
        unreadCount: {
          [user1.uid]: 0,
          [user2.uid]: 0,
        },
      };
      localStorage.setItem(STORAGE_KEYS.DM_CONVERSATIONS, JSON.stringify(all));
    }
    return all[fullId];
  },

  getDmMessages(conversationId: string, currentUserId?: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DM_MESSAGES);
    let all: Record<string, Message[]> = {};
    if (!raw) {
      all = getInitialDmMessages();
      localStorage.setItem(STORAGE_KEYS.DM_MESSAGES, JSON.stringify(all));
    } else {
      try {
        all = JSON.parse(raw);
      } catch {
        all = getInitialDmMessages();
      }
    }
    const msgs = all[conversationId] || [];
    if (currentUserId) {
      return msgs.filter((m) => !m.deletedFor?.includes(currentUserId));
    }
    return msgs;
  },

  sendDmMessage(conversationId: string, message: Omit<Message, 'id' | 'sentAt'>): Message {
    const raw = localStorage.getItem(STORAGE_KEYS.DM_MESSAGES);
    const all: Record<string, Message[]> = raw ? JSON.parse(raw) : getInitialDmMessages();
    if (!all[conversationId]) all[conversationId] = [];

    const newMsg: Message = {
      ...message,
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentAt: Date.now(),
    };
    all[conversationId].push(newMsg);
    localStorage.setItem(STORAGE_KEYS.DM_MESSAGES, JSON.stringify(all));

    // Update conversation metadata
    const rawConv = localStorage.getItem(STORAGE_KEYS.DM_CONVERSATIONS);
    if (rawConv) {
      const convs: Record<string, Conversation> = JSON.parse(rawConv);
      if (convs[conversationId]) {
        convs[conversationId].lastMessage = message.text;
        convs[conversationId].lastMessageAt = Date.now();
        convs[conversationId].lastSenderId = message.senderId;
        // bump unread for other participants
        convs[conversationId].participantIds.forEach((pid) => {
          if (pid !== message.senderId) {
            convs[conversationId].unreadCount[pid] =
              (convs[conversationId].unreadCount[pid] || 0) + 1;

            this.addNotification({
              userId: pid,
              title: `Direct message from ${message.senderName}`,
              body: message.text,
              type: 'new_message',
              targetId: conversationId,
            });
          }
        });
        localStorage.setItem(STORAGE_KEYS.DM_CONVERSATIONS, JSON.stringify(convs));
      }
    }

    return newMsg;
  },

  // Reviews and Trust Score
  getReviewsForUser(userId: string): Review[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    let list: Review[] = [];
    if (!raw) {
      list = getInitialReviews();
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = getInitialReviews();
      }
    }
    return list.filter((r) => r.revieweeId === userId);
  },

  submitReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list: Review[] = raw ? JSON.parse(raw) : getInitialReviews();

    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    list.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));

    // Recalculate target user's trust score
    const targetUser = this.getUser(review.revieweeId);
    if (targetUser) {
      const allTargetReviews = list.filter((r) => r.revieweeId === review.revieweeId);
      const totalStars = allTargetReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Number((totalStars / allTargetReviews.length).toFixed(1));
      targetUser.trustScore = avg;
      targetUser.reviewCount = allTargetReviews.length;
      this.saveUserProfile(targetUser);
    }

    return newReview;
  },

  // Safety & Moderation
  getReports(): Report[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  submitReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const list = this.getReports();
    const newReport: Report = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      createdAt: Date.now(),
    };
    list.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    return newReport;
  },

  resolveReport(reportId: string, action: 'dismissed' | 'resolved', banUser?: string): void {
    const list = this.getReports();
    const r = list.find((x) => x.id === reportId);
    if (r) {
      r.status = action;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    }
    if (banUser) {
      // Remove banned user account
      this.deleteAccount(banUser);
    }
  },

  getBlockedUsers(currentUserId: string): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!raw) return [];
    try {
      const map: Record<string, string[]> = JSON.parse(raw);
      return map[currentUserId] || [];
    } catch {
      return [];
    }
  },

  blockUser(currentUserId: string, targetUserId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    if (!map[currentUserId]) map[currentUserId] = [];
    if (!map[currentUserId].includes(targetUserId)) {
      map[currentUserId].push(targetUserId);
    }
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(map));
  },

  unblockUser(currentUserId: string, targetUserId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!raw) return;
    const map: Record<string, string[]> = JSON.parse(raw);
    if (map[currentUserId]) {
      map[currentUserId] = map[currentUserId].filter((id) => id !== targetUserId);
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(map));
    }
  },

  // Friends (FR-L1, FR-L2)
  addFriend(user1Id: string, user2Id: string): void {
    const u1 = this.getUser(user1Id);
    const u2 = this.getUser(user2Id);
    if (u1 && u2) {
      if (!u1.friends) u1.friends = [];
      if (!u2.friends) u2.friends = [];
      if (!u1.friends.includes(user2Id)) u1.friends.push(user2Id);
      if (!u2.friends.includes(user1Id)) u2.friends.push(user1Id);
      this.saveUserProfile(u1);
      this.saveUserProfile(u2);
    }
  },

  isFriend(user1Id: string, user2Id: string): boolean {
    const u1 = this.getUser(user1Id);
    return !!u1?.friends?.includes(user2Id);
  },

  // Notifications
  getNotifications(userId: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: AppNotification[] = [];
    if (!raw) {
      list = getInitialNotifications();
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = getInitialNotifications();
      }
    }
    return list.filter((n) => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: AppNotification[] = raw ? JSON.parse(raw) : getInitialNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: Date.now(),
    };
    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;
    const list: AppNotification[] = JSON.parse(raw);
    const found = list.find((n) => n.id === id);
    if (found) {
      found.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  },

  markAllNotificationsAsRead(userId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;
    const list: AppNotification[] = JSON.parse(raw);
    list.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  // Settings
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings: AppSettings = {
      pushNotifications: true,
      joinRequestAlerts: true,
      chatMessageAlerts: true,
      interestMatchAlerts: true,
      hangoutReminders: true,
      shareExactLocation: false,
    };
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
