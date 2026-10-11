import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', fullName: '', email: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password || !form.fullName || !form.email) {
      setError('All fields are required'); return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        email: form.email,
        role: form.role,
      })
      login({
        username: res.data.username,
        fullName: res.data.fullName || form.fullName,
        roles: res.data.roles || [form.role],
        token: res.data.token,
      })
      if (form.role === 'RECRUITER') nav('/dashboard/recruiter')
      else nav('/dashboard/student')
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="form-page">
      <div className="form-card" style={{ maxWidth: 500 }}>
        <h1 className="form-title">Create Account</h1>
        <p className="form-subtitle">Join CareerConnect and discover opportunities</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={form.username} onChange={set('username')} placeholder="johndoe" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">I am a</label>
            <select className="form-select" value={form.role} onChange={set('role')}>
              <option value="STUDENT">Student</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text2)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" className="form-link">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
