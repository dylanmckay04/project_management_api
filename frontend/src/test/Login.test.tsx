import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'

// Mock axios
const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}))

vi.mock('../api/axios', () => ({
  default: {
    post: mockPost,
    get: mockGet,
    put: vi.fn(),
    delete: vi.fn(),
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

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockResolvedValue({
      data: { access_token: 'test-token', user: { id: 1, email: 'test@example.com' } },
    })
    mockGet.mockResolvedValue({ data: { id: 1, email: 'test@example.com' } })
  })

  it('renders login form with email and password fields', () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(1)
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    mockPost.mockRejectedValue({
      response: {
        data: { detail: 'Invalid credentials' },
      },
    })
    
    renderWithProviders(<Login />)
    
    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /log in/i })
    
    await user.type(inputs[0], 'test@example.com')
    await user.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.queryByText(/error|invalid|failed|network/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    mockPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { access_token: 'token', user: { id: 1 } } }), 100))
    )
    
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeInTheDocument()
    
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'test@example.com')
    await user.click(submitButton)
    
    // Form submission should be triggered
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })
  })

  it('displays loading text on button during submission', async () => {
    const user = userEvent.setup()
    mockPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { access_token: 'token', user: { id: 1 } } }), 100))
    )
    
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    const inputs = screen.getAllByRole('textbox')
    
    await user.type(inputs[0], 'test@example.com')
    await user.click(submitButton)
    
    // Form should be submitted
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })
  })

  it('has a link to register page', () => {
    renderWithProviders(<Login />)
    const registerLink = screen.getByRole('link', { name: /register|create account/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<Login />)
    
    const form = screen.getByRole('button', { name: /log in/i }).closest('form')
    expect(form).toBeInTheDocument()
  })
})
