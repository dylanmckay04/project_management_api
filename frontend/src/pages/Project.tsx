import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import ProjectForm from '../components/ProjectForm'

async function fetchProject(id: string) {
  const resp = await api.get(`/projects/${id}`)
  return resp.data
}

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: Boolean(id),
  })

  const handleEditSuccess = () => {
    setShowEditForm(false)
    queryClient.invalidateQueries({ queryKey: ['project', id] })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }

    try {
      setDeleteError(null)
      await api.delete(`/projects/${id}`)
      navigate('/projects')
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || err.message)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <div className="container">
      <div className="header-actions">
        <h1>{data.name || data.title}</h1>
        <div className="actions">
          <button onClick={() => setShowEditForm(true)}>Edit</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Project</h2>
            <ProjectForm
              projectId={data.id}
              initialData={{ name: data.name, description: data.description }}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <p>{data.description}</p>

      <h2>Tasks</h2>
      <ul>
        {(data.tasks || []).map((t: any) => (
          <li key={t.id}>{t.title} - {t.status}</li>
        ))}
      </ul>
    </div>
  )
}
