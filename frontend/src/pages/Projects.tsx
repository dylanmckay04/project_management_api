import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import ProjectForm from '../components/ProjectForm'

async function fetchProjects() {
  const resp = await api.get('/projects')
  return resp.data
}

export default function Projects() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }
    
    try {
      setDeleteError(null)
      await api.delete(`/projects/${projectId}`)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || err.message)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading projects</div>

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Your Projects</h1>
        <button onClick={() => setShowCreateForm(true)}>+ New Project</button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Project</h2>
            <ProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <ul className="project-list">
        {(data || []).map((p: any) => (
          <li key={p.id} className="project-item">
            <Link to={`/projects/${p.id}`}>{p.name || p.title || `Project ${p.id}`}</Link>
            <button
              className="delete-btn"
              onClick={() => handleDelete(p.id)}
              title="Delete project"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
