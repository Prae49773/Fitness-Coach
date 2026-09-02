import { formatVenue } from '../constants/venue'

export default function VenueLine({ item, className = '' }) {
  const text = formatVenue(item)
  return (
    <p className={`venue-line ${className}`.trim()}>
      <span className="venue-line-icon" aria-hidden>📍</span>
      {text}
    </p>
  )
}
