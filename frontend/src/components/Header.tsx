import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Header() {
  const { token, logout, user } = useAuth()

  return (
    <header className="app-header">
      <div className="header-inner container">
        <nav className="nav-links">
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
        </nav>
        <div className="header-right">
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
