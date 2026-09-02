import Button from './ui/Button'

export default function UserTable({ users, onView, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-background">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-background">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">{user.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                <span className={`px-2 py-1 rounded-full text-xs ${user.onboarding_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {user.onboarding_completed ? 'Active' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView?.(user)}>
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(user)}>
                    Edit
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
