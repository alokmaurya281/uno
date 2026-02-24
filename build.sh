#!/bin/bash

# ============================================
#  UNO Multiplayer Arena — Build Script
#  Installs all dependencies and seeds the DB.
#  Usage: bash build.sh
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
echo -e "${YELLOW}  Build Script${NC}"
echo ""

# ---- Check Node.js ----
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+.${NC}"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18+ required. Found: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ---- Backend ----
echo ""
echo -e "${CYAN}▶ Installing backend dependencies...${NC}"
cd "$ROOT/backend"
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# ---- Create .env if missing ----
if [ ! -f "$ROOT/backend/.env" ]; then
    cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
    echo -e "${GREEN}✓ Created backend/.env from .env.example${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# ---- Seed DB if empty ----
if [ ! -f "$ROOT/backend/db/uno.db" ]; then
    echo -e "${CYAN}▶ Seeding database...${NC}"
    npm run seed
    echo -e "${GREEN}✓ Database seeded with sample data${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

# ---- Frontend ----
echo ""
echo -e "${CYAN}▶ Installing frontend dependencies...${NC}"
cd "$ROOT/frontend"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# ---- Done ----
echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Build complete!${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo -e "  Run ${CYAN}bash run.sh${NC} to start the servers."
echo ""
