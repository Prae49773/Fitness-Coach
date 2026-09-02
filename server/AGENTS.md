# Server — Agent Notes

Read root `ai-instructions.md` first.

## Stack

- **Express 4** ESM (`"type": "module"`)
- **Neon serverless** Postgres via `@neondatabase/serverless`
- **JWT** auth in `server/middleware/auth.js`
- Entry: `server/index.js` on port `5000` (or `process.env.PORT`)

## Env loading

```js
dotenv.config({ path: 'env.env' })
dotenv.config()  // .env
```

Connection string priority: `NEON_DB` → `DATABASE_URL` → `VITE_NEON_DATABASE_URL`

## Adding a route

1. Create or extend `server/routes/*.js`
2. Mount in `server/index.js` under `/api/...`
3. Add matching method in `src/services/api.js`
4. Use `authMiddleware` for mutations; `optionalAuthMiddleware` for catalog lists that need `is_*` flags

## Database changes

1. Add SQL to `server/db/migrations/NNN_name.sql`
2. Mirror with `ALTER TABLE ... IF NOT EXISTS` in `server/db/run-migration.js`
3. Mirror in `initDatabase()` in `server/db/neon.js`
4. Update seed arrays in `neon.js` if catalog data changes
5. Run `npm run db:migrate`

## Generators

- `workoutPlanGenerator.js` — ACSM FITT; returns `{ plan_name, exercises, schedule, summary, guidelines }`
- `nutritionPlanGenerator.js` — Mifflin-St Jeor + AMDR; returns meal_plan array, macros, daily_calories

When saving workout plans, persist **`schedule`** JSONB (not just flat `exercises`).

## Health check

Bump `version` and `features` in `server/index.js` `/api/health` when adding major API surface so the frontend can detect stale backends.
