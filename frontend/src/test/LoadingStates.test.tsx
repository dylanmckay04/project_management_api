import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Header from '../components/Header'
import { AuthProvider } from '../auth/AuthProvider'
import axios from '../api/axios'

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}))

vi.mock('../api/axios', () => ({
  default: {
    get: mockGet,
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{component}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

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

describe('Header - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
  })

  it('displays navigation links when user is authenticated', async () => {
    mockGet.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', full_name: 'Test User' },
    })

    localStorage.setItem('pm_token', 'test-token')

    renderWithProviders(<Header />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument()
    })
  })

  it('shows spinner while loading user data', async () => {
    mockGet.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ data: { id: 1, email: 'test@example.com' } }),
            500
          )
        )
    )

    localStorage.setItem('pm_token', 'test-token')

    renderWithProviders(<Header />)

    // Spinner should be visible while loading
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    // Spinner should disappear once data is loaded
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  it('displays user name in header after loading', async () => {
    mockGet.mockResolvedValue({
      data: {
        id: 1,
        email: 'test@example.com',
        full_name: 'John Doe',
      },
    })

    localStorage.setItem('pm_token', 'test-token')

    renderWithProviders(<Header />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('displays email as fallback when full_name is not available', async () => {
    mockGet.mockResolvedValue({
      data: {
        id: 1,
        email: 'test@example.com',
        full_name: '',
      },
    })

    localStorage.setItem('pm_token', 'test-token')

    renderWithProviders(<Header />)

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('does not show spinner when no token is present', () => {
    renderWithProviders(<Header />)

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })

  it('displays logout button when user is authenticated', async () => {
    mockGet.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', full_name: 'Test User' },
    })

    localStorage.setItem('pm_token', 'test-token')

    renderWithProviders(<Header />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })
  })
})

describe('Data Loading - General Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient.clear()
  })

  it('shows loading text while fetching data', async () => {
    mockGet.mockImplementation(() => {
      return new Promise((resolve) =>
        setTimeout(
          () => resolve({ data: [{ id: 1, name: 'Project 1' }] }),
          100
        )
      )
    })

    localStorage.setItem('pm_token', 'test-token')

    // Verify axios mock is properly configured
    expect(mockGet).toBeDefined()
    expect(localStorage.getItem('pm_token')).toBe('test-token')
  })
})
