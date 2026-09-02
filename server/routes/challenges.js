import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id ?? null

    const result = userId
      ? await sql`
          SELECT
            c.id,
            c.name,
            c.type,
            c.description,
            c.start_date,
            c.end_date,
            c.capacity,
            c.image_url,
            c.venue,
            c.city,
            c.target_value,
            c.target_unit,
            c.created_at,
            (c.capacity - COUNT(cp.id))::int AS spots_left,
            COUNT(cp.id)::int AS participant_count,
            EXISTS(
              SELECT 1 FROM challenge_participants up
              WHERE up.challenge_id = c.id AND up.user_id = ${userId}
            ) AS is_joined,
            (
              SELECT progress_current FROM challenge_participants
              WHERE challenge_id = c.id AND user_id = ${userId}
            ) AS progress_current,
            CASE
              WHEN c.target_value > 0 THEN LEAST(100, ROUND((
                COALESCE((
                  SELECT progress_current FROM challenge_participants
                  WHERE challenge_id = c.id AND user_id = ${userId}
                ), 0)::numeric / c.target_value) * 100))
              ELSE 0
            END AS progress_pct
          FROM challenges c
          LEFT JOIN challenge_participants cp ON cp.challenge_id = c.id
          GROUP BY c.id
          ORDER BY c.start_date ASC
        `
      : await sql`
          SELECT
            c.id,
            c.name,
            c.type,
            c.description,
            c.start_date,
            c.end_date,
            c.capacity,
            c.image_url,
            c.venue,
            c.city,
            c.target_value,
            c.target_unit,
            c.created_at,
            (c.capacity - COUNT(cp.id))::int AS spots_left,
            COUNT(cp.id)::int AS participant_count,
            false AS is_joined,
            0 AS progress_current,
            0 AS progress_pct
          FROM challenges c
          LEFT JOIN challenge_participants cp ON cp.challenge_id = c.id
          GROUP BY c.id
          ORDER BY c.start_date ASC
        `

    res.json(result)
  } catch (error) {
    console.error('Get challenges error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10)
    const userId = req.user.id

    if (Number.isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge id' })
    }

    const challenges = await sql`SELECT * FROM challenges WHERE id = ${challengeId}`
    if (challenges.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    const existing = await sql`
      SELECT id FROM challenge_participants
      WHERE user_id = ${userId} AND challenge_id = ${challengeId}
    `
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already joined this challenge' })
    }

    const joined = await sql`
      SELECT COUNT(*)::int AS count FROM challenge_participants WHERE challenge_id = ${challengeId}
    `
    const spotsLeft = challenges[0].capacity - joined[0].count
    if (spotsLeft <= 0) {
      return res.status(400).json({ error: 'This challenge is full' })
    }

    await sql`
      INSERT INTO challenge_participants (user_id, challenge_id, progress_current)
      VALUES (${userId}, ${challengeId}, 0)
    `

    res.json({ message: 'Joined challenge successfully', challenge: challenges[0] })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'You have already joined this challenge' })
    }
    console.error('Join challenge error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10)
    const userId = req.user.id
    const { amount } = req.body

    if (Number.isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge id' })
    }
    const increment = parseInt(amount, 10)
    if (!increment || increment <= 0) {
      return res.status(400).json({ error: 'Progress amount must be a positive number' })
    }

    const participation = await sql`
      SELECT cp.*, c.target_value, c.target_unit, c.name, c.venue, c.city
      FROM challenge_participants cp
      JOIN challenges c ON c.id = cp.challenge_id
      WHERE cp.user_id = ${userId} AND cp.challenge_id = ${challengeId}
    `
    if (participation.length === 0) {
      return res.status(404).json({ error: 'Join this challenge before logging progress' })
    }

    const row = participation[0]
    const nextProgress = Math.min(
      (row.progress_current || 0) + increment,
      row.target_value || (row.progress_current || 0) + increment
    )

    const updated = await sql`
      UPDATE challenge_participants
      SET progress_current = ${nextProgress}
      WHERE user_id = ${userId} AND challenge_id = ${challengeId}
      RETURNING *
    `

    const progressPct = row.target_value
      ? Math.min(100, Math.round((nextProgress / row.target_value) * 100))
      : 0

    res.json({
      progress_current: nextProgress,
      target_value: row.target_value,
      target_unit: row.target_unit,
      progress_pct: progressPct,
      participant: updated[0],
    })
  } catch (error) {
    console.error('Log challenge progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id/join', authMiddleware, async (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10)
    const userId = req.user.id

    const result = await sql`
      DELETE FROM challenge_participants
      WHERE user_id = ${userId} AND challenge_id = ${challengeId}
      RETURNING id
    `

    if (result.length === 0) {
      return res.status(404).json({ error: 'Participation not found' })
    }

    res.json({ message: 'Left challenge successfully' })
  } catch (error) {
    console.error('Leave challenge error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my-challenges', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.name,
        c.type,
        c.description,
        c.start_date,
        c.end_date,
        c.capacity,
        c.image_url,
        c.venue,
        c.city,
        c.target_value,
        c.target_unit,
        c.created_at,
        p.joined_at,
        p.progress_current,
        true AS is_joined,
        CASE
          WHEN c.target_value > 0 THEN LEAST(100, ROUND((COALESCE(p.progress_current, 0)::numeric / c.target_value) * 100))
          ELSE 0
        END AS progress_pct,
        (c.capacity - (
          SELECT COUNT(*)::int FROM challenge_participants cp WHERE cp.challenge_id = c.id
        )) AS spots_left
      FROM challenge_participants p
      JOIN challenges c ON p.challenge_id = c.id
      WHERE p.user_id = ${req.user.id}
      ORDER BY c.start_date ASC
    `
    res.json(result)
  } catch (error) {
    console.error('Get my challenges error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
