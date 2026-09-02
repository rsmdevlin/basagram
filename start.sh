#!/usr/bin/env bash

# Basagram Quick Start Script
# Usage: ./start.sh

set -e

echo "🚀 Basagram Development Server"
echo "================================\n"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
fi

if [ ! -d "apps/api/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd apps/api
    npm install
    cd ../..
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd apps/web
    npm install
    cd ../..
fi

echo -e "\n${BLUE}Starting development servers...${NC}\n"
npm run dev

echo -e "\n${GREEN}✓${NC} Development servers started!"
echo -e "   ${BLUE}Frontend${NC}: http://localhost:3000"
echo -e "   ${BLUE}Backend${NC}:  http://localhost:3001"
echo -e "   ${BLUE}WebSocket${NC}: ws://localhost:3001\n"
