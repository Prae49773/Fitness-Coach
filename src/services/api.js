// Prefer explicit VITE_API_URL when provided (works in dev and prod).
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Cannot reach the server. Run npm run server in a separate terminal.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error:
        response.status === 404
          ? 'API not found. Make sure the backend is running (npm run server).'
          : `Request failed (${response.status})`,
    }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    onboarding: (data) => request('/auth/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    getProfile: () => request('/users/profile'),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getFoodLogs: () => request('/users/food-logs'),
    addFoodLog: (data) => request('/users/food-logs', { method: 'POST', body: JSON.stringify(data) }),
    getExerciseLogs: () => request('/users/exercise-logs'),
    addExerciseLog: (data) => request('/users/exercise-logs', { method: 'POST', body: JSON.stringify(data) }),
    getDashboardStats: () => request('/users/dashboard-stats'),
    getProgress: () => request('/users/progress'),
    addProgress: (data) => request('/users/progress', { method: 'POST', body: JSON.stringify(data) }),
    getWorkoutProgress: () => request('/users/workout-progress'),
    addWorkoutProgress: (data) => request('/users/workout-progress', { method: 'POST', body: JSON.stringify(data) }),
    getWorkoutSchedules: () => request('/users/workout-schedule'),
    addWorkoutSchedule: (data) => request('/users/workout-schedule', { method: 'POST', body: JSON.stringify(data) }),
    deleteWorkoutSchedule: (id) => request(`/users/workout-schedule/${id}`, { method: 'DELETE' }),
    getWorkoutReviews: () => request('/users/workout-reviews'),
    addWorkoutReview: (data) => request('/users/workout-reviews', { method: 'POST', body: JSON.stringify(data) }),
    updateWorkoutReview: (id, data) => request(`/users/workout-reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWorkoutReview: (id) => request(`/users/workout-reviews/${id}`, { method: 'DELETE' }),
  },
  classes: {
    getAll: () => request('/classes'),
    book: (id) => request(`/classes/${id}/book`, { method: 'POST' }),
    cancel: (id) => request(`/classes/${id}/book`, { method: 'DELETE' }),
    getMyBookings: () => request('/classes/my-bookings'),
  },
  events: {
    getAll: () => request('/events'),
    register: (id) => request(`/events/${id}/register`, { method: 'POST' }),
    cancel: (id) => request(`/events/${id}/register`, { method: 'DELETE' }),
    getMyRegistrations: () => request('/events/my-registrations'),
  },
  challenges: {
    getAll: () => request('/challenges'),
    join: (id) => request(`/challenges/${id}/join`, { method: 'POST' }),
    leave: (id) => request(`/challenges/${id}/join`, { method: 'DELETE' }),
    logProgress: (id, data) => request(`/challenges/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
    getMyChallenges: () => request('/challenges/my-challenges'),
    getLeaderboard: ({ challengeId, ...params } = {}) => {
      const query = new URLSearchParams(params).toString()
      const path = challengeId ? `/leaderboards/challenge/${challengeId}${query ? `?${query}` : ''}` : `/leaderboards/challenge/1`
      return request(path)
    },
  },
  leaderboard: {
    getGlobal: () => request('/leaderboard/global'),
    getFriends: () => request('/leaderboard/friends'),
    follow: (userId) => request(`/users/follow/${userId}`, { method: 'POST' }),
    unfollow: (userId) => request(`/users/follow/${userId}`, { method: 'DELETE' }),
  },
  workout: {
    getLatest: () => request('/workout/latest'),
    generate: (data) => request('/workout/generate', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: () => request('/workout/history'),
  },
  rewards: {
    getCatalog: () => request('/rewards/catalog'),
    getMy: () => request('/rewards/my'),
    redeem: (rewardId) => request('/rewards/redeem', { method: 'POST', body: JSON.stringify({ reward_id: rewardId }) }),
  },
  passport: {
    getPublic: (userId) => request(`/passport/${userId}`),
    getMine: () => request('/passport'),
  },
  nutrition: {
    getLatest: () => request('/nutrition/latest'),
    getPlans: () => request('/nutrition/plans'),
    activatePlan: (id) => request(`/nutrition/plans/${id}/activate`, { method: 'POST' }),
    deactivatePlan: (id) => request(`/nutrition/plans/${id}/activate`, { method: 'DELETE' }),
    logMeal: (id, data) => request(`/nutrition/plans/${id}/log-meal`, { method: 'POST', body: JSON.stringify(data) }),
    getMyPlans: () => request('/nutrition/my-plans'),
    generate: (data) => request('/nutrition/generate', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: () => request('/nutrition/history'),
  },
  admin: {
    getUsers: () => request('/admin/users'),
    getActions: () => request('/admin/actions'),
    getStats: () => request('/admin/stats'),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  },
}
