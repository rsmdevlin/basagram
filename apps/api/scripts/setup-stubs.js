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
  type: 'module',
  main: 'index.js',
  exports: { '.': './index.js' }
}, null, 2));

fs.writeFileSync(path.join(dbPath, 'index.js'), `
export const query = async (sql, params) => {
  console.log('Query:', sql, params);
  return [];
};

export const execute = async (sql, params) => {
  console.log('Execute:', sql, params);
  return { affectedRows: 0 };
};

export const User = {};
export const Conversation = {};
export const Message = {};
export const Group = {};
export const Channel = {};
export const Story = {};
export const Call = {};
export const Notification = {};
`);

// Create @basagram/validation stub
const valPath = path.join(nodeModulesPath, 'validation');
fs.mkdirSync(valPath, { recursive: true });

fs.writeFileSync(path.join(valPath, 'package.json'), JSON.stringify({
  name: '@basagram/validation',
  version: '1.0.0',
  type: 'module',
  main: 'index.js',
  exports: { '.': './index.js' }
}, null, 2));

fs.writeFileSync(path.join(valPath, 'index.js'), `
export const registerSchema = { parse: (data) => data };
export const loginSchema = { parse: (data) => data };
export const createConversationSchema = { parse: (data) => data };
export const sendMessageSchema = { parse: (data) => data };
export const messageSchema = { parse: (data) => data };
export const createGroupSchema = { parse: (data) => data };
export const createChannelSchema = { parse: (data) => data };
export const createStorySchema = { parse: (data) => data };
export const startCallSchema = { parse: (data) => data };
export const updateProfileSchema = { parse: (data) => data };
`);

console.log('✓ Stub packages created');
