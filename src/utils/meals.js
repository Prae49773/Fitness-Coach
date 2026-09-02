export function parseMeals(meals) {
  if (!meals) return []
  const list = Array.isArray(meals) ? meals : (() => {
    try {
      return JSON.parse(meals)
    } catch {
      return []
    }
  })()

  return list.map((meal, index) => {
    if (typeof meal === 'string') {
      const [label, ...rest] = meal.split(':')
      return {
        slot: `meal-${index}`,
        label: label?.trim() || `Meal ${index + 1}`,
        item: rest.join(':').trim() || meal,
        calories: null,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      }
    }
    return meal
  })
}

export function parseMacros(macros) {
  if (!macros) return null
  if (typeof macros === 'object') return macros
  try {
    return JSON.parse(macros)
  } catch {
    return null
  }
}

export function parseLoggedSlots(loggedSlots) {
  if (Array.isArray(loggedSlots)) return loggedSlots
  if (typeof loggedSlots === 'string') {
    try {
      return JSON.parse(loggedSlots)
    } catch {
      return []
    }
  }
  return []
}
