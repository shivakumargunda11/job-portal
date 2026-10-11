import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'

const emptyForm = {
  title: '', organization: '', description: '', category: 'JOB', location: '',
  workMode: 'REMOTE', eligibility: '', requiredSkills: '', deadline: '', reward: '', imageUrl: ''
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const { toasts, addToast } = useToast()
  const [tab, setTab] = useState<'postings' | 'create' | 'applicants'>('postings')
  const [postings, setPostings] = useState<any[]>([])
  const [applicants, setApplicants] = useState<any[]>([])
  const [selectedOpp, setSelectedOpp] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

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
      link.setAttribute('download', originalName || `applicant-resume-${appId}.pdf`)
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

  useEffect(() => {
    if (!user) { nav('/login'); return }
    loadPostings()
  }, [])

  const loadPostings = () => {
    setLoading(true)
    api.get('/opportunities/my').then(r => {
      setPostings(Array.isArray(r.data) ? r.data : r.data.content || [])
    }).catch(() => setPostings([])).finally(() => setLoading(false))
  }

  const loadApplicants = (oppId: number) => {
    setSelectedOpp(oppId)
    setTab('applicants')
    api.get(`/applications/opportunity/${oppId}`).then(r => {
      setApplicants(Array.isArray(r.data) ? r.data : [])
    }).catch(() => setApplicants([]))
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.organization || !form.category) {
      addToast('Title, organization, and category are required', 'error'); return
    }
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/opportunities/${editId}`, form)
        addToast('Opportunity updated!', 'success')
      } else {
        await api.post('/opportunities', form)
        addToast('Opportunity created!', 'success')
      }
      setForm({ ...emptyForm }); setEditId(null); setTab('postings'); loadPostings()
    } catch (err: any) {
      addToast(err.response?.data?.message || err.response?.data || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  const handleEdit = (opp: any) => {
    setForm({
      title: opp.title || '', organization: opp.organization || '', description: opp.description || '',
      category: opp.category || 'JOB', location: opp.location || '', workMode: opp.workMode || 'REMOTE',
      eligibility: opp.eligibility || '', requiredSkills: opp.requiredSkills || '',
      deadline: opp.deadline || '', reward: opp.reward || '', imageUrl: opp.imageUrl || ''
    })
    setEditId(opp.id); setTab('create')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this opportunity?')) return
    try {
      await api.delete(`/opportunities/${id}`)
      addToast('Opportunity deleted', 'success')
      loadPostings()
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const updateStatus = async (appId: number, status: string) => {
    try {
      await api.put(`/applications/${appId}/status?status=${status}`)
      addToast(`Status updated to ${status}`, 'success')
      if (selectedOpp) loadApplicants(selectedOpp)
    } catch { addToast('Failed to update status', 'error') }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard">
          <div className="sidebar">
            <div className="sidebar-title">Recruiter Dashboard</div>
            <div style={{ marginBottom: 20, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700 }}>{user?.fullName || user?.username}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Recruiter</div>
            </div>
            <div className="sidebar-nav">
              <div className={`sidebar-link ${tab === 'postings' ? 'active' : ''}`} onClick={() => setTab('postings')}>📋 My Postings</div>
              <div className={`sidebar-link ${tab === 'create' ? 'active' : ''}`} onClick={() => { setTab('create'); setEditId(null); setForm({ ...emptyForm }) }}>➕ Post Opportunity</div>
              {tab === 'applicants' && <div className="sidebar-link active">👥 Applicants</div>}
            </div>
          </div>

          <div className="dash-content">
            {tab === 'postings' && (
              <>
                <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="dash-title">My Postings</h2>
                    <p className="dash-subtitle">{postings.length} opportunity(s) posted</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => { setTab('create'); setEditId(null); setForm({ ...emptyForm }) }}>
                    ➕ Post New
                  </button>
                </div>
                {loading ? <div className="loading"><div className="spinner" /></div> :
                  postings.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No postings yet</div>
                      <p>Create your first opportunity posting</p>
                    </div>
                  ) : (
                    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                      <table className="table">
                        <thead><tr><th>Title</th><th>Category</th><th>Deadline</th><th>Actions</th></tr></thead>
                        <tbody>
                          {postings.map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>{p.title}</td>
                              <td><span className={`opp-badge badge-${(p.category || 'job').toLowerCase()}`}>{p.category}</span></td>
                              <td>{p.deadline || '—'}</td>
                              <td style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => loadApplicants(p.id)}>👥 Applicants</button>
                                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>✏️ Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
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

            {tab === 'create' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">{editId ? 'Edit Opportunity' : 'Post New Opportunity'}</h2>
                  <p className="dash-subtitle">Fill in the details below</p>
                </div>
                <div className="card">
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g. Software Engineer Intern" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Organization *</label>
                        <input className="form-input" value={form.organization} onChange={set('organization')} placeholder="e.g. Google" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-select" value={form.category} onChange={set('category')}>
                          <option value="JOB">Job</option>
                          <option value="INTERNSHIP">Internship</option>
                          <option value="HACKATHON">Hackathon</option>
                          <option value="COMPETITION">Competition</option>
                          <option value="SCHOLARSHIP">Scholarship</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Work Mode</label>
                        <select className="form-select" value={form.workMode} onChange={set('workMode')}>
                          <option value="REMOTE">Remote</option>
                          <option value="ONSITE">On-site</option>
                          <option value="HYBRID">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Describe the opportunity..." rows={5} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-input" value={form.location} onChange={set('location')} placeholder="e.g. Bangalore, India" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reward / Stipend</label>
                        <input className="form-input" value={form.reward} onChange={set('reward')} placeholder="e.g. ₹25,000/month" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input className="form-input" type="date" value={form.deadline} onChange={set('deadline')} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Eligibility</label>
                        <input className="form-input" value={form.eligibility} onChange={set('eligibility')} placeholder="e.g. B.Tech 2025 batch" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Required Skills (comma-separated)</label>
                      <input className="form-input" value={form.requiredSkills} onChange={set('requiredSkills')} placeholder="e.g. Java, React, SQL" />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : editId ? 'Update Opportunity' : 'Publish Opportunity'}
                      </button>
                      {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ ...emptyForm }); setTab('postings') }}>Cancel</button>}
                    </div>
                  </form>
                </div>
              </>
            )}

            {tab === 'applicants' && (
              <>
                <div className="dash-header">
                  <h2 className="dash-title">Applicants</h2>
                  <p className="dash-subtitle">Manage applications for this opportunity</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setTab('postings')} style={{ marginBottom: 16 }}>← Back to Postings</button>
                {applicants.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">👥</div>
                    <div className="empty-title">No applicants yet</div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table className="table">
                      <thead><tr><th>Student</th><th>Applied Date</th><th>Resume</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {applicants.map(a => (
                          <tr key={a.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{a.studentName || a.studentUsername || 'Student'}</div>
                              {a.studentEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{a.studentEmail}</div>}
                              {a.coverNote && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }} title={a.coverNote}>
                                  &ldquo;{a.coverNote.length > 50 ? a.coverNote.substring(0, 50) + '...' : a.coverNote}&rdquo;
                                </div>
                              )}
                            </td>
                            <td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              {a.hasResume || a.resumeOriginalName ? (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleDownloadResume(a.id, a.resumeOriginalName)}
                                  disabled={downloadingId === a.id}
                                  title={`Download ${a.resumeOriginalName || 'Resume'}`}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                  📥 {downloadingId === a.id ? 'Downloading...' : (a.resumeOriginalName || 'Download Resume')}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>No resume</span>
                              )}
                            </td>
                            <td><span className={`status status-${(a.status || 'applied').toLowerCase()}`}>{a.status || 'APPLIED'}</span></td>
                            <td style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-sm btn-outline" onClick={() => updateStatus(a.id, 'SHORTLISTED')}>Shortlist</button>
                              <button className="btn btn-sm btn-primary" onClick={() => updateStatus(a.id, 'SELECTED')}>Select</button>
                              <button className="btn btn-sm btn-danger" onClick={() => updateStatus(a.id, 'REJECTED')}>Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
