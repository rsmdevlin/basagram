import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Create notification
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

    const { type, recipientId, title, body, data } = req.body;

    if (!type || !recipientId || !title) {
      return res.status(400).json({
        error: 'type, recipientId, и title обязательны',
      });
    }

    const notificationId = uuidv4();
    await execute(
      `INSERT INTO notifications
       (id, recipient_id, type, title, body, data, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [
        notificationId,
        recipientId,
        type,
        title,
        body || null,
        data ? JSON.stringify(data) : null,
      ]
    );

    const notification = await query(
      'SELECT * FROM notifications WHERE id = ?',
      [notificationId]
    );

    res.status(201).json(notification[0]);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Ошибка при создании уведомления' });
  }
});

// Get unread notifications
router.get('/unread', async (req: Request, res: Response) => {
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

    const notifications = await query(
      `SELECT * FROM notifications
       WHERE recipient_id = ? AND is_read = FALSE
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(
      notifications.map((n: any) => ({
        ...n,
        data: n.data ? JSON.parse(n.data) : null,
      }))
    );
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Get all notifications
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

    const notifications = await query(
      `SELECT * FROM notifications
       WHERE recipient_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json(
      notifications.map((n: any) => ({
        ...n,
        data: n.data ? JSON.parse(n.data) : null,
      }))
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', async (req: Request, res: Response) => {
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

    const { notificationId } = req.params;

    await execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
      [notificationId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Ошибка при пометке уведомления' });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req: Request, res: Response) => {
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

    await execute(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Ошибка при пометке всех уведомлений' });
  }
});

// Delete notification
router.delete('/:notificationId', async (req: Request, res: Response) => {
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

    const { notificationId } = req.params;

    await execute(
      'DELETE FROM notifications WHERE id = ? AND recipient_id = ?',
      [notificationId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Ошибка при удалении уведомления' });
  }
});

// Clear all notifications
router.delete('/', async (req: Request, res: Response) => {
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

    await execute(
      'DELETE FROM notifications WHERE recipient_id = ?',
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Clear all error:', error);
    res.status(500).json({ error: 'Ошибка при удалении уведомлений' });
  }
});

// Get unread count
router.get('/count/unread', async (req: Request, res: Response) => {
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

    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ unreadCount: result[0].count });
  } catch (error) {
    console.error('Get count error:', error);
    res.status(500).json({ error: 'Ошибка при получении счётчика' });
  }
});

export default router;
