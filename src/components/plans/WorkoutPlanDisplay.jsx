import { useState } from 'react'
import Button from '../ui/Button'
import {
  parseObject,
  parseList,
  parseSchedule,
  extractSessionMinutes,
  estimateCalories,
} from './workoutPlanUtils'

export default function WorkoutPlanDisplay({ plan, onRetake, onLogWorkout, logging = false }) {
  const [expandedDay, setExpandedDay] = useState(0)
  const [logDay, setLogDay] = useState(null)
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')

  if (!plan) return null

  const summary = parseObject(plan.summary)
  const guidelines = parseList(plan.guidelines)
  const schedule = parseSchedule(plan)

  const openLog = (day, index) => {
    const mins = extractSessionMinutes(day.day)
    setLogDay({ ...day, index })
    setDuration(String(mins))
    setCalories(String(estimateCalories(mins, summary?.intensity)))
    setNotes('')
  }

  const submitLog = async (e) => {
    e.preventDefault()
    if (!logDay || !duration) return
    const sessionName = logDay.day.split(':').slice(1).join(':').trim() || logDay.day
    const exerciseType = sessionName.replace(/\s*\(\d+\s*min\)\s*$/i, '').trim() || sessionName
    await onLogWorkout?.({
      plan_id: plan.id,
      day_label: logDay.day,
      exercise_type: exerciseType,
      duration: parseInt(duration, 10),
      calories_burned: parseInt(calories, 10) || estimateCalories(parseInt(duration, 10), summary?.intensity),
      notes: notes.trim() || null,
    })
    setLogDay(null)
  }

  return (
    <div className="workout-plan">
      <div className="workout-plan-header">
        <div>
          <p className="workout-plan-eyebrow">Your personalized plan</p>
          <h3 className="workout-plan-title">{plan.plan_name}</h3>
        </div>
        <Button size="sm" onClick={onRetake}>
          Retake Questionnaire
        </Button>
      </div>

      {summary && (
        <div className="workout-plan-stats">
          <div className="workout-plan-stat">
            <span className="workout-plan-stat-label">Frequency</span>
            <span className="workout-plan-stat-value">{summary.frequency}</span>
          </div>
          <div className="workout-plan-stat">
            <span className="workout-plan-stat-label">Intensity</span>
            <span className="workout-plan-stat-value">{summary.intensity}</span>
          </div>
          <div className="workout-plan-stat">
            <span className="workout-plan-stat-label">Weekly volume</span>
            <span className="workout-plan-stat-value">{summary.time}</span>
          </div>
        </div>
      )}

      <div className="workout-plan-days">
        {schedule.map((day, index) => (
          <article
            key={day.day}
            className={`workout-day-card ${expandedDay === index ? 'workout-day-card--open' : ''}`}
          >
            <button
              type="button"
              className="workout-day-card-header"
              onClick={() => setExpandedDay(expandedDay === index ? -1 : index)}
            >
              <div className="workout-day-card-title-wrap">
                <span className="workout-day-badge">Day {index + 1}</span>
                <h4 className="workout-day-title">{day.day.replace(/^Day \d+:\s*/, '')}</h4>
              </div>
              <span className="workout-day-chevron">{expandedDay === index ? '−' : '+'}</span>
            </button>

            {expandedDay === index && (
              <div className="workout-day-card-body">
                <ul className="workout-exercise-list">
                  {day.exercises.map((exercise, i) => (
                    <li key={i} className="workout-exercise-item">
                      <span className="workout-exercise-num">{i + 1}</span>
                      <span className="workout-exercise-text">{exercise}</span>
                    </li>
                  ))}
                </ul>
                <div className="workout-day-actions">
                  <Button size="sm" onClick={() => openLog(day, index)} disabled={logging}>
                    Log this workout
                  </Button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {guidelines.length > 0 && (
        <div className="workout-plan-guidelines">
          <h4 className="workout-plan-guidelines-title">Guidelines</h4>
          <ul className="workout-plan-guidelines-list">
            {guidelines.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
          {plan.guidelines_source && (
            <p className="workout-plan-source">{plan.guidelines_source}</p>
          )}
        </div>
      )}

      {logDay && (
        <div className="plan-modal-overlay" onClick={() => setLogDay(null)}>
          <div className="plan-modal-card card-content workout-log-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="plan-modal-title">Log workout</h3>
            <p className="workout-log-day-label">{logDay.day}</p>
            <form onSubmit={submitLog} className="workout-log-form">
              <label className="auth-field-label">
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="auth-glass-input mt-2"
                />
              </label>
              <label className="auth-field-label">
                Calories burned
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="auth-glass-input mt-2"
                />
              </label>
              <label className="auth-field-label">
                Notes (optional)
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="auth-glass-input mt-2 resize-none"
                  placeholder="How did it feel? Any PRs?"
                />
              </label>
              <div className="plan-modal-actions">
                <Button type="button" variant="secondary" onClick={() => setLogDay(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={logging}>
                  {logging ? 'Saving...' : 'Save to History'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
