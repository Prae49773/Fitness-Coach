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
);

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
);

CREATE TABLE IF NOT EXISTS workout_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workout_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
