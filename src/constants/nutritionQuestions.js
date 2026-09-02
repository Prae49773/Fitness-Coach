export const NUTRITION_QUESTIONS = [
  {
    id: 'primary_goal',
    label: 'What is your primary nutrition goal?',
    type: 'select',
    options: [
      { value: 'weight_loss', label: 'Lose weight / reduce body fat' },
      { value: 'muscle_gain', label: 'Gain muscle mass' },
      { value: 'maintenance', label: 'Maintain current weight' },
      { value: 'performance', label: 'Athletic performance & energy' },
      { value: 'health', label: 'General health & longevity' },
    ],
  },
  {
    id: 'sex',
    label: 'Biological sex (for calorie calculations)',
    type: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  {
    id: 'activity_level',
    label: 'Daily activity level (for TDEE)',
    type: 'select',
    options: [
      { value: 'sedentary', label: 'Sedentary (desk job, little exercise)' },
      { value: 'light', label: 'Lightly active (1–3 workouts/week)' },
      { value: 'moderate', label: 'Moderately active (3–5 workouts/week)' },
      { value: 'active', label: 'Very active (6–7 workouts/week)' },
      { value: 'athlete', label: 'Athlete / physical job + training' },
    ],
  },
  {
    id: 'diet_type',
    label: 'What is your dietary preference?',
    type: 'select',
    options: [
      { value: 'omnivore', label: 'Omnivore (meat & plants)' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'pescatarian', label: 'Pescatarian' },
    ],
  },
  {
    id: 'allergies',
    label: 'Any food allergies or intolerances?',
    type: 'select',
    options: [
      { value: 'none', label: 'None' },
      { value: 'dairy', label: 'Dairy / lactose' },
      { value: 'gluten', label: 'Gluten' },
      { value: 'nuts', label: 'Nuts' },
      { value: 'multiple', label: 'Multiple restrictions' },
    ],
  },
  {
    id: 'meals_per_day',
    label: 'How many meals do you prefer per day?',
    type: 'select',
    options: [
      { value: '2', label: '2 meals' },
      { value: '3', label: '3 meals' },
      { value: '4', label: '4 meals (with snack)' },
      { value: '5', label: '5–6 smaller meals' },
    ],
  },
  {
    id: 'cooking_frequency',
    label: 'How often do you cook at home?',
    type: 'select',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: '2–3 times per week' },
      { value: 'often', label: '4–5 times per week' },
      { value: 'daily', label: 'Almost every day' },
    ],
  },
  {
    id: 'water_intake',
    label: 'How much water do you drink daily?',
    type: 'select',
    options: [
      { value: 'low', label: 'Under 4 cups (1 L)' },
      { value: 'moderate', label: '4–6 cups (1–1.5 L)' },
      { value: 'good', label: '6–8 cups (1.5–2 L)' },
      { value: 'high', label: '8+ cups (2+ L)' },
    ],
  },
  {
    id: 'snacking',
    label: 'How would you describe your snacking habits?',
    type: 'select',
    options: [
      { value: 'none', label: 'Rarely snack' },
      { value: 'light', label: 'Light snacking' },
      { value: 'moderate', label: 'Moderate snacking' },
      { value: 'heavy', label: 'Frequent snacking' },
    ],
  },
  {
    id: 'eating_out',
    label: 'How often do you eat out or order delivery?',
    type: 'select',
    options: [
      { value: 'rarely', label: 'Rarely (0–1×/week)' },
      { value: 'weekly', label: '1–2× per week' },
      { value: 'frequent', label: '3–4× per week' },
      { value: 'daily', label: 'Most days' },
    ],
  },
  {
    id: 'alcohol',
    label: 'Alcohol consumption',
    type: 'select',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1–2 drinks/week)' },
      { value: 'moderate', label: 'Moderate (3–5 drinks/week)' },
      { value: 'frequent', label: 'Frequent (6+ drinks/week)' },
    ],
  },
  {
    id: 'sodium_sugar',
    label: 'Are you trying to limit sodium or added sugar?',
    type: 'select',
    options: [
      { value: 'no', label: 'No specific concern' },
      { value: 'moderate', label: 'Moderately mindful' },
      { value: 'strict', label: 'Strictly limiting both' },
    ],
  },
]
