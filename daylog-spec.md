# Daylog — Product & Technical Spec
**Daily task planner · React (Vite) + Express + Neon DB · PWA**

---

## 1. What it is

A lightweight daily task planner where you plan your day by grouping tasks under main goals, check them off as you work, and anything incomplete automatically carries to the next day. Think of it as a minimal Notion for your day — no fluff, just plan → do → track.

---

## 2. PRD — Product Requirements

### 2.1 User stories

| # | As a user I want to… | So that… |
|---|---|---|
| 1 | Register and log in securely | My tasks are private and persistent |
| 2 | See today's tasks the moment I open the app | I know exactly what to work on |
| 3 | Create a main task (task group) like "Code on Apartment" | I can organise sub-tasks under a goal |
| 4 | Add sub-tasks under each group | I can break big goals into steps |
| 5 | Check off completed sub-tasks | I can track progress through the day |
| 6 | See a completion percentage for today | I can see how productive my day is at a glance |
| 7 | Have incomplete tasks auto-carry to tomorrow | I don't lose track of unfinished work |
| 8 | See past days and what I completed | I can review what I actually did |
| 9 | Use it on my phone and laptop equally | It fits into my workflow anywhere |
| 10 | Install it on my phone like an app | I can access it without opening a browser |

### 2.2 Features — V1 (build this)

**Auth**
- Email + password register and login via Express + JWT (JSON Web Tokens)
- Auto-redirect: logged in → dashboard, logged out → login page
- Persist session (stay logged in on refresh)

**Dashboard — today view**
- Shows today's date prominently
- Completion ring / percentage bar at the top (completed tasks / total tasks)
- Task groups displayed as cards
- Each group shows its sub-tasks with checkboxes
- Carried-forward tasks show a subtle "From yesterday" or "Carried" badge
- Empty state when no tasks yet: prompt to add your first group
- Floating action button (FAB) to add a new group quickly

**Task groups**
- Create with a title (e.g. "Code on Apartment 4hrs")
- Optional color label (purple, teal, amber, blue, coral — 5 options)
- Can be deleted (deletes all sub-tasks with it)
- Groups are ordered by creation time

**Sub-tasks**
- Add under any group with a title
- Checkbox to mark complete (records completed_at timestamp)
- Unchecking a completed task marks it incomplete again
- Can be deleted individually
- Add inline (no modal needed — just a small input that appears)

**Carry-forward logic**
- When the app loads, any sub-task where due_date < today AND completed = false automatically gets due_date updated to today
- This runs once per day per user (tracked with a last_carry_date on the profile)
- Carried tasks show a small badge so you know they came from a previous day
- Their parent group also carries forward (if the group has any carried tasks)

**History view**
- Calendar-style date picker or simple prev/next day arrows
- Shows tasks as they were on that specific day (completed ones with checkmark, incomplete ones as-is)
- Shows completion % for that day
- Read-only — you can't edit past days

**PWA**
- Manifest file with app name, icon, theme color
- Works offline for viewing cached tasks (service worker — basic cache)
- Installable on iOS and Android

### 2.3 Features — V2 (after you ship V1, don't build now)
- Push notifications for end-of-day summary
- Weekly review screen (how many tasks completed per day this week)
- Drag to reorder groups and sub-tasks
- Due time per task (e.g. "By 2 PM")
- Notes field per task

---

## 3. Pages & UI

### Page 1: `/login`
- Centered card on a clean background
- App name + tagline at top
- Email input, password input, login button
- "Don't have an account? Register" link
- Error message below button if login fails

### Page 2: `/register`
- Same layout as login
- Name, email, password, confirm password inputs
- "Already have an account? Login" link

### Page 3: `/dashboard` (main page)

**Header bar**
- App logo/name on left
- Today's date (e.g. "Monday, 19 May") on left below name
- User avatar/initials circle + logout on right

**Completion section**
- Large circular progress ring showing X% complete
- Below it: "X of Y tasks done today"
- Color: green when 100%, purple otherwise

**Task groups**
- Each group is a card
- Card header: colored dot + group title + task count badge + delete button (trash icon)
- Card body: list of sub-tasks with checkboxes
- Below sub-task list: inline "Add a task..." input (tap to expand)
- Completed sub-tasks show with strikethrough text and muted color
- Carried sub-tasks show a small pill badge "↩ Carried"

**FAB button**
- Bottom right corner (above bottom nav on mobile)
- "+" icon
- Opens a simple modal/sheet: input for group title + color picker (5 color dots)
- Submit adds the group immediately

**Empty state**
- Icon + "No tasks yet" text + "Add your first goal" button

### Page 4: `/history`
- Date navigation: left arrow, date label (e.g. "Yesterday · 18 May"), right arrow
- Right arrow disabled when on today
- Same card layout as dashboard but read-only
- Completion % for that day shown at top
- Greyed out style to signal read-only mode

### Navigation (mobile-first)
- Bottom tab bar with 2 tabs: Today (home icon) | History (clock icon)
- On desktop: sidebar or top nav

---

## 4. TRD — Technical Requirements

### 4.1 Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Fast, modern client-side rendering |
| Backend | Express.js (Node.js) | Lightweight REST API server |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent components |
| Auth | JWT (JSON Web Tokens) | Stateless authentication via HTTP-only cookies |
| Database | Neon DB (PostgreSQL) | Serverless Postgres database |
| DB client | Drizzle ORM | Type-safe SQL wrapper/ORM for Neon |
| Deployment | Vercel (Frontend) + Render/Railway (Backend) | Free-tier friendly separate deployments |
| PWA | vite-plugin-pwa | Makes it installable |

### 4.2 Project structure

```
daylog/
├── client/                  # React (Vite) Frontend
│   ├── src/
│   │   ├── components/      # UI components (TaskGroup, AddGroupModal, etc.)
│   │   ├── pages/           # Route components (Login, Dashboard, History)
│   │   ├── hooks/           # Custom React hooks (useTasks, useAuth)
│   │   ├── lib/             # Utilities and API client (axios/fetch)
│   │   └── App.tsx          # Main React component + React Router setup
│   ├── public/              # PWA manifest and icons
│   └── vite.config.ts       # Vite + PWA config
└── server/                  # Express.js Backend
    ├── src/
    │   ├── controllers/     # Route logic (authController, taskController)
    │   ├── routes/          # Express route definitions
    │   ├── middlewares/     # Auth guard (verify JWT)
    │   ├── db/              # Drizzle ORM setup (index.ts, schema.ts)
    │   └── index.ts         # Express server entry point
    └── .env                 # DATABASE_URL, JWT_SECRET
```

### 4.3 Database schema (Neon DB SQL editor / Drizzle migrations)

```sql
-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  last_carry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task groups (parent tasks)
CREATE TABLE public.task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'purple',
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  original_date DATE NOT NULL DEFAULT CURRENT_DATE,
  carried BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE POLICY "Users can only see their own tasks"
  ON public.tasks FOR ALL USING (auth.uid() = user_id);
```

### 4.4 Key queries

**Fetch today's tasks (Express Route / Controller)**
```typescript
// GET /api/tasks/today
router.get('/today', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  // Carry-forward is executed here or via a separate scheduled task/middleware
  await runCarryForward(userId);
  
  const groups = await db.query.taskGroups.findMany({
    where: eq(taskGroups.userId, userId),
    with: { tasks: true },
    orderBy: [asc(taskGroups.createdAt)]
  });
  
  res.json(groups);
});
```

**Carry-forward logic (Backend service function)**
```typescript
async function runCarryForward(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (user?.lastCarryDate === today) return; // already ran today

  // Update all incomplete tasks with due_date < today to today
  await db.update(tasks)
    .set({ dueDate: today, carried: true })
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.completed, false),
      lt(tasks.dueDate, today)
    ));

  // Mark carry as done for today
  await db.update(users)
    .set({ lastCarryDate: today })
    .where(eq(users.id, userId));
}
```

**Mark task complete (Express Controller)**
```typescript
await db.update(tasks)
  .set({ 
    completed: true, 
    completedAt: new Date() 
  })
  .where(eq(tasks.id, taskId));
```

**Fetch history for a specific date (Express Controller)**
```typescript
// GET /api/tasks/history?date=YYYY-MM-DD
const selectedDate = req.query.date;

const data = await db.query.tasks.findMany({
  where: and(
    eq(tasks.userId, userId),
    eq(tasks.dueDate, selectedDate)
  ),
  with: { taskGroup: true },
  orderBy: [asc(tasks.createdAt)]
});
```

### 4.5 Environment variables

```env
# server/.env
DATABASE_URL=postgres://user:password@ep-withered-snow-123456.us-east-2.aws.neon.tech/neondb
JWT_SECRET=your_super_secret_jwt_key
PORT=5000

# client/.env
VITE_API_URL=http://localhost:5000/api
```

### 4.6 Auth middleware (Express `requireAuth.ts`)

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```
*(On the frontend, use React Router to protect routes if the user state is null).*

### 4.7 PWA Config (`vite.config.ts` using vite-plugin-pwa)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// ...inside plugins array:
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Daylog',
    short_name: 'Daylog',
    description: 'Your daily task planner',
    theme_color: '#7c3aed',
    background_color: '#0f0f0f',
    display: 'standalone',
    start_url: '/dashboard',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
})
```

---

## 5. Design tokens

```
Primary accent:   #7c3aed  (purple)
Background:       #0f0f0f  (dark) / #f5f4f2 (light)
Card bg:          #1c1c1a  (dark) / #ffffff (light)
Text primary:     #e8e6e1  (dark) / #1a1a1a (light)
Text muted:       #6b6860  (dark) / #5c5b57 (light)
Success:          #16a34a
Border:           rgba(255,255,255,0.08) dark / rgba(0,0,0,0.09) light

Group colors:
  purple: #7c3aed bg #ede9fe
  teal:   #0f766e bg #ccfbf1
  amber:  #b45309 bg #fef3c7
  blue:   #1d4ed8 bg #dbeafe
  coral:  #c2410c bg #ffedd5

Font: system-ui / -apple-system (no Google Fonts needed)
Border radius: 12px cards, 8px inputs/buttons
```

---

## 6. Lovable prompt (paste this in)

```
Build a full-stack daily task planner PWA called "Daylog" using React (Vite) for the frontend, Express.js for the REST API backend, Tailwind CSS, shadcn/ui, and Neon DB + Drizzle ORM for the database.

## Core concept
Users plan their day by creating task groups (main goals like "Code on Apartment 4hrs") and adding sub-tasks under each group (like "Fix login bug", "Build API route"). At the end of the day, incomplete tasks automatically carry forward to tomorrow. Completed tasks stay in history.

## Pages

### /login and /register
Clean centered auth pages. Email + password. Express API should issue a JWT stored in an HTTP-only cookie. Auto-redirect: authenticated users go to /dashboard. Use React Router for protected routes.

### /dashboard (main page — protected)
- Header: app name "Daylog" left, today's date (e.g. "Monday, 19 May 2025") below it, user initials avatar + logout button right
- Completion section at top: circular SVG progress ring showing X% with "X of Y tasks done" below it. Purple when < 100%, green when 100%
- Task group cards: each card has a colored left border (based on group color), group title bold, sub-task count badge, delete group button (trash icon top right)
- Under each group: list of sub-tasks. Each sub-task has a checkbox (rounded square), task text, delete button. Completed tasks show strikethrough + muted text color
- Carried-forward sub-tasks show a small purple "↩ Carried" pill badge next to the task text
- Below each group's task list: a small "Add task..." placeholder input that expands inline on tap — no modal
- Floating action button bottom-right: "+" opens a bottom sheet with a text input for group title and 5 color dots to pick from (purple, teal, amber, blue, coral). Submit creates the group
- Empty state: centered icon + "No tasks planned yet" + "Add your first goal +" button

### /history (protected)
- Date navigation: left arrow < | "Yesterday · 18 May" | right arrow > (disabled on today)
- Same card layout as dashboard but fully read-only (no checkboxes, no delete buttons, no add inputs)
- Shows completion % for that date
- Slightly greyed out to signal read-only

### Bottom navigation (mobile-first)
Two tabs: Today (home icon) and History (clock icon). Fixed at bottom on mobile. On desktop show as top nav.

## Database (Neon DB + Drizzle)
Three tables: profiles (id, name, last_carry_date), task_groups (id, user_id, title, color, created_date), tasks (id, user_id, group_id, title, completed, completed_at, due_date, original_date, carried). Ensure queries filter by the logged-in user_id.

## Carry-forward logic
On dashboard load, check if last_carry_date on the user's profile equals today. If not, run: UPDATE tasks SET due_date = today, carried = true WHERE user_id = current_user AND completed = false AND due_date < today. Then update last_carry_date to today. This ensures incomplete tasks always appear on the current day.

## Data fetching
Dashboard fetches task_groups with nested tasks filtered to due_date = today. History fetches tasks by due_date = selected_date. Use optimistic updates for instant checkbox feedback.

## Design
Dark mode as default (background #0f0f0f, cards #1c1c1a, text #e8e6e1). Support system light/dark preference. Primary accent #7c3aed (purple). Clean minimal aesthetic — no gradients, flat surfaces, thin borders (0.5px). Border radius 12px for cards, 8px for inputs. Mobile-first responsive layout. System font stack.

## PWA
Use vite-plugin-pwa to generate the manifest with name "Daylog", start_url "/dashboard", display "standalone", theme_color "#7c3aed". Setup the PWA in vite.config.ts. Add apple-mobile-web-app-capable meta tag.

## Routing & Auth Guard
Protect /dashboard and /history React routes. Redirect unauthenticated users to /login. Express API must protect task routes with a JWT verification middleware.

## Environment variables needed
DATABASE_URL (for backend) and JWT_SECRET

Keep the code clean, use TypeScript, and make all database operations use Drizzle ORM.
```

---

## 7. After Lovable — what to fix in Claude Code

These are things Lovable typically gets wrong that you'll need to fix manually:

1. **Migrations** — Ensure you run Drizzle migrations or apply the schema directly to your Neon DB project.
2. **Carry-forward logic** — verify it only runs once per day (check the `last_carry_date` logic). Lovable might implement it in a way that runs on every render.
3. **Optimistic updates** — when you check a task, the UI should update instantly without waiting for Neon DB. If it feels slow, add optimistic state updates.
4. **PWA icons** — generate icons at `/public/icons/icon-192.png` and `icon-512.png`. Use a simple purple square with "D" text — you can generate this at realfavicongenerator.net.
5. **Mobile viewport** — test on your actual phone. Check that the FAB isn't hidden behind the bottom nav.
6. **History date logic** — make sure history shows tasks by `due_date`, not `created_at`. Lovable might confuse these.

---

## 8. Deployment checklist (Frontend + Backend)

1. Push code to GitHub (new repo: `daylog`)
2. **Backend**: Go to Render or Railway → New Web Service → deploy the `server/` directory.
3. Add backend environment variables: `DATABASE_URL` (from Neon DB), `JWT_SECRET`, and `CORS_ORIGIN` (pointing to your frontend URL).
4. **Frontend**: Go to Vercel or Netlify → New Project → deploy the `client/` directory.
5. Add frontend environment variable: `VITE_API_URL` (pointing to your deployed Render/Railway backend).
6. Deploy both. Done.

---

*Spec version 1.0 — Fawzy S. Awadh · May 2026*
