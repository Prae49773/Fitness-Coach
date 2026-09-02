export function toNumber(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function mergeProfile(...sources) {
  return sources.reduce((acc, source) => {
    if (!source || typeof source !== 'object') return acc
    const weight = toNumber(source.weight) ?? acc.weight ?? null
    const height = toNumber(source.height) ?? acc.height ?? null
    return {
      ...acc,
      ...source,
      weight,
      height,
      age: source.age ?? acc.age ?? null,
      goal: source.goal ?? acc.goal ?? null,
      name: source.name ?? acc.name ?? null,
      email: source.email ?? acc.email ?? null,
      exercise_type: source.exercise_type ?? acc.exercise_type ?? null,
    }
  }, { weight: null, height: null, age: null, goal: null, name: null, email: null, exercise_type: null })
}

export function computeBmi(weight, height) {
  const w = toNumber(weight)
  const h = toNumber(height)
  if (!w || !h) return null
  return (w / ((h / 100) ** 2)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi == null || bmi === '') return ''
  const n = Number(bmi)
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n < 18.5) return 'Underweight'
  if (n < 25) return 'Normal'
  if (n < 30) return 'Overweight'
  return 'Obese'
}
