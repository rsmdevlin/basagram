import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = path.join(__dirname, '../node_modules/@basagram');

// Create @basagram directory
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

// Create @basagram/database stub
const dbPath = path.join(nodeModulesPath, 'database');
fs.mkdirSync(dbPath, { recursive: true });

fs.writeFileSync(path.join(dbPath, 'package.json'), JSON.stringify({
  name: '@basagram/database',
  version: '1.0.0',
  main: 'index.js',
  exports: { '.': './index.js' }
}, null, 2));

fs.writeFileSync(path.join(dbPath, 'index.js'), `
module.exports = {
  query: async (sql, params) => { console.log('Query:', sql, params); return []; },
  execute: async (sql, params) => { console.log('Execute:', sql, params); return { affectedRows: 0 }; },
  User: {},
  Conversation: {},
  Message: {},
  Group: {},
  Channel: {},
  Story: {},
  Call: {},
  Notification: {}
};
`);

// Create @basagram/validation stub
const valPath = path.join(nodeModulesPath, 'validation');
fs.mkdirSync(valPath, { recursive: true });

fs.writeFileSync(path.join(valPath, 'package.json'), JSON.stringify({
  name: '@basagram/validation',
  version: '1.0.0',
  main: 'index.js',
  exports: { '.': './index.js' }
}, null, 2));

fs.writeFileSync(path.join(valPath, 'index.js'), `
module.exports = {
  registerSchema: { parse: (data) => data },
  loginSchema: { parse: (data) => data },
  createConversationSchema: { parse: (data) => data },
  sendMessageSchema: { parse: (data) => data },
  createGroupSchema: { parse: (data) => data },
  createChannelSchema: { parse: (data) => data },
  createStorySchema: { parse: (data) => data },
  startCallSchema: { parse: (data) => data },
  updateProfileSchema: { parse: (data) => data }
};
`);

console.log('✓ Stub packages created');
