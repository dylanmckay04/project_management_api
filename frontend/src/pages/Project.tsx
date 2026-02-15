import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import ProjectForm from '../components/ProjectForm'
import TaskForm from '../components/TaskForm'

async function fetchProject(id: string) {
  const resp = await api.get(`/projects/${id}`)
  return resp.data
}

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditProjectForm, setShowEditProjectForm] = useState(false)
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: Boolean(id),
  })

  const projectId = parseInt(id!)

  const handleProjectEditSuccess = () => {
    setShowEditProjectForm(false)
    queryClient.invalidateQueries({ queryKey: ['project', id] })
  }

  const handleProjectDelete = async () => {
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

  const handleTaskCreateSuccess = () => {
    setShowCreateTaskForm(false)
    queryClient.invalidateQueries({ queryKey: ['project', id] })
  }

  const handleTaskEditSuccess = () => {
    setEditingTaskId(null)
    queryClient.invalidateQueries({ queryKey: ['project', id] })
  }

  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      setDeleteError(null)
      await api.delete(`/tasks/${taskId}`)
      queryClient.invalidateQueries({ queryKey: ['project', id] })
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
          <button onClick={() => setShowEditProjectForm(true)}>Edit Project</button>
          <button className="delete-btn" onClick={handleProjectDelete}>Delete Project</button>
        </div>
      </div>

      {showEditProjectForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Project</h2>
            <ProjectForm
              projectId={data.id}
              initialData={{ name: data.name, description: data.description }}
              onSuccess={handleProjectEditSuccess}
              onCancel={() => setShowEditProjectForm(false)}
            />
          </div>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <p>{data.description}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
        <h2>Tasks</h2>
        <button onClick={() => setShowCreateTaskForm(true)}>+ New Task</button>
      </div>

      {showCreateTaskForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Task</h2>
            <TaskForm
              projectId={projectId}
              onSuccess={handleTaskCreateSuccess}
              onCancel={() => setShowCreateTaskForm(false)}
            />
          </div>
        </div>
      )}

      {editingTaskId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Task</h2>
            <TaskForm
              taskId={editingTaskId}
              projectId={projectId}
              initialData={{
                title: data.tasks?.find((t: any) => t.id === editingTaskId)?.title || '',
                description: data.tasks?.find((t: any) => t.id === editingTaskId)?.description || '',
                status: data.tasks?.find((t: any) => t.id === editingTaskId)?.status || 'todo',
                priority: data.tasks?.find((t: any) => t.id === editingTaskId)?.priority || 'medium',
                due_date: data.tasks?.find((t: any) => t.id === editingTaskId)?.due_date || '',
                assigned_to: data.tasks?.find((t: any) => t.id === editingTaskId)?.assigned_to,
              }}
              onSuccess={handleTaskEditSuccess}
              onCancel={() => setEditingTaskId(null)}
            />
          </div>
        </div>
      )}

      <ul className="task-list">
        {(data.tasks || []).map((t: any) => (
          <li key={t.id} className="task-item">
            <div>
              <strong>{t.title}</strong>
              <span className="status-badge" data-status={t.status}>{t.status}</span>
              <span style={{ marginLeft: '10px', color: '#666' }}>Priority: {t.priority || 'N/A'}</span>
            </div>
            <div className="actions">
              <button onClick={() => setEditingTaskId(t.id)}>Edit</button>
              <button className="delete-btn" onClick={() => handleTaskDelete(t.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
