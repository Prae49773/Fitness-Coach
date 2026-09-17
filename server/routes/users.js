import express from 'express'
import { sql } from '../db/neon.js'
import { authMiddleware } from '../middleware/auth.js'
import { normalizeUserMetrics } from '../utils/normalizeUser.js'

const router = express.Router()

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const [profile, workoutStats, weekCalories, weeklyChart, counts, progress, nutritionToday] = await Promise.all([
      sql`SELECT weight, height, age, goal, name FROM users WHERE id = ${userId}`,
      sql`
        SELECT
          COUNT(*)::int AS workouts_this_month,
          COALESCE(SUM(calories_burned), 0)::int AS calories_this_month
        FROM exercise_logs
        WHERE user_id = ${userId}
          AND date >= date_trunc('month', CURRENT_DATE)
      `,
      sql`
        SELECT COALESCE(SUM(calories_burned), 0)::int AS total
        FROM exercise_logs
        WHERE user_id = ${userId}
          AND date >= CURRENT_DATE - INTERVAL '6 days'
      `,
      sql`
        SELECT
          to_char(d::date, 'Dy') AS date,
          COALESCE(SUM(el.calories_burned), 0)::int AS calories
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d
        LEFT JOIN exercise_logs el
          ON el.date = d::date AND el.user_id = ${userId}
        GROUP BY d::date
        ORDER BY d::date
      `,
      sql`
        SELECT
          (SELECT COUNT(*)::int FROM class_bookings WHERE user_id = ${userId}) AS class_bookings,
          (SELECT COUNT(*)::int FROM event_registrations WHERE user_id = ${userId}) AS event_registrations,
          (SELECT COUNT(*)::int FROM challenge_participants WHERE user_id = ${userId}) AS challenges_joined,
          (SELECT COUNT(*)::int FROM user_meal_plans WHERE user_id = ${userId}) AS active_meal_plans
      `,
      sql`
        SELECT weight, bmi, calories_burned, recorded_at
        FROM progress_metrics
        WHERE user_id = ${userId}
        ORDER BY recorded_at ASC
        LIMIT 12
      `,
      sql`
        SELECT COALESCE(SUM(calories), 0)::int AS total
        FROM food_logs
        WHERE user_id = ${userId} AND date = CURRENT_DATE
      `,
    ])

    const user = profile[0] || {}
    const weightChart = progress.length > 0
      ? progress.map((row, i) => ({
          date: `W${i + 1}`,
          weight: Number(row.weight),
        }))
      : user.weight
        ? [{ date: 'Now', weight: Number(user.weight) }]
        : []

    res.json({
      profile: normalizeUserMetrics(user),
      workouts_this_month: workoutStats[0]?.workouts_this_month ?? 0,
      calories_this_month: workoutStats[0]?.calories_this_month ?? 0,
      calories_this_week: weekCalories[0]?.total ?? 0,
      calories_consumed_today: nutritionToday[0]?.total ?? 0,
      weekly_calories_chart: weeklyChart,
      weight_chart: weightChart,
      class_bookings: counts[0]?.class_bookings ?? 0,
      event_registrations: counts[0]?.event_registrations ?? 0,
      challenges_joined: counts[0]?.challenges_joined ?? 0,
      active_meal_plans: counts[0]?.active_meal_plans ?? 0,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, email, name, weight, height, age, goal, exercise_type, role, onboarding_completed
      FROM users WHERE id = ${req.user.id}
    `
    if (!result[0]) return res.status(404).json({ error: 'User not found' })
    res.json(normalizeUserMetrics(result[0]))
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, weight, height, age, goal } = req.body
    const result = await sql`
      UPDATE users SET
        name = COALESCE(${name ?? null}, name),
        weight = COALESCE(${weight ?? null}, weight),
        height = COALESCE(${height ?? null}, height),
        age = COALESCE(${age ?? null}, age),
        goal = COALESCE(${goal ?? null}, goal),
        updated_at = NOW()
      WHERE id = ${req.user.id}
      RETURNING id, email, name, weight, height, age, goal, exercise_type, role, onboarding_completed
    `
    if (!result[0]) return res.status(404).json({ error: 'User not found' })
    res.json(normalizeUserMetrics(result[0]))
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/food-logs', authMiddleware, async (req, res) => {
  try {
    const { food_item, calories, date } = req.body
    const result = await sql`
      INSERT INTO food_logs (user_id, food_item, calories, date)
      VALUES (${req.user.id}, ${food_item}, ${calories}, ${date || new Date().toISOString().split('T')[0]})
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Food log error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/food-logs', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM food_logs WHERE user_id = ${req.user.id} ORDER BY date DESC, created_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Get food logs error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/exercise-logs', authMiddleware, async (req, res) => {
  try {
    const { exercise_type, duration, calories_burned, date, plan_id, day_label, notes } = req.body
    const result = await sql`
      INSERT INTO exercise_logs (
        user_id, exercise_type, duration, calories_burned, date, plan_id, day_label, notes
      )
      VALUES (
        ${req.user.id},
        ${exercise_type},
        ${duration},
        ${calories_burned},
        ${date || new Date().toISOString().split('T')[0]},
        ${plan_id || null},
        ${day_label || null},
        ${notes || null}
      )
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Exercise log error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/exercise-logs', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT el.*, wp.plan_name
      FROM exercise_logs el
      LEFT JOIN workout_plans wp ON el.plan_id = wp.id
      WHERE el.user_id = ${req.user.id}
      ORDER BY el.date DESC, el.created_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Get exercise logs error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM progress_metrics WHERE user_id = ${req.user.id} ORDER BY recorded_at DESC`
    res.json(result)
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { weight, bmi, calories_burned } = req.body
    const result = await sql`
      INSERT INTO progress_metrics (user_id, weight, bmi, calories_burned)
      VALUES (${req.user.id}, ${weight}, ${bmi}, ${calories_burned})
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Add progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/workout-progress', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT *
      FROM workout_progress
      WHERE user_id = ${req.user.id}
      ORDER BY recorded_on DESC, created_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Get workout progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/workout-progress', authMiddleware, async (req, res) => {
  try {
    const { exercise_name, category, sets, reps, weight_kg, duration_minutes, calories_burned, notes, recorded_on } = req.body
    const result = await sql`
      INSERT INTO workout_progress (
        user_id, exercise_name, category, sets, reps, weight_kg, duration_minutes, calories_burned, notes, recorded_on
      )
      VALUES (
        ${req.user.id},
        ${exercise_name},
        ${category || null},
        ${sets ?? null},
        ${reps ?? null},
        ${weight_kg ?? null},
        ${duration_minutes ?? null},
        ${calories_burned ?? null},
        ${notes || null},
        ${recorded_on || new Date().toISOString().split('T')[0]}
      )
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Add workout progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/workout-schedule', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT *
      FROM workout_schedules
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Get workout schedule error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/workout-schedule', authMiddleware, async (req, res) => {
  try {
    const { day_of_week, time_of_day, workout_name, workout_type, duration_minutes, sets, reps, rest_minutes, notes, is_active } = req.body
    const result = await sql`
      INSERT INTO workout_schedules (
        user_id, day_of_week, time_of_day, workout_name, workout_type, duration_minutes, sets, reps, rest_minutes, notes, is_active
      )
      VALUES (
        ${req.user.id},
        ${day_of_week},
        ${time_of_day},
        ${workout_name},
        ${workout_type || null},
        ${duration_minutes ?? null},
        ${sets ?? null},
        ${reps ?? null},
        ${rest_minutes ?? null},
        ${notes || null},
        ${is_active ?? true}
      )
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Add workout schedule error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/workout-schedule/:id', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM workout_schedules
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING *
    `
    if (!result[0]) return res.status(404).json({ error: 'Schedule not found' })
    res.status(204).send()
  } catch (error) {
    console.error('Delete workout schedule error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/workout-reviews', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT *
      FROM workout_reviews
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Get workout reviews error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/workout-reviews', authMiddleware, async (req, res) => {
  try {
    const { workout_name, rating, comment } = req.body
    const result = await sql`
      INSERT INTO workout_reviews (user_id, workout_name, rating, comment)
      VALUES (${req.user.id}, ${workout_name}, ${rating}, ${comment || null})
      RETURNING *
    `
    res.status(201).json(result[0])
  } catch (error) {
    console.error('Add workout review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/workout-reviews/:id', authMiddleware, async (req, res) => {
  try {
    const { workout_name, rating, comment } = req.body
    const result = await sql`
      UPDATE workout_reviews
      SET workout_name = COALESCE(${workout_name ?? null}, workout_name),
          rating = COALESCE(${rating ?? null}, rating),
          comment = COALESCE(${comment ?? null}, comment),
          updated_at = NOW()
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING *
    `
    if (!result[0]) return res.status(404).json({ error: 'Review not found' })
    res.json(result[0])
  } catch (error) {
    console.error('Update workout review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/workout-reviews/:id', authMiddleware, async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM workout_reviews
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
      RETURNING *
    `
    if (!result[0]) return res.status(404).json({ error: 'Review not found' })
    res.status(204).send()
  } catch (error) {
    console.error('Delete workout review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
