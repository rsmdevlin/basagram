# Basagram Deployment & Testing Checklist

## Phase 13: Authentication Testing (After Render Deploy)

### Pre-Flight Checks
- [ ] Render shows "live" status at https://basagrams.onrender.com
- [ ] No port conflicts in Render logs (EADDRINUSE errors gone)
- [ ] Database initialization completed successfully
- [ ] API server started on port 3001 internally
- [ ] Frontend server started on Render's PORT (e.g., 10000)

### Registration Flow Test
1. Navigate to https://basagrams.onrender.com
2. Click "Зарегистрироваться" (Register)
3. Fill in form:
   - Имя пользователя (Username): `testuser123`
   - Email: `test@example.com`
   - Пароль (Password): `password123`
   - Повтор пароля (Confirm): `password123`
4. Click "Создать аккаунт" (Create Account)
5. Expected: 
   - Success message appears: "✓ Аккаунт создан! Переходим на вход..."
   - After 1.5s, redirects to Login form

### Login Flow Test
1. Back on Login form after registration
2. Fill in:
   - Email: `test@example.com`
   - Пароль (Password): `password123`
3. Click "Войти" (Sign In)
4. Expected:
   - No error message
   - Redirects to main chat interface
   - Token stored in localStorage
   - User data stored in localStorage

### Chat Interface Smoke Test
- [ ] Conversation list visible on left
- [ ] Chat area visible on right (or full screen on mobile)
- [ ] User profile visible in header
- [ ] Online status indicator shows (should be online)
- [ ] Message composer visible at bottom

### Database Verification
- [ ] New user created in `users` table
- [ ] User has correct username, email, hashed password
- [ ] Created_at and updated_at timestamps set

## Phase 14: Real-Time Messaging (Next Phase)

Once auth is working:
1. Implement Socket.io connection on frontend
2. Emit `user:online` event on connect
3. Listen for `typing:start/stop` events
4. Implement message sending via Socket.io
5. Real-time message receive and display
6. Conversation list updates with new messages

## Blocking Issues Resolved This Session

✅ TypeScript generics in auth.ts (query<UserRow[]> → query<UserRow>)
✅ Export conflicts in components/index.ts
✅ Port conflict in start.js (removed proxy layer)
✅ Next.js rewrites for /api/* proxying
✅ Database initialization script working on Render

## Known Limitations (To Address Later)

- No 2FA/MFA support yet
- No password reset flow
- No email verification
- No social auth (Google, etc.)
- LocalStorage tokens not persisted securely (for demo)
- No rate limiting on auth endpoints yet (but configured)
