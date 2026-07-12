# 120 Day Challenge

A mobile-first group fitness tracking app for a small crew (4–6 people) running a 120-day health challenge together. Daily logs, squad feed with reactions & comments, AI coaching, and a composite health score leaderboard.

**Production:** https://120-day-challenge.vercel.app

---

## Features

### Core
- **Daily Log** — mood emoji, workout done/not + notes, weight (kg or lbs), waist extended & sucked-in (cm or inches). Unit preference remembered per device. Values always stored in kg + cm.
- **Dashboard** — weight hero card with progress bar, BMI, waist progress bars, streak, badges, squad standings.
- **Squad Standings** — OVERALL and THIS WEEK tabs. Composite health score (0–100 pts) per member with score breakdown bar and stat pills.
- **Rankings page** (`/rankings`) — full methodology explanation with NIH/AHA/WHO/ACSM sources.
- **Squad Feed** (`/group`) — FEED tab shows all logs from the last 7 days with full detail (weight, waist chips, workout badge, mood). Emoji reactions (🔥❤️💪) and inline comment threads per log. CREW tab shows each member's streak, this-week count, and latest weight.
- **Charts** (`/charts`) — weight and waist trend lines, BMI chart, streak calendar. Tab-contextual MY STATS section.
- **Coach Zara** (`/coach`) — AI coach powered by Claude Haiku with full squad context and challenge progress.
- **Profile** (`/profile/[userId]`) — stats, goal editing, invite link, profile photo.
- **Multi-challenge** — users can create or join multiple challenges; active challenge switcher in top bar.

### Auth
- Google OAuth via Auth.js v5 (next-auth@beta).
- Magic link email (Resend) as fallback — requires `AUTH_RESEND_KEY` and `EMAIL_FROM` env vars.

---

## Composite Health Score

Ranks members on a 0–100 scale across three pillars:

| Pillar | Max | Full score threshold |
|--------|-----|---------------------|
| 💪 Weight loss % | 40 pts | ≥10% of starting weight (NIH "substantial") |
| 📏 Waist reduction % | 40 pts | ≥8% from first waist reading (WHO/AHA) |
| 🔥 Consistency | 20 pts | Log every day of the challenge |

Weekly rank uses the same formula with tighter caps (1% weight, 0.75% waist) applied to the last 7 days only. See `/rankings` for the full evidence-based rationale.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (next-auth@beta) |
| Storage | @vercel/blob (profile photos) |
| AI | Anthropic Claude Haiku (Coach Zara) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Fonts | Bebas Neue · JetBrains Mono · Inter |
| Deploy | Vercel |

---

## Design System

- **Background:** `#0a0a0a` · **Card:** `#141414`
- **Primary:** `#6366f1` (indigo) · **Accent:** `#ec4899` (pink)
- **Gradient:** `linear-gradient(135deg, #6366f1, #ec4899)`
- **Display font** (Bebas Neue) for headings and big numbers
- **Mono font** (JetBrains Mono) for labels, badges, stats
- **Sans font** (Inter) for body copy and names

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template (fill in your values)
cp .env.example .env.local   # or set vars manually — see below

# 3. Push schema to your Neon DB
npm run db:push

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required Environment Variables

```env
# Database (Neon)
DATABASE_URL=               # pooled connection
DATABASE_URL_UNPOOLED=      # direct connection (used by drizzle-kit)

# Auth
AUTH_SECRET=                # generate: openssl rand -base64 32
AUTH_URL=http://localhost:3000

# Google OAuth (Auth.js)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Email magic links (optional — Resend)
AUTH_RESEND_KEY=
EMAIL_FROM=                 # must be a verified Resend domain

# AI Coach (optional — Coach Zara)
ANTHROPIC_API_KEY=

# Profile photos (optional — Vercel Blob)
BLOB_READ_WRITE_TOKEN=
```

### Database Commands

```bash
npm run db:push      # push schema changes to DB (no migration files)
npm run db:generate  # generate migration files
npm run db:migrate   # apply migration files
npm run db:studio    # open Drizzle Studio UI
```

---

## Database Schema (key tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth.js user accounts |
| `user_profiles` | Height, start weight, goal weight, goal waist, photo URL |
| `challenges` | Challenge metadata (name, start date, duration, invite code) |
| `challenge_members` | Many-to-many: user ↔ challenge |
| `daily_logs` | Per-day entry: mood, workout, weight (kg), waist extended + sucked-in (cm) |
| `reactions` | Emoji reactions on daily logs (one per user per log) |
| `log_comments` | Comment threads on daily logs |
| `weekly_checkins` | Weekly snapshot (legacy, kept for charts) |
| `badges` | Earned achievement badges |
| `milestones` | Day 30/60/90/120 milestone reveals |
| `shoutouts` | Crew shoutouts |

---

## Project Structure

```
app/
  (app)/              # Authenticated app routes
    dashboard/        # Home — weight hero, standings, badges
    log/              # Daily log form
    group/            # Squad feed + crew tab
    charts/           # Trend charts
    coach/            # Coach Zara AI chat
    profile/[userId]/ # User profile
    rankings/         # Score methodology explanation
    check-in/         # Weekly check-in (legacy)
    challenge/new/    # Create new challenge
    join/[code]/      # Join via invite code
  (auth)/             # Login page
  actions/            # Server actions (log, reactions, comments, profile…)
  globals.css

components/
  feed/               # FeedCard, MemberCard
  log/                # DailyLogForm
  nav/                # TopBar, BottomNav
  charts/             # WeightChart, WaistChart, BMIChart, StreakCalendar

lib/
  db/schema.ts        # Drizzle schema
  scoring.ts          # Composite health score formula
  bmi.ts              # BMI calculations
  streaks.ts          # Streak + days-remaining helpers
  badges.ts           # Badge definitions
```

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable production baseline (pre-overhaul) |
| `feature/ui-overhaul-mobile` | **Active** — mobile UI overhaul, unit toggles, comments, score rankings |
| `backup/pre-ui-overhaul-20260712` | Snapshot before UI overhaul (safe rollback point) |

---

## Deployment

```bash
vercel          # preview deploy
vercel --prod   # production deploy
```

The Neon integration on Vercel auto-syncs `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. All other env vars must be set manually in the Vercel dashboard.
