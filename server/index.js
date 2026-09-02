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
import adminRoutes from './routes/admin.js'
import { initDatabase } from './db/neon.js'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/workout', workoutRoutes)
app.use('/api/nutrition', nutritionRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '3', features: ['nutrition-plans', 'workout-latest', 'questionnaires', 'dashboard-stats'] })
})

const PORT = process.env.PORT || 5000

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
