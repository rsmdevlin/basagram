// Local database type definitions and stubs
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatar?: string;
  bio?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  adminId: string;
  memberIds: string[];
  createdAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  adminId: string;
  createdAt: Date;
}

export interface Story {
  id: string;
  authorId: string;
  content: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'pending' | 'active' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

// Database query stubs
export const query = async (sql: string, params?: any[]): Promise<any[]> => {
  console.log('Query stub called:', sql, params);
  return [];
};

export const execute = async (sql: string, params?: any[]): Promise<any> => {
  console.log('Execute stub called:', sql, params);
  return { affectedRows: 0 };
};


