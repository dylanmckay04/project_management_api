import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

type AuthContextType = {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pm_token')
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('pm_token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('pm_token')
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = (t: string) => setToken(t)
  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
