# Basagram — Premium Telegram Desktop Clone for Web

![Basagram](https://img.shields.io/badge/Telegram-Clone-0088cc?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Express](https://img.shields.io/badge/Express-5-green?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=flat-square)

> **Полнофункциональный мессенджер на основе Telegram Desktop с реал-тайм коммуникацией.**

🚀 **Live Demo:** https://basagrams.onrender.com

## 🎯 Features

### Core Messaging
- ✅ 1-on-1 private chats with real-time messaging
- ✅ Message reactions (emoji picker)
- ✅ Edit and soft-delete messages
- ✅ Typing indicators
- ✅ Unread message counters
- ✅ User presence (online/offline)

### Advanced Features
- ✅ Group chats with member management
- ✅ Public channels with subscriptions
- ✅ 24-hour stories with view tracking
- ✅ Call history (audio/video)
- ✅ User search and contacts
- ✅ Settings (theme, privacy, notifications)

### Design & UX
- ✅ Telegram Design System
- ✅ Desktop (80px sidebar) + Mobile responsive
- ✅ Russian language interface
- ✅ Real-time Socket.io
- ✅ Smooth animations

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js + Socket.io + TypeScript
- **Database:** MySQL 8
- **Auth:** JWT + Argon2
- **Hosting:** Render (auto-rebuild on git push)

## 🚀 Quick Start

### Local Dev
\\\ash
git clone https://github.com/rsmdevlin/basagram.git
cd basagram
cd apps/api && npm install && cd ../web && npm install && cd ../..
node start.js
# Open http://localhost:3001
\\\

### Render Deployment
- Connect GitHub repo to Render
- Build: \cd apps/api && npm install && npm run build && cd ../../apps/web && npm install && npm run build\
- Start: \
ode start.js\
- Add DATABASE_URL, JWT_SECRET env vars

## 📱 Pages

- \/\ — Home dashboard with stats
- \/login\ & \/register\ — Authentication
- \/chats\ — 1-on-1 messaging
- \/groups\ — Group chats
- \/channels\ — Channels
- \/calls\ — Call history
- \/stories\ — Stories
- \/contacts\ — User search
- \/settings\ — Settings

## 🔐 Security

- JWT Bearer authentication
- Argon2 password hashing
- Rate limiting (15 min / 100 requests)
- Helmet security headers
- Input validation
- SQL parameterization

## 📊 API Endpoints

- \POST /api/auth/register\ — Create account
- \POST /api/auth/login\ — Login
- \GET /api/conversations\ — List chats
- \POST /api/conversations/:userId\ — Create chat
- \GET /api/groups\ — List groups
- \POST /api/groups\ — Create group
- \GET /api/channels\ — List channels
- \GET /api/users/search?q=\ — Search users
- \GET /api/settings\ — Get settings

## 🔄 Socket.io Events

- \message:new\ / \message:send\ — Real-time messages
- \	yping:start\ / \	yping:stop\ — Typing indicators
- \user:online\ / \user:offline\ — Presence
- \eaction:added\ — Emoji reactions
- \call:incoming\ — Incoming calls

## 📝 License

MIT — see LICENSE for details

---

**Built with ❤️ for real-time communication**
