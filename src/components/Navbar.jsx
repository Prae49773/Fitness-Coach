import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from './ui/Button'
import { DASHBOARD_TABS, getDashboardTabPath, getActiveDashboardTab } from '../constants/dashboardTabs'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const activeTab = location.pathname.startsWith('/dashboard')
    ? getActiveDashboardTab(location.search)
    : null

  return (
    <nav className="bg-white border-b border-black/10 sticky top-0 z-50">
      <div className="page-container">
        <div className="flex items-center justify-between h-20 gap-4 w-full">
          <Link to="/" className="text-2xl font-bold text-text tracking-wide focus-ring rounded-lg shrink-0">
            FitAI
          </Link>

          {user && (
            <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0 justify-center">
              {DASHBOARD_TABS.map((tab) => (
                <Link
                  key={tab.id}
                  to={getDashboardTabPath(tab.id)}
                  className={`dashboard-nav-tab focus-ring ${
                    activeTab === tab.id ? 'dashboard-nav-tab--active' : 'dashboard-nav-tab--inactive'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {!user ? (
              <>
                <Button to="/login" variant="secondary" size="nav" className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button to="/register" variant="primary" size="nav">
                  Register
                </Button>
              </>
            ) : (
              <>
                <div className="hidden lg:block">
                  <Button variant="secondary" size="nav" onClick={logout}>
                    Logout
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-black/20 hover:bg-black/5 transition focus-ring"
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                >
                  <span className="text-xl leading-none">{mobileOpen ? '×' : '☰'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {user && mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-black/10 pt-4">
            <div className="flex flex-wrap gap-2">
              {DASHBOARD_TABS.map((tab) => (
                <Link
                  key={tab.id}
                  to={getDashboardTabPath(tab.id)}
                  onClick={() => setMobileOpen(false)}
                  className={`dashboard-nav-tab--mobile focus-ring ${
                    activeTab === tab.id
                      ? 'dashboard-nav-tab--mobile-active'
                      : 'dashboard-nav-tab--mobile-inactive'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <Button
              variant="secondary"
              size="nav"
              fullWidth
              className="dashboard-nav-logout-mobile"
              onClick={() => {
                setMobileOpen(false)
                logout()
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
