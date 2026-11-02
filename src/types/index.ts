export type ActivityType =
  | '⚽ Football'
  | '🏏 Cricket'
  | '🏸 Badminton'
  | '☕ Coffee'
  | '🍕 Food'
  | '🚶 Walk'
  | '🎮 Gaming'
  | '📚 Study'
  | '🎬 Movie'
  | '✈️ Travel'
  | '🎵 Music'
  | '🏋️ Gym'
  | string;

export interface HangoutCard {
  id: string;
  postedByName: string;
  postedByUid: string;
  postedByPhoto?: string;
  title: string;
  activityType: ActivityType;
  customActivity?: string;
  description: string;
  startAt?: number;
  endAt?: number;
  timeWindow: string; // "Right now", "In 1 hour", "This evening", "Tomorrow", or formatted date/time
  locationLabel: string;
  exactMeetingPoint?: string; // Only shown to approved participants (FR-J3, NFR-3)
  lat: number;
  lng: number;
  maxPeople: number;
  currentPeople: number;
  photoUrls?: string[];
  rules?: {
    sameGenderOnly?: boolean;
    ageRangeMin?: number;
    ageRangeMax?: number;
    verifiedOnly?: boolean;
  };
  status: 'active' | 'cancelled' | 'completed';
  createdAt: number;
  expiresAt: number;
  isRecurring?: boolean;
  recurringSchedule?: string;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'declined';

export interface JoinRequest {
  id: string;
  hangoutId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  userAge?: number;
  userTrustScore?: number;
  userInterests?: string[];
  status: JoinRequestStatus;
  joinedAt: number;
}

export interface Comment {
  id: string;
  hangoutId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  parentId?: string; // For replies (FR-M4)
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  sentAt: number;
  deletedForEveryone?: boolean;
  deletedFor?: string[]; // user IDs who deleted for themselves (FR-C7)
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

export interface Conversation {
  id: string; // e.g. "dm_user1_user2"
  participantIds: string[];
  participantDetails: {
    [uid: string]: {
      name: string;
      photo?: string;
    };
  };
  lastMessage: string;
  lastMessageAt: number;
  lastSenderId: string;
  unreadCount: {
    [uid: string]: number;
  };
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dobDay: number;
  dobMonth: number;
  dobYear: number;
  age: number;
  bio?: string;
  photoUri: string;
  galleryPhotos?: string[];
  interests: string[];
  profileComplete: boolean;
  trustScore: number; // 1.0 to 5.0
  reviewCount: number;
  hostedCount?: number;
  attendedCount?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  showLastName?: boolean;
  showAge?: boolean;
  friends?: string[];
  createdAt: number;
  isVerified?: boolean;
}

export interface Review {
  id: string;
  hangoutId: string;
  hangoutTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  revieweeId: string;
  rating: number; // 1 to 5 stars
  thumbsUp: boolean;
  tags: string[]; // "fun", "on time", "felt safe", "friendly", "great conversation"
  comment?: string;
  createdAt: number;
  isAnonymous?: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: 'user' | 'card' | 'comment' | 'message' | 'photo';
  targetId: string;
  targetDetails?: string;
  reason:
    | 'misuse_for_dating'
    | 'unwanted_romantic_advances'
    | 'harassment_or_bullying'
    | 'inappropriate_content'
    | 'no_show_or_scam'
    | 'safety_concern'
    | 'spam';
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type:
    | 'join_request'
    | 'request_approved'
    | 'request_declined'
    | 'new_message'
    | 'new_comment'
    | 'reminder'
    | 'review_prompt';
  targetId?: string; // hangoutId or conversationId
  read: boolean;
  createdAt: number;
}

export interface AppSettings {
  pushNotifications: boolean;
  joinRequestAlerts: boolean;
  chatMessageAlerts: boolean;
  interestMatchAlerts: boolean;
  hangoutReminders: boolean;
  shareExactLocation: boolean;
}
