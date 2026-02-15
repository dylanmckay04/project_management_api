import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../auth/AuthProvider'
import axios from '../api/axios'

// Mock axios
const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}))

vi.mock('../api/axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

// Test component that uses auth context
function TestComponent() {
  const { token, user, isLoadingUser, login, logout } = useAuth()

  return (
    <div>
      {token && <span data-testid="token-display">Token: {token}</span>}
      {user && <span data-testid="user-display">User: {user.email}</span>}
      {isLoadingUser && <span data-testid="loading">Loading user...</span>}
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
    mockGet.mockResolvedValue({ data: { id: 1, email: 'test@example.com' } })
  })

  it('stores and retrieves token from localStorage', async () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    const loginButton = screen.getByRole('button', { name: /login/i })
    expect(loginButton).toBeInTheDocument()
    
    loginButton.click()

    await waitFor(() => {
      expect(localStorage.getItem('pm_token')).toBe('test-token')
    })
  })

  it('clears token on logout', async () => {
    localStorage.setItem('pm_token', 'test-token')

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    // Initial state shows token in localStorage
    expect(localStorage.getItem('pm_token')).toBe('test-token')

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    logoutButton.click()

    await waitFor(() => {
      expect(localStorage.getItem('pm_token')).toBeNull()
    })
  })

  it('sets authorization header when token is present', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    const loginButton = screen.getByRole('button', { name: /login/i })
    loginButton.click()

    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toBe(
        'Bearer test-token'
      )
    })
  })

  it('removes authorization header on logout', async () => {
    localStorage.setItem('pm_token', 'test-token')

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    // Mock axios to have the header set
    axios.defaults.headers.common['Authorization'] = 'Bearer test-token'

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    logoutButton.click()

    await waitFor(() => {
      expect(
        axios.defaults.headers.common['Authorization']
      ).toBeUndefined()
    })
  })

  it('shows loading state while fetching user data', async () => {
    mockGet.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ data: { id: 1, email: 'test@example.com' } }),
            100
          )
        )
    )

    localStorage.setItem('pm_token', 'test-token')

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('persists token across page reloads', () => {
    localStorage.setItem('pm_token', 'persistent-token')

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    // Token should be persisted
    expect(localStorage.getItem('pm_token')).toBe('persistent-token')

    unmount()

    // Render again - token should still exist
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    expect(localStorage.getItem('pm_token')).toBe('persistent-token')
  })
})
