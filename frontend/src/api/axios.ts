import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-8f59b.up.railway.app'

const api = axios.create({
  baseURL,
})

export default api
