# FitAI (Prae) — AI Instructions

> **Read this first.** Project handoff for Kilo Code, Cursor, and other coding agents. Subdirectory notes: `server/AGENTS.md`, `src/AGENTS.md`.

## Project overview

**FitAI** is a full-stack fitness platform (React + Vite frontend, Express API, Neon Postgres). Users register, complete onboarding, and use a tabbed dashboard for classes, events, challenges, AI workout/nutrition plans, and history.

**Venue (canonical):** All in-person activity is at **Central Rama 2 Gym, Bangkok** — see `src/constants/venue.js` and seeded DB rows.

**Deployment target:** Netlify (static SPA). The Express API must be hosted separately or run locally; set `VITE_API_URL` for production.

---

## Quick start (human or agent)

```bash
npm install
npm run db:migrate          # applies schema + re-seeds catalog data
npm run dev                 # Vite + auto-spawned API on port 5000
```

**Verify backend:**

```bash
curl http://localhost:5000/api/health
# Expect: { "ok": true, "version": "3", "features": [...] }
```

**Separate API only:**

```bash
npm run server
```

**Env files:** Dotenv loads `env.env` then `.env`. Required:

- `NEON_DB` or `DATABASE_URL` or `VITE_NEON_DATABASE_URL` — Postgres connection
- `JWT_SECRET` — auth tokens
- `VITE_API_URL` — production API base (e.g. `https://your-api.example.com/api`)

Never commit secrets. Do not paste credentials into this file or commits.

---

## Architecture

```
Prae/
├── ai-instructions.md      # This file — project handoff for AI agents
├── src/                    # React 19 + Vite + Tailwind 4
│   ├── pages/              # Login, Register, Onboarding, UserDashboard, AdminDashboard
│   ├── components/         # Cards, plans, FoodLog, UserActivityPanel, ui/*
│   ├── services/api.js     # All frontend API calls (/api proxy in dev)
│   ├── contexts/AuthContext.jsx
│   ├── constants/          # dashboardTabs, workoutQuestions, nutritionQuestions, venue
│   ├── styles/             # dashboard.css, auth-glass.css; global buttons in index.css
│   └── utils/              # capacity.js, meals.js
├── server/
│   ├── index.js            # Express app, mounts /api/*
│   ├── routes/             # auth, users, classes, events, challenges, workout, nutrition, admin
│   ├── services/           # workoutPlanGenerator.js, nutritionPlanGenerator.js
│   ├── db/neon.js          # Schema init + seed data (single source of truth for seeds)
│   └── db/migrations/      # SQL reference; run-migration.js applies changes
├── public/images/          # classes/, events/, challenges/, nutrition/
└── vite.config.js          # Proxies /api → :5000; spawns server/index.js on dev
```

**Auth:** JWT in `localStorage` (`token`, `user`). `authMiddleware` on protected routes. `AuthContext.updateUser()` merges profile patches.

**Dashboard tabs:** Query param `?tab=` — see `src/constants/dashboardTabs.js`. Navbar links for logged-in users: Overview, Classes, Events, Challenges, Nutrition, History.

---

## What was built (session changelog)

Use this section to understand current behavior vs. legacy stubs.

### Auth & layout

- B&W centered auth cards (`src/styles/auth-glass.css`)
- Register: 2-step flow; onboarding collects name + age (weight/height from registration)
- Global navbar: guests see Login/Register; users see dashboard tabs only (no duplicate nav)

### Catalog & booking (real DB + API)

- **Classes** — book/cancel, capacity, images, descriptions, venue
- **Events** — register/cancel, capacity, location
- **Challenges** — join/leave, capacity, **progress logging** (`POST /api/challenges/:id/progress`)
- **Nutrition meal plans** — start/stop plan, **structured meals with macros**, per-meal logging

All seeds live in `server/db/neon.js` and refresh on `npm run db:migrate`.

### AI plans

- **Workout:** 12-question ACSM questionnaire → `generateWorkoutPlan()` → saved to `workout_plans` with `schedule` JSONB
- **Nutrition:** 12-question DRI questionnaire → `nutrition_recommendations`
- UI: `WorkoutPlanDisplay` (day cards, log workout modal), `AIPlanCard` (empty state / nutrition summary)

### Workout logging & history

- `exercise_logs` extended: `plan_id`, `day_label`, `notes`
- Log from workout plan day → syncs to History tab
- Backfill script: `npm run db:backfill-workouts` (fills `schedule` for old plans)

### Dashboard stats & UX (not mock data)

- `GET /api/users/dashboard-stats` — real workouts, calories, enrollments, charts
- `UserActivityPanel` on Overview — bookings, registrations, challenge progress, meal calories
- Toast notifications + button loading states on register/join/book/start/log actions
- Fixed **null capacity bug** — `src/utils/capacity.js` (null spots ≠ full)

### Venue & rich nutrition/challenges

- All classes/events/challenges at **Central Rama 2 Gym, Bangkok**
- `ActiveMealPlanPanel` — daily calorie bar, macros, log each meal slot
- `ChallengeCard` — progress bar + log progress when joined
- `FoodLog` — today’s calories vs plan target

---

## Database

**Run migrations after schema changes:**

```bash
npm run db:migrate
```

| Migration | Purpose |
|-----------|---------|
| `001_fitness_classes.sql` | Classes + bookings |
| `002_events_challenges_nutrition.sql` | Events, challenges, meal plans |
| `003_workout_schedule_logging.sql` | `workout_plans.schedule`, exercise log metadata |
| `004_venue_progress_meals.sql` | Venue columns, challenge progress, meal macros, food_log meal slots |

**Key tables:** `users`, `fitness_classes`, `class_bookings`, `fitness_events`, `event_registrations`, `challenges`, `challenge_participants`, `meal_plans`, `user_meal_plans`, `food_logs`, `exercise_logs`, `workout_plans`, `nutrition_recommendations`, `progress_metrics`

**Meal JSON shape** (in `meal_plans.meals`):

```json
{
  "slot": "breakfast",
  "label": "Breakfast",
  "item": "Oatmeal with berries & chia",
  "calories": 380,
  "protein_g": 14,
  "carbs_g": 58,
  "fat_g": 9
}
```

Legacy string meals are still parsed in `src/utils/meals.js`.

---

## API reference (implemented)

Base: `/api` — see `src/services/api.js` for client wrappers.

| Area | Endpoints |
|------|-----------|
| Health | `GET /health` → version 3 |
| Auth | `POST /auth/register`, `/login`, `/onboarding` |
| Users | `GET /profile`, `GET /dashboard-stats`, `GET/POST /exercise-logs`, `GET/POST /food-logs`, `GET/POST /progress` |
| Classes | `GET /`, `POST /:id/book`, `DELETE /:id/book`, `GET /my-bookings` |
| Events | `GET /`, `POST /:id/register`, `DELETE /:id/register`, `GET /my-registrations` |
| Challenges | `GET /`, `POST /:id/join`, `DELETE /:id/join`, `POST /:id/progress`, `GET /my-challenges` |
| Workout | `GET /latest`, `POST /generate`, `GET /history` |
| Nutrition | `GET /plans`, `POST/DELETE /plans/:id/activate`, `POST /plans/:id/log-meal`, `GET /my-plans`, `POST /generate`, `GET /latest` |

**Optional auth** on catalog GETs populates `is_booked`, `is_registered`, `is_joined`, `is_active`.

---

## Frontend conventions

1. **Buttons:** Use `src/components/ui/Button.jsx` with classes from `index.css` (`.ui-button--sm`, etc.). Tailwind `px-*` alone is unreliable due to CSS reset.
2. **Dashboard cards:** `.dashboard-card`, `.card-content`, spacing in `src/styles/dashboard.css`. Do **not** use `dashboard-card--flush` on full content panels (e.g. workout plan header) unless inner padding is explicit.
3. **Actions:** `UserDashboard.jsx` uses `runAction(key, fn, successMsg)` + `Toast` — follow this pattern for new mutations.
4. **Capacity:** Always use `getCapacityState()` from `src/utils/capacity.js`.
5. **Venue:** Use `VenueLine` or `formatVenue()` from `src/constants/venue.js`.
6. **Loading data:** `loadData()` uses `safe()` fallbacks; failed API calls become `[]`/`null`. Show `dataError` banner when `/api/health` fails.

---

## Known issues & troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| API 404 / buttons do nothing | Stale process on port 5000 or API not running | Stop terminals, `npm run dev` (predev kills port 5000) |
| Empty classes/events/challenges | Backend down or old server without routes | Check `GET /api/health` version is `3` |
| Images broken | Missing files under `public/images/` | Re-run migrate/seeds; paths like `/images/classes/morning-yoga.jpg` |
| Production API fails | Netlify is static-only | Deploy Express separately; set `VITE_API_URL` |
| Workout days missing | Old plan without `schedule` | `npm run db:backfill-workouts` or retake questionnaire |

---

## How to extend (recommended next steps)

### High value

1. **Hosted API** — Railway/Render/Fly.io for `server/`; wire Netlify `VITE_API_URL`
2. **Challenge progress persistence UI** — already API-backed; could add daily history table
3. **Weight progress** — auto-write `progress_metrics` on profile update or workout log
4. **Admin dashboard** — wire `server/routes/admin.js` to real stats

### Patterns to follow

- **New catalog entity:** Add table + seed in `neon.js`, route in `server/routes/`, card in `src/components/`, wire in `UserDashboard.loadData()`
- **New user action:** API route → `api.js` method → handler in `UserDashboard` with `runAction` + toast
- **New migration:** SQL file in `server/db/migrations/` + duplicate `ALTER` in `run-migration.js` and `initDatabase()` in `neon.js`

### Do not

- Commit `.env` or `env.env` with real secrets
- Use `netlify-identity-widget` or `gotrue-js` (deprecated); use `@netlify/identity` if adding Netlify Identity later
- Hardcode stats on Overview — use `dashboard-stats` or derive from loaded logs
- Skip `npm run db:migrate` after changing seeds or schema

---

## Commands cheat sheet

```bash
npm run dev                 # Frontend + API (recommended)
npm run server              # API only
npm run build               # Production build → dist/
npm run db:migrate          # Schema + seeds
npm run db:backfill-workouts # Backfill workout_plans.schedule
npm run lint                # oxlint
```

---

## Kilo Code–specific notes

1. **This file:** `ai-instructions.md` at repo root. Loaded via `kilo.jsonc` → `"instructions": ["./ai-instructions.md"]`. Start a **new task** after editing so changes take effect.
2. **Subdirectory context:** When editing backend-only or frontend-only, read `server/AGENTS.md` or `src/AGENTS.md` respectively.
3. **Permissions:** Prefer `npm run build` and `npm run db:migrate` to verify changes; avoid force git operations unless the user asks.
4. **Commits:** Only commit when the user explicitly requests it.

---

## File index (most touched)

| Feature | Primary files |
|---------|----------------|
| Dashboard hub | `src/pages/UserDashboard.jsx` |
| API client | `src/services/api.js` |
| Workout plan UI | `src/components/plans/WorkoutPlanDisplay.jsx` |
| Active meals | `src/components/ActiveMealPlanPanel.jsx` |
| Challenge progress | `src/components/ChallengeCard.jsx`, `server/routes/challenges.js` |
| Seeds & schema | `server/db/neon.js`, `server/db/run-migration.js` |
| Generators | `server/services/workoutPlanGenerator.js`, `nutritionPlanGenerator.js` |
| Styling | `src/styles/dashboard.css`, `src/index.css` |

---

*Last updated: August 2026 — reflects workout plans, logging, dashboard stats, Central Rama 2 venue, meal/challenge progress.*
