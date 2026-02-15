// User type matches /users/me and /users/{id} responses
export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Project type for list and detail
export interface Project {
  id: number
  name: string
  description?: string
  owner_id: number
  created_at: string
  updated_at: string
}

// Project with tasks (for /projects/{id})
export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

// Task type for list and detail
export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string | null
  assigned_to?: number | null
  project_id: number
  created_at: string
  updated_at: string
}
