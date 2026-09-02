export function parseList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

export function parseSchedule(plan) {
  const stored = parseObject(plan?.schedule)
  if (Array.isArray(stored) && stored.length > 0) return stored

  const exercises = parseList(plan?.exercises)
  const schedule = []
  let current = null

  for (const item of exercises) {
    if (item.startsWith('—')) {
      if (current) schedule.push(current)
      current = {
        day: item.replace(/^—\s*|\s*—$/g, '').trim(),
        exercises: [],
      }
    } else if (current) {
      current.exercises.push(item)
    }
  }
  if (current) schedule.push(current)
  return schedule
}

export function extractSessionMinutes(dayLabel) {
  const match = dayLabel?.match(/\((\d+)\s*min\)/)
  return match ? parseInt(match[1], 10) : 35
}

export function estimateCalories(duration, intensity = 'moderate') {
  const multiplier = intensity === 'vigorous' ? 9 : intensity === 'light' ? 5 : 7
  return Math.round(duration * multiplier)
}
