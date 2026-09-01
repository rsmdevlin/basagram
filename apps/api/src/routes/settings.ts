import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Get user settings
router.get('/', async (req: Request, res: Response) => {
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

    const settings = await query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      return res.status(404).json({ error: 'Настройки не найдены' });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Ошибка при получении настроек' });
  }
});

// Update notification settings
router.put('/notifications', async (req: Request, res: Response) => {
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

    const {
      notifyMessages,
      notifyCalls,
      notifyReactions,
      notifyMentions,
      soundEnabled,
    } = req.body;

    await execute(
      `UPDATE user_settings SET
       notify_messages = ?, notify_calls = ?, notify_reactions = ?,
       notify_mentions = ?, sound_enabled = ?
       WHERE user_id = ?`,
      [
        notifyMessages !== undefined ? notifyMessages : true,
        notifyCalls !== undefined ? notifyCalls : true,
        notifyReactions !== undefined ? notifyReactions : true,
        notifyMentions !== undefined ? notifyMentions : true,
        soundEnabled !== undefined ? soundEnabled : true,
        userId,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении настроек' });
  }
});

// Update privacy settings
router.put('/privacy', async (req: Request, res: Response) => {
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

    const {
      showOnlineStatus,
      showLastSeen,
      allowMessages,
      allowCalls,
      blockedUsers,
    } = req.body;

    await execute(
      `UPDATE user_settings SET
       show_online_status = ?, show_last_seen = ?,
       allow_messages = ?, allow_calls = ?, blocked_users = ?
       WHERE user_id = ?`,
      [
        showOnlineStatus !== undefined ? showOnlineStatus : true,
        showLastSeen !== undefined ? showLastSeen : true,
        allowMessages || 'all',
        allowCalls || 'all',
        blockedUsers ? JSON.stringify(blockedUsers) : null,
        userId,
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении приватности' });
  }
});

// Update appearance settings
router.put('/appearance', async (req: Request, res: Response) => {
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

    const { theme, language, fontSize } = req.body;

    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      return res.status(400).json({ error: 'Неверное значение theme' });
    }

    if (language && !['ru', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Неверное значение language' });
    }

    await execute(
      `UPDATE user_settings SET theme = ?, language = ?, font_size = ? WHERE user_id = ?`,
      [theme || 'dark', language || 'ru', fontSize || 'normal', userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update appearance error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении оформления' });
  }
});

// Block user
router.post('/block/:userId', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let currentUserId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      currentUserId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { userId } = req.params;

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Нельзя заблокировать себя' });
    }

    const settings = await query(
      'SELECT blocked_users FROM user_settings WHERE user_id = ?',
      [currentUserId]
    );

    let blockedUsers = [];
    if (settings.length > 0 && settings[0].blocked_users) {
      blockedUsers = JSON.parse(settings[0].blocked_users);
    }

    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
      await execute(
        'UPDATE user_settings SET blocked_users = ? WHERE user_id = ?',
        [JSON.stringify(blockedUsers), currentUserId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Ошибка при блокировке' });
  }
});

// Unblock user
router.post('/unblock/:userId', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.slice(7);
    let currentUserId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      currentUserId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ error: 'Неверный токен' });
    }

    const { userId } = req.params;

    const settings = await query(
      'SELECT blocked_users FROM user_settings WHERE user_id = ?',
      [currentUserId]
    );

    if (settings.length > 0 && settings[0].blocked_users) {
      let blockedUsers = JSON.parse(settings[0].blocked_users);
      blockedUsers = blockedUsers.filter((id: string) => id !== userId);
      await execute(
        'UPDATE user_settings SET blocked_users = ? WHERE user_id = ?',
        [JSON.stringify(blockedUsers), currentUserId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Ошибка при разблокировке' });
  }
});

export default router;
