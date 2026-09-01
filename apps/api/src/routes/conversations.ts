import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Get conversations for user
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

    const conversations = await query(
      `SELECT c.* FROM conversations c
       INNER JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = ? AND c.is_archived = FALSE
       ORDER BY c.updated_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Ошибка при получении чатов' });
  }
});

// Get or create private conversation
router.post('/direct', async (req: Request, res: Response) => {
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

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'memberId не предоставлен' });
    }

    // Check if conversation already exists
    const existing = await query(
      `SELECT c.id FROM conversations c
       INNER JOIN conversation_members cm1 ON c.id = cm1.conversation_id
       INNER JOIN conversation_members cm2 ON c.id = cm2.conversation_id
       WHERE c.type = 'private'
       AND cm1.user_id = ? AND cm2.user_id = ?`,
      [userId, memberId]
    );

    if (existing.length > 0) {
      return res.json({ id: (existing[0] as any).id });
    }

    // Create new conversation
    const conversationId = uuidv4();
    await execute(
      `INSERT INTO conversations (id, type, created_by_id) VALUES (?, 'private', ?)`,
      [conversationId, userId]
    );

    // Add members
    await execute(
      `INSERT INTO conversation_members (id, conversation_id, user_id) VALUES (?, ?, ?)`,
      [uuidv4(), conversationId, userId]
    );

    await execute(
      `INSERT INTO conversation_members (id, conversation_id, user_id) VALUES (?, ?, ?)`,
      [uuidv4(), conversationId, memberId]
    );

    res.status(201).json({ id: conversationId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
});

// Get conversation details
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversations = await query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    const members = await query(
      `SELECT cm.user_id, u.username, u.display_name, u.avatar_url, cm.role
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.conversation_id = ?`,
      [conversationId]
    );

    res.json({
      ...conversations[0],
      members,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Ошибка при получении чата' });
  }
});

export default router;
