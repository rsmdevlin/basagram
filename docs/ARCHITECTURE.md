# Basagram Architecture

## Monorepo Structure

```
basagram/
├── apps/
│   ├── api/           # Node.js/Express backend
│   └── web/           # Next.js React frontend
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── validation/    # Zod validation schemas
│   ├── utils/         # Shared utilities
│   └── database/      # MySQL client & migrations
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── REALTIME.md
│   └── DESIGN_SYSTEM.md
```

## Tech Stack

### Frontend
- **React 18** — UI library
- **Next.js 14** — Full-stack framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling (for now)
- **Socket.IO Client** — Realtime

### Backend
- **Node.js 18+** — Runtime
- **Express 4** — Web framework
- **TypeScript** — Type safety
- **MySQL 8** — Primary database
- **Redis** — Cache & realtime
- **Socket.IO** — WebSocket server
- **JWT** — Authentication
- **Argon2** — Password hashing
- **Zod** — Validation

### Database
- **MySQL 8.0+** — Persistent data
- **Redis** — Session, presence, pub/sub

## Key Entities

### Users
- id, username, email, displayName, avatar, bio
- is_online, last_seen
- authentication, sessions

### Conversations
- id, name, avatar, type (private/group/channel)
- conversation_members (with role, mute, last_read)
- messages

### Messages
- id, content, status (sending/sent/delivered/read)
- sender_id, conversation_id
- reactions, attachments
- reply_to_id for threading

### Realtime Events
- message:new, message:update, message:delete
- reaction:add, reaction:remove
- typing:start, typing:stop
- presence:update
- chat:read

## Development Workflow

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Fill in MySQL credentials and secrets
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start dev servers**
   ```bash
   npm run dev
   # Frontend: http://localhost:3000
   # Backend: http://localhost:3001
   ```

5. **Type checking & linting**
   ```bash
   npm run type-check
   npm run lint
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users/:userId` — Get user by ID
- `GET /api/users/search/:query` — Search users

### Conversations (Phase 6+)
- `GET /api/conversations` — Get user's conversations
- `POST /api/conversations` — Create conversation
- `GET /api/conversations/:id/messages` — Get messages

### Messages (Phase 6+)
- `POST /api/messages` — Send message
- `PUT /api/messages/:id` — Edit message
- `DELETE /api/messages/:id` — Delete message

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — MySQL connection
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — Token signing
- `SESSION_SECRET` — Refresh token signing
- `STORAGE_*` — S3/R2 credentials (Phase 7)
- `TURN_*` — TURN server (Phase 12)

## Security Checklist

- [ ] Input validation (Zod)
- [ ] Password hashing (Argon2)
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] CSRF protection
- [ ] Authorization checks (backend)
- [ ] Secure cookies
- [ ] XSS protection
- [ ] SQL injection prevention

## Performance Considerations

- [ ] Message pagination
- [ ] Conversation virtualization
- [ ] Image thumbnails
- [ ] Code splitting
- [ ] Database indexes
- [ ] Redis caching
- [ ] IndexedDB (client-side)
- [ ] Service Worker

## Next Phases

1. **Phase 2** — Design system (colors, typography, icons, components)
2. **Phase 3** — Application shell (responsive layout, navigation)
3. **Phase 4** — Auth UI & sessions
4. **Phase 5** — User profiles
5. **Phase 6** — Private chats & realtime
6. **Phase 7** — Media uploads
7. **Phase 8** — Message features (reactions, replies, edits)
8. **Phase 9-17** — Groups, channels, stories, calls, notifications, polish
