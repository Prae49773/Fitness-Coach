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
            fc.id,
            fc.name,
            fc.type,
            fc.instructor,
            fc.schedule,
            fc.capacity,
            fc.image_url,
            fc.description,
            fc.venue,
            fc.city,
            fc.created_at,
            (fc.capacity - COUNT(cb.id))::int AS spots_left,
            COUNT(cb.id)::int AS booked_count,
            EXISTS(
              SELECT 1 FROM class_bookings ub
              WHERE ub.class_id = fc.id AND ub.user_id = ${userId}
            ) AS is_booked
          FROM fitness_classes fc
          LEFT JOIN class_bookings cb ON cb.class_id = fc.id
          GROUP BY fc.id
          ORDER BY fc.schedule ASC
        `
      : await sql`
          SELECT
            fc.id,
            fc.name,
            fc.type,
            fc.instructor,
            fc.schedule,
            fc.capacity,
            fc.image_url,
            fc.description,
            fc.venue,
            fc.city,
            fc.created_at,
            (fc.capacity - COUNT(cb.id))::int AS spots_left,
            COUNT(cb.id)::int AS booked_count,
            false AS is_booked
          FROM fitness_classes fc
          LEFT JOIN class_bookings cb ON cb.class_id = fc.id
          GROUP BY fc.id
          ORDER BY fc.schedule ASC
        `

    res.json(result)
  } catch (error) {
    console.error('Get classes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/book', authMiddleware, async (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10)
    const userId = req.user.id

    if (Number.isNaN(classId)) {
      return res.status(400).json({ error: 'Invalid class id' })
    }

    const classes = await sql`SELECT * FROM fitness_classes WHERE id = ${classId}`
    if (classes.length === 0) {
      return res.status(404).json({ error: 'Class not found' })
    }

    const existing = await sql`
      SELECT id FROM class_bookings
      WHERE user_id = ${userId} AND class_id = ${classId}
    `
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already booked this class' })
    }

    const booked = await sql`
      SELECT COUNT(*)::int AS count FROM class_bookings WHERE class_id = ${classId}
    `
    const spotsLeft = classes[0].capacity - booked[0].count
    if (spotsLeft <= 0) {
      return res.status(400).json({ error: 'This class is full' })
    }

    await sql`
      INSERT INTO class_bookings (user_id, class_id)
      VALUES (${userId}, ${classId})
    `

    res.json({ message: 'Class booked successfully' })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'You have already booked this class' })
    }
    console.error('Book class error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id/book', authMiddleware, async (req, res) => {
  try {
    const classId = parseInt(req.params.id, 10)
    const userId = req.user.id

    const result = await sql`
      DELETE FROM class_bookings
      WHERE user_id = ${userId} AND class_id = ${classId}
      RETURNING id
    `

    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    res.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Cancel booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.name,
        c.type,
        c.instructor,
        c.schedule,
        c.capacity,
        c.image_url,
        c.description,
        c.venue,
        c.city,
        c.created_at,
        b.booked_at,
        true AS is_booked,
        (c.capacity - (
          SELECT COUNT(*)::int FROM class_bookings cb WHERE cb.class_id = c.id
        )) AS spots_left
      FROM class_bookings b
      JOIN fitness_classes c ON b.class_id = c.id
      WHERE b.user_id = ${req.user.id}
      ORDER BY c.schedule ASC
    `
    res.json(result)
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
