import { Router, Request, Response } from 'express';
import { query } from '@basagram/database';

const router = Router();

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen?: Date;
  created_at: Date;
}

// Get user by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const users = await query<UserRow[]>(
      'SELECT id, username, display_name, avatar_url, bio, is_online, last_seen, created_at FROM users WHERE id = ?',
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

// Search users
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query: searchQuery } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const users = await query<UserRow[]>(
      `SELECT id, username, display_name, avatar_url, is_online
       FROM users
       WHERE username LIKE ? OR display_name LIKE ?
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
      }))
    );
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Ошибка при поиске пользователей' });
  }
});

export default router;
