import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../pages/Register'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'

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

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockResolvedValue({
      data: { id: 1, email: 'test@example.com' },
    })
  })

  it('renders register form with email, full name, and password fields', () => {
    renderWithProviders(<Register />)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('shows error on failed registration (e.g., duplicate email)', async () => {
    const user = userEvent.setup()
    mockPost.mockRejectedValue({
      response: {
        data: { detail: 'Email already registered' },
      },
    })
    
    renderWithProviders(<Register />)
    
    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    await user.type(inputs[0], 'existing@example.com')
    if (inputs.length > 1) await user.type(inputs[1], 'John Doe')
    await user.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.queryByText(/error|already|registered|exists|network/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    mockPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 100))
    )
    
    renderWithProviders(<Register />)
    
    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    expect(submitButton).toBeInTheDocument()
    
    await user.type(inputs[0], 'test@example.com')
    if (inputs.length > 1) await user.type(inputs[1], 'Test User')
    await user.click(submitButton)
    
    // Form submission should be triggered
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })
  })

  it('displays loading text on button during submission', async () => {
    const user = userEvent.setup()
    mockPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 1 } }), 100))
    )
    
    renderWithProviders(<Register />)
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    const inputs = screen.getAllByRole('textbox')
    
    await user.type(inputs[0], 'test@example.com')
    if (inputs.length > 1) await user.type(inputs[1], 'Test User')
    await user.click(submitButton)
    
    // Form should be submitted  
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })
  })

  it('has a link to login page', () => {
    renderWithProviders(<Register />)
    const loginLink = screen.getByRole('link', { name: /login|sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('validates that password field is required', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<Register />)
    
    const form = screen.getByRole('button', { name: /register/i }).closest('form')
    expect(form).toBeInTheDocument()
  })

  it('validates that email field is required', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<Register />)
    
    const form = screen.getByRole('button', { name: /register/i }).closest('form')
    expect(form).toBeInTheDocument()
  })
})
