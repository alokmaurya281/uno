#!/bin/bash

# ============================================
# UNO Multiplayer Arena — Run Script
# ============================================
# Installs all dependencies and starts both
# backend and frontend servers.
# Usage: bash run.sh
# ============================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ██╗   ██╗███╗   ██╗ ██████╗ "
echo "  ██║   ██║████╗  ██║██╔═══██╗"
echo "  ██║   ██║██╔██╗ ██║██║   ██║"
echo "  ██║   ██║██║╚██╗██║██║   ██║"
echo "  ╚██████╔╝██║ ╚████║╚██████╔╝"
echo "   ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ "
echo -e "${NC}"
echo -e "${YELLOW}  Multiplayer Arena${NC}"
echo ""

# ------- Check Node.js -------
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18+ required. Found: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# ------- Install Backend Dependencies -------
echo ""
echo -e "${CYAN}▶ Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# ------- Create .env if missing -------
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✓ Created .env from .env.example${NC}"
fi

# ------- Seed Database -------
if [ ! -f "$BACKEND_DIR/db/uno.db" ]; then
    echo -e "${CYAN}▶ Seeding database...${NC}"
    npm run seed
    echo -e "${GREEN}✓ Database seeded${NC}"
fi

# ------- Install Frontend Dependencies -------
echo ""
echo -e "${CYAN}▶ Installing frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# ------- Kill any existing processes on our ports -------
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
        echo -e "${YELLOW}  Killed existing process on port $port${NC}"
    fi
}

echo ""
kill_port 3001
kill_port 5173

# ------- Start Backend -------
echo -e "${CYAN}▶ Starting backend server...${NC}"
cd "$BACKEND_DIR"
node server.js &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Backend running on http://localhost:3001${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    exit 1
fi

# ------- Start Frontend -------
echo -e "${CYAN}▶ Starting frontend dev server...${NC}"
cd "$FRONTEND_DIR"
npx vite --port 5173 &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ UNO Multiplayer Arena is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "  🎮 Game:        ${CYAN}http://localhost:5173${NC}"
echo -e "  🔧 Backend API: ${CYAN}http://localhost:3001${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all servers."
echo ""

# ------- Handle cleanup on exit -------
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ All servers stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
