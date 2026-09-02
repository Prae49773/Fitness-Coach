import dotenv from 'dotenv'
import path from 'path'
import { sql } from './neon.js'
import { generateWorkoutPlan } from '../services/workoutPlanGenerator.js'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

function parseJson(value, fallback = null) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function scheduleFromExercises(exercises, planName = 'Workout') {
  const list = parseJson(exercises, [])
  if (!Array.isArray(list) || list.length === 0) return []

  const schedule = []
  let current = null

  for (const item of list) {
    if (typeof item === 'string' && item.startsWith('—')) {
      if (current) schedule.push(current)
      current = {
        day: item.replace(/^—\s*|\s*—$/g, '').trim(),
        exercises: [],
      }
    } else if (current && typeof item === 'string') {
      current.exercises.push(item)
    }
  }
  if (current) schedule.push(current)

  if (schedule.length > 0) return schedule

  return [{ day: planName, exercises: list.filter((item) => typeof item === 'string') }]
}

function isEmptySchedule(schedule) {
  const parsed = parseJson(schedule, null)
  return !Array.isArray(parsed) || parsed.length === 0
}

async function backfillWorkoutSchedules() {
  const plans = await sql`
    SELECT
      wp.*,
      u.weight,
      u.height,
      u.age,
      u.goal,
      u.exercise_type
    FROM workout_plans wp
    JOIN users u ON u.id = wp.user_id
    ORDER BY wp.created_at ASC
  `

  let updated = 0
  let skipped = 0

  for (const plan of plans) {
    if (!isEmptySchedule(plan.schedule)) {
      skipped++
      continue
    }

    const questionnaire = parseJson(plan.questionnaire, null)
    const user = {
      weight: plan.weight,
      height: plan.height,
      age: plan.age,
      goal: plan.goal,
      exercise_type: plan.exercise_type,
    }

    let schedule
    let exercises
    let summary
    let guidelines
    let planName = plan.plan_name

    if (questionnaire && typeof questionnaire === 'object' && Object.keys(questionnaire).length > 0) {
      const generated = generateWorkoutPlan(questionnaire, user)
      schedule = generated.schedule
      exercises = generated.exercises
      summary = generated.summary
      guidelines = generated.guidelines
      planName = generated.plan_name
    } else {
      schedule = scheduleFromExercises(plan.exercises, plan.plan_name)
      exercises = parseJson(plan.exercises, [])
      summary = parseJson(plan.summary, null)
      guidelines = parseJson(plan.guidelines, [])
    }

    if (!schedule.length) {
      console.warn(`Plan #${plan.id} (${plan.plan_name}): could not build schedule, skipping`)
      skipped++
      continue
    }

    await sql`
      UPDATE workout_plans
      SET
        plan_name = ${planName},
        exercises = ${JSON.stringify(exercises)},
        schedule = ${JSON.stringify(schedule)},
        summary = ${JSON.stringify(summary)},
        guidelines = ${JSON.stringify(guidelines)}
      WHERE id = ${plan.id}
    `

    console.log(`Updated plan #${plan.id} "${planName}" — ${schedule.length} days`)
    updated++
  }

  console.log(`\nBackfill complete: ${updated} updated, ${skipped} already had schedule or skipped.`)
}

backfillWorkoutSchedules().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
