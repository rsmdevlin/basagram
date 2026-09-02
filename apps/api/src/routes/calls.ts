import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

let pool: mysql.Pool;

const getPool = async () => {
  if (!pool) {
    const getDatabaseConfig = () => {
      if (process.env.DATABASE_URL) {
        try {
          const url = new URL(process.env.DATABASE_URL);
          return {
            host: url.hostname,
            port: parseInt(url.port || '3306'),
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
          };
        } catch (e) {
          console.error('Failed to parse DATABASE_URL:', e);
        }
      }

      return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'basagram',
      };
    };

    const config = getDatabaseConfig();
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

const dbQuery = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
  const p = await getPool();
  const connection = await p.getConnection();
  try {
    const [rows] = await connection.query(sql, params || []);
    return rows as T[];
  } finally {
    connection.release();
  }
};

const dbExecute = async (sql: string, params?: any[]): Promise<any> => {
  const p = await getPool();
  const connection = await p.getConnection();
  try {
    const [result] = await connection.execute(sql, params || []);
    return result;
  } finally {
    connection.release();
  }
};

// Get all calls for user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const calls = await dbQuery<any>(
      `SELECT
        c.id,
        CASE
          WHEN c.initiator_id = ? THEN c.recipient_id
          ELSE c.initiator_id
        END as participant_id,
        u.display_name as participant_name,
        u.avatar_url as participant_avatar,
        c.type,
        CASE
          WHEN c.initiator_id = ? THEN 'outgoing'
          WHEN c.status = 'missed' THEN 'missed'
          ELSE 'incoming'
        END as status,
        c.duration,
        c.created_at
      FROM calls c
      LEFT JOIN users u ON u.id = CASE
        WHEN c.initiator_id = ? THEN c.recipient_id
        ELSE c.initiator_id
      END
      WHERE c.initiator_id = ? OR c.recipient_id = ?
      ORDER BY c.created_at DESC
      LIMIT 100`,
      [userId, userId, userId, userId, userId]
    );

    res.json(
      calls.map((call) => ({
        id: call.id,
        participantId: call.participant_id,
        participantName: call.participant_name,
        participantAvatar: call.participant_avatar,
        type: call.type,
        status: call.status,
        duration: call.duration,
        createdAt: call.created_at,
      }))
    );
  } catch (error) {
    console.error('[Calls Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке звонков' });
  }
});

// Initiate call
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { recipientId, type } = req.body;

    if (!recipientId || !type || !['audio', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Требуется recipientId и type (audio/video)' });
    }

    const callId = uuidv4();
    await dbExecute(
      `INSERT INTO calls (id, initiator_id, recipient_id, type, status)
       VALUES (?, ?, ?, ?, ?)`,
      [callId, userId, recipientId, type, 'ringing']
    );

    res.status(201).json({
      id: callId,
      initiatorId: userId,
      recipientId,
      type,
      status: 'ringing',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Call Initiate] Error:', error);
    res.status(500).json({ error: 'Ошибка при инициировании звонка' });
  }
});

// Answer call
router.patch('/:callId/answer', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { callId } = req.params;

    await dbExecute(
      `UPDATE calls SET status = ?, answered_at = NOW()
       WHERE id = ? AND recipient_id = ?`,
      ['active', callId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Call Answer] Error:', error);
    res.status(500).json({ error: 'Ошибка при принятии звонка' });
  }
});

// Reject/end call
router.patch('/:callId/end', requireAuth, async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { duration } = req.body;

    await dbExecute(
      `UPDATE calls SET status = ?, ended_at = NOW(), duration = ?
       WHERE id = ?`,
      ['ended', duration || null, callId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Call End] Error:', error);
    res.status(500).json({ error: 'Ошибка при завершении звонка' });
  }
});

// Mark call as missed
router.patch('/:callId/miss', requireAuth, async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;

    await dbExecute(
      `UPDATE calls SET status = ?
       WHERE id = ? AND status = ?`,
      ['missed', callId, 'ringing']
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Call Miss] Error:', error);
    res.status(500).json({ error: 'Ошибка при отметке пропущенного звонка' });
  }
});

export default router;
