#!/bin/bash

# ============================================
#  UNO Multiplayer Arena — Run Script
#  Starts backend and frontend dev servers.
#  Usage: bash run.sh
# ============================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

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
echo -e "${YELLOW}  Starting Servers${NC}"
echo ""

# ---- Preflight check ----
if [ ! -d "$ROOT/backend/node_modules" ] || [ ! -d "$ROOT/frontend/node_modules" ]; then
    echo -e "${RED}✗ Dependencies not installed. Run ${CYAN}bash build.sh${RED} first.${NC}"
    exit 1
fi

# ---- Kill existing processes on ports ----
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "${YELLOW}  Freed port $port${NC}"
    fi
}

kill_port 3001
kill_port 5173
sleep 1

# ---- Start backend ----
echo -e "${CYAN}▶ Starting backend...${NC}"
cd "$ROOT/backend"
node server.js &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Backend running → http://localhost:3001${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    exit 1
fi

# ---- Start frontend ----
echo -e "${CYAN}▶ Starting frontend...${NC}"
cd "$ROOT/frontend"
npx vite --port 5173 &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ UNO Arena is live!${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo -e "  🎮 Play:    ${CYAN}http://localhost:5173${NC}"
echo -e "  🔧 API:     ${CYAN}http://localhost:3001${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop."
echo ""

# ---- Cleanup on exit ----
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
