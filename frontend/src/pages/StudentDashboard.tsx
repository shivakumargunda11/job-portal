import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const { toasts, addToast } = useToast()
  const [tab, setTab] = useState<'applications' | 'bookmarks'>('applications')
  const [apps, setApps] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) { nav('/login'); return }
    api.get('/dashboard/student').then(r => setProfile(r.data)).catch(() => {})
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get('/applications/my').catch(() => ({ data: [] })),
      api.get('/bookmarks/my').catch(() => ({ data: [] })),
    ]).then(([a, b]) => {
      setApps(Array.isArray(a.data) ? a.data : a.data.content || [])
      setBookmarks(Array.isArray(b.data) ? b.data : b.data.content || [])
    }).finally(() => setLoading(false))
  }

  const removeBookmark = async (id: number) => {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks(b => b.filter(x => x.id !== id))
      addToast('Bookmark removed', 'success')
    } catch { addToast('Failed to remove bookmark', 'error') }
  }

  const handleDownloadResume = async (appId: number, originalName?: string) => {
    setDownloadingId(appId)
    try {
      const res = await api.get(`/applications/${appId}/resume`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/octet-stream',
      })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', originalName || `resume-${appId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      addToast('Resume downloaded successfully', 'success')
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to download resume', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-title">Student Dashboard</div>
            <div style={{ marginBottom: 20, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile?.fullName || user?.fullName || user?.username}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{profile?.email || ''}</div>
              <div style={{ marginTop: 6, display: 'inline-block', fontSize: '0.75rem', background: 'rgba(108,71,255,0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4 }}>
                Student
              </div>
            </div>
            <div className="sidebar-nav">
              <div className={`sidebar-link ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>
                📋 My Applications
              </div>
              <div className={`sidebar-link ${tab === 'bookmarks' ? 'active' : ''}`} onClick={() => setTab('bookmarks')}>
                🔖 Bookmarks
              </div>
              <div className="sidebar-link" onClick={() => nav('/opportunities')}>
                🔍 Browse Opportunities
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="dash-content">
            {tab === 'applications' && (
              <>
                <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="dash-title">My Applications</h2>
                    <p className="dash-subtitle">Track the status of all your applications & uploaded resumes</p>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={loadData}>
                    🔄 Refresh
                  </button>
                </div>

                {loading ? <div className="loading"><div className="spinner" /></div> :
                  apps.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No applications yet</div>
                      <p>Start exploring opportunities and apply with your resume!</p>
                      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/opportunities')}>
                        Browse Opportunities
                      </button>
                    </div>
                  ) : (
                    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Opportunity</th>
                            <th>Organization</th>
                            <th>Applied Date</th>
                            <th>Uploaded Resume</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apps.map(a => (
                            <tr key={a.id}>
                              <td style={{ fontWeight: 600 }}>
                                <span
                                  style={{ cursor: 'pointer', color: 'var(--text)' }}
                                  onClick={() => a.opportunityId && nav(`/opportunities/${a.opportunityId}`)}
                                >
                                  {a.opportunityTitle || 'Opportunity'}
                                </span>
                              </td>
                              <td>{a.organization || '—'}</td>
                              <td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                              <td>
                                {a.hasResume || a.resumeOriginalName ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                      className="btn btn-ghost btn-sm"
                                      style={{
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg3)',
                                        color: 'var(--text)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                      }}
                                      onClick={() => handleDownloadResume(a.id, a.resumeOriginalName)}
                                      disabled={downloadingId === a.id}
                                      title={`Download ${a.resumeOriginalName || 'Resume'}`}
                                    >
                                      📄 {downloadingId === a.id ? 'Downloading...' : (a.resumeOriginalName || 'View Resume')}
                                    </button>
                                    {a.resumeSize && (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                                        ({formatFileSize(a.resumeSize)})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>No resume</span>
                                )}
                              </td>
                              <td>
                                <span className={`status status-${(a.status || 'applied').toLowerCase()}`}>
                                  {a.status || 'APPLIED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </>
            )}

            {tab === 'bookmarks' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">Bookmarks</h2>
                  <p className="dash-subtitle">Opportunities you saved for later</p>
                </div>
                {loading ? <div className="loading"><div className="spinner" /></div> :
                  bookmarks.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">🔖</div>
                      <div className="empty-title">No bookmarks yet</div>
                      <p>Bookmark opportunities to save them for later</p>
                    </div>
                  ) : (
                    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Opportunity</th>
                            <th>Organization</th>
                            <th>Saved</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookmarks.map(b => (
                            <tr key={b.id}>
                              <td style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => b.opportunityId && nav(`/opportunities/${b.opportunityId}`)}>
                                {b.opportunityTitle || 'Opportunity'}
                              </td>
                              <td>{b.organization || '—'}</td>
                              <td>{b.savedAt ? new Date(b.savedAt).toLocaleDateString() : '—'}</td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => removeBookmark(b.id)}>Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
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
