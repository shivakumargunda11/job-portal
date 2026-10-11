import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'

export default function AdminDashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const { toasts, addToast } = useToast()
  const [tab, setTab] = useState<'users' | 'opportunities' | 'applications'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [opps, setOpps] = useState<any[]>([])
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { nav('/login'); return }
    loadData()
  }, [tab])

  const loadData = () => {
    setLoading(true)
    if (tab === 'users') {
      api.get('/dashboard/admin/users').then(r => setUsers(Array.isArray(r.data) ? r.data : []))
        .catch(() => setUsers([])).finally(() => setLoading(false))
    } else if (tab === 'opportunities') {
      api.get('/opportunities?size=100').then(r => {
        const d = r.data
        setOpps(Array.isArray(d) ? d : d.content || [])
      }).catch(() => setOpps([])).finally(() => setLoading(false))
    } else {
      api.get('/dashboard/admin/applications').then(r => setApps(Array.isArray(r.data) ? r.data : []))
        .catch(() => setApps([])).finally(() => setLoading(false))
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/dashboard/admin/users/${id}`)
      addToast('User deleted', 'success')
      loadData()
    } catch { addToast('Failed to delete user', 'error') }
  }

  const deleteOpp = async (id: number) => {
    if (!confirm('Delete this opportunity?')) return
    try {
      await api.delete(`/opportunities/${id}`)
      addToast('Opportunity deleted', 'success')
      loadData()
    } catch { addToast('Failed to delete', 'error') }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard">
          <div className="sidebar">
            <div className="sidebar-title">Admin Dashboard</div>
            <div style={{ marginBottom: 20, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700 }}>{user?.fullName || 'Admin'}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Administrator</div>
            </div>
            <div className="sidebar-nav">
              <div className={`sidebar-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Users</div>
              <div className={`sidebar-link ${tab === 'opportunities' ? 'active' : ''}`} onClick={() => setTab('opportunities')}>📋 Opportunities</div>
              <div className={`sidebar-link ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>📄 Applications</div>
            </div>
          </div>

          <div className="dash-content">
            {tab === 'users' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">User Management</h2>
                  <p className="dash-subtitle">{users.length} registered users</p>
                </div>
                {loading ? <div className="loading"><div className="spinner" /></div> :
                  <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="table">
                      <thead><tr><th>Username</th><th>Full Name</th><th>Email</th><th>Roles</th><th>Actions</th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.username}</td>
                            <td>{u.fullName || '—'}</td>
                            <td>{u.email || '—'}</td>
                            <td>{(u.roles || []).join(', ')}</td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </>
            )}

            {tab === 'opportunities' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">All Opportunities</h2>
                  <p className="dash-subtitle">{opps.length} total opportunities</p>
                </div>
                {loading ? <div className="loading"><div className="spinner" /></div> :
                  <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="table">
                      <thead><tr><th>Title</th><th>Organization</th><th>Category</th><th>Actions</th></tr></thead>
                      <tbody>
                        {opps.map(o => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => nav(`/opportunities/${o.id}`)}>{o.title}</td>
                            <td>{o.organization}</td>
                            <td><span className={`opp-badge badge-${(o.category || 'job').toLowerCase()}`}>{o.category}</span></td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => deleteOpp(o.id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </>
            )}

            {tab === 'applications' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">All Applications</h2>
                  <p className="dash-subtitle">{apps.length} total applications</p>
                </div>
                {loading ? <div className="loading"><div className="spinner" /></div> :
                  <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="table">
                      <thead><tr><th>Student</th><th>Opportunity</th><th>Applied</th><th>Resume</th><th>Status</th></tr></thead>
                      <tbody>
                        {apps.map(a => (
                          <tr key={a.id}>
                            <td>{a.studentName || a.studentUsername || '—'}</td>
                            <td>{a.opportunityTitle || '—'}</td>
                            <td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              {a.hasResume || a.resumeOriginalName ? (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={async () => {
                                    try {
                                      const res = await api.get(`/applications/${a.id}/resume`, { responseType: 'blob' })
                                      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' })
                                      const url = window.URL.createObjectURL(blob)
                                      const link = document.createElement('a')
                                      link.href = url
                                      link.setAttribute('download', a.resumeOriginalName || `resume-${a.id}.pdf`)
                                      document.body.appendChild(link)
                                      link.click()
                                      link.parentNode?.removeChild(link)
                                      window.URL.revokeObjectURL(url)
                                      addToast('Downloaded resume', 'success')
                                    } catch { addToast('Failed to download resume', 'error') }
                                  }}
                                >
                                  📥 {a.resumeOriginalName || 'Resume'}
                                </button>
                              ) : <span style={{ color: 'var(--text3)' }}>No resume</span>}
                            </td>
                            <td><span className={`status status-${(a.status || 'applied').toLowerCase()}`}>{a.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
