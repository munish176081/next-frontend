export interface ChatParticipant {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin';
  isOnline: boolean;
  lastSeen: Date | string;
  unreadCount: number;
}

// Type for creating participants (matches backend DTO)
export interface CreateParticipantDto {
  user_id: string;
  name: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'listing';
  timestamp: Date | string;
  isRead: boolean;
  readBy: string[];
  replyTo?: string;
  attachments?: {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }[];
  listingReference?: {
    listingId: string;
    title: string;
    price: number;
    image: string;
    location: string;
    fields?: Record<string, any>;
  };
}

export interface ChatConversation {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  listingId?: string;
  conversationType: 'direct' | 'listing' | 'support';
  metadata?: {
    subject?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    listingDetails?: {
      id: string;
      title: string;
      price: number;
      location: string;
      breed: string;
    };
    participants?: {
      buyer?: {
        id: string;
        name: string;
        joinedPlatform: string | Date;
      };
      seller?: {
        id: string;
        name: string;
        joinedPlatform: string | Date;
      };
    };
  };
}

export interface ChatNotification {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  type: 'new_message' | 'message_read' | 'user_online' | 'user_offline';
  isRead: boolean;
  createdAt: Date | string;
}

export interface ChatSearchFilters {
  searchTerm?: string;
  participants?: string[];
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
  messageType?: ChatMessage['messageType'];
  unreadOnly?: boolean;
  listingId?: string;
}

export interface ChatStats {
  totalConversations: number;
  unreadMessages: number;
  activeConversations: number;
  messagesToday: number;
  responseTime: number; // average response time in minutes
}

export interface ChatSettings {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    allowFileSharing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
} 