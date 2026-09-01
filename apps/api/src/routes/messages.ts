import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';
import { messageSchema } from '@basagram/validation';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Get messages for conversation
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await query(
      `SELECT m.*, u.display_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.is_deleted = FALSE
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversationId, limit, offset]
    );

    res.json(messages.reverse()); // Reverse to get chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

// Send message
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

    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ошибка валидации' });
    }

    const { content, conversationId, replyToId } = parsed.data as any;

    // Verify user is member of conversation
    const membership = await query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const messageId = uuidv4();

    await execute(
      `INSERT INTO messages (id, conversation_id, sender_id, content, status, reply_to_id)
       VALUES (?, ?, ?, ?, 'sent', ?)`,
      [messageId, conversationId, userId, content, replyToId || null]
    );

    // Update conversation updated_at
    await execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversationId]
    );

    const messages = await query(
      `SELECT m.*, u.display_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    );

    res.status(201).json(messages[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// Mark messages as read
router.post('/:conversationId/read', async (req: Request, res: Response) => {
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

    const { conversationId } = req.params;

    // Update member's last_read_at
    await execute(
      'UPDATE conversation_members SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Ошибка при отметке прочитанного' });
  }
});

export default router;
