import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import TaskForm from '../components/TaskForm'

async function fetchTasks(projectId?: number) {
  const params = projectId ? { project_id: projectId } : {}
  const resp = await api.get('/tasks', { params })
  return resp.data
}

async function fetchProjects() {
  const resp = await api.get('/projects')
  return resp.data
}

export default function Tasks() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const { data: tasks, isLoading: tasksLoading, error } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => fetchTasks(selectedProjectId || undefined),
  })

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      setDeleteError(null)
      await api.delete(`/tasks/${taskId}`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || err.message)
    }
  }

  if (projectsLoading || tasksLoading) return <div>Loading...</div>
  if (error) return <div>Error loading tasks</div>

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Your Tasks</h1>
        {selectedProjectId && (
          <button onClick={() => setShowCreateForm(true)}>+ New Task</button>
        )}
      </div>

      <div>
        <label>Filter by Project</label>
        <select
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Tasks</option>
          {(projects || []).map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {showCreateForm && selectedProjectId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Task</h2>
            <TaskForm
              projectId={selectedProjectId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <ul className="task-list">
        {(tasks || []).map((t: any) => (
          <li key={t.id} className="task-item">
            <div>
              <Link to={`/tasks/${t.id}`}>{t.title || `Task ${t.id}`}</Link>
              <span className="status-badge" data-status={t.status}>{t.status}</span>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(t.id)}
              title="Delete task"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
