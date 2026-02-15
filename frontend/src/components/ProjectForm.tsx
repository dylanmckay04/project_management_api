import React, { useState, useEffect } from 'react'
import api from '../api/axios'

type ProjectFormProps = {
  projectId?: number
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    name: string
    description?: string
  }
}

export default function ProjectForm({ projectId, onSuccess, onCancel, initialData }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (projectId) {
        // Update
        await api.put(`/projects/${projectId}`, { name, description })
      } else {
        // Create
        await api.post('/projects', { name, description })
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
        <label>Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : projectId ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
