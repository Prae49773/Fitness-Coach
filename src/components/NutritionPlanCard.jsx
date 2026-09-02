import Button from './ui/Button'
import { parseMeals, parseMacros } from '../utils/meals'

export default function NutritionPlanCard({
  plan,
  onActivate,
  onDeactivate,
  active = false,
  loading = false,
  actionKey,
}) {
  const isActive = plan.is_active || active
  const meals = parseMeals(plan.meals)
  const macros = parseMacros(plan.macros)
  const isLoading = loading && actionKey === `plan-${plan.id}`

  return (
    <div className="dashboard-card dashboard-card--flush card-content flex flex-col overflow-hidden">
      <div className="class-card-image-wrap">
        <img
          src={plan.image_url || '/images/nutrition/maintenance-plan.jpg'}
          alt={plan.name}
          className="class-card-image"
        />
        <span className="class-card-type">{plan.goal}</span>
        {isActive && <span className="card-status-badge">Active</span>}
      </div>

      <div className="class-card-body flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text">{plan.name}</h3>
        <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
          {plan.daily_calories} cal / day
          {macros && ` · ${macros.protein_g}g P · ${macros.carbs_g}g C · ${macros.fat_g}g F`}
        </p>
        <p className="text-sm mt-3 flex-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
          {plan.description}
        </p>

        {meals.length > 0 && (
          <ul className="nutrition-meal-preview mt-4">
            {meals.map((meal) => (
              <li key={meal.slot} className="nutrition-meal-preview-item">
                <span className="nutrition-meal-preview-label">{meal.label}</span>
                <span className="nutrition-meal-preview-name">{meal.item}</span>
                {meal.calories != null && (
                  <span className="nutrition-meal-preview-cal">{meal.calories} kcal</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6 border-t border-black/10">
          <p className="text-sm mb-5" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {isActive ? 'Track today\'s meals below' : '4 structured meals per day'}
          </p>
          {isActive ? (
            <Button
              size="md"
              fullWidth
              variant="secondary"
              disabled={isLoading}
              onClick={() => onDeactivate?.(plan)}
            >
              {isLoading ? 'Deactivating...' : 'Stop Plan'}
            </Button>
          ) : (
            <Button
              size="md"
              fullWidth
              disabled={isLoading}
              onClick={() => onActivate?.(plan)}
            >
              {isLoading ? 'Starting...' : 'Start Plan'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
