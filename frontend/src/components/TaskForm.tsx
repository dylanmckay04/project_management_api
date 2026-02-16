import React, { useState } from 'react'
import api from '../api/axios'
import { Task } from '../types'

type TaskFormProps = {
  taskId?: number
  projectId: number
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'assigned_to'>>
}

export default function TaskForm({
  taskId,
  projectId,
  onSuccess,
  onCancel,
  initialData,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState(initialData?.status || 'todo')
  const [priority, setPriority] = useState(initialData?.priority || 'medium')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [assignedTo, setAssignedTo] = useState(initialData?.assigned_to || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'project_id'> & { project_id: number } = {
        title,
        description,
        status: status as Task['status'],
        priority: priority as Task['priority'],
        due_date: dueDate || null,
        assigned_to: assignedTo ? parseInt(assignedTo as string) : null,
        project_id: projectId,
      }

      if (taskId) {
        // Update
        await api.put(`/tasks/${taskId}`, payload)
      } else {
        // Create
        await api.post('/tasks/', payload)
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div>
        <label>Task Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div>
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label>Assigned To (User ID)</label>
        <input
          type="number"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Optional"
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : taskId ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
