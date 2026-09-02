export default function StatsCard({ title, value, change, icon }) {
  return (
    <div className="dashboard-card card-content">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'rgba(0,0,0,0.5)' }}>{title}</p>
          <p className="text-3xl font-bold text-text">{value}</p>
          {change && (
            <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.45)' }}>
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  )
}
