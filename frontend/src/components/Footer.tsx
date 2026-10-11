export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">CareerConnect</div>
            <p className="footer-desc">
              Discover opportunities that match your potential. Jobs, internships,
              hackathons, competitions and scholarships — all in one place.
            </p>
          </div>
          <div className="footer-col">
            <h4>Opportunities</h4>
            <ul>
              <li><a href="/opportunities?category=JOB">Jobs</a></li>
              <li><a href="/opportunities?category=INTERNSHIP">Internships</a></li>
              <li><a href="/opportunities?category=HACKATHON">Hackathons</a></li>
              <li><a href="/opportunities?category=COMPETITION">Competitions</a></li>
              <li><a href="/opportunities?category=SCHOLARSHIP">Scholarships</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} CareerConnect. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
