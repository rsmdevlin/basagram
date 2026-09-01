import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
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
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Middleware
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Basagram API запущен`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
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
