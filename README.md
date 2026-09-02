# Basagram — Premium Modern Messenger

A Telegram-class web messenger built with modern web technologies, featuring real-time messaging, group chats, channels, calls, and more.

## 🎯 Project Overview

Basagram is a comprehensive implementation of Telegram Desktop's UI/UX principles adapted for the web using React, Next.js, Express, and Socket.io. The project follows a systematic design-driven approach based on deep analysis of Telegram's source code.

## 📋 Requirements

- **Node.js**: ≥18.0.0
- **npm**: ≥9.0.0
- **MySQL**: ≥5.7 (optional, for production)
- **Redis**: (optional, for sessions)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repo-url>
cd web-messenger
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

### 3. Configure Environment
Create `.env.local` in root directory:

```env
# Backend
PORT=3001
JWT_SECRET=your-secret-key-here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=basagram
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development Servers
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001

## 📁 Project Structure

```
web-messenger/
├── apps/
│   ├── api/              # Express.js backend + Socket.io
│   │   ├── src/
│   │   │   ├── index.ts  # Main server + Socket.io handlers
│   │   │   ├── types.ts  # TypeScript interfaces
│   │   │   ├── routes/   # API endpoints
│   │   │   └── middleware/
│   │   └── package.json
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # Pages
│       │   ├── components/ # React components
│       │   ├── hooks/    # Custom hooks
│       │   └── app/globals.css # Design system
│       └── package.json
│
├── TELEGRAM_RESEARCH.md  # Design research documentation
├── package.json          # Root monorepo config
└── README.md            # This file
```

## 🎨 Design System

The project implements Telegram Desktop's design principles:

### Colors
- **Primary**: #0088cc (Telegram Blue)
- **Light Theme**: White backgrounds with subtle grays
- **Dark Theme**: #212121 background with lighter text

### Components
- **Avatar** - User profile pictures with online indicator
- **MessageBubble** - Telegram-style message bubbles (max 430px width)
- **ConversationList** - Left sidebar with search
- **ChatHeader** - Chat info with action buttons
- **MessageComposer** - Auto-expanding message input
- **TypingIndicator** - "User is typing..." animation
- **Badge** - Unread count indicators

### Animations
- Message arrival: slide-up + scale (300ms)
- Typing dots: staggered animation (1.4s loop)
- Reactions: pop animation (400ms)
- Transitions: 150-200ms standard

## 🔌 Real-time Features

### Socket.io Events

**Client → Server:**
- `user:online` - Register user presence
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `message:send` - Send new message
- `message:read` - Mark message as read
- `reaction:add` - Add emoji reaction
- `reaction:remove` - Remove emoji reaction
- `call:initiate` - Start audio/video call
- `call:answer` - Accept incoming call
- `call:end` - End active call

**Server → Client:**
- `message:new` - New message received
- `typing:indicator` - User typing status
- `message:read-receipt` - Message read notification
- `message:deleted` - Message deleted
- `message:edited` - Message edited
- `reaction:added` - Reaction added
- `reaction:removed` - Reaction removed
- `presence:updated` - User online/offline
- `call:incoming` - Incoming call
- `call:connected` - Call established
- `call:ended` - Call ended

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations/:id/messages` - Send message

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user
- `GET /api/users/me` - Current user

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group info
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

### Channels
- `GET /api/channels` - List channels
- `POST /api/channels` - Create channel
- `GET /api/channels/:id` - Get channel
- `POST /api/channels/:id/subscribe` - Subscribe

### More
- `/api/calls` - Call management
- `/api/stories` - Stories/ephemeral content
- `/api/notifications` - Push notifications
- `/api/settings` - User settings
- `/api/security` - Security features

## 🛠️ Scripts

```bash
# Development
npm run dev              # Start both backend and frontend

# Building
npm run build            # Build both apps
npm run type-check       # TypeScript validation
npm run lint             # ESLint check

# Database
npm run db:init          # Initialize database
npm run db:migrate       # Run migrations

# Starting
npm start                # Start production servers
```

## 🎯 Development Phases

### Completed ✅
- PHASE 0: Environment setup
- PHASE 1: Repository indexing
- PHASE 2: Design system tokens
- PHASE 3: Animation research
- PHASE 4: Backend architecture
- PHASE 5: Global design CSS
- PHASE 6: Core UI components

### In Progress 🔄
- Component integration testing
- Real-time Socket.io validation
- Message flow testing

### Upcoming ⏳
- PHASE 7: Authentication UI
- PHASE 8: Responsive design
- PHASE 9: Search functionality
- PHASE 10: Group/channel management
- PHASE 11: Call UI
- PHASE 12-14: Polish & optimization
- PHASE 15-19: Testing & deployment

## 🧪 Testing

### Frontend Components
```bash
cd apps/web
npm run dev
# Navigate to http://localhost:3000
```

### Backend API
```bash
curl http://localhost:3001/health
# Response: { "status": "ok", "timestamp": "..." }

curl http://localhost:3001/api/status
# Response: { "service": "basagram-api", "version": "0.1.0", ... }
```

### Real-time Testing
Use browser DevTools console:
```javascript
// Access Socket.io instance
console.log(window.__SOCKET__);

// Emit events manually
window.__SOCKET__.emit('typing:start', { conversationId: '1' });
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Module Not Found Errors
```bash
rm -rf node_modules apps/*/node_modules
npm install --legacy-peer-deps
cd apps/api && npm install
cd ../web && npm install
```

### TypeScript Errors
```bash
npm run type-check  # Check all errors
cd apps/web && npm run type-check  # Check frontend only
cd apps/api && npm run type-check  # Check backend only
```

### Build Failures
```bash
npm run build -- --verbose  # See detailed build output
```

## 📚 Documentation

- **TELEGRAM_RESEARCH.md** - Complete design analysis and implementation guide
- **API Documentation** - See `/api/status` endpoint
- **Type Definitions** - `apps/api/src/types.ts`

## 🔐 Security

- JWT-based authentication with Argon2 password hashing
- Rate limiting on auth endpoints
- HTTPS enforced in production
- CORS configured for allowed origins
- Input validation via Zod schemas
- SQL injection protection via parameterized queries

## 🌙 Dark Mode

Automatically responds to system `prefers-color-scheme`:
- Light theme (day-blue Telegram)
- Dark theme (night-green Telegram)
- Toggle via settings

## 📱 Responsive Design

- **Desktop** (1024px+): Full sidebar + chat layout
- **Tablet** (768px-1023px): Split view
- **Mobile** (<768px): Full-screen chat with back button

## 🎯 Performance

- Message virtualization for large chat lists
- Image lazy loading
- Optimistic message sending
- Debounced typing indicators
- WebSocket compression
- SQLite in-memory caching

## 📖 Technology Stack

### Frontend
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend
- Express.js
- TypeScript
- Socket.io
- MySQL2
- JWT (jsonwebtoken)
- Argon2 (password hashing)

### DevOps
- Turbo (monorepo)
- ESLint
- TypeScript Compiler

## 🤝 Contributing

1. Create a feature branch
2. Make changes following the existing code style
3. Run `npm run type-check` to validate
4. Run `npm run lint` to check style
5. Test with `npm run dev`
6. Submit PR with description

## 📄 License

[Your License Here]

## 📧 Support

For issues and questions:
1. Check TELEGRAM_RESEARCH.md
2. Review existing issues
3. Create new issue with reproduction steps

## 🎉 Status

**Version**: 0.1.0  
**Status**: Active Development  
**Last Updated**: 2026-09-02

---

## Quick Reference

### Start Development
```bash
npm install --legacy-peer-deps
npm run dev
```

### Check Health
```bash
curl http://localhost:3001/health
```

### View Design System
```bash
# Colors, spacing, animations in:
apps/web/src/app/globals.css

# Component examples:
apps/web/src/components/
```

### Enable Debug Logging
```bash
# Backend
DEBUG=basagram:* npm run dev

# Frontend (DevTools console)
localStorage.setItem('debug', 'basagram:*')
location.reload()
```

---

Made with ❤️ for premium messaging experience.
