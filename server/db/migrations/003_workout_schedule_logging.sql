-- Workout plan schedule + exercise log metadata for history sync
ALTER TABLE workout_plans ADD COLUMN IF NOT EXISTS schedule JSONB;

ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES workout_plans(id) ON DELETE SET NULL;
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS day_label VARCHAR(255);
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS notes TEXT;
