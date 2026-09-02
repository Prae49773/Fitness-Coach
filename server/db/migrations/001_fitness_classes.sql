-- Fitness classes schema updates and seed data
-- Run against your Neon database (uses NEON_DB / DATABASE_URL from .env)

-- Add image and description columns
ALTER TABLE fitness_classes
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Prevent duplicate bookings per user per class
CREATE UNIQUE INDEX IF NOT EXISTS class_bookings_user_class_unique
  ON class_bookings (user_id, class_id);

-- Update existing rows by name (safe to re-run)
UPDATE fitness_classes SET
  type = 'yoga',
  instructor = 'Sarah Johnson',
  schedule = '2026-09-15 08:00:00',
  capacity = 20,
  image_url = '/images/classes/morning-yoga.jpg',
  description = 'Start your day with gentle flows and breathwork. All levels welcome.'
WHERE name = 'Morning Yoga';

UPDATE fitness_classes SET
  type = 'cardio',
  instructor = 'Mike Chen',
  schedule = '2026-09-15 10:00:00',
  capacity = 15,
  image_url = '/images/classes/hiit-cardio.jpg',
  description = 'High-intensity intervals to boost endurance and burn calories fast.'
WHERE name = 'HIIT Cardio';

UPDATE fitness_classes SET
  type = 'strength',
  instructor = 'Alex Rivera',
  schedule = '2026-09-15 14:00:00',
  capacity = 10,
  image_url = '/images/classes/strength-training.jpg',
  description = 'Build muscle with compound lifts, form coaching, and progressive overload.'
WHERE name = 'Strength Training';

UPDATE fitness_classes SET
  type = 'yoga',
  instructor = 'Emma Wilson',
  schedule = '2026-09-15 18:00:00',
  capacity = 20,
  image_url = '/images/classes/evening-yoga.jpg',
  description = 'Wind down with restorative poses and guided relaxation after work.'
WHERE name = 'Evening Yoga';
