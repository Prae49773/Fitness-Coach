export function calculateBMI(weight, height) {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return (weight / (heightInMeters ** 2)).toFixed(1)
}

export function getBMICategory(bmi) {
  if (!bmi) return 'Unknown'
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
