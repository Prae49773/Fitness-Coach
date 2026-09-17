-- Leaderboards, badges, rewards, passport tables
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  seasonal BOOLEAN DEFAULT FALSE,
  season_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS rewards_catalog (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL DEFAULT 0,
  benefit JSONB,
  stock INTEGER DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_id INTEGER REFERENCES rewards_catalog(id) ON DELETE SET NULL,
  points_used INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, target_user_id)
);
