import axios from 'axios'

// In production (Vercel), set VITE_API_URL to your Railway backend URL
// e.g. https://your-app.railway.app/api
// In development, falls back to /api (proxied by vite.config.ts to localhost:8080)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token')
      localStorage.removeItem('cc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
