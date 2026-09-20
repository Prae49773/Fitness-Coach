import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import classRoutes from './routes/classes.js'
import eventRoutes from './routes/events.js'
import challengeRoutes from './routes/challenges.js'
import workoutRoutes from './routes/workout.js'
import nutritionRoutes from './routes/nutrition.js'
import leaderboardRoutes from './routes/leaderboard.js'
import rewardsRoutes from './routes/rewards.js'
import passportRoutes from './routes/passport.js'
import adminRoutes from './routes/admin.js'
import { initDatabase, sql } from './db/neon.js'

if (!process.env.NEON_DB && !process.env.DATABASE_URL && !process.env.VITE_NEON_DATABASE_URL) {
  const cwd = process.cwd()
  dotenv.config({ path: path.resolve(cwd, 'env.env') })
  dotenv.config({ path: path.resolve(cwd, '.env') })
  dotenv.config({ path: path.resolve(cwd, '../.env') })
  dotenv.config({ path: path.resolve(cwd, '../env.env') })
  dotenv.config()
}

const app = express()
const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)

/** Normalize Netlify function rewrite paths to /api/* */
app.use((req, _res, next) => {
  const [pathname, query] = (req.url || '/').split('?')
  const qs = query != null ? `?${query}` : ''
  const fnPrefix = '/.netlify/functions/api'

  let nextPath = pathname
  if (pathname.startsWith(fnPrefix)) {
    nextPath = `/api${pathname.slice(fnPrefix.length) || ''}`
  } else if (!pathname.startsWith('/api')) {
    nextPath = `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`
  }

  if (nextPath !== pathname) {
    req.url = `${nextPath}${qs}`
  }
  next()
})

let initPromise = null

/** Local: full schema/seed. Serverless: one cheap ping (schema via npm run db:migrate). */
async function prepareDatabase() {
  if (isServerless) {
    await sql`SELECT 1`
    return
  }
  await initDatabase()
}

export function ensureDb() {
  if (!initPromise) {
    initPromise = prepareDatabase().catch((err) => {
      initPromise = null
      throw err
    })
  }
  return initPromise
}

app.use(async (_req, res, next) => {
  try {
    await ensureDb()
    next()
  } catch (err) {
    console.error('Database initialization failed:', err)
    res.status(500).json({ error: 'Database initialization failed' })
  }
})

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/workout', workoutRoutes)
app.use('/api/nutrition', nutritionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/rewards', rewardsRoutes)
app.use('/api/passport', passportRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    version: '5',
    features: ['nutrition-plans', 'workout-latest', 'questionnaires', 'dashboard-stats', 'leaderboards'],
  })
})

export default app
