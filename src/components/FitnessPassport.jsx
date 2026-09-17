import { useEffect, useState } from 'react'
import Button from './ui/Button'
import { api } from '../services/api'
import { buildPassportSummary } from '../utils/rewardSystem'

export default function FitnessPassport({ userId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = userId ? await api.passport.getPublic(userId) : await api.passport.getMine()
        if (!mounted) return
        setData(res)
      } catch (err) {
        console.error('Load passport failed', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [userId])

  if (loading) return <div className="dashboard-card card-content"><div className="dashboard-card-body">Loading passport...</div></div>
  if (!data) return null

  const summary = buildPassportSummary({
    user: data.user,
    points: data.points,
    badges: data.badges,
    challenges: data.challenges,
    records: data.records,
    programs: data.programs || [],
  })

  return (
    <div className="dashboard-card card-content">
      <div className="dashboard-card-header">
        <h3>Fitness Passport</h3>
      </div>
      <div className="dashboard-card-body">
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}><strong>{summary.userName}</strong></p>
          <p style={{ margin: 0 }}>{summary.skillLevel} · {data.points?.points ?? 0} pts · {data.points?.xp ?? 0} XP</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="card-status-badge">Verified: {summary.verifiedBadges}</span>
            <span className="card-status-badge">Challenges: {summary.challengeCount}</span>
            <span className="card-status-badge">Programs: {summary.programCount}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <strong>Verified achievements</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(data.badges || []).map((b) => (
              <div key={b.id} style={{ textAlign: 'center', minWidth: 72 }}>
                <img src={b.image_url || '/images/badge-default.svg'} alt={b.title} style={{ width: 54, height: 54, display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{b.title}</div>
                {b.seasonal && <div style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.55)' }}>{b.season_name || 'Seasonal badge'}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <strong>Challenge history</strong>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {(data.challenges || []).slice(0, 4).map((challenge) => (
              <li key={challenge.id}>{challenge.title || challenge.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <strong>Personal records</strong>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {(data.records || []).slice(0, 4).map((r) => (
              <li key={r.id}>{new Date(r.recorded_at).toLocaleDateString()} — {r.weight ? `${r.weight} kg` : ''} {r.calories_burned ? `· ${r.calories_burned} kcal` : ''}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <strong>Completed programs</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {(data.programs || []).length > 0 ? (data.programs || []).slice(0, 4).map((program) => (
              <span key={program.id} className="card-status-badge">{program.title || program.plan_name || 'Program'}</span>
            )) : <span className="card-status-badge">No completed programs yet</span>}
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={() => {
            const shareText = summary.publicCard
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareText)
              alert('Public achievement summary copied')
            } else {
              alert(shareText)
            }
          }}>Share Public Card</Button>
        </div>
      </div>
    </div>
  )
}
