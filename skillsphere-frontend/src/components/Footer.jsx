import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Landing page footer — exact port of landing.html footer section.
 */
export default function Footer() {
  return (
    <footer className="footer-nexus">
      <div className="container container-xl">
        <div className="row g-4">
          <div className="col-lg-4 footer-brand">
            <a className="brand-logo mb-3 d-inline-flex" href="#home" style={{ color: '#fff' }}>
              <span className="mark"><i className="bi bi-hexagon-fill"></i></span>
              SkillSphere Nexus
            </a>
            <p>Personalized career guidance, learning roadmaps, and skill assessments — helping students turn ambition into a clear plan.</p>
            <div className="mt-3">
              <a href="#" className="social-icon"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-icon"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h6>Platform</h6>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#roadmaps">Roadmaps</a>
            <a href="#about">About</a>
          </div>

          <div className="col-6 col-lg-2">
            <h6>Resources</h6>
            <a href="#">Career Blog</a>
            <a href="#">Guides</a>
            <a href="#">FAQs</a>
            <a href="#">Help Center</a>
          </div>

          <div className="col-6 col-lg-2">
            <h6>Company</h6>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>

          <div className="col-6 col-lg-2">
            <h6>Get Started</h6>
            <Link to={ROUTES.LOGIN}>Login</Link>
            <Link to={ROUTES.REGISTER}>Sign Up</Link>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 text-center text-md-start">
          <span>© 2026 SkillSphere Nexus. All rights reserved.</span>
          <span>Built for students, by students.</span>
        </div>
      </div>
    </footer>
  );
}
