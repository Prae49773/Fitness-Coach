import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { generateNutritionPlan } from '../services/nutritionPlanGenerator.js'

const router = express.Router()

router.get('/plans', optionalAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id ?? null

    const result = userId
      ? await sql`
          SELECT
            mp.*,
            EXISTS(
              SELECT 1 FROM user_meal_plans ump
              WHERE ump.meal_plan_id = mp.id AND ump.user_id = ${userId}
            ) AS is_active
          FROM meal_plans mp
          ORDER BY mp.daily_calories ASC
        `
      : await sql`
          SELECT mp.*, false AS is_active
          FROM meal_plans mp
          ORDER BY mp.daily_calories ASC
        `

    res.json(result)
  } catch (error) {
    console.error('Get meal plans error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/plans/:id/activate', authMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10)
    const userId = req.user.id

    if (Number.isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan id' })
    }

    const plans = await sql`SELECT * FROM meal_plans WHERE id = ${planId}`
    if (plans.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' })
    }

    const plan = plans[0]

    await sql`
      INSERT INTO user_meal_plans (user_id, meal_plan_id)
      VALUES (${userId}, ${planId})
      ON CONFLICT (user_id, meal_plan_id) DO NOTHING
    `

    await sql`
      INSERT INTO nutrition_recommendations (user_id, meal_plan, recommendations)
      VALUES (
        ${userId},
        ${JSON.stringify(plan.meals)},
        ${`Active plan: ${plan.name} — ${plan.daily_calories} cal/day`}
      )
    `

    res.json({ message: 'Meal plan activated', plan })
  } catch (error) {
    console.error('Activate meal plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/plans/:id/activate', authMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10)
    const userId = req.user.id

    const result = await sql`
      DELETE FROM user_meal_plans
      WHERE user_id = ${userId} AND meal_plan_id = ${planId}
      RETURNING id
    `

    if (result.length === 0) {
      return res.status(404).json({ error: 'Active plan not found' })
    }

    res.json({ message: 'Meal plan deactivated' })
  } catch (error) {
    console.error('Deactivate meal plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my-plans', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const result = await sql`
      SELECT
        mp.*,
        ump.started_at,
        true AS is_active,
        COALESCE((
          SELECT SUM(fl.calories)::int FROM food_logs fl
          WHERE fl.user_id = ${req.user.id}
            AND fl.meal_plan_id = mp.id
            AND fl.date = ${today}
        ), 0) AS calories_logged_today,
        COALESCE((
          SELECT json_agg(fl.meal_slot)
          FROM food_logs fl
          WHERE fl.user_id = ${req.user.id}
            AND fl.meal_plan_id = mp.id
            AND fl.date = ${today}
            AND fl.meal_slot IS NOT NULL
        ), '[]'::json) AS logged_slots
      FROM user_meal_plans ump
      JOIN meal_plans mp ON ump.meal_plan_id = mp.id
      WHERE ump.user_id = ${req.user.id}
      ORDER BY ump.started_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Get my meal plans error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/plans/:id/log-meal', authMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10)
    const userId = req.user.id
    const { slot } = req.body
    const today = new Date().toISOString().split('T')[0]

    if (Number.isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan id' })
    }
    if (!slot) {
      return res.status(400).json({ error: 'Meal slot is required' })
    }

    const active = await sql`
      SELECT 1 FROM user_meal_plans
      WHERE user_id = ${userId} AND meal_plan_id = ${planId}
    `
    if (active.length === 0) {
      return res.status(400).json({ error: 'Start this meal plan before logging meals' })
    }

    const existing = await sql`
      SELECT id FROM food_logs
      WHERE user_id = ${userId} AND meal_plan_id = ${planId}
        AND meal_slot = ${slot} AND date = ${today}
    `
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This meal is already logged for today' })
    }

    const plans = await sql`SELECT * FROM meal_plans WHERE id = ${planId}`
    if (plans.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' })
    }

    const plan = plans[0]
    const meals = Array.isArray(plan.meals) ? plan.meals : JSON.parse(plan.meals || '[]')
    const meal = meals.find((m) => m.slot === slot)
    if (!meal) {
      return res.status(400).json({ error: 'Unknown meal slot' })
    }

    const foodItem = `${meal.label}: ${meal.item}`
    const result = await sql`
      INSERT INTO food_logs (user_id, food_item, calories, date, meal_plan_id, meal_slot)
      VALUES (${userId}, ${foodItem}, ${meal.calories}, ${today}, ${planId}, ${slot})
      RETURNING *
    `

    const loggedToday = await sql`
      SELECT COALESCE(SUM(calories), 0)::int AS total
      FROM food_logs
      WHERE user_id = ${userId} AND meal_plan_id = ${planId} AND date = ${today}
    `

    res.status(201).json({
      log: result[0],
      calories_logged_today: loggedToday[0]?.total ?? 0,
      daily_target: plan.daily_calories,
    })
  } catch (error) {
    console.error('Log meal error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM nutrition_recommendations
      WHERE user_id = ${req.user.id} AND questionnaire IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (result.length === 0) return res.json(null)
    res.json(result[0])
  } catch (error) {
    console.error('Get latest nutrition error:', error)
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

    const users = await sql`SELECT weight, height, age, goal FROM users WHERE id = ${userId}`
    const user = users[0] || {}

    const generated = generateNutritionPlan(answers, user)

    const result = await sql`
      INSERT INTO nutrition_recommendations (
        user_id, meal_plan, recommendations, questionnaire,
        daily_calories, macros, guidelines, guidelines_source
      )
      VALUES (
        ${userId},
        ${JSON.stringify(generated.meal_plan)},
        ${generated.recommendations},
        ${JSON.stringify(generated.questionnaire)},
        ${generated.daily_calories},
        ${JSON.stringify(generated.macros)},
        ${JSON.stringify(generated.guidelines)},
        ${generated.guidelines_source}
      )
      RETURNING *
    `

    res.json(result[0])
  } catch (error) {
    console.error('Generate nutrition error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM nutrition_recommendations WHERE user_id = ${req.user.id} ORDER BY created_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Get nutrition history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
