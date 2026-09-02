import { useState } from 'react'
import Button from './ui/Button'

export default function FoodLog({ foods, onAdd, dailyTarget }) {
  const [newFood, setNewFood] = useState('')
  const [calories, setCalories] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayFoods = foods.filter((f) => f.date?.startsWith?.(today) || f.date === today)
  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newFood || !calories) return
    onAdd?.({ food_item: newFood, calories: parseInt(calories, 10) })
    setNewFood('')
    setCalories('')
  }

  return (
    <div className="dashboard-card dashboard-card--flush card-content">
      <div className="dashboard-card-header">
        <div>
          <h3>Food Log</h3>
          {dailyTarget && (
            <p className="food-log-summary">
              Today: {todayCalories} / {dailyTarget} kcal
            </p>
          )}
        </div>
      </div>
      <div className="dashboard-card-body">
        {dailyTarget && (
          <div className="active-meal-plan-progress mb-6">
            <div
              className="active-meal-plan-progress-bar"
              style={{ width: `${Math.min(100, Math.round((todayCalories / dailyTarget) * 100))}%` }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newFood}
            onChange={(e) => setNewFood(e.target.value)}
            placeholder="Food item"
            className="flex-1 px-4 py-3 rounded-xl border border-black/20 focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition focus-ring"
          />
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Calories"
            className="w-full sm:w-32 px-4 py-3 rounded-xl border border-black/20 focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition focus-ring"
          />
          <Button type="submit" size="md" fullWidth className="sm:w-auto sm:min-w-[6rem]">
            Add
          </Button>
        </form>
        <div className="space-y-3">
          {todayFoods.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
              No food logged today. Log meals from your active plan above.
            </p>
          ) : (
            todayFoods.map((food) => (
              <div key={food.id} className="flex justify-between items-center py-3 border-b border-black/10 last:border-0">
                <div>
                  <span className="text-sm text-text">{food.food_item}</span>
                  {food.meal_slot && (
                    <span className="food-log-slot">{food.meal_slot}</span>
                  )}
                </div>
                <span className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>{food.calories} cal</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
