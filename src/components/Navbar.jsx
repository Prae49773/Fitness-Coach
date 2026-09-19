import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from './ui/Button'
import { DASHBOARD_TABS, getActiveDashboardTab, getDashboardTabPath } from '../constants/dashboardTabs'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeTab = getActiveDashboardTab(location.search)
  const onDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/home', label: 'Explore' },
    { to: getDashboardTabPath('classes'), label: 'Classes' },
    { to: getDashboardTabPath('events'), label: 'Events' },
  ]

  const userLinks = DASHBOARD_TABS.map((tab) => ({
    to: getDashboardTabPath(tab.id),
    label: tab.label,
    active: onDashboard && activeTab === tab.id,
  }))

  const links = user ? userLinks : guestLinks

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <div className="site-nav-left">
          <Link to="/" className="site-nav-brand">
            FitAI
          </Link>

          <div className="site-nav-desktop">
            {links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className={`site-nav-link${link.active ? ' is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="site-nav-right">
          {!user ? (
            <>
              <Button to="/login" variant="secondary" size="nav" className="site-nav-auth-btn">
                Login
              </Button>
              <Button to="/register" variant="primary" size="nav" className="site-nav-auth-btn">
                Register
              </Button>
            </>
          ) : (
            <>
              <span className="site-nav-user">{user.name || user.email}</span>
              <Button type="button" variant="secondary" size="nav" className="site-nav-auth-btn" onClick={logout}>
                Logout
              </Button>
            </>
          )}

          <button
            type="button"
            className={`site-nav-burger${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-nav-mobile"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="site-nav-mobile" className={`site-nav-mobile${menuOpen ? ' is-open' : ''}`}>
        <div className="site-nav-mobile-panel">
          {links.map((link) => (
            <Link
              key={`m-${link.to}-${link.label}`}
              to={link.to}
              className={`site-nav-mobile-link${link.active ? ' is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {!user ? (
            <div className="site-nav-mobile-actions">
              <Button to="/login" variant="secondary" size="md" fullWidth>
                Login
              </Button>
              <Button to="/register" variant="primary" size="md" fullWidth>
                Register
              </Button>
            </div>
          ) : (
            <div className="site-nav-mobile-actions">
              <p className="site-nav-mobile-user">{user.name || user.email}</p>
              <Button type="button" variant="secondary" size="md" fullWidth onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
