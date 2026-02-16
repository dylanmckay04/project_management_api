import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from "./pages/Register"
import Projects from "./pages/Projects"
import Project from "./pages/Project"
import Tasks from './pages/Tasks'
import Task from './pages/Task'
import Profile from './pages/Profile'
import { useAuth } from './auth/AuthProvider'

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Guest({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/projects" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route path="/register" element={<Guest><Register /></Guest>} />
      <Route
        path="/projects"
        element={<Protected><Projects /></Protected>}
      />
      <Route
        path="/projects/:id"
        element={<Protected><Project /></Protected>}
      />
      <Route
        path="/tasks"
        element={<Protected><Tasks /></Protected>}
      />
      <Route
        path="/tasks/:id"
        element={<Protected><Task /></Protected>}
      />
      <Route path="/me" element={<Protected><Profile /></Protected>} />
      <Route path="/" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}
