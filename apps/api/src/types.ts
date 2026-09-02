// Common types for Basagram API

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  online: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  type: 'private' | 'group' | 'channel';
  members: User[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  unreadCount?: number;
  muted: boolean;
  pinned: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'file' | 'voice' | 'sticker';
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  replyTo?: string;
  forwardedFrom?: string;
  edited: boolean;
  editedAt?: Date;
  status: 'sending' | 'sent' | 'read' | 'failed';
  readBy?: ReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file' | 'voice';
  mimeType: string;
  size: number;
  duration?: number; // for video/voice
  thumbnail?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export interface Group {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: User[];
  admins: User[];
  owner: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  subscribers: User[];
  owner: User;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  conversationId: string;
  callerId: string;
  recipientId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'rejected';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'call' | 'mention' | 'reaction' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  privacy: {
    profileVisibility: 'public' | 'contacts' | 'private';
    allowMessages: 'anyone' | 'contacts' | 'none';
    allowCalls: 'anyone' | 'contacts' | 'none';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
  blockedUsers: string[];
  mutedConversations: string[];
}

export interface AuthRequest {
  user?: User;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
}
