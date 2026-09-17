import { useEffect, useState } from 'react'
import Button from './ui/Button'
import { api } from '../services/api'

export default function RewardsPanel() {
  const [catalog, setCatalog] = useState([])
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [c, m] = await Promise.all([api.rewards.getCatalog(), api.rewards.getMy().catch(() => null)])
        if (!mounted) return
        setCatalog(c || [])
        setMe(m || null)
      } catch (err) {
        console.error('Load rewards failed', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const redeem = async (id) => {
    try {
      await api.rewards.redeem(id)
      alert('Redeemed — check your transactions in profile')
      const m = await api.rewards.getMy()
      setMe(m)
    } catch (err) {
      alert(err.message || 'Redeem failed')
    }
  }

  return (
    <div className="dashboard-card card-content">
      <div className="dashboard-card-header">
        <h3>Rewards & Shop</h3>
      </div>
      <div className="dashboard-card-body">
        {loading ? (
          <p>Loading rewards...</p>
        ) : (
          <div>
            <p>Your points: {me?.points?.points ?? 0} · Level: {me?.points?.level ?? 1}</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {catalog.map((r) => (
                <div key={r.id} className="mini-card">
                  <strong>{r.title}</strong>
                  <p style={{ color: 'rgba(0,0,0,0.65)' }}>{r.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small>{r.cost_points} pts</small>
                    <Button size="sm" variant="primary" onClick={() => redeem(r.id)}>Redeem</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
