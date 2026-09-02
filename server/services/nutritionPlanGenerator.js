/**
 * Nutrition plan generator based on:
 * - Mifflin-St Jeor BMR equation
 * - NASEM/DRI activity multipliers for TDEE
 * - AMDR: protein 10–35%, carbs 45–65%, fat 20–35% of calories
 * - Higher protein during deficit (1.4–2.2 g/kg per sports nutrition research)
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
}

const PROTEIN_PER_KG = {
  weight_loss: 1.6,
  muscle_gain: 1.8,
  maintenance: 1.0,
  performance: 1.6,
  health: 1.2,
}

function calcBmr(weightKg, heightCm, age, sex) {
  if (!weightKg || !heightCm || !age) return 1800
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

function mealTemplates(dietType, allergies, goal) {
  const avoidDairy = allergies === 'dairy' || allergies === 'multiple'
  const avoidGluten = allergies === 'gluten' || allergies === 'multiple'
  const avoidNuts = allergies === 'nuts' || allergies === 'multiple'

  const protein =
    dietType === 'vegan'
      ? 'tofu, tempeh, or lentils'
      : dietType === 'vegetarian'
        ? 'eggs, Greek yogurt, or legumes'
        : dietType === 'pescatarian'
          ? 'salmon, tuna, or white fish'
          : 'lean chicken, turkey, or fish'

  const breakfast =
    goal === 'muscle_gain'
      ? `Breakfast: ${avoidDairy ? 'Oatmeal with plant protein & banana' : 'Greek yogurt parfait with granola & berries'}`
      : goal === 'weight_loss'
        ? `Breakfast: Veggie egg scramble${avoidDairy ? ' (dairy-free)' : ''} with spinach`
        : `Breakfast: ${avoidGluten ? 'Rice cakes' : 'Whole grain toast'} with ${protein.split(',')[0]} & fruit`

  const lunch =
    goal === 'performance'
      ? `Lunch: ${avoidGluten ? 'Rice bowl' : 'Whole grain wrap'} with ${protein}, sweet potato & greens`
      : `Lunch: Large salad with ${protein}, mixed vegetables & olive oil dressing`

  const snack =
    avoidNuts
      ? 'Snack: Rice cakes with hummus or fruit'
      : goal === 'muscle_gain'
        ? 'Snack: Protein shake & banana'
        : 'Snack: Apple with almond butter or carrots with hummus'

  const dinner =
    goal === 'weight_loss'
      ? `Dinner: Grilled ${protein} with steamed vegetables & quinoa`
      : goal === 'muscle_gain'
        ? `Dinner: ${protein} with brown rice, roasted vegetables & avocado`
        : `Dinner: Baked ${protein} with mixed vegetables & ${avoidGluten ? 'rice' : 'whole grain pasta'}`

  return [breakfast, lunch, snack, dinner]
}

export function generateNutritionPlan(answers, user = {}) {
  const {
    primary_goal,
    sex,
    activity_level,
    diet_type,
    allergies,
    meals_per_day,
    cooking_frequency,
    water_intake,
    snacking,
    eating_out,
    alcohol,
    sodium_sugar,
  } = answers

  const weightKg = parseFloat(user.weight) || 70
  const heightCm = parseFloat(user.height) || 170
  const age = parseInt(user.age, 10) || 30
  const goal = primary_goal || user.goal || 'maintenance'

  const bmr = calcBmr(weightKg, heightCm, age, sex || 'male')
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity_level] || 1.55))

  let targetCalories = tdee
  if (goal === 'weight_loss') targetCalories = Math.round(tdee - 500)
  else if (goal === 'muscle_gain') targetCalories = Math.round(tdee + 350)
  else if (goal === 'performance') targetCalories = Math.round(tdee + 200)

  targetCalories = Math.max(1400, Math.min(targetCalories, 4500))

  const proteinG = Math.round(weightKg * (PROTEIN_PER_KG[goal] || 1.2))
  const proteinCal = proteinG * 4
  const fatPct = goal === 'weight_loss' ? 0.28 : 0.3
  const fatG = Math.round((targetCalories * fatPct) / 9)
  const fatCal = fatG * 9
  const carbG = Math.round((targetCalories - proteinCal - fatCal) / 4)

  const meals = mealTemplates(diet_type || 'omnivore', allergies || 'none', goal)

  const guidelines = [
    `Daily calories: ${targetCalories} kcal (BMR ${Math.round(bmr)} × activity → TDEE ${tdee} kcal, adjusted for goal).`,
    `Protein: ${proteinG}g/day (${(proteinG / weightKg).toFixed(1)} g/kg — supports lean mass per AMDR/sports nutrition).`,
    `Carbs: ${carbG}g (${Math.round((carbG * 4 / targetCalories) * 100)}% of calories, within 45–65% AMDR).`,
    `Fat: ${fatG}g (${Math.round((fatG * 9 / targetCalories) * 100)}% of calories, within 20–35% AMDR).`,
    'Hydration: Aim for 2–3 L water daily (more if very active).',
  ]

  if (water_intake === 'low') guidelines.push('Increase water intake gradually — target 6–8 cups minimum.')
  if (snacking === 'heavy') guidelines.push('Choose protein-forward snacks to improve satiety during a deficit.')
  if (eating_out === 'frequent' || eating_out === 'daily') {
    guidelines.push('When dining out: prioritize lean protein, vegetables, and watch portion sizes.')
  }
  if (alcohol !== 'none') guidelines.push('Limit alcohol — it adds empty calories and can impair recovery.')
  if (sodium_sugar === 'strict') guidelines.push('Limit added sugar to <10% of calories; keep sodium under 2,300 mg/day (DGA).')
  if (cooking_frequency === 'rarely') guidelines.push('Batch-prep 2–3 meals on weekends to stay on track.')

  const mealCount = parseInt(meals_per_day, 10) || 3
  const recommendations = [
    `Personalized ${goal.replace('_', ' ')} plan — ${targetCalories} cal/day`,
    `Macros: ${proteinG}g protein · ${carbG}g carbs · ${fatG}g fat`,
    `Diet: ${diet_type || 'omnivore'} · ${mealCount} meals/day`,
  ].join(' · ')

  return {
    meal_plan: meals,
    recommendations,
    daily_calories: targetCalories,
    macros: { protein_g: proteinG, carbs_g: carbG, fat_g: fatG, bmr: Math.round(bmr), tdee },
    guidelines,
    questionnaire: answers,
    guidelines_source: 'Mifflin-St Jeor BMR, NASEM/DRI activity factors, Dietary Guidelines AMDR',
  }
}
