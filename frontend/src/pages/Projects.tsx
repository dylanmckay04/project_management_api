import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { Link } from 'react-router-dom'

async function fetchProjects() {
  const resp = await api.get('/projects')
  return resp.data
}

export default function Projects() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading projects</div>

  return (
    <div className="container">
      <h1>Your Projects</h1>
      <ul>
        {(data || []).map((p: any) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name || p.title || `Project ${p.id}`}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
