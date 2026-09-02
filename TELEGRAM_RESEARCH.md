# Basagram — Telegram Desktop UI/UX Implementation Guide

## Project Status: PHASE 6 IN PROGRESS ✅

### Completed Phases
- ✅ **PHASE 0**: Environment discovery & path verification
- ✅ **PHASE 1**: Telegram Desktop repository indexing
- ✅ **PHASE 2**: Design system tokens extraction
- ✅ **PHASE 3**: Animation & asset research (TGS, SVG)
- ✅ **PHASE 4**: Existing web-messenger architecture analysis
- ✅ **PHASE 5**: Global design system CSS implementation
- 🔄 **PHASE 6**: Core UI components (IN PROGRESS)

### Current Work
Implementing Telegram-class web messenger using modern React/Next.js following Telegram Desktop's design principles.

---

## PHASE 0-2: INDEXING & DESIGN SYSTEM ✅

### Repository Paths
- **TDESKTOP_ROOT**: `C:\Users\myteg\Desktop\tdesktop`
- **WEB_MESSENGER_ROOT**: `C:\Users\myteg\Desktop\web-messenger`

### Telegram Desktop Structure
```
Telegram/SourceFiles/
├── ui/
│   ├── chat/ (message bubbles, chat styles)
│   ├── controls/ (buttons, inputs, dropdowns)
│   ├── effects/ (animations, premium effects)
│   ├── widgets/ (UI components)
│   └── boxes/ (modals, dialogs)
├── window/ (themes, main window)
├── dialogs/ (chat list, sidebar)
├── history/ (message rendering)
├── settings/ (preferences UI)
└── profile/ (user profiles)
```

### Key Design Tokens from Telegram Desktop

#### Message Bubble Styling
- **msgMaxWidth**: 430px
- **msgMinWidth**: 160px
- **msgPadding**: 11px 8px (vertical horizontal)
- **msgMargin**: 16px 6px 56px 2px
- **msgPhotoSize**: 33px
- **msgReplyBarSize**: 2px × 36px

#### Color Palette
- **Primary Blue**: #0088cc (Telegram brand)
- **Incoming Bubble**: #e5e5ea (light), #1c1c1c (dark)
- **Outgoing Bubble**: #d5f4ff (light), #166088 (dark)
- **Text Primary**: #000000 (light), #ffffff (dark)
- **Text Secondary**: #666666 (light), #b3b3b3 (dark)

#### Typography
- **Font Family**: System stack (-apple-system, Segoe UI, Roboto)
- **Base Size**: 15px
- **Message Font**: 15px regular
- **Name Font**: 15px semibold
- **Service Font**: 13px semibold

#### Animation Timings
- **Item Reveal**: 150ms
- **Standard Transition**: 200ms
- **Fast Transition**: 100ms
- **Easing**: cubic-bezier(0.34, 1.56, 0.64, 1)

---

## PHASE 5: GLOBAL DESIGN SYSTEM ✅

### CSS Variables Implementation
Created comprehensive `globals.css` with:
- 50+ CSS custom properties
- Dark/light theme support (prefers-color-scheme)
- Animation keyframes (slide, scale, fade, typing dots, etc.)
- Utility animation classes
- Scrollbar styling (webkit)
- Focus ring styles
- Z-index stack

### Tailwind Configuration
- Integrated with design tokens
- Responsive breakpoints (xs, sm, md, lg, xl, 2xl)
- Custom color palette
- Typography scale
- Spacing scale

---

## PHASE 6: CORE UI COMPONENTS ✅

### Implemented Components

#### 1. **Avatar** (`components/Avatar.tsx`)
- Supports src or initials
- Size variants: xs, sm, md, lg, xl
- Online indicator (green dot with pulse animation)
- Muted indicator
- Auto color assignment from initials

#### 2. **Badge** (`components/Badge.tsx`)
- Unread count display
- Variants: danger, success, warning, info, muted
- Size options: sm, md, lg
- Shows "99+" for counts > 99

#### 3. **MessageBubble** (`components/MessageBubble.tsx`)
- Telegram-style bubbles (incoming/outgoing)
- Max width 430px (Telegram standard)
- Status indicators (sending/sent/read/failed)
- Reaction support with emoji counter
- Reply quotes
- Hover actions (react, reply, edit, delete)
- Animation on entry

#### 4. **ConversationList** (`components/ConversationList.tsx`)
- Left sidebar (300px on desktop)
- Search functionality
- Pinned conversations section
- Last message preview with timestamp
- Unread badges
- Online indicators
- Muted chat indicators

#### 5. **ChatHeader** (`components/ChatHeader.tsx`)
- User/group info display
- Online status or "last seen" time
- Action buttons (search, call, video, menu)
- Avatar with online indicator
- Member count for groups

#### 6. **MessageComposer** (`components/MessageComposer.tsx`)
- Auto-expanding textarea
- Send button (plane emoji icon)
- Attachment & emoji buttons
- Typing indicator emission
- Keyboard shortcuts (Enter to send, Ctrl+Enter for new line)
- Character limit handling

#### 7. **TypingIndicator** (`components/TypingIndicator.tsx`)
- Three animated dots
- "User is typing..." text
- Supports multiple users
- Grammar-correct output ("User", "User and User", "User, User, and User")

#### 8. **TelegramLayout** (`components/TelegramLayout.tsx`)
- Main app shell component
- Integrates all components
- Real-time Socket.io integration
- Message state management
- Conversation management
- Typing indicator coordination
- Message reactions handling

### Socket.io Integration

#### Backend Handlers (`index.ts`)
- `user:online` — Register user presence
- `typing:start/stop` — Typing indicators
- `conversation:join/leave` — Room management
- `message:send` — Broadcast new messages
- `message:read` — Read receipts
- `message:delete` — Message deletion
- `message:edit` — Message editing
- `reaction:add/remove` — Emoji reactions
- `call:*` — Audio/video call events

#### Frontend Hooks (`useSocket.ts`)
- Auto-connect with reconnection logic
- Event subscription management
- Emit wrapper
- Connection state tracking

---

## Backend Architecture

### API Structure
```
apps/api/src/
├── index.ts (Express + Socket.io setup)
├── types.ts (TypeScript interfaces)
├── middleware/
│   ├── auth.js (JWT verification)
│   └── performance.js (compression, rate limiting)
├── routes/
│   ├── auth.ts
│   ├── conversations.ts
│   ├── messages.ts
│   ├── users.ts
│   ├── profiles.ts
│   ├── groups.ts
│   ├── channels.ts
│   ├── calls.ts
│   ├── stories.ts
│   ├── notifications.ts
│   ├── attachments.ts
│   ├── message-features.ts
│   ├── settings.ts
│   └── security.ts
└── database.ts
```

### Database Schema (MySQL 21 tables)
- users
- conversations
- messages
- attachments
- reactions
- read_receipts
- groups
- group_members
- channels
- channel_subscribers
- calls
- notifications
- user_settings
- blocked_users
- muted_conversations
- message_edits
- message_deletes
- call_logs
- media_files
- presence_history
- verification_tokens

### Real-time Features
- Socket.io for WebSocket communication
- Room-based architecture (conversation:ID)
- Presence tracking (online/offline/last seen)
- Typing indicators with 3-second timeout
- Message delivery states (sending/sent/read)
- Reaction system
- Call signaling

---

## Frontend Architecture

### Project Structure
```
apps/web/src/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (main TelegramLayout)
│   ├── auth/ (login/register)
│   ├── chats/ (conversations)
│   ├── groups/ (group chats)
│   ├── channels/ (public channels)
│   ├── calls/ (call UI)
│   ├── profile/ (user profile)
│   ├── settings/ (preferences)
│   ├── stories/ (ephemeral content)
│   └── ...
├── components/
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── MessageBubble.tsx
│   ├── ConversationList.tsx
│   ├── ChatHeader.tsx
│   ├── MessageComposer.tsx
│   ├── TypingIndicator.tsx
│   ├── TelegramLayout.tsx
│   └── index.ts (exports)
├── hooks/
│   ├── useApi.ts (HTTP requests)
│   ├── useSocket.ts (WebSocket)
│   └── ...
├── app/globals.css (design system tokens)
└── ...
```

### Technology Stack
- **Framework**: Next.js 14 + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS custom properties
- **Real-time**: Socket.io client
- **HTTP**: Fetch API with useApi hook
- **State Management**: React hooks (local state)
- **Build**: Next.js default (Turbo for monorepo)

---

## Design System Specifications

### Color Palette
```css
/* Light Theme (Default) */
--tg-primary: #0088cc;
--tg-bg: #ffffff;
--tg-surface: #f2f2f2;
--tg-text: #000000;
--tg-msg-in-bg: #e5e5ea;
--tg-msg-out-bg: #d5f4ff;

/* Dark Theme */
--tg-dark-bg: #212121;
--tg-dark-surface: #2c2c2c;
--tg-dark-text: #ffffff;
--tg-dark-msg-in-bg: #1c1c1c;
--tg-dark-msg-out-bg: #166088;
```

### Spacing Scale
```
--tg-space-1: 4px
--tg-space-2: 8px
--tg-space-3: 12px
--tg-space-4: 16px
--tg-space-5: 20px
--tg-space-6: 24px
--tg-space-7: 32px
--tg-space-8: 40px
```

### Typography
```
--tg-font-size-xs: 11px
--tg-font-size-sm: 12px
--tg-font-size-base: 15px
--tg-font-size-lg: 16px
--tg-font-size-xl: 17px
```

### Animations
```
@keyframes slideInUp { ... }     /* +150ms */
@keyframes scaleIn { ... }       /* +150ms */
@keyframes fadeIn { ... }        /* +150ms */
@keyframes typingDot { ... }     /* 1.4s loop */
@keyframes messageBubbleIn { ... } /* +300ms */
@keyframes reactionPop { ... }   /* +400ms */
```

---

## Implementation Priorities

### Remaining PHASES (7-19)

#### PHASE 7: Authentication Screens
- [ ] Login page (Telegram-style)
- [ ] Register page
- [ ] Password recovery
- [ ] Two-factor authentication
- [ ] Session management

#### PHASE 8: Responsive Design
- [ ] Mobile layout (full-screen conversation)
- [ ] Tablet layout (split view)
- [ ] Desktop layout (sidebar + chat)
- [ ] Back navigation for mobile
- [ ] Touch gestures

#### PHASE 9: Search & Navigation
- [ ] Global search
- [ ] Chat search
- [ ] Message search with highlight
- [ ] Search filters
- [ ] Navigation history

#### PHASE 10: Advanced Features
- [ ] Group chat creation/management
- [ ] Channel creation/subscription
- [ ] Call UI (audio/video)
- [ ] Stories/ephemeral content
- [ ] Stickers & GIFs

#### PHASE 11: Polish & Performance
- [ ] Skeleton loaders
- [ ] Error boundaries
- [ ] Loading states
- [ ] Infinite scroll
- [ ] Message virtualizer (for large chats)

#### PHASE 12: Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Focus management
- [ ] High contrast mode

#### PHASE 13: Dark Mode
- [ ] Automatic theme switching
- [ ] Manual theme toggle
- [ ] Theme persistence
- [ ] Smooth transitions

#### PHASE 14: Settings & Customization
- [ ] Theme selection
- [ ] Notification preferences
- [ ] Privacy settings
- [ ] Blocked users management
- [ ] Account settings

#### PHASE 15-19: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Production build
- [ ] Deployment to Render

---

## Key Telegram Design Principles Applied

1. **Message Bubbles**
   - Max width 430px (not full width)
   - Padding 11px 8px internal
   - Incoming: left-aligned, distinct color
   - Outgoing: right-aligned, distinct color
   - Smooth animations on arrival

2. **Information Density**
   - Compact list items with preview
   - Time shown relative ("5m", "1h", "yesterday")
   - Unread count badges
   - Online indicators

3. **Real-time Feedback**
   - Typing indicators with animation
   - Message delivery states visible
   - Read receipts (checkmarks)
   - Online/offline status
   - Last seen time

4. **Interactions**
   - Hover shows action buttons (reply, react, edit, delete)
   - Right-click context menu
   - Emoji reactions
   - Message selection mode
   - Swipe gestures on mobile

5. **Performance**
   - Virtual scrolling for large message lists
   - Lazy loading of images
   - Optimistic message sending
   - Debounced typing indicator

---

## Development Workflow

### Install Dependencies
```bash
npm install --legacy-peer-deps
cd apps/api && npm install
cd ../web && npm install
```

### Development Mode
```bash
npm run dev
# Runs both backend (port 3001) and frontend (port 3000)
```

### Build
```bash
npm run build
# Compiles both apps
```

### Type Checking
```bash
npm run type-check
# Validates TypeScript across monorepo
```

---

## Environment Variables Required

### Backend (.env.local in root)
```
PORT=3001
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=basagram
NODE_ENV=development
```

### Frontend (.env.local in root)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Notes & Learnings

### From Telegram Desktop Analysis
1. Message bubbles have max-width constraint for readability
2. Sidebar is fixed 300px on desktop
3. Typing indicator uses 3-second debounce
4. Reactions use small emoji buttons
5. Animations are fast (100-300ms) for responsiveness
6. Online indicator is green dot (12px) with pulse
7. Message status shows with checkmarks or clock icon
8. Context menus appear on right-click or long-press

### Implementation Decisions
1. Using CSS variables for theming instead of Tailwind config
2. Socket.io for real-time instead of polling
3. Server-side message ordering instead of client-side
4. Optimistic updates for better UX
5. Component-based architecture for reusability
6. TypeScript for type safety

---

## Next Steps

1. ✅ **Completed**: Core design system and UI components
2. 🔄 **In Progress**: Test TelegramLayout with mock data
3. ⏳ **Next**: Connect to real backend API
4. ⏳ **Then**: Build responsive mobile layout
5. ⏳ **Finally**: Implement remaining features and polish

---

## Resources

- **Telegram Desktop**: `C:\Users\myteg\Desktop\tdesktop`
- **Web Messenger**: `C:\Users\myteg\Desktop\web-messenger`
- **API Docs**: `/api/status` endpoint
- **Health Check**: `/health` endpoint
- **Socket.io Events**: See `index.ts` in backend


