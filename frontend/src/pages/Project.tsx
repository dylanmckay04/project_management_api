import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

async function fetchProject(id: string) {
  const resp = await api.get(`/projects/${id}`)
  return resp.data
}

export default function Project() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: Boolean(id),
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <div className="container">
      <h1>{data.name || data.title}</h1>
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
