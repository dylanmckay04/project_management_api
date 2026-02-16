import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'

export default function Header() {
  const { token, logout, user, isLoadingUser } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="app-header">
      <div className="header-inner container">
        <nav className="nav-links">
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
        <div className="header-right">
          {/* Dark mode toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb" />
            </span>
            <span className="theme-toggle-icon">
              {theme === 'light' ? '☀️' : '🌙'}
            </span>
          </button>

          {token && isLoadingUser && (
            <span className="header-spinner" data-testid="loading-spinner" aria-hidden="true"></span>
          )}
          {user ? (
            <>
              <Link to="/me" className="user-name">{user.full_name || user.email}</Link>
              <button className="link-btn" onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <div>
              <Link to="/login">Login</Link>
              {' / '}
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
