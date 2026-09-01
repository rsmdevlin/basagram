import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface AttachmentRow {
  id: string;
  message_id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnail?: string;
  size: number;
  mime_type: string;
  created_at: Date;
}

// Upload attachment
router.post('/upload', async (req: Request, res: Response) => {
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

    const { filename, mimeType, size, type } = req.body;

    if (!filename || !mimeType || !type) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
    }

    // Validate file size (max 100MB)
    if (size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: 'Файл слишком большой (макс 100MB)' });
    }

    // Validate file type
    const validTypes = ['image', 'video', 'audio', 'file'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Недопустимый тип файла' });
    }

    const attachmentId = uuidv4();
    const uploadUrl = `/uploads/${attachmentId}/${filename}`;

    // Store metadata in database
    await execute(
      `INSERT INTO message_attachments (id, type, url, size, mime_type)
       VALUES (?, ?, ?, ?, ?)`,
      [attachmentId, type, uploadUrl, size, mimeType]
    );

    res.status(201).json({
      id: attachmentId,
      url: uploadUrl,
      type,
      size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
  }
});

// Get attachment metadata
router.get('/:attachmentId', async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;

    const attachments = await query<AttachmentRow[]>(
      `SELECT * FROM message_attachments WHERE id = ?`,
      [attachmentId]
    );

    if (attachments.length === 0) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    const attachment = attachments[0];
    res.json({
      id: attachmentId,
      type: attachment.type,
      url: attachment.url,
      thumbnail: attachment.thumbnail,
      size: attachment.size,
      mimeType: attachment.mime_type,
      createdAt: attachment.created_at,
    });
  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({ error: 'Ошибка при получении файла' });
  }
});

// Attach to message
router.post('/:attachmentId/attach', async (req: Request, res: Response) => {
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

    const { attachmentId } = req.params;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId не предоставлен' });
    }

    // Verify message belongs to user
    const messages = await query(
      'SELECT id FROM messages WHERE id = ? AND sender_id = ?',
      [messageId, userId]
    );

    if (messages.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Attach
    await execute(
      'UPDATE message_attachments SET message_id = ? WHERE id = ?',
      [messageId, attachmentId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Attach error:', error);
    res.status(500).json({ error: 'Ошибка при прикреплении файла' });
  }
});

// Delete attachment
router.delete('/:attachmentId', async (req: Request, res: Response) => {
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

    const { attachmentId } = req.params;

    // Verify ownership through message
    const attachments = await query(
      `SELECT ma.id FROM message_attachments ma
       JOIN messages m ON ma.message_id = m.id
       WHERE ma.id = ? AND m.sender_id = ?`,
      [attachmentId, userId]
    );

    if (attachments.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await execute('DELETE FROM message_attachments WHERE id = ?', [attachmentId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Ошибка при удалении файла' });
  }
});

export default router;
