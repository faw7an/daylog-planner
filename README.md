# Daylog Planner

A daily task planner that carries forward what you didn't finish. Built with React, Express, Neon DB, and TypeScript.

## What it does

- Create daily goals and add tasks under each one
- Check off tasks as you complete them — progress ring updates live
- Unfinished tasks automatically carry forward to the next day with a "Carried" badge
- Browse your history to see completed tasks by date
- Works as a PWA — install on your phone's home screen

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TanStack Router, TanStack Query, Tailwind CSS v4, Vite |
| Backend | Express 5, TypeScript |
| Database | Neon DB (serverless PostgreSQL) |
| Auth | JWT stored in httpOnly cookies |
| ORM | Drizzle ORM |
| PWA | vite-plugin-pwa with Workbox caching |

## Prerequisites

- Node.js 18+
- A [Neon DB](https://neon.tech) database (free tier works)
- npm

## Setup

### 1. Clone and install

```bash
git clone https://github.com/faw7an/daylog-planner.git
cd daylog-planner

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-here
PORT=5000
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Push database schema

```bash
cd server
npx drizzle-kit push
```

This creates the `users`, `task_groups`, and `tasks` tables in Neon DB.

### 4. Start development servers

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open `http://localhost:8080` and register an account.

## Production build

```bash
cd server && npm run build    # TypeScript → dist/
cd client && npm run build    # Vite → dist/ with PWA
```

Deploy the `server/dist/` and `client/dist/` directories to your host. Set the `server/dist/index.js` as the entry point.

## How to use

1. **Register** an account with your email and password
2. **Create a goal** — tap the + button or "Add your first goal" on the empty state. Pick a name and color
3. **Add tasks** — tap "Add task..." under any goal, type, press Enter. Appears instantly (optimistic UI)
4. **Complete tasks** — click the checkbox or tap the task text to toggle done. Progress ring updates in real time
5. **Carry forward** — any incomplete tasks from yesterday automatically appear today with a "Carried" tag
6. **History** — tap History in the bottom nav to browse past completed days. Use the calendar icon to jump to any date
7. **Profile** — tap your avatar to see your account info and sign out

## Project structure

```
server/
  src/
    controllers/    # Route handlers (auth, tasks)
    db/             # Drizzle schema + connection
    middlewares/     # requireAuth
    routes/         # Express routers
    types/          # TypeScript declarations
    utils/          # JWT token generation
    index.ts        # Entry point

client/
  src/
    components/
      daylog/       # AppHeader, TaskGroupCard, ProfileSheet, etc.
      ui/           # Button, Input, Toaster
    hooks/          # useAuth (React Context)
    lib/            # API client, group colors, utils
    routes/         # File-based routes (TanStack Router)
    start.tsx       # Entry point with providers
    router.tsx      # TanStack Router setup
```

## License

MIT
