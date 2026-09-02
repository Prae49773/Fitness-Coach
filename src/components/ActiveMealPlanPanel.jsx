import Button from './ui/Button'
import { parseMeals, parseMacros, parseLoggedSlots } from '../utils/meals'

export default function ActiveMealPlanPanel({ plan, onLogMeal, logging = false, actionKey }) {
  const meals = parseMeals(plan.meals)
  const macros = parseMacros(plan.macros)
  const loggedSlots = parseLoggedSlots(plan.logged_slots)
  const caloriesLogged = plan.calories_logged_today ?? 0
  const target = plan.daily_calories ?? 0
  const progressPct = target > 0 ? Math.min(100, Math.round((caloriesLogged / target) * 100)) : 0

  return (
    <div className="dashboard-card card-content active-meal-plan">
      <div className="active-meal-plan-header">
        <div>
          <p className="workout-plan-eyebrow">Active meal plan</p>
          <h3 className="dashboard-card-title">{plan.name}</h3>
          <p className="active-meal-plan-goal">{plan.description}</p>
        </div>
        <div className="active-meal-plan-target">
          <span className="active-meal-plan-target-value">{caloriesLogged}</span>
          <span className="active-meal-plan-target-label">/ {target} kcal today</span>
        </div>
      </div>

      <div className="active-meal-plan-progress">
        <div className="active-meal-plan-progress-bar" style={{ width: `${progressPct}%` }} />
      </div>

      {macros && (
        <div className="active-meal-plan-macros">
          <span>{macros.protein_g}g protein</span>
          <span>{macros.carbs_g}g carbs</span>
          <span>{macros.fat_g}g fat</span>
        </div>
      )}

      <div className="active-meal-plan-meals">
        {meals.map((meal) => {
          const isLogged = loggedSlots.includes(meal.slot)
          const isLoading = logging && actionKey === `meal-${plan.id}-${meal.slot}`

          return (
            <article
              key={meal.slot}
              className={`active-meal-item ${isLogged ? 'active-meal-item--logged' : ''}`}
            >
              <div className="active-meal-item-main">
                <p className="active-meal-item-label">{meal.label}</p>
                <p className="active-meal-item-name">{meal.item}</p>
                {meal.calories != null && (
                  <p className="active-meal-item-macros">
                    {meal.calories} kcal
                    {meal.protein_g != null && ` · ${meal.protein_g}g P · ${meal.carbs_g}g C · ${meal.fat_g}g F`}
                  </p>
                )}
              </div>
              {isLogged ? (
                <span className="active-meal-item-done">Logged ✓</span>
              ) : (
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={() => onLogMeal?.(plan, meal.slot)}
                >
                  {isLoading ? 'Logging...' : 'Log meal'}
                </Button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
