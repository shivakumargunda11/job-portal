import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) { setError('All fields are required'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      login({
        username: res.data.username,
        fullName: res.data.fullName || res.data.username,
        roles: res.data.roles || [],
        token: res.data.token,
      })
      const roles: string[] = res.data.roles || []
      if (roles.some((r: string) => r.includes('ADMIN'))) nav('/dashboard/admin')
      else if (roles.some((r: string) => r.includes('RECRUITER'))) nav('/dashboard/recruiter')
      else nav('/dashboard/student')
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1 className="form-title">Welcome back</h1>
        <p className="form-subtitle">Log in to your CareerConnect account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text2)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" className="form-link">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
