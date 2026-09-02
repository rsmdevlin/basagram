#!/usr/bin/env node

// Quick start script for Basagram development

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(__filename);

console.log('🚀 Basagram Development Setup\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js: ${nodeVersion}`);

// Install dependencies
console.log('\n📥 Installing dependencies...\n');

const commands = [
  'npm install --legacy-peer-deps',
  'cd apps/api && npm install',
  'cd ../web && npm install',
];

let currentIndex = 0;

const runNext = () => {
  if (currentIndex >= commands.length) {
    console.log('\n✅ Dependencies installed successfully!');
    console.log('\n📝 Available commands:');
    console.log('   npm run dev          - Start development servers');
    console.log('   npm run build        - Build both apps');
    console.log('   npm run type-check   - Check TypeScript types');
    console.log('   npm run lint         - Run linter');
    return;
  }

  const cmd = commands[currentIndex];
  console.log(`\n▶️  Running: ${cmd}`);

  exec(cmd, { cwd: rootDir, shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    if (stderr) console.error(stderr);
    console.log(stdout);

    currentIndex++;
    runNext();
  });
};

runNext();
