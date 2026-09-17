import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/challenge/:challengeId', authMiddleware, async (req, res) => {
  try {
    const challengeId = Number(req.params.challengeId)
    const { scope = 'global', category, location, period = 'all', friendOnly = 'false' } = req.query

    const hasFriendsTable = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_follows'
      ) AS has_table
    `

    let friendFilter = sql``
    if ((scope === 'friends' || friendOnly === 'true') && hasFriendsTable[0]?.has_table) {
      friendFilter = sql`AND u.id IN (SELECT following_user_id FROM user_follows WHERE follower_user_id = ${req.user.id})`
    } else if (scope === 'friends' || friendOnly === 'true') {
      friendFilter = sql`AND u.id = ${req.user.id}`
    }

    const rows = await sql`
      SELECT
        u.id AS user_id,
        u.name,
        u.city,
        u.age,
        u.gender,
        cp.progress_current,
        c.target_value,
        c.target_unit,
        CASE
          WHEN c.target_value > 0 THEN LEAST(100, ROUND((COALESCE(cp.progress_current, 0)::numeric / c.target_value) * 100))
          ELSE 0
        END AS progress_pct,
        ROW_NUMBER() OVER (ORDER BY cp.progress_current DESC, u.name ASC) AS rank
      FROM challenge_participants cp
      JOIN users u ON u.id = cp.user_id
      JOIN challenges c ON c.id = cp.challenge_id
      WHERE cp.challenge_id = ${challengeId}
        ${scope === 'regional' ? sql`AND COALESCE(u.city, '') = COALESCE((SELECT city FROM users WHERE id = ${req.user.id}), '')` : sql``}
        ${scope === 'gym' ? sql`AND COALESCE(c.city, '') = COALESCE((SELECT city FROM users WHERE id = ${req.user.id}), '')` : sql``}
        ${scope === 'age' ? sql`AND u.age BETWEEN ${Math.max(0, Number(req.user.age ?? 25) - 5)} AND ${Number(req.user.age ?? 25) + 5}` : sql``}
        ${scope === 'gender' ? sql`AND COALESCE(u.gender, 'Prefer not to say') = COALESCE((SELECT gender FROM users WHERE id = ${req.user.id}), 'Prefer not to say')` : sql``}
        ${friendFilter}
        ${category ? sql`AND COALESCE(u.exercise_type, '') ILIKE ${'%' + category + '%'}` : sql``}
        ${location ? sql`AND COALESCE(u.city, '') ILIKE ${'%' + location + '%'}` : sql``}
      ORDER BY cp.progress_current DESC, u.name ASC
      LIMIT 25
    `

    res.json(rows)
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
