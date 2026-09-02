import Button from './ui/Button'
import VenueLine from './VenueLine'
import { getCapacityState } from '../utils/capacity'

export default function ClassCard({
  fitnessClass,
  onBook,
  onCancel,
  booking = false,
  loading = false,
  actionKey,
}) {
  const { isFull, spotsLabel, isEnrolled } = getCapacityState(fitnessClass, {
    enrolled: booking,
    enrolledField: 'is_booked',
  })

  const formatSchedule = (schedule) => {
    const date = new Date(schedule)
    return date.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isLoading = loading && actionKey === `class-${fitnessClass.id}`

  return (
    <div className="dashboard-card dashboard-card--flush card-content flex flex-col overflow-hidden">
      <div className="class-card-image-wrap">
        <img
          src={fitnessClass.image_url || '/images/classes/morning-yoga.jpg'}
          alt={fitnessClass.name}
          className="class-card-image"
        />
        <span className="class-card-type">{fitnessClass.type}</span>
        {isEnrolled && <span className="card-status-badge">Booked</span>}
      </div>

      <div className="class-card-body flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text">{fitnessClass.name}</h3>
        <VenueLine item={fitnessClass} className="mt-2" />
        <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
          Instructor: {fitnessClass.instructor}
        </p>
        {fitnessClass.description && (
          <p className="text-sm mt-3 flex-1" style={{ color: 'rgba(0,0,0,0.6)' }}>
            {fitnessClass.description}
          </p>
        )}
        <div className="flex items-center text-sm mt-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
          <span>{formatSchedule(fitnessClass.schedule)}</span>
        </div>

        <div className="mt-auto pt-6 border-t border-black/10">
          <p className="text-sm mb-5" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {isEnrolled ? 'You are booked' : isFull ? 'Class full' : spotsLabel}
          </p>
          {isEnrolled ? (
            <Button
              size="md"
              fullWidth
              variant="secondary"
              disabled={isLoading}
              onClick={() => onCancel?.(fitnessClass)}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          ) : (
            <Button
              size="md"
              fullWidth
              disabled={isFull || isLoading}
              onClick={() => onBook?.(fitnessClass)}
            >
              {isLoading ? 'Booking...' : isFull ? 'Full' : 'Book at Central Rama 2'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
