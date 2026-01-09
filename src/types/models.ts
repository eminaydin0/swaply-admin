export interface User {
  id: string | number;

  // Identity
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;

  // Location Data
  location: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: string;
  birthDate?: string;
  gender?: string;
  website?: string;

  // Status
  verified: boolean;
  role: 'user' | 'admin' | 'moderator';
  onlineStatus: boolean;
  isPremium: boolean;

  // Mobile auth-related fields
  userId?: string | number;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;

  // Stats
  joinDate: string;
  lastActive: string;
  rating: number;
  responseRate: number;

  // Relations
  favoritesProductIds: Array<string | number>;
  followersCount: number;
  followingCount: number;
}

export interface Product {
  id: string | number;
  ownerId: string | number;
  userId?: string | number;

  name: string;
  description: string;
  price: number | null;
  currency: 'TL';

  categoryId: number | null;
  categoryName: string;
  hashTags: string[];
  tags: string[];

  condition: 'new' | 'slightly-used' | 'used';
  status: 'new' | 'slightly-used' | 'used' | 'draft';
  isExchanged: boolean;
  changeProduct: string[];

  imageUrl: string | null;
  images: string[];

  location: string;

  premium: boolean;
  isAd: boolean;
  premiumType: 'none' | 'featured' | 'vitrin';
  premiumExpiryDate: string | null;

  viewCount: number;
  likeCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;

  owner?: {
    id?: string | number;
    firstName?: string;
    lastName?: string;
    name?: string;
    username?: string;
    phone?: string;
    avatar?: string;
    rating?: number;
  };

  // Admin-only moderation flag (used by Hide/Unhide action)
  hidden?: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  slug: string;
}

export interface SwapOffer {
  id: string | number;
  initiatorId: string | number;
  targetUserId: string | number;
  targetProductId: string | number;
  offeredProductId: string | number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  message: string;
  createdAt: string;
  updatedAt: string;
  initiatorOnline?: boolean;
  targetOnline?: boolean;
}

export interface SwapHistoryItem {
  id: string | number;
  myProductId: string | number;
  theirProductId: string | number;
  partnerUserId: string | number;
  date: string;
  status: 'completed' | 'cancelled' | 'disputed';
  rating: number;
  categoryName: string;
}

export type ChatType = 'individual';

export interface ChatThread {
  id: string | number;
  type: ChatType;

  userIds: Array<string | number>;
  otherUserId: string | number;
  otherName: string;
  otherUsername: string;
  otherAvatar: string;
  isOnline: boolean;

  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;

  productId: string | number | null;
  productName: string | null;
  productImage: string | null;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string | number;
  threadId: string | number;
  senderUserId: string | number;
  text: string;
  images?: string[];
  time: string;
  isRead: boolean;
  status: MessageStatus;
}

export type NotificationType =
  | 'swap_offer'
  | 'swap_accepted'
  | 'swap_rejected'
  | 'product_viewed'
  | 'new_message'
  | 'favorite_updated';

export interface NotificationItem {
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  productId?: string | number;
  userId?: string | number;
  userPhoto?: string | null;
  productPhoto?: string | null;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  swapOffers: boolean;
  swapAccepted: boolean;
  swapRejected: boolean;
  newMessages: boolean;
  productViewed: boolean;
  newFollowers: boolean;

  emailEnabled: boolean;
  emailSwapUpdates: boolean;
  emailWeeklyDigest: boolean;
  emailPromotions: boolean;

  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface LocationRef {
  id: number;
  city: string;
  district: string;
}

export interface LocationHistoryItem extends LocationRef {
  date: string;
  time: string;
}

export interface LocationSettings {
  locationPermission: boolean;
  defaultLocation: LocationRef;
  nearbyRadiusKm: 5 | 10 | 20 | 50;
  history: LocationHistoryItem[];
}

export type ReportCategory = 'bug' | 'user' | 'product' | 'payment' | 'other';

export interface ReportItem {
  id: string | number;
  category: ReportCategory;
  message: string;
  createdAt: string;
  reporterUserId?: string | number;
  targetUserId?: string | number;
  targetProductId?: string | number;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  resolutionNote?: string;
}

export interface TrustFactor {
  id:
    | 'completed-swaps'
    | 'ratings'
    | 'response-time'
    | 'profile-completeness'
    | 'verification';
  score: number;
  maxScore: number;
}

export interface TrustScore {
  userId: string | number;
  overallScore: number;
  factors: TrustFactor[];
}

export type ThemePreference = 'dark' | 'light';
