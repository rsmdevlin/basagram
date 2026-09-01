import { execute } from './client';

const migrations = [
  {
    id: '001_init_users',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        bio VARCHAR(500),
        is_online BOOLEAN DEFAULT FALSE,
        last_seen TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_is_online (is_online)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS users;`,
  },
  {
    id: '002_init_sessions',
    up: `
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        refresh_token_hash VARCHAR(255),
        device_info JSON,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS sessions;`,
  },
  {
    id: '003_init_conversations',
    up: `
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        type ENUM('private', 'group', 'channel') NOT NULL DEFAULT 'private',
        created_by_id VARCHAR(36),
        is_archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_type (type),
        INDEX idx_is_archived (is_archived),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS conversations;`,
  },
  {
    id: '004_init_conversation_members',
    up: `
      CREATE TABLE IF NOT EXISTS conversation_members (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role ENUM('member', 'admin', 'moderator') DEFAULT 'member',
        muted_until TIMESTAMP,
        last_read_at TIMESTAMP,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_member (conversation_id, user_id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_conversation_id (conversation_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS conversation_members;`,
  },
  {
    id: '005_init_messages',
    up: `
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        sender_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        status ENUM('sending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
        reply_to_id VARCHAR(36),
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL,
        INDEX idx_conversation_id (conversation_id),
        INDEX idx_sender_id (sender_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS messages;`,
  },
  {
    id: '006_init_message_reads',
    up: `
      CREATE TABLE IF NOT EXISTS message_reads (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_read (message_id, user_id),
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS message_reads;`,
  },
  {
    id: '007_init_reactions',
    up: `
      CREATE TABLE IF NOT EXISTS reactions (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_reaction (message_id, user_id, emoji),
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS reactions;`,
  },
  {
    id: '008_init_pinned_messages',
    up: `
      CREATE TABLE IF NOT EXISTS pinned_messages (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36) NOT NULL UNIQUE,
        conversation_id VARCHAR(36) NOT NULL,
        pinned_by_id VARCHAR(36) NOT NULL,
        pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (pinned_by_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_conversation_id (conversation_id),
        INDEX idx_pinned_at (pinned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS pinned_messages;`,
  },
  {
    id: '009_init_message_edits',
    up: `
      CREATE TABLE IF NOT EXISTS message_edits (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36) NOT NULL,
        old_content TEXT NOT NULL,
        edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id),
        INDEX idx_edited_at (edited_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS message_edits;`,
  },
  {
    id: '010_init_message_attachments',
    up: `
      CREATE TABLE IF NOT EXISTS message_attachments (
        id VARCHAR(36) PRIMARY KEY,
        message_id VARCHAR(36) NOT NULL,
        type ENUM('image', 'video', 'audio', 'file') NOT NULL,
        url VARCHAR(500) NOT NULL,
        thumbnail VARCHAR(500),
        size INT NOT NULL,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        INDEX idx_message_id (message_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS message_attachments;`,
  },
  {
    id: '011_init_stories',
    up: `
      CREATE TABLE IF NOT EXISTS stories (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type ENUM('text', 'image', 'video') NOT NULL,
        content TEXT,
        media_url VARCHAR(500),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS stories;`,
  },
  {
    id: '012_init_story_views',
    up: `
      CREATE TABLE IF NOT EXISTS story_views (
        id VARCHAR(36) PRIMARY KEY,
        story_id VARCHAR(36) NOT NULL,
        viewer_id VARCHAR(36) NOT NULL,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_view (story_id, viewer_id),
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_story_id (story_id),
        INDEX idx_viewer_id (viewer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS story_views;`,
  },
  {
    id: '013_init_story_reactions',
    up: `
      CREATE TABLE IF NOT EXISTS story_reactions (
        id VARCHAR(36) PRIMARY KEY,
        story_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE KEY unique_story_reaction (story_id, user_id, emoji),
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_story_id (story_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
    down: `DROP TABLE IF EXISTS story_reactions;`,
  },
];

export async function runMigrations() {
  console.log('🔄 Запуск миграций БД...');

  for (const migration of migrations) {
    try {
      await execute(migration.up);
      console.log(`✅ ${migration.id}`);
    } catch (error: any) {
      if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.error(`❌ ${migration.id}:`, error.message);
        throw error;
      }
    }
  }

  console.log('✨ Миграции завершены');
}

runMigrations().catch(console.error);
