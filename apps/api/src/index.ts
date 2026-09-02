import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  compressionMiddleware,
  helmetMiddleware,
  createRateLimiter,
  authLimiter,
  responseTimeMiddleware,
} from './middleware/performance.js';
import { authenticate, requireAuth, AuthRequest } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import profilesRoutes from './routes/profiles.js';
import conversationsRoutes from './routes/conversations.js';
import messagesRoutes from './routes/messages.js';
import attachmentsRoutes from './routes/attachments.js';
import messageFeaturesRoutes from './routes/message-features.js';
import groupsRoutes from './routes/groups.js';
import channelsRoutes from './routes/channels.js';
import storiesRoutes from './routes/stories.js';
import callsRoutes from './routes/calls.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import securityRoutes from './routes/security.js';

dotenv.config({ path: '../../.env.local' });

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Track connected users for real-time presence
const connectedUsers = new Map<string, { socket: Socket; userId: string }>();

// Middleware
app.set('trust proxy', 1);
app.use(cors());
app.use(compressionMiddleware);
app.use(helmetMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(responseTimeMiddleware);
app.use(createRateLimiter(15 * 60 * 1000, 100));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  next();
});

app.use(authenticate);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    service: 'basagram-api',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/messages', messageFeaturesRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/security', securityRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Basagram API',
    version: '0.1.0',
    status: 'online',
    endpoints: {
      health: '/health',
      status: '/api/status',
      auth: '/api/auth',
      users: '/api/users',
      profiles: '/api/profiles',
      conversations: '/api/conversations',
      messages: '/api/messages',
      groups: '/api/groups',
      channels: '/api/channels',
      stories: '/api/stories',
      calls: '/api/calls',
      notifications: '/api/notifications',
      settings: '/api/settings',
      security: '/api/security',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Socket.IO handlers
io.on('connection', (socket: Socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // User joins real-time session
  socket.on('user:online', (data: { userId: string }) => {
    connectedUsers.set(socket.id, { socket, userId: data.userId });
    io.emit('presence:updated', {
      userId: data.userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  });

  // User typing indicator
  socket.on('typing:start', (data: { conversationId: string; userId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:indicator', {
      conversationId: data.conversationId,
      userId: data.userId,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:indicator', {
      conversationId: data.conversationId,
      userId: data.userId,
      isTyping: false,
    });
  });

  // Join conversation room
  socket.on('conversation:join', (data: { conversationId: string }) => {
    socket.join(`conversation:${data.conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`);
  });

  // Message received (broadcast to conversation room)
  socket.on('message:send', (data: any) => {
    io.to(`conversation:${data.conversationId}`).emit('message:new', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // Message read receipt
  socket.on('message:read', (data: { conversationId: string; messageId: string; userId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('message:read-receipt', data);
  });

  // Message deleted
  socket.on('message:delete', (data: { conversationId: string; messageId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('message:deleted', data);
  });

  // Message edited
  socket.on('message:edit', (data: { conversationId: string; messageId: string; content: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('message:edited', data);
  });

  // Reaction added
  socket.on('reaction:add', (data: { conversationId: string; messageId: string; emoji: string; userId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('reaction:added', data);
  });

  // Reaction removed
  socket.on('reaction:remove', (data: { conversationId: string; messageId: string; emoji: string; userId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('reaction:removed', data);
  });

  // Call initiated
  socket.on('call:initiate', (data: { callerId: string; recipientId: string; type: 'audio' | 'video' }) => {
    io.to(`user:${data.recipientId}`).emit('call:incoming', {
      callerId: data.callerId,
      type: data.type,
      callId: uuidv4(),
    });
  });

  // Call answered
  socket.on('call:answer', (data: { callId: string }) => {
    io.emit('call:connected', data);
  });

  // Call rejected
  socket.on('call:reject', (data: { callId: string }) => {
    io.emit('call:ended', data);
  });

  // Call ended
  socket.on('call:end', (data: { callId: string }) => {
    io.emit('call:ended', data);
  });

  // User goes offline
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.emit('presence:updated', {
        userId: user.userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      });
    }
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // Error handler
  socket.on('error', (error: any) => {
    console.error(`Socket error [${socket.id}]:`, error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Basagram API запущен`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 WebSocket: ws://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export { requireAuth, AuthRequest };
