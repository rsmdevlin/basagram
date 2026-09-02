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

// Get all groups for user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const groups = await dbQuery<any>(
      `SELECT
        g.id,
        g.name,
        g.description,
        g.avatar_url,
        g.creator_id,
        COUNT(DISTINCT gm.user_id) as members_count,
        g.created_at
      FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id
      WHERE EXISTS (
        SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?
      )
      GROUP BY g.id
      ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar_url,
        creatorId: g.creator_id,
        membersCount: g.members_count || 0,
        createdAt: g.created_at,
      }))
    );
  } catch (error) {
    console.error('[Groups Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке групп' });
  }
});

// Create group
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Требуется название группы' });
    }

    const groupId = uuidv4();
    await dbExecute(
      `INSERT INTO groups (id, name, description, creator_id)
       VALUES (?, ?, ?, ?)`,
      [groupId, name.trim(), description || null, userId]
    );

    // Add creator as admin member
    await dbExecute(
      `INSERT INTO group_members (id, group_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), groupId, userId, 'admin']
    );

    res.status(201).json({
      id: groupId,
      name: name.trim(),
      description: description || null,
      creatorId: userId,
      membersCount: 1,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Group Create] Error:', error);
    res.status(500).json({ error: 'Ошибка при создании группы' });
  }
});

// Get group details
router.get('/:groupId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await dbQuery<any>(
      `SELECT
        g.id,
        g.name,
        g.description,
        g.avatar_url,
        g.creator_id,
        g.created_at
      FROM groups g
      WHERE g.id = ?`,
      [groupId]
    );

    if (!group.length) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const g = group[0];
    res.json({
      id: g.id,
      name: g.name,
      description: g.description,
      avatar: g.avatar_url,
      creatorId: g.creator_id,
      createdAt: g.created_at,
    });
  } catch (error) {
    console.error('[Group Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке группы' });
  }
});

// Get group members
router.get('/:groupId/members', requireAuth, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const members = await dbQuery<any>(
      `SELECT
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        gm.role,
        gm.joined_at
      FROM group_members gm
      LEFT JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.role = 'admin' DESC, u.display_name ASC`,
      [groupId]
    );

    res.json(
      members.map((m) => ({
        id: m.id,
        username: m.username,
        displayName: m.display_name,
        avatar: m.avatar_url,
        role: m.role,
        joinedAt: m.joined_at,
      }))
    );
  } catch (error) {
    console.error('[Group Members Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке участников' });
  }
});

// Add member to group
router.post('/:groupId/members', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId } = req.params;
    const { newMemberId } = req.body;

    if (!newMemberId) {
      return res.status(400).json({ error: 'Требуется newMemberId' });
    }

    // Check if requester is admin
    const isAdmin = await dbQuery<any>(
      `SELECT id FROM group_members
       WHERE group_id = ? AND user_id = ? AND role IN ('admin', 'moderator')`,
      [groupId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Check if member already exists
    const existing = await dbQuery<any>(
      `SELECT id FROM group_members
       WHERE group_id = ? AND user_id = ?`,
      [groupId, newMemberId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже в группе' });
    }

    await dbExecute(
      `INSERT INTO group_members (id, group_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), groupId, newMemberId, 'member']
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('[Group Member Add] Error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении участника' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:memberId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId, memberId } = req.params;

    // Can remove self or if admin
    if (userId !== memberId) {
      const isAdmin = await dbQuery<any>(
        `SELECT id FROM group_members
         WHERE group_id = ? AND user_id = ? AND role = 'admin'`,
        [groupId, userId]
      );

      if (!isAdmin.length) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
    }

    await dbExecute(
      `DELETE FROM group_members
       WHERE group_id = ? AND user_id = ?`,
      [groupId, memberId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Group Member Remove] Error:', error);
    res.status(500).json({ error: 'Ошибка при удалении участника' });
  }
});

// Update member role (admin only)
router.patch('/:groupId/members/:memberId/role', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId, memberId } = req.params;
    const { role } = req.body;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    // Check if requester is admin
    const isAdmin = await dbQuery<any>(
      `SELECT id FROM group_members
       WHERE group_id = ? AND user_id = ? AND role = 'admin'`,
      [groupId, userId]
    );

    if (!isAdmin.length) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await dbExecute(
      `UPDATE group_members SET role = ?
       WHERE group_id = ? AND user_id = ?`,
      [role, groupId, memberId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Group Member Role Update] Error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении роли' });
  }
});

// Get group messages
router.get('/:groupId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const messages = await dbQuery<any>(
      `SELECT
        gm.id,
        gm.group_id,
        gm.sender_id,
        u.display_name as sender_name,
        gm.content,
        gm.created_at,
        gm.is_edited
      FROM group_messages gm
      LEFT JOIN users u ON u.id = gm.sender_id
      WHERE gm.group_id = ? AND gm.is_deleted = FALSE
      ORDER BY gm.created_at ASC
      LIMIT 50`,
      [groupId]
    );

    res.json(
      messages.map((msg) => ({
        id: msg.id,
        groupId: msg.group_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        createdAt: msg.created_at,
        isEdited: msg.is_edited,
      }))
    );
  } catch (error) {
    console.error('[Group Messages Get] Error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке сообщений' });
  }
});

// Send message to group
router.post('/:groupId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    // Check membership
    const member = await dbQuery<any>(
      `SELECT id FROM group_members
       WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (!member.length) {
      return res.status(403).json({ error: 'Вы не являетесь членом этой группы' });
    }

    const messageId = uuidv4();
    await dbExecute(
      `INSERT INTO group_messages (id, group_id, sender_id, content)
       VALUES (?, ?, ?, ?)`,
      [messageId, groupId, userId, content.trim()]
    );

    const msg = await dbQuery<any>(
      `SELECT gm.*, u.display_name as sender_name
       FROM group_messages gm
       LEFT JOIN users u ON u.id = gm.sender_id
       WHERE gm.id = ?`,
      [messageId]
    );

    res.status(201).json({
      id: msg[0].id,
      groupId: msg[0].group_id,
      senderId: msg[0].sender_id,
      senderName: msg[0].sender_name,
      content: msg[0].content,
      createdAt: msg[0].created_at,
    });
  } catch (error) {
    console.error('[Group Message Send] Error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

export default router;
