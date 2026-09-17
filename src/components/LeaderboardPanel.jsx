import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const SCOPES = [
  { value: 'global', label: 'Global' },
  { value: 'regional', label: 'Regional' },
  { value: 'gym', label: 'Gym' },
  { value: 'age', label: 'Age Group' },
  { value: 'gender', label: 'Gender' },
  { value: 'friends', label: 'Friends' },
]

const PERIODS = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: '30 days' },
  { value: '7d', label: '7 days' },
]

export default function LeaderboardPanel() {
  const [challengeId, setChallengeId] = useState('1')
  const [scope, setScope] = useState('global')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [period, setPeriod] = useState('all')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    api.challenges.getLeaderboard({
      challengeId,
      scope,
      category,
      location,
      period,
    })
      .then((data) => {
        if (active) setRows(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [challengeId, scope, category, location, period])

  const challengeLabel = useMemo(() => {
    if (!rows.length) return 'No challenge selected'
    return `Challenge #${challengeId}`
  }, [challengeId, rows])

  return (
    <div className="dashboard-card dashboard-card--flush card-content">
      <div className="dashboard-card-header">
        <h3>Dynamic Leaderboards</h3>
      </div>

      <div className="dashboard-card-body">
        <div className="leaderboard-toolbar">
          <label>
            Challenge
            <select value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
              <option value="1">Step Challenge</option>
              <option value="2">Plank Challenge</option>
              <option value="3">100 Push-ups Challenge</option>
              <option value="4">Run a 5K</option>
            </select>
          </label>

          <label>
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Strength, cardio..." />
          </label>

          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bangkok, Bangkok..." />
          </label>

          <label>
            Time
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="leaderboard-filter-row">
          {SCOPES.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`leaderboard-pill ${scope === item.value ? 'active' : ''}`}
              onClick={() => setScope(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="leaderboard-summary">
          <span>{challengeLabel}</span>
          <small>{scope} ranking</small>
        </div>

        <div className="leaderboard-list">
          {loading ? (
            <div className="leaderboard-empty">Loading leaderboard…</div>
          ) : rows.length === 0 ? (
            <div className="leaderboard-empty">No leaderboard entries for this filter yet.</div>
          ) : (
            rows.map((entry) => (
              <div key={entry.user_id} className="leaderboard-row">
                <div className="leaderboard-rank">#{entry.rank}</div>
                <div className="leaderboard-main">
                  <strong>{entry.name}</strong>
                  <span>
                    {entry.city || 'Global'} · {entry.age ? `${entry.age} yrs` : 'All ages'} · {entry.gender || 'No gender'}
                  </span>
                </div>
                <div className="leaderboard-metrics">
                  <strong>{entry.progress_current ?? 0}</strong>
                  <span>{entry.target_unit || 'points'} · {entry.progress_pct ?? 0}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
