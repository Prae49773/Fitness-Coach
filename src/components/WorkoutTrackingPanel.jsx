import { useMemo, useState } from 'react'
import Button from './ui/Button'

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function StarRating({ value, onChange }) {
  return (
    <div className="workout-rating-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`workout-rating-star ${star <= value ? 'is-active' : ''}`}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function WorkoutTrackingPanel({
  progress = [],
  schedules = [],
  reviews = [],
  onAddProgress,
  onAddSchedule,
  onDeleteSchedule,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
}) {
  const [progressForm, setProgressForm] = useState({
    exercise_name: '',
    category: '',
    sets: '',
    reps: '',
    weight_kg: '',
    duration_minutes: '',
    calories_burned: '',
    notes: '',
    recorded_on: new Date().toISOString().split('T')[0],
  })

  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 'Monday',
    time_of_day: '08:00',
    workout_name: '',
    workout_type: '',
    duration_minutes: '',
    sets: '',
    reps: '',
    rest_minutes: '',
    notes: '',
  })

  const [reviewForm, setReviewForm] = useState({
    workout_name: '',
    rating: 5,
    comment: '',
  })

  const [editingReviewId, setEditingReviewId] = useState(null)

  const reviewSummary = useMemo(() => {
    if (!reviews.length) return { average: 0, count: 0 }
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return { average: total / reviews.length, count: reviews.length }
  }, [reviews])

  const handleProgressSubmit = (event) => {
    event.preventDefault()
    if (!progressForm.exercise_name.trim()) return
    onAddProgress?.({
      ...progressForm,
      sets: progressForm.sets === '' ? null : Number(progressForm.sets),
      reps: progressForm.reps === '' ? null : Number(progressForm.reps),
      weight_kg: progressForm.weight_kg === '' ? null : Number(progressForm.weight_kg),
      duration_minutes: progressForm.duration_minutes === '' ? null : Number(progressForm.duration_minutes),
      calories_burned: progressForm.calories_burned === '' ? null : Number(progressForm.calories_burned),
    })
    setProgressForm({
      exercise_name: '',
      category: '',
      sets: '',
      reps: '',
      weight_kg: '',
      duration_minutes: '',
      calories_burned: '',
      notes: '',
      recorded_on: new Date().toISOString().split('T')[0],
    })
  }

  const handleScheduleSubmit = (event) => {
    event.preventDefault()
    if (!scheduleForm.workout_name.trim()) return
    onAddSchedule?.({
      ...scheduleForm,
      duration_minutes: scheduleForm.duration_minutes === '' ? null : Number(scheduleForm.duration_minutes),
      sets: scheduleForm.sets === '' ? null : Number(scheduleForm.sets),
      reps: scheduleForm.reps === '' ? null : Number(scheduleForm.reps),
      rest_minutes: scheduleForm.rest_minutes === '' ? null : Number(scheduleForm.rest_minutes),
    })
    setScheduleForm({
      day_of_week: 'Monday',
      time_of_day: '08:00',
      workout_name: '',
      workout_type: '',
      duration_minutes: '',
      sets: '',
      reps: '',
      rest_minutes: '',
      notes: '',
    })
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()
    if (!reviewForm.workout_name.trim()) return
    if (editingReviewId) {
      onUpdateReview?.(editingReviewId, reviewForm)
      setEditingReviewId(null)
    } else {
      onAddReview?.(reviewForm)
    }
    setReviewForm({ workout_name: '', rating: 5, comment: '' })
  }

  const editReview = (review) => {
    setEditingReviewId(review.id)
    setReviewForm({
      workout_name: review.workout_name,
      rating: review.rating,
      comment: review.comment || '',
    })
  }

  return (
    <div className="dashboard-card dashboard-card--flush card-content">
      <div className="dashboard-card-header">
        <h3>Workout Tracking</h3>
      </div>

      <div className="dashboard-card-body">
        <div className="workout-tracking-grid">
          <section className="workout-tracking-panel">
            <h4>Progress Log</h4>
            <form onSubmit={handleProgressSubmit} className="workout-form">
              <div className="workout-form-grid">
                <label>
                  Exercise
                  <input value={progressForm.exercise_name} onChange={(e) => setProgressForm({ ...progressForm, exercise_name: e.target.value })} placeholder="Bench Press" />
                </label>
                <label>
                  Category
                  <input value={progressForm.category} onChange={(e) => setProgressForm({ ...progressForm, category: e.target.value })} placeholder="Strength" />
                </label>
                <label>
                  Sets
                  <input type="number" min="0" value={progressForm.sets} onChange={(e) => setProgressForm({ ...progressForm, sets: e.target.value })} />
                </label>
                <label>
                  Reps
                  <input type="number" min="0" value={progressForm.reps} onChange={(e) => setProgressForm({ ...progressForm, reps: e.target.value })} />
                </label>
                <label>
                  Weight (kg)
                  <input type="number" min="0" step="0.5" value={progressForm.weight_kg} onChange={(e) => setProgressForm({ ...progressForm, weight_kg: e.target.value })} />
                </label>
                <label>
                  Duration (min)
                  <input type="number" min="0" value={progressForm.duration_minutes} onChange={(e) => setProgressForm({ ...progressForm, duration_minutes: e.target.value })} />
                </label>
                <label>
                  Calories
                  <input type="number" min="0" value={progressForm.calories_burned} onChange={(e) => setProgressForm({ ...progressForm, calories_burned: e.target.value })} />
                </label>
                <label>
                  Date
                  <input type="date" value={progressForm.recorded_on} onChange={(e) => setProgressForm({ ...progressForm, recorded_on: e.target.value })} />
                </label>
                <label className="full-width">
                  Notes
                  <textarea value={progressForm.notes} onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })} placeholder="How did it feel?" rows="3" />
                </label>
              </div>
              <Button type="submit" variant="primary" size="sm">Save Progress</Button>
            </form>

            {progress.length > 0 && (
              <div className="mini-list">
                {progress.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="mini-card">
                    <strong>{entry.exercise_name}</strong>
                    <span>{entry.category || 'Workout'} · {entry.recorded_on}</span>
                    <small>{entry.sets ? `${entry.sets} sets` : ''}{entry.reps ? ` · ${entry.reps} reps` : ''}{entry.duration_minutes ? ` · ${entry.duration_minutes} min` : ''}</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="workout-tracking-panel">
            <h4>Workout Schedule</h4>
            <form onSubmit={handleScheduleSubmit} className="workout-form">
              <div className="workout-form-grid">
                <label>
                  Day
                  <select value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}>
                    {DAY_OPTIONS.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </label>
                <label>
                  Time
                  <input type="time" value={scheduleForm.time_of_day} onChange={(e) => setScheduleForm({ ...scheduleForm, time_of_day: e.target.value })} />
                </label>
                <label className="full-width">
                  Workout Name
                  <input value={scheduleForm.workout_name} onChange={(e) => setScheduleForm({ ...scheduleForm, workout_name: e.target.value })} placeholder="Upper Body Focus" />
                </label>
                <label>
                  Type
                  <input value={scheduleForm.workout_type} onChange={(e) => setScheduleForm({ ...scheduleForm, workout_type: e.target.value })} placeholder="Strength" />
                </label>
                <label>
                  Duration
                  <input type="number" min="0" value={scheduleForm.duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: e.target.value })} />
                </label>
                <label>
                  Sets
                  <input type="number" min="0" value={scheduleForm.sets} onChange={(e) => setScheduleForm({ ...scheduleForm, sets: e.target.value })} />
                </label>
                <label>
                  Reps
                  <input type="number" min="0" value={scheduleForm.reps} onChange={(e) => setScheduleForm({ ...scheduleForm, reps: e.target.value })} />
                </label>
                <label>
                  Rest (min)
                  <input type="number" min="0" value={scheduleForm.rest_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, rest_minutes: e.target.value })} />
                </label>
                <label className="full-width">
                  Notes
                  <textarea value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} rows="3" />
                </label>
              </div>
              <Button type="submit" variant="secondary" size="sm">Add Schedule</Button>
            </form>

            {schedules.length > 0 && (
              <div className="mini-list">
                {schedules.map((entry) => (
                  <div key={entry.id} className="mini-card schedule-row">
                    <div>
                      <strong>{entry.workout_name}</strong>
                      <span>{entry.day_of_week} · {entry.time_of_day}</span>
                    </div>
                    <button type="button" className="text-link" onClick={() => onDeleteSchedule?.(entry.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="workout-tracking-panel full-span">
            <h4>Workout Reviews</h4>
            <div className="workout-review-summary">
              <span>{reviewSummary.average ? reviewSummary.average.toFixed(1) : '0.0'} / 5</span>
              <small>{reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}</small>
            </div>

            <form onSubmit={handleReviewSubmit} className="workout-form">
              <div className="workout-form-grid">
                <label className="full-width">
                  Workout Name
                  <input value={reviewForm.workout_name} onChange={(e) => setReviewForm({ ...reviewForm, workout_name: e.target.value })} placeholder="Leg Day" />
                </label>
                <label className="full-width">
                  Rating
                  <StarRating value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} />
                </label>
                <label className="full-width">
                  Comment
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows="3" placeholder="Tell us how the workout felt." />
                </label>
              </div>
              <Button type="submit" variant={editingReviewId ? 'secondary' : 'primary'} size="sm">
                {editingReviewId ? 'Update Review' : 'Add Review'}
              </Button>
            </form>

            {reviews.length > 0 && (
              <div className="mini-list review-list">
                {reviews.map((review) => (
                  <div key={review.id} className="mini-card review-item">
                    <div className="review-header">
                      <strong>{review.workout_name}</strong>
                      <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p>{review.comment || 'No comment added.'}</p>
                    <div className="review-actions">
                      <button type="button" className="text-link" onClick={() => editReview(review)}>Edit</button>
                      <button type="button" className="text-link" onClick={() => onDeleteReview?.(review.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
