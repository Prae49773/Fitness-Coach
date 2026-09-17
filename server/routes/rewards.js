import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/catalog', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM rewards_catalog ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    console.error('Get catalog error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const pointsRow = await sql`SELECT points, xp, level FROM user_points WHERE user_id = ${req.user.id}`
    const trans = await sql`SELECT t.*, r.title, r.description FROM user_transactions t LEFT JOIN rewards_catalog r ON r.id = t.reward_id WHERE t.user_id = ${req.user.id} ORDER BY t.created_at DESC`
    res.json({ points: pointsRow[0] || { points: 0, xp: 0, level: 1 }, transactions: trans })
  } catch (err) {
    console.error('Get my rewards error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/redeem', authMiddleware, async (req, res) => {
  try {
    const { reward_id } = req.body
    const reward = (await sql`SELECT * FROM rewards_catalog WHERE id = ${reward_id}`)[0]
    if (!reward) return res.status(404).json({ error: 'Reward not found' })

    const pointsRow = (await sql`SELECT * FROM user_points WHERE user_id = ${req.user.id}`)[0]
    const currentPoints = pointsRow?.points ?? 0
    if (currentPoints < reward.cost_points) return res.status(400).json({ error: 'Insufficient points' })

    await sql`UPDATE user_points SET points = points - ${reward.cost_points}, updated_at = NOW() WHERE user_id = ${req.user.id}`
    const tx = await sql`INSERT INTO user_transactions (user_id, reward_id, points_used, status, details) VALUES (${req.user.id}, ${reward_id}, ${reward.cost_points}, 'completed', ${JSON.stringify({ benefit: reward.benefit })}) RETURNING *`
    res.json(tx[0])
  } catch (err) {
    console.error('Redeem error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
