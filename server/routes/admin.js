import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/users', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT id, email, name, role, onboarding_completed, created_at FROM users ORDER BY created_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/actions', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM user_actions ORDER BY created_at DESC LIMIT 100`
    res.json(result)
  } catch (error) {
    console.error('Get actions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const users = await sql`SELECT COUNT(*) as total_users FROM users`
    const activeUsers = await sql`SELECT COUNT(*) as active_users FROM users WHERE onboarding_completed = true`
    const actions = await sql`SELECT COUNT(*) as total_actions FROM user_actions`
    
    res.json({
      totalUsers: parseInt(users[0].total_users),
      activeUsers: parseInt(activeUsers[0].active_users),
      totalActions: parseInt(actions[0].total_actions)
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/users/:id/role', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    await sql`UPDATE users SET role = ${role} WHERE id = ${id}`
    res.json({ message: 'Role updated successfully' })
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
