import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import StatsCard from '../components/StatsCard'
import UserTable from '../components/UserTable'
import ActivityLog from '../components/ActivityLog'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [actions, setActions] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalActions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, actionsData, statsData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getActions(),
        api.admin.getStats(),
      ])
      setUsers(usersData)
      setActions(actionsData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (userData) => {
    alert(`User: ${userData.name}\nEmail: ${userData.email}\nRole: ${userData.role}\nStatus: ${userData.onboarding_completed ? 'Active' : 'Pending'}`)
  }

  const handleEditUser = async (userData) => {
    const newRole = prompt(`Change role for ${userData.name} (current: ${userData.role}):`, userData.role)
    if (newRole && newRole !== userData.role) {
      try {
        await api.admin.updateUserRole(userData.id, newRole)
        alert('Role updated successfully!')
        loadData()
      } catch (err) {
        alert(err.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="page-container py-8 lg:py-12 flex-1">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage users and monitor platform activity"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <StatsCard title="Total Users" value={stats.totalUsers} />
          <StatsCard title="Active Users" value={stats.activeUsers} />
          <StatsCard title="Total Actions" value={stats.totalActions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-2xl shadow-sm overflow-hidden card-content">
            <div className="px-6 lg:px-8 py-4 border-b border-border">
              <h3 className="text-xl font-bold text-text">All Users</h3>
            </div>
            <UserTable users={users} onView={handleViewUser} onEdit={handleEditUser} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <ActivityLog activities={actions} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
