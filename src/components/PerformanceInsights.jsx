import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function PerformanceInsights({ workouts = [], onStartQuick }) {
  const data = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return { key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), calories: 0, minutes: 0, count: 0 }
    })

    const byDay = Object.fromEntries(days.map((d) => [d.key, d]))

    workouts.forEach((w) => {
      const dateKey = (w.date && new Date(w.date).toISOString().slice(0, 10)) || (w.created_at && new Date(w.created_at).toISOString().slice(0, 10))
      if (!dateKey) return
      if (!byDay[dateKey]) return
      byDay[dateKey].calories += Number(w.calories || w.calories_burned || 0)
      byDay[dateKey].minutes += Number(w.duration || w.minutes || 0)
      byDay[dateKey].count += 1
    })

    return Object.values(byDay)
  }, [workouts])

  const summary = useMemo(() => {
    const now = new Date()
    const days28 = Array.from({ length: 28 }).map((_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))
    const dayKeys28 = new Set(days28.map((d) => d.toISOString().slice(0, 10)))

    const logsByDay = {}
    workouts.forEach((w) => {
      const d = (w.date && new Date(w.date)) || (w.created_at && new Date(w.created_at))
      if (!d) return
      const key = d.toISOString().slice(0, 10)
      logsByDay[key] = logsByDay[key] || []
      logsByDay[key].push(w)
    })

    const daysWithWorkout = days28.reduce((acc, d) => acc + (logsByDay[d.toISOString().slice(0, 10)] ? 1 : 0), 0)
    const consistency = Math.round((daysWithWorkout / 28) * 100)

    // streak (consecutive days ending yesterday/today)
    let streak = 0
    for (let i = 0; i < 28; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (logsByDay[key]) streak++
      else break
    }

    // strongest category (by minutes)
    const byType = {}
    workouts.forEach((w) => {
      const t = w.type || w.exercise_type || w.name || 'unknown'
      byType[t] = (byType[t] || 0) + Number(w.duration || w.minutes || 0)
    })
    const strongest = Object.keys(byType).sort((a, b) => byType[b] - byType[a])[0] || '—'

    // improvement area: the type with the least minutes among known types
    const types = Object.keys(byType)
    const improvement = types.length > 0 ? types.sort((a, b) => byType[a] - byType[b])[0] : 'add more variety'

    // recovery score (simple heuristic): average rest days between workouts in last 28 days
    const workoutDates = Object.keys(logsByDay).sort()
    let avgRest = 2
    if (workoutDates.length >= 2) {
      const diffs = []
      for (let i = 1; i < workoutDates.length; i++) {
        const a = new Date(workoutDates[i - 1])
        const b = new Date(workoutDates[i])
        diffs.push(Math.round((b - a) / (1000 * 60 * 60 * 24)))
      }
      avgRest = Math.max(0.5, diffs.reduce((s, n) => s + n, 0) / diffs.length)
    }
    const recoveryScore = Math.max(0, Math.min(100, Math.round((Math.min(avgRest, 7) / 7) * 100)))

    // next best action: protect streak
    const todayKey = new Date().toISOString().slice(0, 10)
    const hasToday = !!logsByDay[todayKey]
    const nextAction = hasToday ? 'Keep going — you already logged a workout today.' : 'Complete a 20-minute workout today to protect your streak.'

    return { consistency, streak, strongest, improvement, recoveryScore, nextAction }
  }, [workouts])

  return (
    <div className="dashboard-card card-content">
      <h3 className="dashboard-card-title">Performance Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#000" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface/60 rounded-lg p-3">
              <div className="text-xs text-text-secondary">Consistency</div>
              <div className="text-xl font-bold">{summary.consistency}%</div>
            </div>
            <div className="bg-surface/60 rounded-lg p-3">
              <div className="text-xs text-text-secondary">Recovery</div>
              <div className="text-xl font-bold">{summary.recoveryScore}%</div>
            </div>
            <div className="bg-surface/60 rounded-lg p-3">
              <div className="text-xs text-text-secondary">Streak</div>
              <div className="text-xl font-bold">{summary.streak}d</div>
            </div>
            <div className="bg-surface/60 rounded-lg p-3">
              <div className="text-xs text-text-secondary">Strongest</div>
              <div className="text-xl font-bold">{summary.strongest}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-text-secondary mb-2">Improvement Area</div>
            <div className="font-medium mb-3">{summary.improvement}</div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="text-sm font-semibold">Next Best Action</div>
              <div className="text-text-secondary mt-1">{summary.nextAction}</div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onStartQuick && onStartQuick()}
                  className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition"
                >
                  Start 20‑minute Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
