import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'

async function fetchTasks() {
  const resp = await api.get('/tasks')
  return resp.data
}

export default function Tasks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading tasks</div>

  return (
    <div className="container">
      <h1>Your Tasks</h1>
      <ul>
        {(data || []).map((t: any) => (
          <li key={t.id}>
            <Link to={`/tasks/${t.id}`}>{t.title || `Task ${t.id}`}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
