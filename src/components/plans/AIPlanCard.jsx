import Button from '../ui/Button'

function parseList(value) {
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

function parseObject(value) {
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

export default function AIPlanCard({ type, plan, onStart, loading }) {
  const isWorkout = type === 'workout'

  const exercises = isWorkout ? parseList(plan?.exercises) : []
  const meals = !isWorkout ? parseList(plan?.meal_plan) : []
  const guidelines = parseList(plan?.guidelines)
  const summary = isWorkout ? parseObject(plan?.summary) : null
  const macros = !isWorkout ? parseObject(plan?.macros) : null

  return (
    <div className="dashboard-card card-content flex flex-col h-full">
      <div className="dashboard-card-actions">
        <h3>{isWorkout ? 'AI Workout Plan' : 'AI Nutrition Plan'}</h3>
        <Button size="sm" onClick={onStart} disabled={loading}>
          {plan ? 'Retake Questionnaire' : 'Start Questionnaire'}
        </Button>
      </div>

      {!plan ? (
        <div className="flex-1">
          <p style={{ color: 'rgba(0,0,0,0.5)' }} className="mb-4">
            Answer {isWorkout ? '12' : '12'} questions based on{' '}
            {isWorkout ? 'ACSM exercise guidelines' : 'DRI & dietary guidelines'} to get your personalized plan.
          </p>
          <ul className="space-y-2 text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
            {isWorkout ? (
              <>
                <li>· FITT: Frequency, Intensity, Time, Type</li>
                <li>· 150+ min/week moderate activity target</li>
                <li>· Resistance training 2+ days/week</li>
              </>
            ) : (
              <>
                <li>· Mifflin-St Jeor calorie calculation</li>
                <li>· AMDR macro ranges (protein, carbs, fat)</li>
                <li>· Personalized meals for your diet type</li>
              </>
            )}
          </ul>
        </div>
      ) : (
        <div className="flex-1">
          <h4 className="font-semibold text-text mb-2">
            {isWorkout ? plan.plan_name : plan.recommendations?.split('·')[0]?.trim()}
          </h4>

          {isWorkout && summary && (
            <div className="text-sm mb-4 space-y-1" style={{ color: 'rgba(0,0,0,0.55)' }}>
              <p>Frequency: {summary.frequency}</p>
              <p>Intensity: {summary.intensity}</p>
              <p>Session: {summary.time}</p>
            </div>
          )}

          {!isWorkout && plan.daily_calories && (
            <div className="text-sm mb-4" style={{ color: 'rgba(0,0,0,0.55)' }}>
              <p>{plan.daily_calories} kcal/day</p>
              {macros && (
                <p className="mt-1">
                  {macros.protein_g}g protein · {macros.carbs_g}g carbs · {macros.fat_g}g fat
                </p>
              )}
            </div>
          )}

          <ul className="space-y-2 mb-4">
            {(isWorkout ? exercises : meals).slice(0, 8).map((item, i) => (
              <li key={i} className="flex items-start text-sm" style={{ color: 'rgba(0,0,0,0.65)' }}>
                <span className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center text-xs mr-2 shrink-0 mt-0.5">
                  {item.startsWith('—') ? '·' : i + 1}
                </span>
                <span className={item.startsWith('—') ? 'font-semibold' : ''}>{item}</span>
              </li>
            ))}
          </ul>

          {guidelines.length > 0 && (
            <div className="pt-4 border-t border-black/10">
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.4)' }}>
                Guidelines
              </p>
              <ul className="space-y-1">
                {guidelines.slice(0, 3).map((g, i) => (
                  <li key={i} className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
