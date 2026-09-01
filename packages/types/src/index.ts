// User types
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile extends Omit<User, 'email'> {
  phoneNumber?: string;
  location?: string;
  website?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  replyToId?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
}

export interface Attachment {
  id: string;
  messageId: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnail?: string;
  size: number;
  mimeType: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Conversation types
export interface Conversation {
  id: string;
  name?: string;
  avatar?: string;
  type: 'private' | 'group' | 'channel';
  members: string[];
  lastMessage?: Message;
  unreadCount: number;
  mutedUntil?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Realtime event types
export type RealtimeEventType =
  | 'message:new'
  | 'message:update'
  | 'message:delete'
  | 'reaction:add'
  | 'reaction:remove'
  | 'typing:start'
  | 'typing:stop'
  | 'presence:update'
  | 'chat:read'
  | 'chat:update';

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  version: number;
  payload: T;
  timestamp: Date;
  userId: string;
  conversationId: string;
}
