import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, execute } from '@basagram/database';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Add attachment to message table migration helper
export async function initializeAttachmentsTable() {
  try {
    await execute(
      `CREATE TABLE IF NOT EXISTS message_attachments (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36),
        type ENUM('image', 'video', 'audio', 'file') NOT NULL,
        url VARCHAR(500) NOT NULL,
        thumbnail VARCHAR(500),
        size INT NOT NULL,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
  } catch (error) {
    console.error('Initialize attachments table error:', error);
  }
}

// Get message with attachments
router.get('/:messageId/attachments', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const attachments = await query(
      `SELECT * FROM message_attachments WHERE message_id = ? ORDER BY created_at ASC`,
      [messageId]
    );

    res.json(
      attachments.map((a: any) => ({
        id: a.id,
        type: a.type,
        url: a.url,
        thumbnail: a.thumbnail,
        size: a.size,
        mimeType: a.mime_type,
        createdAt: a.created_at,
      }))
    );
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Ошибка при получении файлов' });
  }
});

export default router;
