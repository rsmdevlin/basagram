import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Initiate call
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

    const { type, recipientId, conversationId } = req.body;

    if (!type || !['audio', 'video'].includes(type)) {
      return res.status(400).json({ error: 'type должен быть audio или video' });
    }

    if (!recipientId && !conversationId) {
      return res.status(400).json({ error: 'Требуется recipientId или conversationId' });
    }

    const callId = uuidv4();
    await execute(
      `INSERT INTO calls
       (id, initiator_id, recipient_id, conversation_id, type, status, started_at)
       VALUES (?, ?, ?, ?, ?, 'ringing', NOW())`,
      [callId, userId, recipientId || null, conversationId || null, type]
    );

    res.status(201).json({
      id: callId,
      type,
      status: 'ringing',
      initiator: userId,
      recipient: recipientId,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ error: 'Ошибка при инициировании звонка' });
  }
});

// Accept call
router.post('/:callId/accept', async (req: Request, res: Response) => {
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

    const { callId } = req.params;

    await execute(
      'UPDATE calls SET status = ?, answered_by_id = ?, answered_at = NOW() WHERE id = ?',
      ['active', userId, callId]
    );

    const call = await query('SELECT * FROM calls WHERE id = ?', [callId]);

    res.json({ ...call[0], status: 'active' });
  } catch (error) {
    console.error('Accept call error:', error);
    res.status(500).json({ error: 'Ошибка при принятии звонка' });
  }
});

// Reject call
router.post('/:callId/reject', async (req: Request, res: Response) => {
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

    const { callId } = req.params;

    await execute(
      'UPDATE calls SET status = ?, ended_at = NOW() WHERE id = ?',
      ['rejected', callId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({ error: 'Ошибка при отклонении звонка' });
  }
});

// End call
router.post('/:callId/end', async (req: Request, res: Response) => {
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

    const { callId } = req.params;

    const call = await query('SELECT * FROM calls WHERE id = ?', [callId]);

    if (call.length === 0) {
      return res.status(404).json({ error: 'Звонок не найден' });
    }

    const duration = Math.round(
      (new Date().getTime() - new Date(call[0].started_at).getTime()) / 1000
    );

    await execute(
      'UPDATE calls SET status = ?, ended_at = NOW(), duration_seconds = ? WHERE id = ?',
      ['ended', duration, callId]
    );

    res.json({ success: true, duration });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ error: 'Ошибка при завершении звонка' });
  }
});

// Get call history
router.get('/history', async (req: Request, res: Response) => {
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

    const history = await query(
      `SELECT c.*,
              u1.username as initiator_username, u1.display_name as initiator_name,
              u2.username as recipient_username, u2.display_name as recipient_name
       FROM calls c
       LEFT JOIN users u1 ON c.initiator_id = u1.id
       LEFT JOIN users u2 ON c.recipient_id = u2.id
       WHERE c.initiator_id = ? OR c.recipient_id = ?
       ORDER BY c.started_at DESC
       LIMIT 50`,
      [userId, userId]
    );

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Ошибка при получении истории звонков' });
  }
});

// Get active calls for user
router.get('/active', async (req: Request, res: Response) => {
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

    const activeCalls = await query(
      `SELECT * FROM calls
       WHERE (initiator_id = ? OR recipient_id = ?)
       AND status IN ('ringing', 'active')`,
      [userId, userId]
    );

    res.json(activeCalls);
  } catch (error) {
    console.error('Get active calls error:', error);
    res.status(500).json({ error: 'Ошибка при получении активных звонков' });
  }
});

export default router;
