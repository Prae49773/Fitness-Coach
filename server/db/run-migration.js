import dotenv from 'dotenv'
import path from 'path'
import { pathToFileURL } from 'url'
import { sql, seedFitnessClasses, seedFitnessEvents, seedChallenges, seedMealPlans } from './neon.js'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

async function runMigration() {
  await sql`ALTER TABLE fitness_classes ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`
  await sql`ALTER TABLE fitness_classes ADD COLUMN IF NOT EXISTS description TEXT`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS class_bookings_user_class_unique ON class_bookings (user_id, class_id)`

  await sql`ALTER TABLE fitness_events ADD COLUMN IF NOT EXISTS capacity INTEGER`
  await sql`ALTER TABLE fitness_events ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`
  await sql`ALTER TABLE fitness_events ADD COLUMN IF NOT EXISTS location VARCHAR(255)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_user_event_unique ON event_registrations (user_id, event_id)`

  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS capacity INTEGER`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS type VARCHAR(50)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS challenge_participants_user_challenge_unique ON challenge_participants (user_id, challenge_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      goal VARCHAR(50) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      daily_calories INTEGER,
      meals JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS user_meal_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
      started_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_meal_plans_user_plan_unique ON user_meal_plans (user_id, meal_plan_id)`

  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS questionnaire JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS summary JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS guidelines JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS guidelines_source TEXT`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS questionnaire JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS daily_calories INTEGER`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS macros JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS guidelines JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS guidelines_source TEXT`

  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS schedule JSONB`
  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES workout_plans(id) ON DELETE SET NULL`
  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS day_label VARCHAR(255)`
  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS notes TEXT`

  // Create exercises and questionnaire tables, and seed with frontend constants
  await sql`
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      met NUMERIC,
      calories_per_hour INTEGER,
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      questions JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_questionnaire_responses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      questionnaire_id INTEGER REFERENCES questionnaires(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  try {
    const exercisesUrl = pathToFileURL(path.resolve(process.cwd(), 'src/data/exercises.js')).href
    const constantsUrl = pathToFileURL(path.resolve(process.cwd(), 'src/constants/workoutQuestions.js')).href
    const exercisesModule = await import(exercisesUrl)
    const constantsModule = await import(constantsUrl)
    const EXERCISES = exercisesModule.exercises || []
    const WORKOUT_QUESTIONS = constantsModule.WORKOUT_QUESTIONS || []

    for (const ex of EXERCISES) {
      const existing = await sql`SELECT id FROM exercises WHERE slug = ${ex.id}`
      const details = JSON.stringify(ex)
      if (existing.length > 0) {
        await sql`
          UPDATE exercises
          SET name = ${ex.name}, met = ${ex.met}, calories_per_hour = ${ex.calories_per_hour}, details = ${details}
          WHERE slug = ${ex.id}
        `
      } else {
        await sql`
          INSERT INTO exercises (slug, name, met, calories_per_hour, details)
          VALUES (${ex.id}, ${ex.name}, ${ex.met}, ${ex.calories_per_hour}, ${details})
        `
      }
    }

    // Seed a 10-question workout questionnaire (take first 10 from constants)
    const seedQuestions = WORKOUT_QUESTIONS.slice(0, 10)
    const qExisting = await sql`SELECT id FROM questionnaires WHERE slug = 'workout_questionnaire'`
    if (qExisting.length > 0) {
      await sql`
        UPDATE questionnaires SET title = 'Workout Questionnaire', questions = ${JSON.stringify(seedQuestions)} WHERE slug = 'workout_questionnaire'
      `
    } else {
      await sql`
        INSERT INTO questionnaires (slug, title, questions) VALUES ('workout_questionnaire', 'Workout Questionnaire', ${JSON.stringify(seedQuestions)})
      `
    }
  } catch (err) {
    console.warn('Seeding exercises/questionnaire failed:', err)
  }

  await sql`ALTER TABLE fitness_classes ADD COLUMN IF NOT EXISTS venue VARCHAR(255)`
  await sql`ALTER TABLE fitness_classes ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS venue VARCHAR(255)`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS target_value INTEGER`
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS target_unit VARCHAR(50)`
  await sql`ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS progress_current INTEGER DEFAULT 0`
  await sql`ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS macros JSONB`
  await sql`ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE SET NULL`
  await sql`ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS meal_slot VARCHAR(50)`

  await seedFitnessClasses()
  await seedFitnessEvents()
  await seedChallenges()
  await seedMealPlans()

  console.log('All migrations and seeds completed.')
}

runMigration().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
