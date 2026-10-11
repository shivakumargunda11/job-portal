import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ToastContainer'
import ApplyModal from '../components/ApplyModal'

const icons: Record<string, string> = {
  JOB: '💼', INTERNSHIP: '🎓', HACKATHON: '🚀', COMPETITION: '🏆', SCHOLARSHIP: '📚'
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const { toasts, addToast } = useToast()
  const [opp, setOpp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  useEffect(() => {
    api.get(`/opportunities/${id}`)
      .then(r => setOpp(r.data))
      .catch(() => nav('/opportunities'))
      .finally(() => setLoading(false))

    // Check if user has already applied
    if (user) {
      api.get('/applications/my').then(r => {
        const myApps = Array.isArray(r.data) ? r.data : []
        const already = myApps.some((a: any) => String(a.opportunityId) === String(id))
        if (already) setHasApplied(true)
      }).catch(() => {})
    }
  }, [id, user])

  const handleApplyClick = () => {
    if (!user) {
      nav('/login')
      return
    }
    if (hasApplied) {
      addToast('You have already applied to this opportunity.', 'info')
      return
    }
    setShowApplyModal(true)
  }

  const handleBookmark = async () => {
    if (!user) { nav('/login'); return }
    setBookmarking(true)
    try {
      await api.post(`/bookmarks/${id}`)
      addToast('Opportunity bookmarked!', 'success')
    } catch (err: any) {
      addToast(err.response?.data?.message || err.response?.data || 'Failed to bookmark', 'error')
    } finally { setBookmarking(false) }
  }

  if (loading) return <div className="page"><div className="loading"><div className="spinner" /></div></div>
  if (!opp) return null

  const cat = opp.category?.toUpperCase() || 'JOB'

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav(-1)} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <div className="opp-detail-header">
          <div className="opp-detail-logo">{icons[cat] || '📄'}</div>
          <div>
            <div className={`opp-badge badge-${cat.toLowerCase()}`} style={{ marginBottom: 8 }}>{cat}</div>
            <h1 className="opp-detail-title">{opp.title}</h1>
            <p className="opp-detail-org">{opp.organization}</p>
            <div className="opp-detail-tags">
              {opp.location && <span className="opp-detail-tag">📍 {opp.location}</span>}
              {opp.workMode && <span className="opp-detail-tag">🏠 {opp.workMode}</span>}
              {opp.deadline && <span className="opp-detail-tag">⏰ Deadline: {opp.deadline}</span>}
              {opp.reward && <span className="opp-detail-tag">🎁 {opp.reward}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          {hasApplied ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--success)',
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              ✅ Applied
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleApplyClick}>
              🚀 Apply Now
            </button>
          )}
          <button className="btn btn-outline btn-lg" onClick={handleBookmark} disabled={bookmarking}>
            {bookmarking ? 'Saving...' : '🔖 Bookmark'}
          </button>
        </div>

        {opp.description && (
          <div className="opp-detail-section card">
            <h3>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{opp.description}</p>
          </div>
        )}

        {opp.eligibility && (
          <div className="opp-detail-section card">
            <h3>Eligibility</h3>
            <p>{opp.eligibility}</p>
          </div>
        )}

        {opp.requiredSkills && (
          <div className="opp-detail-section card">
            <h3>Required Skills</h3>
            <div>
              {opp.requiredSkills.split(',').map((s: string, i: number) => (
                <span key={i} className="skill-tag">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showApplyModal && (
        <ApplyModal
          opportunity={opp}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setHasApplied(true)
            addToast('Application submitted with your resume!', 'success')
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
