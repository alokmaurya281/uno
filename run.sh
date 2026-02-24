#!/bin/bash

# ============================================
#  UNO Multiplayer Arena — Run Script
#  For Render: starts backend (serves frontend
#  dist as static). Use as Start Command.
# ============================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/backend"
echo "🎮 Starting UNO server..."
node server.js
