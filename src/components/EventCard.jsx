import Button from './ui/Button'
import VenueLine from './VenueLine'
import { getCapacityState } from '../utils/capacity'

export default function EventCard({
  event,
  onRegister,
  onCancel,
  registered = false,
  loading = false,
  actionKey,
}) {
  const { isFull, spotsLabel, isEnrolled } = getCapacityState(event, {
    enrolled: registered,
    enrolledField: 'is_registered',
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isLoading = loading && actionKey === `event-${event.id}`

  return (
    <div className="dashboard-card dashboard-card--flush card-content flex flex-col overflow-hidden">
      <div className="class-card-image-wrap">
        <img
          src={event.image_url || '/images/events/marathon-training.jpg'}
          alt={event.name}
          className="class-card-image"
        />
        <span className="class-card-type">{event.type}</span>
        {isEnrolled && <span className="card-status-badge">Registered</span>}
      </div>

      <div className="class-card-body flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text">{event.name}</h3>
        <VenueLine item={event} className="mt-2" />
        <p className="text-sm mt-3 flex-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
          {event.description}
        </p>
        <div className="flex items-center text-sm mt-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
          <span>{formatDate(event.event_date)}</span>
        </div>

        <div className="mt-auto pt-6 border-t border-black/10">
          <p className="text-sm mb-5" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {isEnrolled ? 'You are registered' : isFull ? 'Event full' : spotsLabel}
          </p>
          {isEnrolled ? (
            <Button
              size="md"
              fullWidth
              variant="secondary"
              disabled={isLoading}
              onClick={() => onCancel?.(event)}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Registration'}
            </Button>
          ) : (
            <Button
              size="md"
              fullWidth
              disabled={isFull || isLoading}
              onClick={() => onRegister?.(event)}
            >
              {isLoading ? 'Registering...' : isFull ? 'Full' : 'Register · Central Rama 2'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
