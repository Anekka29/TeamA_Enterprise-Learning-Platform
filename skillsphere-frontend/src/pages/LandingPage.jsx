import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import { ROUTES } from '../constants/routes';
import '../styles/landing.css';

/**
 * Landing Page — full port of landing.html.
 * Scroll-reveal IntersectionObserver wired via useEffect.
 */
export default function LandingPage() {
  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <LandingLayout>
      {/* ============ HERO ============ */}
      <section className="hero-section page" id="home">
        <div className="container container-xl">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="eyebrow-badge"><span className="dot"></span> Trusted by 25,000+ students worldwide</span>
              <h1 className="hero-heading">Build Your Future with <span className="highlight">SkillSphere Nexus</span></h1>
              <p className="hero-subheading">Personalized career guidance, learning roadmaps, and skill assessments for students — all in one connected platform.</p>
              <div className="hero-cta-row">
                <Link to={ROUTES.REGISTER} className="btn btn-nexus-primary btn-lg-nexus">
                  Get Started <i className="bi bi-arrow-right ms-1"></i>
                </Link>
                <Link to={ROUTES.LOGIN} className="btn btn-nexus-outline btn-lg-nexus">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
              </div>
              <div className="hero-trust">
                <div className="avatars">
                  <span>JS</span><span>AK</span><span>RM</span><span>+</span>
                </div>
                <span>Joined by students from 120+ campuses this month</span>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="nexus-visual">
                <svg viewBox="0 0 400 400">
                  <line className="nexus-line" x1="200" y1="200" x2="80" y2="90"/>
                  <line className="nexus-line" x1="200" y1="200" x2="330" y2="70"/>
                  <line className="nexus-line" x1="200" y1="200" x2="60" y2="290"/>
                  <line className="nexus-line" x1="200" y1="200" x2="340" y2="310"/>
                  <line className="nexus-line" x1="200" y1="200" x2="200" y2="360"/>
                  <g className="nexus-node n1">
                    <circle cx="80" cy="90" r="26" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
                    <text x="80" y="96" textAnchor="middle" fontSize="18" fill="#2563EB">🎯</text>
                  </g>
                  <g className="nexus-node n2">
                    <circle cx="330" cy="70" r="22" fill="#ECFDF5" stroke="#10B981" strokeWidth="2"/>
                    <text x="330" y="76" textAnchor="middle" fontSize="16" fill="#10B981">📈</text>
                  </g>
                  <g className="nexus-node n3">
                    <circle cx="60" cy="290" r="24" fill="#ECFDF5" stroke="#10B981" strokeWidth="2"/>
                    <text x="60" y="296" textAnchor="middle" fontSize="17" fill="#10B981">🎓</text>
                  </g>
                  <g className="nexus-node n4">
                    <circle cx="340" cy="310" r="28" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
                    <text x="340" y="317" textAnchor="middle" fontSize="19" fill="#2563EB">🧭</text>
                  </g>
                  <g className="nexus-node n5">
                    <circle cx="200" cy="360" r="20" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
                    <text x="200" y="366" textAnchor="middle" fontSize="15" fill="#2563EB">🏆</text>
                  </g>
                </svg>
                <div className="nexus-center-card">
                  <div className="label">Career Match</div>
                  <div className="value">Frontend Developer</div>
                  <div className="bar"><span></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section-pad page" id="features">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow">What You Get</span>
            <h2 className="section-title">Everything you need to plan your career</h2>
            <p className="section-desc mx-auto">Four connected tools that turn uncertainty about your future into a clear, trackable plan.</p>
          </div>
          <div className="row g-4 mt-4">
            {[
              { icon: 'bi-compass', title: 'Personalized Career Guidance', desc: 'Get recommendations tailored to your interests, strengths, and academic background — not generic advice.' },
              { icon: 'bi-clipboard-check', title: 'Skill Assessment', desc: 'Take short, focused assessments that reveal exactly where you stand and what to work on next.' },
              { icon: 'bi-signpost-2', title: 'Learning Roadmaps', desc: 'Follow step-by-step paths built from real industry skill requirements, updated as roles evolve.' },
              { icon: 'bi-graph-up-arrow', title: 'Progress Tracking', desc: 'See your growth over time with visual dashboards that keep you accountable and motivated.' },
            ].map((f, i) => (
              <div key={i} className="col-md-6 col-lg-3 reveal">
                <div className="feature-card">
                  <div className="feature-icon"><i className={`bi ${f.icon}`}></i></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section-pad bg-surface page" id="roadmaps">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow">The Process</span>
            <h2 className="section-title">How SkillSphere Nexus works</h2>
            <p className="section-desc mx-auto">Four steps stand between you and a career plan built specifically for you.</p>
          </div>
          <div className="steps-wrap mt-5">
            <div className="steps-line d-none d-lg-block"></div>
            <div className="row g-4">
              {[
                { n: 1, title: 'Create Account', desc: 'Sign up in under a minute — no forms to dread.' },
                { n: 2, title: 'Complete Skill Profile', desc: 'Tell us your interests and current skill level.' },
                { n: 3, title: 'Get Career Roadmap', desc: 'Receive a personalized path matched to your goals.' },
                { n: 4, title: 'Track Progress', desc: 'Follow your roadmap and watch your skills grow.' },
              ].map((s) => (
                <div key={s.n} className="col-6 col-lg-3 step-item reveal">
                  <div className="step-number">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section-pad page" id="about">
        <div className="container container-xl">
          <div className="text-center mx-auto reveal" style={{ maxWidth: 640 }}>
            <span className="section-eyebrow">Student Stories</span>
            <h2 className="section-title">Trusted by students who found direction</h2>
            <p className="section-desc mx-auto">Real students, real roadmaps, real results.</p>
          </div>
          <div className="row g-4 mt-4">
            {[
              { initials: 'AN', name: 'Ayesha Nair', role: 'Computer Science, 3rd Year', quote: '"I had no idea what career path fit me. The skill assessment showed me gaps I didn\'t know existed, and the roadmap made the next step obvious."', stars: 5 },
              { initials: 'RK', name: 'Rohan Kulkarni', role: 'Data Science, Final Year', quote: '"The progress tracking kept me consistent. Seeing the dashboard fill up every week was oddly motivating — like a game I actually wanted to win."', stars: 5 },
              { initials: 'MS', name: 'Meera Sharma', role: 'Business Analytics, 2nd Year', quote: '"I compared three platforms before this one. SkillSphere Nexus was the only one that felt built for students, not recruiters."', stars: 4.5 },
            ].map((t, i) => (
              <div key={i} className="col-md-6 col-lg-4 reveal">
                <div className="testimonial-card">
                  <i className="bi bi-quote quote-icon"></i>
                  <div className="stars">
                    {[1,2,3,4].map(s => <i key={s} className="bi bi-star-fill"></i>)}
                    <i className={`bi ${t.stars === 5 ? 'bi-star-fill' : 'bi-star-half'}`}></i>
                  </div>
                  <p className="quote">{t.quote}</p>
                  <div className="testimonial-author">
                    <div className="avatar">{t.initials}</div>
                    <div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cta-band mt-5 reveal">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="mb-2" style={{ fontSize: '1.7rem' }}>Ready to find your path?</h2>
                <p className="mb-lg-0">Join thousands of students already building their future with a clear roadmap.</p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <Link to={ROUTES.REGISTER} className="btn btn-nexus-primary btn-lg-nexus">
                  Get Started Free <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
