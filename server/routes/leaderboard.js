import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Global leaderboard (last 30 days)
router.get('/global', authMiddleware, async (req, res) => {
  try {
    const rows = await sql`
      SELECT u.id, u.name, COALESCE(SUM(wp.calories_burned), 0)::int AS score
      FROM users u
      LEFT JOIN workout_progress wp ON wp.user_id = u.id AND wp.recorded_on >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.name
      ORDER BY score DESC
      LIMIT 100
    `
    res.json(rows)
  } catch (err) {
    console.error('Leaderboard global error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Friend leaderboard for current user
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const rows = await sql`
      SELECT u.id, u.name, COALESCE(SUM(wp.calories_burned), 0)::int AS score
      FROM user_follows f
      JOIN users u ON u.id = f.target_user_id
      LEFT JOIN workout_progress wp ON wp.user_id = u.id AND wp.recorded_on >= CURRENT_DATE - INTERVAL '30 days'
      WHERE f.user_id = ${userId}
      GROUP BY u.id, u.name
      ORDER BY score DESC
    `
    res.json(rows)
  } catch (err) {
    console.error('Leaderboard friends error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
