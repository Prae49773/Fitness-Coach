export function calculateCalories(exercise, weightKg, durationMin) {
  const calories = exercise.met * weightKg * (durationMin / 60)
  return Math.round(calories)
}

export function getRecommendation(exercise, weightKg, durationMin, calories) {
  const recommendations = {
    yoga: {
      low: `${exercise.name} burns approximately ${calories} calories in ${durationMin} minutes. This is a gentle way to improve flexibility and reduce stress. For best results, practice ${durationMin >= 30 ? '3-4 times per week' : '5-6 times per week'} and combine with light cardio on rest days.`,
      moderate: `Great choice for active recovery! ${exercise.name} helps with muscle recovery while burning ${calories} calories. Consider adding ${durationMin >= 30 ? '2-3 sessions' : '4-5 sessions'} weekly to improve flexibility and mental focus.`,
      high: `${exercise.name} is excellent for maintaining mobility and burning ${calories} calories. Use these sessions as recovery days between high-intensity workouts. Try combining with strength training for balanced fitness.`,
    },
    cardio: {
      low: `Cardio is a fantastic start! You'll burn approximately ${calories} calories. Begin with ${durationMin >= 20 ? '3 sessions' : '5 sessions'} per week and gradually increase intensity. Consider interval training to maximize results.`,
      moderate: `Excellent cardiovascular work! Burning ${calories} calories in ${durationMin} minutes puts you on track for improved heart health. Maintain consistency with 3-4 sessions weekly and track your progress.`,
      high: `Impressive cardio session! ${calories} calories is a strong burn. Ensure you're fueling properly and allow for 1-2 rest days per week. Consider mixing in lower-impact cardio for recovery.`,
    },
    running: {
      low: `Running is a powerful calorie burner! At ${calories} calories for ${durationMin} minutes, you're building great endurance. Start with ${durationMin >= 20 ? '2-3 runs' : '4-5 runs'} per week and increase gradually to avoid injury.`,
      moderate: `Strong run! ${calories} calories shows solid effort. Focus on proper form and consider adding strength training on non-running days to support your joints and improve performance.`,
      high: `Outstanding performance! ${calories} calories is exceptional. Monitor your recovery closely—prioritize sleep, hydration, and nutrition. Consider periodic deload weeks to prevent overtraining.`,
    },
    weight: {
      low: `Weight training builds a strong foundation! Burning ${calories} calories means you're building muscle while improving metabolism. Aim for ${durationMin >= 30 ? '2-3 sessions' : '3-4 sessions'} per week, targeting different muscle groups each time.`,
      moderate: `Great strength session! ${calories} calories shows you're working with meaningful intensity. Focus on progressive overload—gradually increase weight or reps. Combine with cardio for optimal fat loss.`,
      high: `Intense weight training! ${calories} calories indicates heavy lifting. Prioritize protein intake (1.6-2.2g per kg of body weight) and ensure 48 hours of recovery for each muscle group before training them again.`,
    },
    swimming: {
      low: `Swimming is perfect for full-body fitness! ${calories} calories in ${durationMin} minutes with minimal joint stress. Aim for ${durationMin >= 30 ? '2-3 sessions' : '4 sessions'} weekly, mixing different strokes to engage all muscle groups.`,
      moderate: `Excellent swim session! ${calories} calories with low-impact benefits is ideal for long-term fitness. Consider interval training (e.g., 4x50m sprints) to boost intensity and calorie burn further.`,
      high: `Impressive swim! ${calories} calories demonstrates high effort. Swimming is joint-friendly—ideal for daily training. Complement with dryland exercises like core work and flexibility training for well-rounded results.`,
    },
    pilates: {
      low: `Pilates focuses on core strength and posture! ${calories} calories in ${durationMin} minutes. Practice ${durationMin >= 30 ? '3-4 times' : '5-6 times'} weekly and complement with cardio for a complete fitness routine.`,
      moderate: `Strong Pilates practice! ${calories} calories while building long, lean muscles. Combine with strength training and cardio 2-3 times per week for balanced development and improved overall fitness.`,
      high: `Dedicated Pilates session! ${calories} calories shows focused effort. For enhanced results, add resistance training or cardio intervals. Pilates is excellent for injury prevention—great for active recovery days.`,
    },
  }

  let category = 'moderate'
  if (weightKg < 60) category = 'low'
  else if (weightKg > 90) category = 'high'
  else if (weightKg >= 75 || durationMin >= 45) category = 'high'
  else if (weightKg >= 65 && durationMin >= 30) category = 'moderate'
  else if (weightKg < 65 && durationMin < 30) category = 'low'

  if (durationMin >= 60 && calories > 600) category = 'high'
  if (calories > 500 && category === 'moderate') category = 'moderate'

  return recommendations[exercise.id]?.[category] || recommendations[exercise.id]?.moderate
}
