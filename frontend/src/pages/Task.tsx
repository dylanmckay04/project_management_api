import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import TaskForm from '../components/TaskForm'

async function fetchTask(id: string) {
  const resp = await api.get(`/tasks/${id}`)
  return resp.data
}

export default function Task() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: Boolean(id),
  })

  const handleEditSuccess = () => {
    setShowEditForm(false)
    queryClient.invalidateQueries({ queryKey: ['task', id] })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      setDeleteError(null)
      await api.delete(`/tasks/${id}`)
      navigate('/tasks')
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || err.message)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <div className="container">
      <div className="header-actions">
        <h1>{data.title}</h1>
        <div className="actions">
          <button onClick={() => setShowEditForm(true)}>Edit</button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Task</h2>
            <TaskForm
              taskId={data.id}
              projectId={data.project_id}
              initialData={{
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                due_date: data.due_date,
                assigned_to: data.assigned_to,
              }}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <p>{data.description}</p>
      <p>Status: <strong>{data.status}</strong></p>
      <p>Priority: <strong>{data.priority || 'N/A'}</strong></p>
      {data.due_date && <p>Due Date: <strong>{data.due_date}</strong></p>}
      {data.assigned_to && <p>Assigned to User: <strong>{data.assigned_to}</strong></p>}
    </div>
  )
}
