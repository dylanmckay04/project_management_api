import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectForm from '../components/ProjectForm'
import axios from '../api/axios'

const { mockPost, mockPut } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}))

vi.mock('../api/axios', () => ({
  default: {
    post: mockPost,
    put: mockPut,
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}))

describe('ProjectForm - Form Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits form with project name and description', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    mockPost.mockResolvedValue({
      data: { id: 1, name: 'Test Project', description: 'Test Description' },
    })

    render(
      <ProjectForm onSuccess={onSuccess} onCancel={onCancel} />
    )

    const inputs = screen.getAllByRole('textbox')
    const textareas = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /create|save/i })

    if (inputs[0]) await user.type(inputs[0], 'Test Project')
    const textareasAll = screen.queryAllByRole('textbox')
    if (textareasAll.length > 1) await user.type(textareasAll[1] as HTMLTextAreaElement, 'Test Description')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })

    expect(onSuccess).toHaveBeenCalled()
  })

  it('displays error message on failed submission', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    mockPost.mockRejectedValue({
      response: {
        data: { detail: 'Something went wrong' },
      },
    })

    render(
      <ProjectForm onSuccess={onSuccess} onCancel={onCancel} />
    )

    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /create|save/i })

    if (inputs[0]) await user.type(inputs[0], 'Test Project')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    mockPost.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ data: { id: 1, name: 'Test' } }),
            100
          )
        )
    )

    render(
      <ProjectForm onSuccess={onSuccess} onCancel={onCancel} />
    )

    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /create|save/i })

    expect(submitButton).not.toBeDisabled()

    if (inputs[0]) await user.type(inputs[0], 'Test Project')
    await user.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    render(
      <ProjectForm onSuccess={onSuccess} onCancel={onCancel} />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills form with initial data when provided', () => {
    const onSuccess = vi.fn()
    const onCancel = vi.fn()
    const initialData = {
      name: 'Existing Project',
      description: 'Existing Description',
    }

    render(
      <ProjectForm
        projectId={1}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    if (inputs[0]) {
      expect((inputs[0] as HTMLInputElement).value).toBe('Existing Project')
    }
  })

  it('shows "Update" button text when projectId is provided', () => {
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    render(
      <ProjectForm
        projectId={1}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('calls PUT endpoint when updating existing project', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    mockPut.mockResolvedValue({
      data: { id: 1, name: 'Updated Project' },
    })

    render(
      <ProjectForm
        projectId={1}
        initialData={{ name: 'Old Project', description: 'Old' }}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /update/i })

    if (inputs[0]) {
      await user.clear(inputs[0])
      await user.type(inputs[0], 'Updated Project')
    }
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/projects/1', expect.objectContaining({ name: 'Updated Project' }))
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})
