import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Create channel
router.post('/', async (req: Request, res: Response) => {
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

    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name не предоставлено' });
    }

    const channelId = uuidv4();
    await execute(
      `INSERT INTO conversations
       (id, name, type, created_by_id)
       VALUES (?, ?, 'channel', ?)`,
      [channelId, name, userId]
    );

    // Add creator as admin/owner
    await execute(
      `INSERT INTO conversation_members
       (id, conversation_id, user_id, role)
       VALUES (?, ?, ?, 'admin')`,
      [uuidv4(), channelId, userId]
    );

    res.status(201).json({
      id: channelId,
      name,
      description,
      type: 'channel',
      isPrivate: isPrivate || false,
      createdBy: userId,
      subscriberCount: 1,
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Ошибка при создании канала' });
  }
});

// Get channel info
router.get('/:channelId', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const channels = await query(
      'SELECT * FROM conversations WHERE id = ? AND type = ?',
      [channelId, 'channel']
    );

    if (channels.length === 0) {
      return res.status(404).json({ error: 'Канал не найден' });
    }

    const subscribers = await query(
      'SELECT COUNT(*) as count FROM conversation_members WHERE conversation_id = ?',
      [channelId]
    );

    res.json({
      ...channels[0],
      subscriberCount: subscribers[0].count,
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: 'Ошибка при получении канала' });
  }
});

// Search channels
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query: searchQuery } = req.params;

    const results = await query(
      `SELECT c.*, COUNT(cm.user_id) as subscriber_count
       FROM conversations c
       LEFT JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE c.type = 'channel' AND c.name LIKE ?
       GROUP BY c.id
       LIMIT 20`,
      [`%${searchQuery}%`]
    );

    res.json(
      results.map((c: any) => ({
        ...c,
        subscriberCount: c.subscriber_count,
      }))
    );
  } catch (error) {
    console.error('Search channels error:', error);
    res.status(500).json({ error: 'Ошибка при поиске каналов' });
  }
});

// Subscribe to channel
router.post('/:channelId/subscribe', async (req: Request, res: Response) => {
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

    const { channelId } = req.params;

    // Check if already subscribed
    const existing = await query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [channelId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Вы уже подписаны на этот канал' });
    }

    await execute(
      `INSERT INTO conversation_members
       (id, conversation_id, user_id, role)
       VALUES (?, ?, ?, 'member')`,
      [uuidv4(), channelId, userId]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Ошибка при подписке' });
  }
});

// Unsubscribe from channel
router.post('/:channelId/unsubscribe', async (req: Request, res: Response) => {
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

    const { channelId } = req.params;

    await execute(
      'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [channelId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Ошибка при отписке' });
  }
});

// Get channel subscribers
router.get('/:channelId/subscribers', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    const subscribers = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, cm.role
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.conversation_id = ? AND cm.role IN ('admin', 'moderator')
       ORDER BY cm.role DESC, u.display_name ASC`,
      [channelId]
    );

    res.json(subscribers);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Ошибка при получении подписчиков' });
  }
});

// Post to channel (admin/moderator only)
router.post('/:channelId/posts', async (req: Request, res: Response) => {
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

    const { channelId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content не предоставлен' });
    }

    // Check if user is admin or moderator
    const member = await query(
      `SELECT role FROM conversation_members
       WHERE conversation_id = ? AND user_id = ? AND role IN ('admin', 'moderator')`,
      [channelId, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Только администраторы могут постить' });
    }

    const messageId = uuidv4();
    await execute(
      `INSERT INTO messages
       (id, conversation_id, sender_id, content, status)
       VALUES (?, ?, ?, ?, 'sent')`,
      [messageId, channelId, userId, content]
    );

    const message = await query(
      'SELECT * FROM messages WHERE id = ?',
      [messageId]
    );

    res.status(201).json(message[0]);
  } catch (error) {
    console.error('Post error:', error);
    res.status(500).json({ error: 'Ошибка при публикации' });
  }
});

// Delete channel (admin only)
router.delete('/:channelId', async (req: Request, res: Response) => {
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

    const { channelId } = req.params;

    // Check if user is creator/admin
    const channel = await query(
      'SELECT created_by_id FROM conversations WHERE id = ? AND type = ?',
      [channelId, 'channel']
    );

    if (channel.length === 0 || channel[0].created_by_id !== userId) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await execute(
      'UPDATE conversations SET is_archived = TRUE WHERE id = ?',
      [channelId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Ошибка при удалении канала' });
  }
});

export default router;
