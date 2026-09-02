export default function ActivityLog({ activities }) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-bold text-text">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">{activity.action_type}</p>
              <p className="text-sm text-text-secondary">{activity.details}</p>
            </div>
            <span className="text-xs text-text-secondary">
              {new Date(activity.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
