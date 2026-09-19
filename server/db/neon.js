import dotenv from 'dotenv'
import path from 'path'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: path.resolve(process.cwd(), 'env.env') })
dotenv.config()

const connectionString =
  process.env.NEON_DB ||
  process.env.DATABASE_URL ||
  process.env.VITE_NEON_DATABASE_URL

export const sql = connectionString ? neon(connectionString) : neon()

export async function initDatabase() {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      weight DECIMAL(5,2),
      height DECIMAL(5,2),
      age INTEGER,
      goal VARCHAR(255),
      exercise_type VARCHAR(50),
      gender VARCHAR(20),
      city VARCHAR(100),
      role VARCHAR(20) DEFAULT 'user',
      onboarding_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS goal VARCHAR(255)
  `

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(50)
  `

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20)
  `

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS city VARCHAR(100)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS food_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      food_item VARCHAR(255) NOT NULL,
      calories INTEGER,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      exercise_type VARCHAR(100) NOT NULL,
      duration INTEGER,
      calories_burned INTEGER,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      plan_name VARCHAR(255),
      exercises JSONB,
      questionnaire JSONB,
      summary JSONB,
      guidelines JSONB,
      guidelines_source TEXT,
      generated_by VARCHAR(20) DEFAULT 'ai',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS questionnaire JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS summary JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS guidelines JSONB`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS guidelines_source TEXT`
  await sql`ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS schedule JSONB`

  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES workout_plans(id) ON DELETE SET NULL`
  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS day_label VARCHAR(255)`
  await sql`ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS notes TEXT`

  await sql`
    CREATE TABLE IF NOT EXISTS nutrition_recommendations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      meal_plan JSONB,
      recommendations TEXT,
      questionnaire JSONB,
      daily_calories INTEGER,
      macros JSONB,
      guidelines JSONB,
      guidelines_source TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS questionnaire JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS daily_calories INTEGER`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS macros JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS guidelines JSONB`
  await sql`ALTER TABLE nutrition_recommendations ADD COLUMN IF NOT EXISTS guidelines_source TEXT`

  await sql`
    CREATE TABLE IF NOT EXISTS fitness_classes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      instructor VARCHAR(255),
      schedule TIMESTAMP,
      capacity INTEGER,
      image_url VARCHAR(500),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE fitness_classes
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
  `

  await sql`
    ALTER TABLE fitness_classes
    ADD COLUMN IF NOT EXISTS description TEXT
  `

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

  await sql`
    CREATE TABLE IF NOT EXISTS class_bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      class_id INTEGER REFERENCES fitness_classes(id) ON DELETE CASCADE,
      booked_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS class_bookings_user_class_unique
    ON class_bookings (user_id, class_id)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS fitness_events (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      event_date TIMESTAMP,
      capacity INTEGER,
      image_url VARCHAR(500),
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE fitness_events
    ADD COLUMN IF NOT EXISTS capacity INTEGER
  `

  await sql`
    ALTER TABLE fitness_events
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
  `

  await sql`
    ALTER TABLE fitness_events
    ADD COLUMN IF NOT EXISTS location VARCHAR(255)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER REFERENCES fitness_events(id) ON DELETE CASCADE,
      registered_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_user_event_unique
    ON event_registrations (user_id, event_id)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      capacity INTEGER,
      image_url VARCHAR(500),
      type VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE challenges
    ADD COLUMN IF NOT EXISTS capacity INTEGER
  `

  await sql`
    ALTER TABLE challenges
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
  `

  await sql`
    ALTER TABLE challenges
    ADD COLUMN IF NOT EXISTS type VARCHAR(50)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS challenge_participants_user_challenge_unique
    ON challenge_participants (user_id, challenge_id)
  `

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

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS user_meal_plans_user_plan_unique
    ON user_meal_plans (user_id, meal_plan_id)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_actions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      action_type VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS progress_metrics (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      weight DECIMAL(5,2),
      bmi DECIMAL(4,2),
      calories_burned INTEGER,
      recorded_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      seasonal BOOLEAN DEFAULT FALSE,
      season_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      awarded_at TIMESTAMP DEFAULT NOW(),
      verified BOOLEAN DEFAULT FALSE
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS rewards_catalog (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      cost_points INTEGER NOT NULL DEFAULT 0,
      benefit JSONB,
      stock INTEGER DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_points (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      points INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reward_id INTEGER REFERENCES rewards_catalog(id) ON DELETE SET NULL,
      points_used INTEGER,
      status VARCHAR(50) DEFAULT 'pending',
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_follows (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS workout_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      exercise_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      sets INTEGER,
      reps INTEGER,
      weight_kg DECIMAL(6,2),
      duration_minutes INTEGER,
      calories_burned INTEGER,
      notes TEXT,
      recorded_on DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS workout_schedules (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      day_of_week VARCHAR(20) NOT NULL,
      time_of_day VARCHAR(20) NOT NULL,
      workout_name VARCHAR(255) NOT NULL,
      workout_type VARCHAR(100),
      duration_minutes INTEGER,
      sets INTEGER,
      reps INTEGER,
      rest_minutes INTEGER,
      notes TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS workout_reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      workout_name VARCHAR(255) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `

  await seedFitnessClasses()
  await seedFitnessEvents()
  await seedChallenges()
  await seedMealPlans()

  const userCount = await sql`SELECT COUNT(*) as count FROM users`
  if (parseInt(userCount[0].count) === 0) {
    const { default: bcrypt } = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await sql`
      INSERT INTO users (email, password, name, role, onboarding_completed) VALUES
      ('admin@fitai.com', ${hashedPassword}, 'Admin User', 'admin', true)
    `
  }

  console.log('Database initialized and seeded successfully')
}

const VENUE = { venue: 'Central Rama 2 Gym', city: 'Bangkok', location: 'Central Rama 2 Gym, Bangkok' }

const FITNESS_CLASSES = [
  {
    name: 'Morning Yoga',
    type: 'yoga',
    instructor: 'Sarah Johnson',
    schedule: '2026-09-15 08:00:00',
    capacity: 20,
    image_url: '/images/classes/morning-yoga.jpg',
    description: 'Start your day with gentle flows and breathwork. All levels welcome.',
    ...VENUE,
  },
  {
    name: 'HIIT Cardio',
    type: 'cardio',
    instructor: 'Mike Chen',
    schedule: '2026-09-15 10:00:00',
    capacity: 15,
    image_url: '/images/classes/hiit-cardio.jpg',
    description: 'High-intensity intervals to boost endurance and burn calories fast.',
    ...VENUE,
  },
  {
    name: 'Strength Training',
    type: 'strength',
    instructor: 'Alex Rivera',
    schedule: '2026-09-15 14:00:00',
    capacity: 10,
    image_url: '/images/classes/strength-training.jpg',
    description: 'Build muscle with compound lifts, form coaching, and progressive overload.',
    ...VENUE,
  },
  {
    name: 'Evening Yoga',
    type: 'yoga',
    instructor: 'Emma Wilson',
    schedule: '2026-09-15 18:00:00',
    capacity: 20,
    image_url: '/images/classes/evening-yoga.jpg',
    description: 'Wind down with restorative poses and guided relaxation after work.',
    ...VENUE,
  },
]

export async function seedFitnessClasses() {
  for (const cls of FITNESS_CLASSES) {
    const existing = await sql`SELECT id FROM fitness_classes WHERE name = ${cls.name}`
    if (existing.length > 0) {
      await sql`
        UPDATE fitness_classes
        SET type = ${cls.type},
            instructor = ${cls.instructor},
            schedule = ${cls.schedule},
            capacity = ${cls.capacity},
            image_url = ${cls.image_url},
            description = ${cls.description},
            venue = ${cls.venue},
            city = ${cls.city}
        WHERE name = ${cls.name}
      `
    } else {
      await sql`
        INSERT INTO fitness_classes (name, type, instructor, schedule, capacity, image_url, description, venue, city)
        VALUES (${cls.name}, ${cls.type}, ${cls.instructor}, ${cls.schedule}, ${cls.capacity}, ${cls.image_url}, ${cls.description}, ${cls.venue}, ${cls.city})
      `
    }
  }
}

const FITNESS_EVENTS = [
  {
    name: 'Marathon Training',
    type: 'event',
    description: 'Prepare for the city marathon with expert coaches. 12-week progressive program with group long runs.',
    event_date: '2026-10-05 07:00:00',
    capacity: 50,
    image_url: '/images/events/marathon-training.jpg',
    location: VENUE.location,
  },
  {
    name: 'Summer Body Bootcamp',
    type: 'event',
    description: 'Intensive 2-week outdoor training program on the gym rooftop track. Full-body workouts and nutrition guidance.',
    event_date: '2026-09-20 06:30:00',
    capacity: 30,
    image_url: '/images/events/summer-bootcamp.jpg',
    location: VENUE.location,
  },
  {
    name: 'Yoga Retreat',
    type: 'event',
    description: 'A relaxing weekend yoga intensive at our Bangkok studio. Meditation, breathwork, and restorative sessions.',
    event_date: '2026-11-08 09:00:00',
    capacity: 25,
    image_url: '/images/events/yoga-retreat.jpg',
    location: VENUE.location,
  },
  {
    name: 'New Year Fitness Kickoff',
    type: 'challenge',
    description: 'Start the year strong with our 30-day community fitness challenge. Daily workouts and group support.',
    event_date: '2027-01-01 08:00:00',
    capacity: 100,
    image_url: '/images/events/new-year-fitness.jpg',
    location: VENUE.location,
  },
]

const CHALLENGES = [
  {
    name: '30-Day Step Challenge',
    type: 'steps',
    description: 'Walk 10,000 steps every day for 30 days. Track progress and compete on the leaderboard at Central Rama 2.',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    capacity: 200,
    image_url: '/images/challenges/step-challenge.jpg',
    target_value: 300000,
    target_unit: 'steps',
    ...VENUE,
  },
  {
    name: 'Plank Challenge',
    type: 'core',
    description: 'Hold a plank for 5 minutes total daily. Build core strength with progressive daily targets.',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    capacity: 150,
    image_url: '/images/challenges/plank-challenge.jpg',
    target_value: 9000,
    target_unit: 'seconds',
    ...VENUE,
  },
  {
    name: '100 Push-ups Challenge',
    type: 'strength',
    description: 'Build up to 100 push-ups in a single session over 30 days with structured progression.',
    start_date: '2026-11-01',
    end_date: '2026-11-30',
    capacity: 120,
    image_url: '/images/challenges/pushups-challenge.jpg',
    target_value: 3000,
    target_unit: 'push-ups',
    ...VENUE,
  },
  {
    name: 'Run a 5K',
    type: 'cardio',
    description: 'Complete a 5K run under 30 minutes on the Central Rama 2 track. Training plan included.',
    start_date: '2026-12-01',
    end_date: '2026-12-31',
    capacity: 100,
    image_url: '/images/challenges/run-5k.jpg',
    target_value: 5000,
    target_unit: 'meters',
    ...VENUE,
  },
]

const MEAL_PLANS = [
  {
    name: 'Weight Loss Plan',
    goal: 'weight-loss',
    description: 'Calorie-conscious meals focused on lean protein, fiber, and steady energy throughout the day.',
    image_url: '/images/nutrition/weight-loss-plan.jpg',
    daily_calories: 1800,
    macros: { protein_g: 135, carbs_g: 180, fat_g: 60 },
    meals: [
      { slot: 'breakfast', label: 'Breakfast', item: 'Oatmeal with berries & chia', calories: 380, protein_g: 14, carbs_g: 58, fat_g: 9 },
      { slot: 'lunch', label: 'Lunch', item: 'Grilled chicken salad with olive oil', calories: 520, protein_g: 42, carbs_g: 28, fat_g: 22 },
      { slot: 'snack', label: 'Snack', item: 'Apple with almond butter', calories: 220, protein_g: 6, carbs_g: 28, fat_g: 10 },
      { slot: 'dinner', label: 'Dinner', item: 'Steamed vegetables with baked fish', calories: 480, protein_g: 38, carbs_g: 32, fat_g: 16 },
    ],
  },
  {
    name: 'Muscle Gain Plan',
    goal: 'muscle-gain',
    description: 'High-protein meals to support muscle growth with balanced carbs and healthy fats.',
    image_url: '/images/nutrition/muscle-gain-plan.jpg',
    daily_calories: 2800,
    macros: { protein_g: 200, carbs_g: 280, fat_g: 85 },
    meals: [
      { slot: 'breakfast', label: 'Breakfast', item: '4 eggs, whole grain toast & avocado', calories: 620, protein_g: 38, carbs_g: 42, fat_g: 28 },
      { slot: 'lunch', label: 'Lunch', item: 'Chicken breast with jasmine rice', calories: 780, protein_g: 58, carbs_g: 88, fat_g: 18 },
      { slot: 'snack', label: 'Snack', item: 'Whey protein shake with banana', calories: 420, protein_g: 40, carbs_g: 48, fat_g: 6 },
      { slot: 'dinner', label: 'Dinner', item: 'Steak with sweet potato & greens', calories: 820, protein_g: 52, carbs_g: 62, fat_g: 32 },
    ],
  },
  {
    name: 'Maintenance Plan',
    goal: 'maintenance',
    description: 'Balanced everyday nutrition to maintain your current weight and energy levels.',
    image_url: '/images/nutrition/maintenance-plan.jpg',
    daily_calories: 2200,
    macros: { protein_g: 150, carbs_g: 240, fat_g: 75 },
    meals: [
      { slot: 'breakfast', label: 'Breakfast', item: 'Greek yogurt with granola & honey', calories: 450, protein_g: 28, carbs_g: 58, fat_g: 12 },
      { slot: 'lunch', label: 'Lunch', item: 'Turkey sandwich on whole wheat', calories: 580, protein_g: 36, carbs_g: 62, fat_g: 18 },
      { slot: 'snack', label: 'Snack', item: 'Mixed nuts & dried fruit', calories: 280, protein_g: 10, carbs_g: 22, fat_g: 18 },
      { slot: 'dinner', label: 'Dinner', item: 'Pasta with vegetables & parmesan', calories: 720, protein_g: 28, carbs_g: 88, fat_g: 24 },
    ],
  },
  {
    name: 'Endurance Plan',
    goal: 'endurance',
    description: 'Carb-focused fueling for runners and endurance athletes with optimal recovery meals.',
    image_url: '/images/nutrition/endurance-plan.jpg',
    daily_calories: 2600,
    macros: { protein_g: 130, carbs_g: 340, fat_g: 70 },
    meals: [
      { slot: 'breakfast', label: 'Breakfast', item: 'Banana peanut butter toast & coffee', calories: 480, protein_g: 16, carbs_g: 72, fat_g: 14 },
      { slot: 'lunch', label: 'Lunch', item: 'Quinoa bowl with black beans & corn', calories: 640, protein_g: 28, carbs_g: 98, fat_g: 16 },
      { slot: 'snack', label: 'Snack', item: 'Energy bar & electrolyte drink', calories: 320, protein_g: 12, carbs_g: 58, fat_g: 6 },
      { slot: 'dinner', label: 'Dinner', item: 'Pasta with lean chicken & marinara', calories: 820, protein_g: 48, carbs_g: 98, fat_g: 22 },
    ],
  },
]

export async function seedFitnessEvents() {
  for (const event of FITNESS_EVENTS) {
    const existing = await sql`SELECT id FROM fitness_events WHERE name = ${event.name}`
    if (existing.length > 0) {
      await sql`
        UPDATE fitness_events
        SET type = ${event.type},
            description = ${event.description},
            event_date = ${event.event_date},
            capacity = ${event.capacity},
            image_url = ${event.image_url},
            location = ${event.location}
        WHERE name = ${event.name}
      `
    } else {
      await sql`
        INSERT INTO fitness_events (name, type, description, event_date, capacity, image_url, location)
        VALUES (${event.name}, ${event.type}, ${event.description}, ${event.event_date}, ${event.capacity}, ${event.image_url}, ${event.location})
      `
    }
  }

  const keepNames = FITNESS_EVENTS.map((e) => e.name)
  await sql`
    DELETE FROM event_registrations
    WHERE event_id IN (
      SELECT id FROM fitness_events WHERE name NOT IN (${keepNames[0]}, ${keepNames[1]}, ${keepNames[2]}, ${keepNames[3]})
    )
  `
  await sql`
    DELETE FROM fitness_events
    WHERE name NOT IN (${keepNames[0]}, ${keepNames[1]}, ${keepNames[2]}, ${keepNames[3]})
  `
}

export async function seedChallenges() {
  for (const challenge of CHALLENGES) {
    const existing = await sql`SELECT id FROM challenges WHERE name = ${challenge.name}`
    if (existing.length > 0) {
      await sql`
        UPDATE challenges
        SET type = ${challenge.type},
            description = ${challenge.description},
            start_date = ${challenge.start_date},
            end_date = ${challenge.end_date},
            capacity = ${challenge.capacity},
            image_url = ${challenge.image_url},
            venue = ${challenge.venue},
            city = ${challenge.city},
            target_value = ${challenge.target_value},
            target_unit = ${challenge.target_unit}
        WHERE name = ${challenge.name}
      `
    } else {
      await sql`
        INSERT INTO challenges (name, type, description, start_date, end_date, capacity, image_url, venue, city, target_value, target_unit)
        VALUES (${challenge.name}, ${challenge.type}, ${challenge.description}, ${challenge.start_date}, ${challenge.end_date}, ${challenge.capacity}, ${challenge.image_url}, ${challenge.venue}, ${challenge.city}, ${challenge.target_value}, ${challenge.target_unit})
      `
    }
  }

  const keepNames = CHALLENGES.map((c) => c.name)
  await sql`
    DELETE FROM challenge_participants
    WHERE challenge_id IN (
      SELECT id FROM challenges WHERE name NOT IN (${keepNames[0]}, ${keepNames[1]}, ${keepNames[2]}, ${keepNames[3]})
    )
  `
  await sql`
    DELETE FROM challenges
    WHERE name NOT IN (${keepNames[0]}, ${keepNames[1]}, ${keepNames[2]}, ${keepNames[3]})
  `
}

export async function seedMealPlans() {
  for (const plan of MEAL_PLANS) {
    const existing = await sql`SELECT id FROM meal_plans WHERE name = ${plan.name}`
    const mealsJson = JSON.stringify(plan.meals)
    const macrosJson = JSON.stringify(plan.macros)
    if (existing.length > 0) {
      await sql`
        UPDATE meal_plans
        SET goal = ${plan.goal},
            description = ${plan.description},
            image_url = ${plan.image_url},
            daily_calories = ${plan.daily_calories},
            meals = ${mealsJson},
            macros = ${macrosJson}
        WHERE name = ${plan.name}
      `
    } else {
      await sql`
        INSERT INTO meal_plans (name, goal, description, image_url, daily_calories, meals, macros)
        VALUES (${plan.name}, ${plan.goal}, ${plan.description}, ${plan.image_url}, ${plan.daily_calories}, ${mealsJson}, ${macrosJson})
      `
    }
  }
}
