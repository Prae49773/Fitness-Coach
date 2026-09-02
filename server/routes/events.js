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
            fe.id,
            fe.name,
            fe.type,
            fe.description,
            fe.event_date,
            fe.capacity,
            fe.image_url,
            fe.location,
            fe.created_at,
            (fe.capacity - COUNT(er.id))::int AS spots_left,
            COUNT(er.id)::int AS registered_count,
            EXISTS(
              SELECT 1 FROM event_registrations ur
              WHERE ur.event_id = fe.id AND ur.user_id = ${userId}
            ) AS is_registered
          FROM fitness_events fe
          LEFT JOIN event_registrations er ON er.event_id = fe.id
          GROUP BY fe.id
          ORDER BY fe.event_date ASC
        `
      : await sql`
          SELECT
            fe.id,
            fe.name,
            fe.type,
            fe.description,
            fe.event_date,
            fe.capacity,
            fe.image_url,
            fe.location,
            fe.created_at,
            (fe.capacity - COUNT(er.id))::int AS spots_left,
            COUNT(er.id)::int AS registered_count,
            false AS is_registered
          FROM fitness_events fe
          LEFT JOIN event_registrations er ON er.event_id = fe.id
          GROUP BY fe.id
          ORDER BY fe.event_date ASC
        `

    res.json(result)
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10)
    const userId = req.user.id

    if (Number.isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event id' })
    }

    const events = await sql`SELECT * FROM fitness_events WHERE id = ${eventId}`
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const existing = await sql`
      SELECT id FROM event_registrations
      WHERE user_id = ${userId} AND event_id = ${eventId}
    `
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already registered for this event' })
    }

    const registered = await sql`
      SELECT COUNT(*)::int AS count FROM event_registrations WHERE event_id = ${eventId}
    `
    const spotsLeft = events[0].capacity - registered[0].count
    if (spotsLeft <= 0) {
      return res.status(400).json({ error: 'This event is full' })
    }

    await sql`
      INSERT INTO event_registrations (user_id, event_id)
      VALUES (${userId}, ${eventId})
    `

    res.json({ message: 'Registered for event successfully' })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'You are already registered for this event' })
    }
    console.error('Register for event error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id/register', authMiddleware, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10)
    const userId = req.user.id

    const result = await sql`
      DELETE FROM event_registrations
      WHERE user_id = ${userId} AND event_id = ${eventId}
      RETURNING id
    `

    if (result.length === 0) {
      return res.status(404).json({ error: 'Registration not found' })
    }

    res.json({ message: 'Registration cancelled successfully' })
  } catch (error) {
    console.error('Cancel registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my-registrations', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT
        e.id,
        e.name,
        e.type,
        e.description,
        e.event_date,
        e.capacity,
        e.image_url,
        e.location,
        e.created_at,
        r.registered_at,
        true AS is_registered,
        (e.capacity - (
          SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id
        )) AS spots_left
      FROM event_registrations r
      JOIN fitness_events e ON r.event_id = e.id
      WHERE r.user_id = ${req.user.id}
      ORDER BY e.event_date ASC
    `
    res.json(result)
  } catch (error) {
    console.error('Get registrations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
