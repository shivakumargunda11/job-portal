import { useNavigate } from 'react-router-dom'

interface Opp {
  id: number
  title: string
  organization: string
  category: string
  location?: string
  workMode?: string
  deadline?: string
  reward?: string
}

const icons: Record<string, string> = {
  JOB: '💼', INTERNSHIP: '🎓', HACKATHON: '🚀', COMPETITION: '🏆', SCHOLARSHIP: '📚'
}

export default function OpportunityCard({ opp }: { opp: Opp }) {
  const nav = useNavigate()
  const cat = opp.category?.toUpperCase() || 'JOB'
  const badgeClass = `opp-badge badge-${cat.toLowerCase()}`

  return (
    <div className="opp-card" onClick={() => nav(`/opportunities/${opp.id}`)}>
      <div className="opp-card-header">
        <div className="opp-logo">{icons[cat] || '📄'}</div>
        <span className={badgeClass}>{cat}</span>
      </div>
      <div className="opp-title">{opp.title}</div>
      <div className="opp-org">{opp.organization}</div>
      <div className="opp-meta">
        {opp.location && <span className="opp-tag">📍 {opp.location}</span>}
        {opp.workMode && <span className="opp-tag">🏠 {opp.workMode}</span>}
      </div>
      <div className="opp-footer">
        <span className="opp-deadline">{opp.deadline ? `⏰ ${opp.deadline}` : ''}</span>
        <span className="opp-reward">{opp.reward || ''}</span>
      </div>
    </div>
  )
}
