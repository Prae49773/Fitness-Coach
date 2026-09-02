export default function WorkoutHistory({ workouts }) {
  if (!workouts?.length) {
    return (
      <div className="dashboard-card dashboard-card--flush card-content">
        <div className="dashboard-card-header">
          <h3>Workout History</h3>
        </div>
        <div className="dashboard-card-body workout-history-empty">
          <p className="workout-history-empty-title">No workouts logged yet</p>
          <p className="workout-history-empty-text">
            Complete a session from your AI workout plan and tap &ldquo;Log this workout&rdquo; to track it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-card dashboard-card--flush card-content">
      <div className="dashboard-card-header workout-history-header">
        <h3>Workout History</h3>
        <span className="workout-history-count">{workouts.length} logged</span>
      </div>
      <div className="dashboard-card-body workout-history-list">
        {workouts.map((workout) => (
          <article key={workout.id} className="workout-history-item">
            <div className="workout-history-item-main">
              <p className="workout-history-type">
                {workout.day_label || workout.exercise_type}
              </p>
              {workout.plan_name && (
                <p className="workout-history-plan">{workout.plan_name}</p>
              )}
              {workout.notes && (
                <p className="workout-history-notes">{workout.notes}</p>
              )}
            </div>
            <div className="workout-history-item-meta">
              <p className="workout-history-duration">{workout.duration} min</p>
              <p className="workout-history-calories">{workout.calories_burned} cal</p>
              <p className="workout-history-date">
                {new Date(workout.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
