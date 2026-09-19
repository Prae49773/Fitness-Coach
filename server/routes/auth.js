import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'
import { normalizeUserMetrics } from '../utils/normalizeUser.js'

const router = express.Router()

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key'

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, height, weight, exerciseType } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (!height || !weight || !exerciseType) {
      return res.status(400).json({ error: 'Height, weight, and exercise type are required' })
    }

    const parsedHeight = Number(height)
    const parsedWeight = Number(weight)
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0 || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ error: 'Height and weight must be positive numbers' })
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await sql`
      INSERT INTO users (email, password, name, height, weight, exercise_type, role, onboarding_completed)
      VALUES (${email}, ${hashedPassword}, ${name || null}, ${parsedHeight}, ${parsedWeight}, ${exerciseType}, 'user', false)
      RETURNING id, email, name, height, weight, exercise_type, role, onboarding_completed
    `

    const token = jwt.sign({ id: result[0].id, email: result[0].email, role: result[0].role }, getJwtSecret(), { expiresIn: '7d' })
    
    res.status(201).json({
      user: normalizeUserMetrics(result[0]),
      token,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`
    const user = result[0]
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), { expiresIn: '7d' })
    
    res.json({
      user: normalizeUserMetrics({
        id: user.id,
        email: user.email,
        name: user.name,
        weight: user.weight,
        height: user.height,
        age: user.age,
        goal: user.goal,
        exercise_type: user.exercise_type,
        role: user.role,
        onboarding_completed: user.onboarding_completed,
      }),
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    const { name, age } = req.body
    const userId = req.user.id

    if (!name || !age) {
      return res.status(400).json({ error: 'Full name and age are required' })
    }

    const result = await sql`
      UPDATE users 
      SET name = ${name}, age = ${age}, onboarding_completed = true, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, name, weight, height, age, goal, exercise_type, role, onboarding_completed
    `

    res.json({ user: normalizeUserMetrics(result[0]), message: 'Onboarding completed successfully' })
  } catch (error) {
    console.error('Onboarding error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
