import { Router, Request, Response } from 'express';
import { query, execute } from '@basagram/database';
import { updateProfileSchema } from '@basagram/validation';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
}

// Get user by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const users = await query<UserRow[]>(
      `SELECT id, username, display_name, avatar_url, bio, is_online, last_seen, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar_url,
      bio: user.bio,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

// Update profile (requires auth)
router.put('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ошибка валидации' });
    }

    const { displayName, bio, avatar } = parsed.data;

    const updates: string[] = [];
    const values: any[] = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Return updated user
    const users = await query<UserRow[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(500).json({ error: 'Ошибка при получении пользователя' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      avatar: user.avatar_url,
      bio: user.bio,
      isOnline: user.is_online,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// Search users
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query: searchQuery } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const users = await query<UserRow[]>(
      `SELECT id, username, display_name, avatar_url, is_online, last_seen
       FROM users
       WHERE (username LIKE ? OR display_name LIKE ?) AND id != 'system'
       LIMIT ?`,
      [`%${searchQuery}%`, `%${searchQuery}%`, limit]
    );

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatar: u.avatar_url,
        isOnline: u.is_online,
        lastSeen: u.last_seen,
      }))
    );
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Ошибка при поиске пользователей' });
  }
});

// Set online status
router.post('/:userId/presence', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isOnline } = req.body;

    await execute(
      `UPDATE users SET is_online = ?, last_seen = NOW() WHERE id = ?`,
      [isOnline ? 1 : 0, userId]
    );

    res.json({ success: true, isOnline });
  } catch (error) {
    console.error('Set presence error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

export default router;
