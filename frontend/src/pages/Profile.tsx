import React, { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../auth/AuthProvider'

export default function Profile() {
  const { token, logout, user: data, isLoadingUser: isLoading, refetchUser } = useAuth()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  React.useEffect(() => {
    if (data) setFullName(data.full_name || '')
  }, [data])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload: any = {}
      if (fullName) payload.full_name = fullName
      if (password) payload.password = password
      await api.put(`/users/${data.id}`, payload)
      // refresh cached user from AuthProvider
      refetchUser()
      setEditing(false)
      setPassword('')
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>No user data</div>

  return (
    <div className="container">
      <div className="header-actions">
        <h1>Your Profile</h1>
        <div className="actions">
          <button onClick={() => logout()}>Logout</button>
        </div>
      </div>

      {!editing ? (
        <div>
          <p><strong>Name:</strong> {data.full_name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Joined:</strong> {new Date(data.created_at).toLocaleString()}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="form">
          <div>
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label>New password (leave blank to keep current)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {saveError && <p className="error">{saveError}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
