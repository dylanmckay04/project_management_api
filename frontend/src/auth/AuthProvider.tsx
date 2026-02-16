import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { User } from '../types'

type AuthContextType = {
  token: string | null
  user: User | null
  isLoadingUser: boolean
  login: (token: string) => void
  logout: () => void
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoadingUser: false,
  login: () => {},
  logout: () => {},
  refetchUser: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pm_token')
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    if (token) {
      localStorage.setItem('pm_token', token)
    } else {
      localStorage.removeItem('pm_token')
      // clear cached user on logout
      queryClient.removeQueries({ queryKey: ['me'] })
    }
  }, [token, queryClient])

  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const resp = await api.get<User>('/users/me')
        return resp.data
      } catch (error: any) {
        // If we get a 401, the token is invalid/expired - clear it
        if (error?.response?.status === 401) {
          localStorage.removeItem('pm_token')
          setToken(null)
        }
        throw error
      }
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    retry: false, // Don't retry on auth failures
  })

  useEffect(() => {
    // when token changes to a truthy value, refetch user
    if (token) refetch()
  }, [token, refetch])

  const login = (t: string) => setToken(t)
  const logout = () => setToken(null)

  return (
    <AuthContext.Provider value={{ token, user: user ?? null, isLoadingUser: isLoading, login, logout, refetchUser: refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
