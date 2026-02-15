import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

async function fetchTask(id: string) {
  const resp = await api.get(`/tasks/${id}`)
  return resp.data
}

export default function Task() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: Boolean(id),
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <div className="container">
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <p>Status: {data.status}</p>
    </div>
  )
}
