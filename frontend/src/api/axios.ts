import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-8f59b.up.railway.app'

const api = axios.create({
  baseURL,
})

// Add token to every request from localStorage
// This ensures the token is always included, even before React's useEffect runs
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
