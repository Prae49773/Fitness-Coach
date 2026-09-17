import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public passport for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = (await sql`SELECT id, name FROM users WHERE id = ${userId}`)[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const badges = await sql`SELECT b.* FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = ${userId} ORDER BY ub.awarded_at DESC`
    const challenges = await sql`SELECT c.* FROM challenge_participants cp JOIN challenges c ON c.id = cp.challenge_id WHERE cp.user_id = ${userId} ORDER BY cp.joined_at DESC`
    const records = await sql`SELECT * FROM progress_metrics WHERE user_id = ${userId} ORDER BY recorded_at DESC LIMIT 10`
    const points = (await sql`SELECT points, xp, level FROM user_points WHERE user_id = ${userId}`)[0] || { points: 0, xp: 0, level: 1 }

    res.json({ user, badges, challenges, records, points })
  } catch (err) {
    console.error('Passport error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Personal (authenticated) passport
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const user = (await sql`SELECT id, name, email FROM users WHERE id = ${userId}`)[0]
    const badges = await sql`SELECT b.* FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = ${userId} ORDER BY ub.awarded_at DESC`
    const challenges = await sql`SELECT c.* FROM challenge_participants cp JOIN challenges c ON c.id = cp.challenge_id WHERE cp.user_id = ${userId} ORDER BY cp.joined_at DESC`
    const records = await sql`SELECT * FROM progress_metrics WHERE user_id = ${userId} ORDER BY recorded_at DESC LIMIT 20`
    const points = (await sql`SELECT points, xp, level FROM user_points WHERE user_id = ${userId}`)[0] || { points: 0, xp: 0, level: 1 }

    res.json({ user, badges, challenges, records, points })
  } catch (err) {
    console.error('Passport self error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
