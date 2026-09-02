import { formatVenue } from '../constants/venue'

function formatProgress(challenge) {
  if (!challenge?.target_value) return null
  const current = challenge.progress_current ?? 0
  const pct = challenge.progress_pct ?? 0
  const unit = challenge.target_unit || ''
  return `${current.toLocaleString()} / ${challenge.target_value.toLocaleString()} ${unit} (${pct}%)`
}

export default function UserActivityPanel({
  bookings = [],
  registrations = [],
  myChallenges = [],
  myMealPlans = [],
  stats,
}) {
  const items = [
    ...bookings.map((b) => ({
      id: `class-${b.id}`,
      label: b.name,
      meta: `Class · ${formatVenue(b)}`,
      detail: b.instructor ? `Instructor: ${b.instructor}` : null,
      date: b.schedule,
    })),
    ...registrations.map((r) => ({
      id: `event-${r.id}`,
      label: r.name,
      meta: `Event · ${formatVenue(r)}`,
      detail: null,
      date: r.event_date,
    })),
    ...myChallenges.map((c) => ({
      id: `challenge-${c.id}`,
      label: c.name,
      meta: `Challenge · ${formatVenue(c)}`,
      detail: formatProgress(c),
      date: c.start_date,
    })),
    ...myMealPlans.map((p) => ({
      id: `plan-${p.id}`,
      label: p.name,
      meta: 'Meal plan',
      detail: p.calories_logged_today != null
        ? `${p.calories_logged_today} / ${p.daily_calories} kcal today`
        : `${p.daily_calories} kcal/day target`,
      date: p.started_at,
    })),
  ].slice(0, 8)

  const summary = [
    { label: 'Classes', value: stats?.class_bookings ?? bookings.length },
    { label: 'Events', value: stats?.event_registrations ?? registrations.length },
    { label: 'Challenges', value: stats?.challenges_joined ?? myChallenges.length },
    { label: 'Meal plans', value: stats?.active_meal_plans ?? myMealPlans.length },
  ]

  return (
    <div className="dashboard-card card-content user-activity-panel">
      <div className="dashboard-card-header">
        <div>
          <h3 className="dashboard-card-title">Your Activity</h3>
          <p className="user-activity-subtitle">Central Rama 2 Gym, Bangkok</p>
        </div>
      </div>

      <div className="user-activity-stats">
        {summary.map((item) => (
          <div key={item.label} className="user-activity-stat">
            <span className="user-activity-stat-value">{item.value}</span>
            <span className="user-activity-stat-label">{item.label}</span>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="user-activity-empty">
          Book a class, register for an event at Central Rama 2, join a challenge, or start a meal plan.
        </p>
      ) : (
        <ul className="user-activity-list">
          {items.map((item) => (
            <li key={item.id} className="user-activity-item">
              <div>
                <p className="user-activity-item-label">{item.label}</p>
                <p className="user-activity-item-meta">{item.meta}</p>
                {item.detail && <p className="user-activity-item-detail">{item.detail}</p>}
              </div>
              {item.date && (
                <time className="user-activity-item-date">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
