/**
 * Workout plan generator based on ACSM FITT principles:
 * - Frequency: 150+ min moderate or 75+ min vigorous aerobic activity per week
 * - Resistance training: 2+ days/week for major muscle groups
 * - Intensity: light / moderate / vigorous zones
 */

const GOAL_LABELS = {
  weight_loss: 'Fat Loss & Conditioning',
  muscle_gain: 'Hypertrophy & Strength',
  endurance: 'Endurance Builder',
  general_health: 'General Health & Fitness',
  flexibility: 'Mobility & Flexibility',
}

function buildWarmup(injuries, duration) {
  const items = ['5 min brisk walk or bike (moderate warmup)']
  if (injuries === 'back') items.push('Cat-cow stretches × 10')
  else if (injuries === 'knees') items.push('Standing hip circles × 10 each side')
  else items.push('Arm circles & dynamic leg swings × 30s each')
  if (parseInt(duration, 10) >= 35) items.push('Foam rolling 3 min (optional)')
  return items
}

function buildStrengthDay(equipment, experience, injuries, intensity) {
  const sets = experience === 'beginner' ? '2×10–12' : experience === 'advanced' ? '4×8–10' : '3×10–12'
  const exercises = []

  if (injuries === 'knees') {
    exercises.push(`Goblet squat or leg press ${sets} (knee-friendly)`)
    exercises.push(`Romanian deadlift ${sets}`)
  } else if (injuries === 'back') {
    exercises.push(`Chest-supported row ${sets}`)
    exercises.push(`Glute bridge ${sets}`)
  } else if (injuries === 'shoulders') {
    exercises.push(`Landmine press ${sets}`)
    exercises.push(`Lat pulldown or band pull-apart ${sets}`)
  } else {
    if (equipment === 'full_gym') {
      exercises.push(`Squat or leg press ${sets}`)
      exercises.push(`Bench press or dumbbell press ${sets}`)
      exercises.push(`Romanian deadlift ${sets}`)
      exercises.push(`Lat pulldown or row ${sets}`)
    } else if (equipment === 'home_dumbbells') {
      exercises.push(`Goblet squat ${sets}`)
      exercises.push(`Dumbbell bench press ${sets}`)
      exercises.push(`Dumbbell row ${sets}`)
      exercises.push(`Dumbbell RDL ${sets}`)
    } else {
      exercises.push(`Bodyweight squat ${sets}`)
      exercises.push(`Push-ups (incline if needed) ${sets}`)
      exercises.push(`Reverse lunge ${sets}`)
      exercises.push(`Plank ${intensity === 'light' ? '3×20s' : '3×45s'}`)
    }
  }

  exercises.push(`Core: dead bug or pallof press 3×10 each side`)
  return exercises
}

function buildCardioDay(intensity, injuries, equipment, duration) {
  const mins = Math.min(parseInt(duration, 10), 45)
  if (injuries === 'knees') {
    return [
      `${mins} min low-impact cardio (bike, elliptical, or swimming)`,
      'Target: moderate intensity (ACSM Zone 2)',
      'Cool-down walk 5 min',
    ]
  }
  if (intensity === 'vigorous') {
    return [
      `5 min warmup jog`,
      `${Math.floor(mins * 0.6)} min intervals: 1 min hard / 1 min easy`,
      `${Math.floor(mins * 0.3)} min steady-state cardio`,
      '5 min cooldown',
    ]
  }
  if (equipment === 'outdoor') {
    return [
      `${mins} min run/walk (talk test: moderate intensity)`,
      'Include 4×30s pick-ups if intermediate+',
      '5 min walking cooldown',
    ]
  }
  return [
    `${mins} min cardio (treadmill, bike, or rower)`,
    'Keep heart rate in moderate zone (64–76% max HR estimate)',
    '5 min cooldown stretch',
  ]
}

function buildHiitDay(experience, injuries, duration) {
  if (injuries !== 'none' && injuries !== 'other') {
    return buildCardioDay('moderate', injuries, 'bodyweight', duration)
  }
  const rounds = experience === 'beginner' ? 3 : experience === 'advanced' ? 5 : 4
  return [
    `HIIT circuit — ${rounds} rounds, 40s work / 20s rest`,
    'Jump squats or step-ups',
    'Push-ups',
    'Mountain climbers',
    'Plank hold',
    '5 min cooldown walk',
  ]
}

function buildYogaDay(duration) {
  return [
    'Sun Salutation A × 5 rounds',
    'Warrior I & II — 1 min each side',
    'Downward Dog — 1 min',
    'Pigeon pose — 90s each side',
    `Savasana — ${Math.max(5, Math.floor(parseInt(duration, 10) * 0.15))} min`,
  ]
}

function buildCooldown() {
  return ['Static stretch major muscle groups 5 min', 'Deep breathing 2 min']
}

export function generateWorkoutPlan(answers, user = {}) {
  const {
    primary_goal,
    activity_level,
    days_per_week,
    session_duration,
    training_type,
    experience_level,
    intensity,
    equipment,
    injuries,
    sleep_quality,
    stress_level,
    consistency,
  } = answers

  const days = parseInt(days_per_week, 10) || 3
  const duration = parseInt(session_duration, 10) || 35
  const weeklyMinutes = days * duration

  const guidelines = []
  guidelines.push('ACSM: Aim for 150+ min/week moderate aerobic activity OR 75+ min vigorous activity.')
  guidelines.push('ACSM: Include resistance training for all major muscle groups at least 2 days/week.')
  if (weeklyMinutes < 150 && intensity !== 'vigorous') {
    guidelines.push(`Your plan targets ~${weeklyMinutes} min/week — consider adding a short walk on rest days.`)
  }
  if (sleep_quality === 'poor' || stress_level === 'high') {
    guidelines.push('Recovery note: Prioritize sleep and include extra mobility due to stress/poor sleep.')
  }
  if (consistency === 'new' || experience_level === 'beginner') {
    guidelines.push('Progression: Start at lower volume; increase 5–10% per week (ACSM progression principle).')
  }

  const planName = GOAL_LABELS[primary_goal] || 'Personalized Workout Plan'
  const schedule = []
  const dayTypes = []

  const preferStrength = ['muscle_gain', 'general_health'].includes(primary_goal) || training_type === 'strength'
  const preferCardio = ['weight_loss', 'endurance'].includes(primary_goal) || training_type === 'cardio'
  const preferHiit = training_type === 'hiit' && injuries === 'none'
  const preferYoga = primary_goal === 'flexibility' || training_type === 'yoga'

  for (let d = 1; d <= days; d++) {
    let label = ''
    let exercises = []

    if (preferYoga && d % 2 === 0) {
      label = `Day ${d}: Yoga & Mobility (${duration} min)`
      exercises = [...buildWarmup(injuries, duration), ...buildYogaDay(duration), ...buildCooldown()]
    } else if (preferHiit && d % 3 === 0) {
      label = `Day ${d}: HIIT Conditioning (${duration} min)`
      exercises = [...buildWarmup(injuries, duration), ...buildHiitDay(experience_level, injuries, duration), ...buildCooldown()]
    } else if (d % 2 === 1 || preferStrength) {
      label = `Day ${d}: Strength & Resistance (${duration} min)`
      exercises = [...buildWarmup(injuries, duration), ...buildStrengthDay(equipment, experience_level, injuries, intensity), ...buildCooldown()]
      dayTypes.push('strength')
    } else {
      label = `Day ${d}: Cardio & Conditioning (${duration} min)`
      exercises = [...buildWarmup(injuries, duration), ...buildCardioDay(intensity, injuries, equipment, duration), ...buildCooldown()]
      dayTypes.push('cardio')
    }

    schedule.push({ day: label, exercises })
  }

  const strengthDays = dayTypes.filter((t) => t === 'strength').length
  if (strengthDays < 2 && days >= 2) {
    guidelines.push('Added strength emphasis: ACSM recommends ≥2 resistance sessions per week.')
  }

  const flatExercises = schedule.flatMap((s) => [`— ${s.day} —`, ...s.exercises])

  const summary = {
    frequency: `${days} sessions/week`,
    intensity: intensity || 'moderate',
    time: `${duration} min/session (~${weeklyMinutes} min/week)`,
    type: training_type || 'mixed',
    activity_level,
    equipment,
  }

  return {
    plan_name: planName,
    exercises: flatExercises,
    schedule,
    summary,
    guidelines,
    questionnaire: answers,
    guidelines_source: 'ACSM Guidelines for Exercise Testing and Prescription (FITT principles)',
    user_weight: user.weight,
    user_goal: user.goal,
  }
}
