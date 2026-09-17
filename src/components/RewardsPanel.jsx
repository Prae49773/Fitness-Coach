import { useEffect, useState } from 'react'
import Button from './ui/Button'
import { api } from '../services/api'
import { buildRewardSummary } from '../utils/rewardSystem'

const rewardLabelMap = {
  'partner-discounts': 'Partner discounts',
  'gym-benefits': 'Gym benefits',
  merchandise: 'Merchandise',
  'premium-features': 'Premium features',
}

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

  const summary = buildRewardSummary({
    points: me?.points?.points ?? 0,
    xp: me?.points?.xp ?? 0,
    level: me?.points?.level ?? 1,
    streak: me?.streak ?? 7,
    badges: me?.badges ?? [],
    challengeCount: me?.challengeCount ?? 0,
    transactions: me?.transactions ?? [],
  })

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
        <h3>Rewards & Achievement System</h3>
      </div>
      <div className="dashboard-card-body">
        {loading ? (
          <p>Loading rewards...</p>
        ) : (
          <div>
            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ margin: 0 }}>
                <strong>{summary.points}</strong> pts · <strong>{summary.xp}</strong> XP · Level <strong>{summary.level}</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {summary.rewardCategories.map((category) => (
                  <span key={category} className="card-status-badge" style={{ background: '#f0fdf4' }}>
                    {rewardLabelMap[category] || category}
                  </span>
                ))}
              </div>
              {summary.streakReward.unlocked && (
                <div className="mini-card" style={{ background: '#fef3c7', borderColor: '#facc15' }}>
                  <strong>{summary.streakReward.label}</strong>
                  <div>Bonus: +{summary.streakReward.pointsBonus} pts</div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
              <strong>Surprise rewards</strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {summary.surpriseRewards.length > 0 ? summary.surpriseRewards.map((reward) => (
                  <span key={reward} className="card-status-badge" style={{ background: '#ecfeff' }}>
                    {reward}
                  </span>
                )) : <span className="card-status-badge">Keep training to unlock surprise rewards</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {catalog.map((r) => (
                <div key={r.id} className="mini-card">
                  <strong>{r.title}</strong>
                  <p style={{ color: 'rgba(0,0,0,0.65)', margin: '0.35rem 0' }}>{r.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
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
