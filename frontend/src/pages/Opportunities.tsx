import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api'
import OpportunityCard from '../components/OpportunityCard'

const categories = ['ALL', 'JOB', 'INTERNSHIP', 'HACKATHON', 'COMPETITION', 'SCHOLARSHIP']

export default function Opportunities() {
  const [params, setParams] = useSearchParams()
  const [opps, setOpps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState(params.get('search') || '')
  const activeCat = params.get('category') || 'ALL'

  const fetchOpps = (cat: string, pg: number, q: string) => {
    setLoading(true)
    let url = `/opportunities?page=${pg}&size=12`
    if (cat !== 'ALL') url += `&category=${cat}`
    if (q) url += `&search=${encodeURIComponent(q)}`
    api.get(url).then(r => {
      const d = r.data
      if (Array.isArray(d)) { setOpps(d); setTotalPages(1) }
      else { setOpps(d.content || []); setTotalPages(d.totalPages || 1) }
    }).catch(() => { setOpps([]); setTotalPages(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOpps(activeCat, page, search)
  }, [activeCat, page])

  const handleCat = (c: string) => {
    setPage(0)
    const p = new URLSearchParams()
    if (c !== 'ALL') p.set('category', c)
    if (search) p.set('search', search)
    setParams(p)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchOpps(activeCat, 0, search)
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
            {activeCat === 'ALL' ? 'All Opportunities' : `${activeCat.charAt(0) + activeCat.slice(1).toLowerCase()}s`}
          </h1>
          <p style={{ color: 'var(--text2)' }}>Browse and apply to the best opportunities for you</p>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <div className="search-bar">
            <input className="search-input" placeholder="Search opportunities..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="search-btn">Search</button>
          </div>
        </form>

        <div className="categories">
          {categories.map(c => (
            <button key={c} className={`cat-pill ${activeCat === c ? 'active' : ''}`} onClick={() => handleCat(c)}>
              {c === 'ALL' ? '🔥 All' : c === 'JOB' ? '💼' : c === 'INTERNSHIP' ? '🎓' : c === 'HACKATHON' ? '🚀' : c === 'COMPETITION' ? '🏆' : '📚'}{' '}
              {c === 'ALL' ? '' : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : opps.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No opportunities found</div>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="opp-grid">
              {opps.map(o => <OpportunityCard key={o.id} opp={o} />)}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                  <button key={i} className={`page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
