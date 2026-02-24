#!/bin/bash

# ============================================
#  UNO Multiplayer Arena — Build Script
#  For Render: installs deps, builds frontend,
#  seeds DB. Use as Build Command.
# ============================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Installing backend dependencies..."
cd "$ROOT/backend"
npm install
echo "✓ Backend ready"

echo ""
echo "▶ Checking .env..."
if [ ! -f "$ROOT/.env" ]; then
    if [ -z "$NODE_ENV" ]; then
        cp "$ROOT/.env.example" "$ROOT/.env"
        echo "✓ Created .env from .env.example (local dev)"
    else
        echo "✓ Env vars provided by platform — skipping .env"
    fi
else
    echo "✓ .env already exists"
fi

echo ""
echo "▶ Seeding database..."
if [ ! -f "$ROOT/backend/db/uno.db" ]; then
    npm run seed
    echo "✓ Database seeded"
else
    echo "✓ Database already exists"
fi

echo ""
echo "▶ Installing frontend dependencies..."
cd "$ROOT/frontend"
npm install
echo "✓ Frontend deps ready"

echo ""
echo "▶ Building frontend..."
npm run build
echo "✓ Frontend built → frontend/dist"

echo ""
echo "══════════════════════════════════"
echo "  ✓ Build complete!"
echo "══════════════════════════════════"
