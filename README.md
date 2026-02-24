# 🎴 UNO Multiplayer Arena

A real-time multiplayer UNO card game with modern neon/glassmorphism UI, AI bots, and competitive features.

## ✨ Features

- **Real-time multiplayer** — 2-10 players per room via Socket.io
- **Game Modes** — Classic, Stacking (+2/+4 stacking), Team (2v2, 3v3)
- **AI Bots** — Easy, Medium, and Hard difficulty
- **XP & Leveling** — Earn XP, level up, climb the leaderboard
- **Match History** — Full game history stored in SQLite
- **Modern UI** — Dark theme with neon accents, glassmorphism, Framer Motion animations
- **In-game Chat** — Room chat with emoji reactions
- **Responsive** — Works on desktop and mobile
- **Reconnection** — Rejoin games after disconnect

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Backend

```bash
cd backend
npm install
npm run seed    # Seed sample data (optional)
npm start       # Starts on port 3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Starts on port 5173
```

### 3. Play!

Open http://localhost:5173 in your browser.

## 🐳 Docker

```bash
docker-compose up --build
```

Open http://localhost in your browser.

## 📁 Project Structure

```
uno/
├── backend/
│   ├── controllers/     # REST API endpoints
│   ├── db/              # SQLite database & seed
│   ├── gameEngine/      # Core game logic
│   │   ├── deck.js      # 108-card deck + shuffle
│   │   ├── rules.js     # Card validation & effects
│   │   ├── gameState.js # Turn management & game flow
│   │   └── aiPlayer.js  # AI bot strategies
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.io event handlers
│   ├── utils/           # XP system
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── components/  # Card, GameBoard, Chat, etc.
│       ├── hooks/       # Socket.io hook
│       ├── pages/       # Landing, Lobby, Room, Game, Leaderboard
│       └── store/       # Zustand stores
├── docker-compose.yml
└── README.md
```

## 🎮 How to Play

1. Enter a username
2. Create or join a room
3. Host configures game settings (stacking, teams, timer)
4. Host can add AI bots to fill slots
5. Host starts the game when ready
6. Play cards by clicking on them (wild cards prompt color selection)
7. Click the draw pile to draw a card
8. Click "UNO!" when you have 1-2 cards left
9. Click "Catch!" on opponents who forget to call UNO

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Backend server port |
| FRONTEND_URL | http://localhost:5173 | Allowed CORS origin |
| DB_PATH | ./db/uno.db | SQLite database path |
| TURN_TIMER | 30 | Default turn timer (seconds) |

## 📜 License

MIT
