import { useEffect, useState } from 'react'
import Button from './ui/Button'
import { api } from '../services/api'

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

  return (
    <div className="dashboard-card card-content">
      <div className="dashboard-card-header">
        <h3>Fitness Passport</h3>
      </div>
      <div className="dashboard-card-body">
        <p><strong>{data.user.name}</strong></p>
        <p>Level: {data.points?.level ?? 1} · Points: {data.points?.points ?? 0}</p>
        <h4>Badges</h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {data.badges.map((b) => (
            <div key={b.id} style={{ textAlign: 'center' }}>
              <img src={b.image_url || '/images/badge-default.png'} alt={b.title} style={{ width: 64, height: 64 }} />
              <div style={{ fontSize: '0.8rem' }}>{b.title}</div>
            </div>
          ))}
        </div>
        <h4 style={{ marginTop: '1rem' }}>Recent Records</h4>
        <ul>
          {data.records.map((r) => (
            <li key={r.id}>{new Date(r.recorded_at).toLocaleDateString()} — {r.weight ? `${r.weight} kg` : ''} {r.calories_burned ? `· ${r.calories_burned} kcal` : ''}</li>
          ))}
        </ul>
        <div style={{ marginTop: '1rem' }}>
          <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Profile URL copied') }}>Share Public Card</Button>
        </div>
      </div>
    </div>
  )
}
