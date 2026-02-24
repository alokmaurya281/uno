#!/bin/bash

# ============================================
#  UNO Multiplayer Arena — Start Script
#  Starts the backend server from project root.
#  Render Start Command: bash run.sh
# ============================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🎮 Starting UNO server..."
node backend/server.js
