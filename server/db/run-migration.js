import dotenv from 'dotenv'
import path from 'path'
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
