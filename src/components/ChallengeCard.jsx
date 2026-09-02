import { useState } from 'react'
import Button from './ui/Button'
import VenueLine from './VenueLine'
import { getCapacityState } from '../utils/capacity'

function formatUnit(value, unit) {
  if (unit === 'seconds') {
    const mins = Math.floor(value / 60)
    const secs = value % 60
    return secs ? `${mins}m ${secs}s` : `${mins} min`
  }
  if (unit === 'meters') return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${value} m`
  return `${value.toLocaleString()} ${unit || ''}`.trim()
}

function defaultIncrement(unit) {
  if (unit === 'steps') return 1000
  if (unit === 'seconds') return 60
  if (unit === 'push-ups') return 10
  if (unit === 'meters') return 500
  return 1
}

export default function ChallengeCard({
  challenge,
  onJoin,
  onLeave,
  onLogProgress,
  joined = false,
  loading = false,
  actionKey,
}) {
  const { isFull, spotsLabel, isEnrolled } = getCapacityState(challenge, {
    enrolled: joined,
    enrolledField: 'is_joined',
  })

  const [progressInput, setProgressInput] = useState('')

  const formatDateRange = (start, end) => {
    const opts = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(end).toLocaleDateString(undefined, opts)}`
  }

  const isLoading = loading && actionKey?.startsWith(`challenge-${challenge.id}`)
  const progressPct = challenge.progress_pct ?? 0
  const progressCurrent = challenge.progress_current ?? 0
  const targetValue = challenge.target_value ?? 0
  const targetUnit = challenge.target_unit ?? ''

  const handleLog = () => {
    const amount = parseInt(progressInput, 10) || defaultIncrement(targetUnit)
    onLogProgress?.(challenge, amount)
    setProgressInput('')
  }

  return (
    <div className="dashboard-card dashboard-card--flush card-content flex flex-col overflow-hidden">
      <div className="class-card-image-wrap">
        <img
          src={challenge.image_url || '/images/challenges/step-challenge.jpg'}
          alt={challenge.name}
          className="class-card-image"
        />
        <span className="class-card-type">{challenge.type || 'challenge'}</span>
        {isEnrolled && <span className="card-status-badge">Joined</span>}
      </div>

      <div className="class-card-body flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text">{challenge.name}</h3>
        <VenueLine item={challenge} className="mt-2" />
        <p className="text-sm mt-3 flex-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
          {challenge.description}
        </p>
        <div className="flex items-center text-sm mt-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
          <span>{formatDateRange(challenge.start_date, challenge.end_date)}</span>
        </div>

        {isEnrolled && targetValue > 0 && (
          <div className="challenge-progress mt-5">
            <div className="challenge-progress-header">
              <span className="challenge-progress-label">Your progress</span>
              <span className="challenge-progress-value">
                {formatUnit(progressCurrent, targetUnit)} / {formatUnit(targetValue, targetUnit)}
              </span>
            </div>
            <div className="challenge-progress-track">
              <div className="challenge-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="challenge-progress-pct">{progressPct}% complete</p>
            <div className="challenge-progress-log">
              <input
                type="number"
                min="1"
                placeholder={`+${defaultIncrement(targetUnit)} ${targetUnit}`}
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                className="auth-glass-input challenge-progress-input"
              />
              <Button
                size="sm"
                disabled={isLoading}
                onClick={handleLog}
              >
                {isLoading ? 'Saving...' : 'Log progress'}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-black/10">
          <p className="text-sm mb-5" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {isEnrolled
              ? `${challenge.participant_count ?? '—'} participants at Central Rama 2`
              : isFull
                ? 'Challenge full'
                : spotsLabel}
          </p>
          {isEnrolled ? (
            <Button
              size="md"
              fullWidth
              variant="secondary"
              disabled={isLoading}
              onClick={() => onLeave?.(challenge)}
            >
              {isLoading ? 'Leaving...' : 'Leave Challenge'}
            </Button>
          ) : (
            <Button
              size="md"
              fullWidth
              disabled={isFull || isLoading}
              onClick={() => onJoin?.(challenge)}
            >
              {isLoading ? 'Joining...' : isFull ? 'Full' : 'Join at Central Rama 2'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
