-- Events, Challenges, and Nutrition schema + seed updates
-- Run: npm run db:migrate

ALTER TABLE fitness_events
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS location VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_user_event_unique
  ON event_registrations (user_id, event_id);

ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS type VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS challenge_participants_user_challenge_unique
  ON challenge_participants (user_id, challenge_id);

CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  goal VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  daily_calories INTEGER,
  meals JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_meal_plans_user_plan_unique
  ON user_meal_plans (user_id, meal_plan_id);
