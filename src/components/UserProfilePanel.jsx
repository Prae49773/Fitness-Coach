import { useEffect, useState } from 'react'
import StatsCard from './StatsCard'
import Button from './ui/Button'
import Input from './ui/Input'
import { VENUE, formatVenue } from '../constants/venue'

function formatLabel(value) {
  if (!value) return '—'
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-detail-row">
      <span className="profile-detail-label">{label}</span>
      <span className="profile-detail-value">{value ?? '—'}</span>
    </div>
  )
}

export default function UserProfilePanel({
  profile,
  bmi,
  bmiLabel,
  stats,
  bookings = [],
  registrations = [],
  myChallenges = [],
  myMealPlans = [],
  workoutPlan,
  nutritionPlan,
  exerciseLogs = [],
  foodLogs = [],
  onSaveProfile,
  saving = false,
}) {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setWeight(profile.weight != null ? String(profile.weight) : '')
    setHeight(profile.height != null ? String(profile.height) : '')
    setAge(profile.age != null ? String(profile.age) : '')
  }, [profile.weight, profile.height, profile.age])

  const handleSaveMetrics = async (e) => {
    e.preventDefault()
    setFormError('')

    const parsedWeight = parseFloat(weight)
    const parsedHeight = parseFloat(height)
    const parsedAge = parseInt(age, 10)

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setFormError('Enter a valid weight in kg')
      return
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setFormError('Enter a valid height in cm')
      return
    }
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      setFormError('Enter a valid age')
      return
    }

    await onSaveProfile?.({
      weight: parsedWeight,
      height: parsedHeight,
      age: parsedAge,
    })
  }
  const today = new Date().toISOString().split('T')[0]
  const foodToday = foodLogs.filter((f) => f.date?.startsWith?.(today) || f.date === today)
  const caloriesEatenToday = foodToday.reduce((sum, f) => sum + (f.calories || 0), 0)
  const totalWorkouts = exerciseLogs.length
  const totalCaloriesBurned = exerciseLogs.reduce((sum, l) => sum + (l.calories_burned || 0), 0)

  return (
    <div className="profile-page">
      <section className="dashboard-card card-content profile-hero">
        <div className="profile-hero-main">
          <p className="workout-plan-eyebrow">Member profile</p>
          <h2 className="profile-hero-name">{profile.name || 'FitAI Member'}</h2>
          <p className="profile-hero-email">{profile.email || '—'}</p>
          <p className="profile-hero-venue">{VENUE.full}</p>
        </div>
        <div className="profile-hero-bmi">
          <span className="profile-hero-bmi-value">{bmi || '—'}</span>
          <span className="profile-hero-bmi-label">BMI {bmiLabel ? `· ${bmiLabel}` : ''}</span>
        </div>
      </section>

      <div className="dashboard-grid dashboard-grid--stats dashboard-section">
        <StatsCard title="Weight" value={profile.weight ? `${profile.weight} kg` : 'N/A'} change={profile.height ? `${profile.height} cm` : ''} />
        <StatsCard title="Age" value={profile.age ? String(profile.age) : 'N/A'} change={formatLabel(profile.exercise_type)} />
        <StatsCard
          title="Workouts (month)"
          value={String(stats?.workouts_this_month ?? 0)}
          change={`${totalWorkouts} all time`}
        />
        <StatsCard
          title="Calories burned"
          value={(stats?.calories_this_week ?? 0).toLocaleString()}
          change="This week"
        />
      </div>

      <div className="dashboard-grid dashboard-grid--2 dashboard-section">
        <section className="dashboard-card card-content">
          <h3 className="dashboard-card-title">Body & goals</h3>

          <form onSubmit={handleSaveMetrics} className="profile-edit-form">
            <p className="profile-edit-heading">Edit metrics</p>
            <div className="profile-edit-grid">
              <Input
                label="Weight (kg)"
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 72"
                required
              />
              <Input
                label="Height (cm)"
                type="number"
                min="1"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 175"
                required
              />
              <Input
                label="Age"
                type="number"
                min="1"
                step="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                required
              />
            </div>
            {formError && <p className="profile-edit-error">{formError}</p>}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save metrics'}
            </Button>
          </form>

          <div className="profile-detail-list">
            <ProfileRow label="Full name" value={profile.name} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Age" value={profile.age ? `${profile.age} years` : null} />
            <ProfileRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
            <ProfileRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
            <ProfileRow label="BMI" value={bmi ? `${bmi} (${bmiLabel})` : null} />
            <ProfileRow label="Goal" value={formatLabel(profile.goal)} />
            <ProfileRow label="Exercise type" value={formatLabel(profile.exercise_type)} />
          </div>
        </section>

        <section className="dashboard-card card-content">
          <h3 className="dashboard-card-title">Activity summary</h3>
          <div className="profile-detail-list">
            <ProfileRow label="Workouts this month" value={stats?.workouts_this_month ?? 0} />
            <ProfileRow label="Calories burned (week)" value={stats?.calories_this_week?.toLocaleString?.() ?? stats?.calories_this_week ?? 0} />
            <ProfileRow label="Calories burned (month)" value={stats?.calories_this_month?.toLocaleString?.() ?? stats?.calories_this_month ?? 0} />
            <ProfileRow label="Calories eaten today" value={caloriesEatenToday} />
            <ProfileRow label="Total workouts logged" value={totalWorkouts} />
            <ProfileRow label="Lifetime calories burned" value={totalCaloriesBurned.toLocaleString()} />
          </div>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid--2 dashboard-section">
        <section className="dashboard-card card-content">
          <h3 className="dashboard-card-title">Memberships</h3>
          <div className="profile-membership-stats">
            <div className="profile-membership-stat">
              <span className="profile-membership-value">{stats?.class_bookings ?? bookings.length}</span>
              <span className="profile-membership-label">Classes booked</span>
            </div>
            <div className="profile-membership-stat">
              <span className="profile-membership-value">{stats?.event_registrations ?? registrations.length}</span>
              <span className="profile-membership-label">Events</span>
            </div>
            <div className="profile-membership-stat">
              <span className="profile-membership-value">{stats?.challenges_joined ?? myChallenges.length}</span>
              <span className="profile-membership-label">Challenges</span>
            </div>
            <div className="profile-membership-stat">
              <span className="profile-membership-value">{stats?.active_meal_plans ?? myMealPlans.length}</span>
              <span className="profile-membership-label">Meal plans</span>
            </div>
          </div>
          <ul className="profile-enrollment-list">
            {bookings.map((b) => (
              <li key={`c-${b.id}`}>
                <span className="profile-enrollment-type">Class</span>
                {b.name} · {formatVenue(b)}
              </li>
            ))}
            {registrations.map((r) => (
              <li key={`e-${r.id}`}>
                <span className="profile-enrollment-type">Event</span>
                {r.name} · {formatVenue(r)}
              </li>
            ))}
            {myChallenges.map((c) => (
              <li key={`ch-${c.id}`}>
                <span className="profile-enrollment-type">Challenge</span>
                {c.name}
                {c.progress_pct != null && ` · ${c.progress_pct}% complete`}
              </li>
            ))}
            {bookings.length === 0 && registrations.length === 0 && myChallenges.length === 0 && (
              <li className="profile-enrollment-empty">No active enrollments yet</li>
            )}
          </ul>
        </section>

        <section className="dashboard-card card-content">
          <h3 className="dashboard-card-title">Active plans</h3>
          <div className="profile-detail-list">
            <ProfileRow
              label="AI workout plan"
              value={workoutPlan?.plan_name || 'None — start questionnaire on Overview'}
            />
            <ProfileRow
              label="AI nutrition plan"
              value={
                nutritionPlan?.daily_calories
                  ? `${nutritionPlan.daily_calories} kcal/day`
                  : 'None — start questionnaire on Overview'
              }
            />
          </div>
          {myMealPlans.length > 0 && (
            <ul className="profile-meal-plans-list">
              {myMealPlans.map((plan) => (
                <li key={plan.id} className="profile-meal-plan-item">
                  <span className="profile-meal-plan-name">{plan.name}</span>
                  <span className="profile-meal-plan-meta">
                    {plan.daily_calories} kcal/day
                    {plan.calories_logged_today != null && ` · ${plan.calories_logged_today} logged today`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
