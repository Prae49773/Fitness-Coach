export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'classes', label: 'Classes' },
  { id: 'events', label: 'Events' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'history', label: 'History' },
  { id: 'profile', label: 'Profile' },
]

export function getDashboardTabPath(tabId) {
  if (tabId === 'overview') return '/dashboard'
  return `/dashboard?tab=${tabId}`
}

export function getActiveDashboardTab(search) {
  const tab = new URLSearchParams(search).get('tab')
  return DASHBOARD_TABS.some((item) => item.id === tab) ? tab : 'overview'
}
