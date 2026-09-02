import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'
import { generateWorkoutPlan } from '../services/workoutPlanGenerator.js'

const router = express.Router()

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM workout_plans
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (result.length === 0) return res.json(null)
    const plan = result[0]
    res.json({
      ...plan,
      exercises: plan.exercises,
      schedule: plan.schedule,
      summary: plan.summary,
      guidelines: plan.guidelines,
      questionnaire: plan.questionnaire,
    })
  } catch (error) {
    console.error('Get latest workout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body
    const userId = req.user.id

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Questionnaire answers are required' })
    }

    const users = await sql`SELECT weight, height, age, goal, exercise_type FROM users WHERE id = ${userId}`
    const user = users[0] || {}

    const generated = generateWorkoutPlan(answers, user)

    const result = await sql`
      INSERT INTO workout_plans (
        user_id, plan_name, exercises, schedule, questionnaire, summary, guidelines, guidelines_source
      )
      VALUES (
        ${userId},
        ${generated.plan_name},
        ${JSON.stringify(generated.exercises)},
        ${JSON.stringify(generated.schedule)},
        ${JSON.stringify(generated.questionnaire)},
        ${JSON.stringify(generated.summary)},
        ${JSON.stringify(generated.guidelines)},
        ${generated.guidelines_source}
      )
      RETURNING *
    `

    res.json({
      ...result[0],
      schedule: generated.schedule,
      summary: generated.summary,
      guidelines: generated.guidelines,
      questionnaire: generated.questionnaire,
    })
  } catch (error) {
    console.error('Generate workout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM workout_plans WHERE user_id = ${req.user.id} ORDER BY created_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Get workout history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
