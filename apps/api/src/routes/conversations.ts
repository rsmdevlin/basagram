import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// DB Connection Pool (same as auth.ts)
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

// Get all conversations for a user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const conversations = await dbQuery<any>(
      `SELECT
        c.id,
        CASE
          WHEN c.user_id_1 = ? THEN c.user_id_2
          ELSE c.user_id_1
        END as participant_id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.is_online,
        m.content as last_message,
        m.created_at as last_message_time,
        COUNT(CASE WHEN mr.sender_id != ? AND mr.is_deleted = FALSE THEN 1 END) as unread_count
      FROM conversations c
      LEFT JOIN users u ON u.id = CASE
        WHEN c.user_id_1 = ? THEN c.user_id_2
        ELSE c.user_id_1
      END
      LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
      )
      LEFT JOIN messages mr ON mr.conversation_id = c.id AND mr.created_at > c.updated_at
      WHERE c.user_id_1 = ? OR c.user_id_2 = ?
      GROUP BY c.id
      ORDER BY COALESCE(m.created_at, c.updated_at) DESC`,
      [userId, userId, userId, userId, userId]
    );

    res.json(
      conversations.map((conv) => ({
        id: conv.id,
        participantId: conv.participant_id,
        participantName: conv.display_name || conv.username,
        participantAvatar: conv.avatar_url,
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_time,
        unreadCount: conv.unread_count || 0,
        isOnline: conv.is_online,
      }))
    );
  } catch (error) {
    console.error('[Conversations] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке чатов' });
  }
});

// Get or create conversation with user
router.post('/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).userId;
    const { userId } = req.params;

    if (!currentUserId || !userId) {
      return res.status(400).json({ error: 'Требуется userId' });
    }

    const existing = await dbQuery<any>(
      `SELECT id FROM conversations
       WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      [currentUserId, userId, userId, currentUserId]
    );

    let conversationId: string;
    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      conversationId = uuidv4();
      await dbExecute(
        `INSERT INTO conversations (id, user_id_1, user_id_2) VALUES (?, ?, ?)`,
        [conversationId, currentUserId, userId]
      );
    }

    res.json({ id: conversationId });
  } catch (error) {
    console.error('[Conversations Create] Error:', error);
    res.status(500).json({ error: 'Ошибка при создании чата' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).userId;

    const messages = await dbQuery<any>(
      `SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        u.display_name as sender_name,
        m.content,
        m.created_at,
        m.is_edited,
        JSON_ARRAYAGG(
          JSON_OBJECT('emoji', mr.emoji, 'count', COUNT(*))
        ) as reactions
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      LEFT JOIN message_reactions mr ON mr.message_id = m.id
      WHERE m.conversation_id = ? AND m.is_deleted = FALSE
      GROUP BY m.id
      ORDER BY m.created_at ASC`,
      [conversationId]
    );

    res.json(
      messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        createdAt: msg.created_at,
        reactions: msg.reactions ? JSON.parse(msg.reactions) : [],
      }))
    );
  } catch (error) {
    console.error('[Messages Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке сообщений' });
  }
});

// Send message
router.post('/:conversationId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const messageId = uuidv4();
    await dbExecute(
      `INSERT INTO messages (id, conversation_id, sender_id, content)
       VALUES (?, ?, ?, ?)`,
      [messageId, conversationId, userId, content]
    );

    const message = await dbQuery<any>(
      `SELECT m.*, u.display_name as sender_name
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [messageId]
    );

    res.status(201).json({
      id: message[0].id,
      conversationId: message[0].conversation_id,
      senderId: message[0].sender_id,
      senderName: message[0].sender_name,
      content: message[0].content,
      createdAt: message[0].created_at,
    });
  } catch (error) {
    console.error('[Message Send] Error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

// Edit message
router.patch('/:conversationId/messages/:messageId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId, messageId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    await dbExecute(
      `UPDATE messages SET content = ?, is_edited = TRUE, edited_at = NOW()
       WHERE id = ? AND sender_id = ?`,
      [content, messageId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Message Edit] Error:', error);
    res.status(500).json({ error: 'Ошибка при редактировании сообщения' });
  }
});

// Delete message
router.delete('/:conversationId/messages/:messageId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).userId;

    await dbExecute(
      `UPDATE messages SET is_deleted = TRUE, deleted_at = NOW()
       WHERE id = ? AND sender_id = ?`,
      [messageId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Message Delete] Error:', error);
    res.status(500).json({ error: 'Ошибка при удалении сообщения' });
  }
});

// Add reaction
router.post('/:conversationId/messages/:messageId/reactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = (req as any).userId;

    if (!emoji) {
      return res.status(400).json({ error: 'Требуется emoji' });
    }

    const reactionId = uuidv4();
    await dbExecute(
      `INSERT IGNORE INTO message_reactions (id, message_id, user_id, emoji)
       VALUES (?, ?, ?, ?)`,
      [reactionId, messageId, userId, emoji]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[Reaction Add] Error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении реакции' });
  }
});

export default router;
