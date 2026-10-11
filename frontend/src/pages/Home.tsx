import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import OpportunityCard from '../components/OpportunityCard'

const categories = ['ALL', 'JOB', 'INTERNSHIP', 'HACKATHON', 'COMPETITION', 'SCHOLARSHIP']

export default function Home() {
  const [opps, setOpps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    api.get('/opportunities?size=6').then(r => {
      const data = r.data
      setOpps(Array.isArray(data) ? data : data.content || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    nav(`/opportunities?search=${encodeURIComponent(search)}`)
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">🔥 India's #1 Career Platform</div>
          <h1 className="hero-title">
            Discover Your Next<br /><span>Career Opportunity</span>
          </h1>
          <p className="hero-subtitle">
            Explore thousands of jobs, internships, hackathons, competitions, and
            scholarships from top companies and organizations.
          </p>
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <input
                className="search-input"
                placeholder="Search jobs, internships, hackathons..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
          <div className="stats">
            <div className="stat"><div className="stat-num">10K+</div><div className="stat-label">Opportunities</div></div>
            <div className="stat"><div className="stat-num">500+</div><div className="stat-label">Companies</div></div>
            <div className="stat"><div className="stat-num">1M+</div><div className="stat-label">Students</div></div>
            <div className="stat"><div className="stat-num">95%</div><div className="stat-label">Success Rate</div></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ padding: '60px 24px' }}>
        <div className="section-header">
          <h2 className="section-title">Explore by Category</h2>
          <Link to="/opportunities" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="categories">
          {categories.slice(1).map(c => (
            <Link key={c} to={`/opportunities?category=${c}`} className="cat-pill">
              {c === 'JOB' ? '💼' : c === 'INTERNSHIP' ? '🎓' : c === 'HACKATHON' ? '🚀' : c === 'COMPETITION' ? '🏆' : '📚'}{' '}
              {c.charAt(0) + c.slice(1).toLowerCase()}s
            </Link>
          ))}
        </div>
      </section>

      {/* Latest opportunities */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <div className="section-header">
          <h2 className="section-title">Latest Opportunities</h2>
          <Link to="/opportunities" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : opps.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No opportunities yet</div>
            <p>Check back soon or register as a recruiter to post one!</p>
          </div>
        ) : (
          <div className="opp-grid">
            {opps.map(o => <OpportunityCard key={o.id} opp={o} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a0a3d 0%, #0f0f1a 100%)', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>
            Ready to kickstart your career?
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: '1.1rem' }}>
            Join thousands of students who found their dream opportunity on CareerConnect.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free</Link>
        </div>
      </section>
    </>
  )
}
