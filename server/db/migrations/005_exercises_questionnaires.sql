-- Create exercises table and questionnaire tables
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  met NUMERIC,
  calories_per_hour INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questionnaires (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_questionnaire_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  questionnaire_id INTEGER REFERENCES questionnaires(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure workout_plans has questionnaire JSONB (already handled in JS runner, but safe here)
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS questionnaire JSONB;
