import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + '/') ? 'nav-link active' : 'nav-link'

  const handleLogout = () => { logout(); navigate('/') }

  const dashPath = user
    ? user.roles.some(r => r.includes('ADMIN')) ? '/dashboard/admin'
      : user.roles.some(r => r.includes('RECRUITER')) ? '/dashboard/recruiter'
      : '/dashboard/student'
    : '/login'

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">CareerConnect</Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/opportunities?category=JOB" className="nav-link">Jobs</Link>
          <Link to="/opportunities?category=INTERNSHIP" className="nav-link">Internships</Link>
          <Link to="/opportunities?category=HACKATHON" className="nav-link">Hackathons</Link>
          <Link to="/opportunities?category=COMPETITION" className="nav-link">Competitions</Link>
          <Link to="/opportunities?category=SCHOLARSHIP" className="nav-link">Scholarships</Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to={dashPath} className="btn btn-ghost btn-sm">
                👤 {user.fullName || user.username}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
