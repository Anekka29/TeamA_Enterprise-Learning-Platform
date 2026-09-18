import { useState, useEffect } from 'react';
import courseBadgeImg from '../../../assets/images/course-completed-badge.jpg';
import logoImg from '../../../assets/images/logo.png';
import CourseContentService from '../../../services/CourseContentService';

function formatDate(dateStr) {
  let d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ----------------------------------------------------------------------
// PRESTIGIOUS 3D SKILLSPHERE NEXUS ACHIEVEMENT SHIELD MEDALLION (PURE SVG)
// ----------------------------------------------------------------------
function ModuleBadgeGraphic({ moduleTitle, courseTitle, size = 260, isClaimed = true }) {
  const cleanModuleTitle = (moduleTitle || 'MODULE TOPIC')
    .replace(/^Module \d+:\s*/i, '')
    .trim();

  // Determine topic-based 3D emblem symbol
  const titleLower = cleanModuleTitle.toLowerCase();
  let topicSymbol = '🏆';

  if (titleLower.includes('react') || titleLower.includes('architecture') || titleLower.includes('frontend')) {
    topicSymbol = '⚛️';
  } else if (titleLower.includes('dom') || titleLower.includes('state') || titleLower.includes('virtual')) {
    topicSymbol = '⚡';
  } else if (titleLower.includes('sql') || titleLower.includes('database') || titleLower.includes('schema')) {
    topicSymbol = '🌁';
  } else if (titleLower.includes('spring') || titleLower.includes('java') || titleLower.includes('backend')) {
    topicSymbol = '☕';
  } else if (titleLower.includes('security') || titleLower.includes('jwt')) {
    topicSymbol = '🛡️';
  } else if (titleLower.includes('capstone') || titleLower.includes('testing') || titleLower.includes('performance')) {
    topicSymbol = '🏅';
  }

  const titleLength = cleanModuleTitle.length;
  const fontSizeFactor = titleLength > 28 ? 10 : titleLength > 18 ? 12 : 14;

  return (
    <div
      className="position-relative mx-auto d-flex align-items-center justify-content-center"
      style={{
        width: `${size}px`,
        height: `${size * 1.1}px`,
        filter: isClaimed ? 'drop-shadow(0 16px 36px rgba(16,185,129,0.45))' : 'grayscale(0.85) opacity(0.45)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 320 360"
        width={size}
        height={size * 1.125}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Metallic Gold Bevel Gradient */}
          <linearGradient id="goldBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Deep Emerald Shield Background */}
          <linearGradient id="emeraldShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d4a3a" />
            <stop offset="50%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* 3D Embossed Metallic Ribbon Gradient */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Radial Light Glow Effect */}
          <radialGradient id="innerLightGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0d4a3a" stopOpacity="0" />
          </radialGradient>

          {/* Drop Shadows */}
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Outer 3D Gold Shield Frame */}
        <path
          d="M 160 12 L 290 60 L 290 200 C 290 270 210 325 160 348 C 110 325 30 270 30 200 L 30 60 Z"
          fill="url(#goldBevelGrad)"
          filter="url(#badgeShadow)"
        />

        {/* 2. Inner Deep Emerald Shield Core */}
        <path
          d="M 160 22 L 278 66 L 278 195 C 278 258 204 310 160 332 C 116 310 42 258 42 195 L 42 66 Z"
          fill="url(#emeraldShieldGrad)"
          stroke="#fbbf24"
          strokeWidth="2.5"
        />

        {/* 3. Radial Tech Glow Overlay */}
        <path
          d="M 160 22 L 278 66 L 278 195 C 278 258 204 310 160 332 C 116 310 42 258 42 195 L 42 66 Z"
          fill="url(#innerLightGlow)"
        />

        {/* 4. Decorative Golden Laurel Leaf Branch */}
        <g stroke="#fbbf24" strokeWidth="2.5" fill="none" opacity="0.9">
          <path d="M 60 135 Q 50 165 65 195 Q 75 215 95 235" />
          <path d="M 260 135 Q 270 165 255 195 Q 245 215 225 235" />
          <circle cx="62" cy="135" r="3.5" fill="#fbbf24" />
          <circle cx="72" cy="165" r="3.5" fill="#fbbf24" />
          <circle cx="82" cy="195" r="3.5" fill="#fbbf24" />
          <circle cx="258" cy="135" r="3.5" fill="#fbbf24" />
          <circle cx="248" cy="165" r="3.5" fill="#fbbf24" />
          <circle cx="238" cy="195" r="3.5" fill="#fbbf24" />
        </g>

        {/* 5. Top Emblem & Gold Stars */}
        <g textAnchor="middle">
          <text x="160" y="68" fontSize="42" filter="url(#badgeShadow)">{topicSymbol}</text>
          <text x="120" y="95" fontSize="14" fill="#fbbf24">★</text>
          <text x="160" y="92" fontSize="18" fill="#fbbf24">★</text>
          <text x="200" y="95" fontSize="14" fill="#fbbf24">★</text>

          {/* Enterprise Learning Platform with Skill and Career Guidance System Brand Header */}
          <text x="160" y="116" fontSize="13" fontWeight="900" fill="#ffffff" letterSpacing="2" fontFamily="system-ui, sans-serif">
            SKILLSPHERE NEXUS
          </text>
          <text x="160" y="132" fontSize="9" fontWeight="700" fill="#34d399" letterSpacing="2" fontFamily="system-ui, sans-serif">
            ACADEMIC ACHIEVEMENT
          </text>
        </g>

        {/* 6. Center 3D Embossed Metallic Ribbon */}
        <g filter="url(#badgeShadow)">
          {/* Ribbon Fold Tails */}
          <path d="M 20 185 L 45 165 L 45 225 L 20 205 Z" fill="#047857" />
          <path d="M 300 185 L 275 165 L 275 225 L 300 205 Z" fill="#047857" />

          {/* Main Ribbon Container */}
          <rect
            x="35"
            y="160"
            width="250"
            height="68"
            rx="10"
            fill="url(#ribbonGrad)"
            stroke="#fbbf24"
            strokeWidth="2.5"
          />
        </g>

        {/* 7. Dynamic Module Name Text inside Ribbon */}
        <g textAnchor="middle">
          <rect x="100" y="167" width="120" height="16" rx="8" fill="#fbbf24" />
          <text x="160" y="179" fontSize="9" fontWeight="900" fill="#0d4a3a" letterSpacing="1" fontFamily="system-ui, sans-serif">
            MODULE MASTER
          </text>

          <text
            x="160"
            y="206"
            fontSize={fontSizeFactor}
            fontWeight="900"
            fill="#ffffff"
            letterSpacing="0.5"
            fontFamily="system-ui, sans-serif"
            style={{ textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
          >
            {cleanModuleTitle.length > 26 ? `${cleanModuleTitle.substring(0, 24)}...` : cleanModuleTitle}
          </text>
        </g>

        {/* 8. Bottom Gold Verification Seal */}
        <g textAnchor="middle">
          <circle cx="160" cy="275" r="24" fill="#0d4a3a" stroke="#fbbf24" strokeWidth="2.5" filter="url(#badgeShadow)" />
          <text x="160" y="282" fontSize="20" fill="#34d399">✔</text>
          <text x="160" y="316" fontSize="10" fontWeight="900" fill="#fbbf24" letterSpacing="1.5" fontFamily="system-ui, sans-serif">
            VERIFIED BADGE
          </text>
        </g>
      </svg>
    </div>
  );
}

// Dynamic Module Generator for Courses
function getCourseModules(course) {
  if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
    return course.modules;
  }

  const title = (course.title || course.courseTitle || '').toLowerCase();
  
  if (title.includes('react') || title.includes('frontend')) {
    return [
      { id: 'm1', title: 'Module 1: Scalable React Delivery & Architecture', desc: 'Component architecture, design tokens, and modular directory structures.', topic: 'React Architecture', icon: 'bi-filetype-jsx', color: '#0284c7', bg: '#e0f2fe' },
      { id: 'm2', title: 'Module 2: Virtual DOM, State & Reconciliation', desc: 'Understanding fiber reconciliation, hook state cycles, and immutability.', topic: 'Virtual DOM & State', icon: 'bi-cpu-fill', color: '#0ea5e9', bg: '#f0f9ff' },
      { id: 'm3', title: 'Module 3: Micro-Frontends & Distributed Rendering', desc: 'Module federation, lazy loading, and sub-app integration.', topic: 'Micro-Frontends', icon: 'bi-diagram-3-fill', color: '#06b6d4', bg: '#ecfeff' },
      { id: 'm4', title: 'Module 4: Performance & SSR Optimization', desc: 'Server-side rendering, bundle splitting, and memoization techniques.', topic: 'Performance & SSR', icon: 'bi-lightning-charge-fill', color: '#d97706', bg: '#fffbeb' },
      { id: 'm5', title: 'Module 5: Enterprise Deployment & Testing Pipelines', desc: 'Jest unit tests, Playwright E2E, CI/CD automated deployments.', topic: 'Testing & CI/CD', icon: 'bi-shield-check', color: '#059669', bg: '#ecfdf5' }
    ];
  } else if (title.includes('sql') || title.includes('database')) {
    return [
      { id: 'm1', title: 'Module 1: Relational Schema Design & DDL', desc: 'Normalization, primary/foreign keys, and schema definition language.', topic: 'Schema Design', icon: 'bi-database-gear', color: '#059669', bg: '#ecfdf5' },
      { id: 'm2', title: 'Module 2: Complex Queries & JOIN Operations', desc: 'INNER, LEFT, RIGHT JOINs, aggregate functions, and window functions.', topic: 'SQL Queries & JOINs', icon: 'bi-search', color: '#10b981', bg: '#f0fdf4' },
      { id: 'm3', title: 'Module 3: Indexing, Transactions & ACID Guarantees', desc: 'B-Tree indexes, isolation levels, commit/rollback, and deadlock avoidance.', topic: 'Transactions & ACID', icon: 'bi-lock-fill', color: '#d97706', bg: '#fffbeb' },
      { id: 'm4', title: 'Module 4: Stored Procedures & Triggers', desc: 'Automating database logic using PL/SQL routines and trigger events.', topic: 'Procedures & Triggers', icon: 'bi-code-square', color: '#4f46e5', bg: '#eef2ff' },
      { id: 'm5', title: 'Module 5: Performance Tuning & Optimization', desc: 'EXPLAIN execution plans, query optimization, and connection pooling.', topic: 'Performance Tuning', icon: 'bi-speedometer', color: '#7c3aed', bg: '#f5f3ff' }
    ];
  } else if (title.includes('java') || title.includes('spring') || title.includes('backend')) {
    return [
      { id: 'm1', title: 'Module 1: Core Java & OOP Architecture', desc: 'Polymorphism, inheritance, interfaces, and JVM memory management.', topic: 'Java OOP', icon: 'bi-filetype-java', color: '#ea580c', bg: '#fff7ed' },
      { id: 'm2', title: 'Module 2: Spring Boot Framework & Bean Container', desc: 'Dependency injection, auto-configuration, and application properties.', topic: 'Spring Boot Core', icon: 'bi-box-seam-fill', color: '#16a34a', bg: '#f0fdf4' },
      { id: 'm3', title: 'Module 3: Spring Data JPA & Database Persistence', desc: 'Entity mappings, repositories, JPQL queries, and database migrations.', topic: 'Spring Data JPA', icon: 'bi-database-fill-check', color: '#0284c7', bg: '#e0f2fe' },
      { id: 'm4', title: 'Module 4: RESTful API Security & JWT Authentication', desc: 'Spring Security, filter chains, JWT tokens, and OAuth2 integration.', topic: 'Security & JWT', icon: 'bi-shield-lock-fill', color: '#7c3aed', bg: '#f5f3ff' },
      { id: 'm5', title: 'Module 5: Microservices & Cloud Deployment', desc: 'Docker containerization, Spring Cloud Gateway, and service discovery.', topic: 'Microservices & Cloud', icon: 'bi-cloud-check-fill', color: '#2563eb', bg: '#eff6ff' }
    ];
  } else {
    return [
      { id: 'm1', title: `Module 1: Fundamentals of ${course.title || 'Course'}`, desc: 'Core principles, environment setup, and baseline concepts.', topic: 'Foundations', icon: 'bi-book-half', color: '#2563eb', bg: '#eff6ff' },
      { id: 'm2', title: `Module 2: Intermediate Concepts & Practical Application`, desc: 'Practical exercises, key workflows, and scenario implementations.', topic: 'Practical Work', icon: 'bi-tools', color: '#0ea5e9', bg: '#f0f9ff' },
      { id: 'm3', title: `Module 3: Advanced Optimization & Industry Standards`, desc: 'Deep dive into optimization, design patterns, and edge cases.', topic: 'Advanced Mastery', icon: 'bi-stars', color: '#d97706', bg: '#fffbeb' },
      { id: 'm4', title: `Module 4: Real-World Case Studies & Project Modules`, desc: 'Building comprehensive solutions and end-to-end project modules.', topic: 'Case Studies', icon: 'bi-journal-code', color: '#7c3aed', bg: '#f5f3ff' },
      { id: 'm5', title: `Module 5: Capstone Synthesis & Final Evaluation`, desc: 'Curriculum review, synthesis assessments, and final validation.', topic: 'Capstone', icon: 'bi-trophy-fill', color: '#059669', bg: '#ecfdf5' }
    ];
  }
}

// ----------------------------------------------------------------------
// MODAL 1: Luxury Dark Glassmorphism Achievement Showcase Modal
// ----------------------------------------------------------------------
function ModuleBadgeModal({ badge, studentName, onClose }) {
  const badgeId = `BADGE-${String(badge.courseId || 100).padStart(3, '0')}-M${badge.moduleIndex + 1}`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(2, 26, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #092820 0%, #064e3b 50%, #021a14 100%)',
          borderRadius: '28px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(52,211,153,0.2)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          animation: 'modalScaleUp 0.35s cubic-bezier(0.16,1,0.3,1)',
          color: '#ffffff',
        }}
      >
        <style>{`
          @keyframes modalScaleUp {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @media print {
            .no-print { display: none !important; }
            body * { visibility: hidden; }
            .badge-printable, .badge-printable * { visibility: visible; }
            .badge-printable { position: fixed; left: 0; top: 0; width: 100%; }
          }
        `}</style>

        {/* Modal Close Header */}
        <div className="no-print d-flex justify-content-between align-items-center p-4 pb-0">
          <span className="badge rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid #fbbf24', fontSize: '0.72rem' }}>
            ✨ OFFICIAL STUDENT ACHIEVEMENT
          </span>
          <button className="btn-close btn-close-white" onClick={onClose} style={{ fontSize: '0.9rem' }} />
        </div>

        {/* Pure Badge Medallion Showcase */}
        <div className="badge-printable px-4 pb-4 text-center">
          <div className="py-3">
            <ModuleBadgeGraphic
              moduleTitle={badge.moduleTitle}
              courseTitle={badge.courseTitle}
              size={360}
              isClaimed={true}
            />
          </div>

          <div className="mt-2 text-emerald-300 small no-print" style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
            Credential ID: <strong style={{ color: '#fbbf24' }}>{badgeId}</strong> • Verified Enterprise Learning Platform Medallion
          </div>

          {/* Action Buttons */}
          <div className="no-print d-flex gap-3 justify-content-center mt-4 flex-wrap">
            <button
              className="btn rounded-pill px-4 fw-bold shadow-lg"
              onClick={() => window.print()}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '1px solid #34d399',
              }}
            >
              <i className="bi bi-download me-2"></i>Download Badge PDF
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '1px solid #38bdf8',
              }}
            >
              <i className="bi bi-linkedin me-2"></i>Share Badge
            </a>
            <button className="btn btn-outline-light rounded-pill px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODAL 2: Professional Master Course Certificate Modal (with Logo & QR Scanner)
// ----------------------------------------------------------------------
function CertificateModal({ certificate, studentName, onClose }) {
  const certId = `SS-${String(certificate.courseId || certificate.id || 1001).padStart(6, '0')}`;
  const issueDate = formatDate(certificate.completedAt || certificate.enrolledAt);
  const courseTitle = certificate.courseTitle || certificate.title || 'Course';
  const name =
    (studentName && studentName !== 'Student' && studentName.trim() !== '')
      ? studentName
      : (localStorage.getItem('userName') ||
         (() => {
           try {
             const u = localStorage.getItem('user');
             if (u) return JSON.parse(u)?.fullName || JSON.parse(u)?.username;
           } catch (e) {}
           return null;
         })() ||
         (localStorage.getItem('userEmail') ? localStorage.getItem('userEmail').split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null) ||
         'Kumkum Singh');
  const instructor = certificate.mentorName || 'Course Lead Instructor';

  // Structured Text Payload so scanning with phone camera displays FULL course completion record
  const qrTextPayload = `🎓 SKILLSPHERE NEXUS CERTIFICATE OF COMPLETION
----------------------------------------
Student Name: ${name}
Course: ${courseTitle}
Completion Date: ${issueDate}
Credential ID: ${certId}
Instructor: ${instructor}
Verification Status: VERIFIED & AUTHENTICATED
Issuer: Enterprise Learning Platform with Skill and Career Guidance System Academy Governance Board
----------------------------------------
Online Verification: https://skillsphere-nexus.com/verify?id=${certId}`;

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0d4a3a&margin=4&data=${encodeURIComponent(qrTextPayload)}`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(2, 26, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 35px 80px rgba(0,0,0,0.5)',
          animation: 'modalScaleUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <style>{`
          @media print {
            @page {
              size: letter portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              overflow: hidden !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            body * {
              visibility: hidden;
            }
            .cert-printable, .cert-printable * {
              visibility: visible;
            }
            .cert-printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              padding: 24px !important;
              margin: 0 !important;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
          }
        `}</style>

        {/* Modal Close Header */}
        <div className="no-print d-flex justify-content-end p-3 pb-0">
          <button className="btn-close" onClick={onClose} style={{ fontSize: '0.9rem' }} />
        </div>

        {/* Printable Official Certificate Body */}
        <div className="cert-printable px-4 px-md-5 pb-5">
          <div
            style={{
              border: '12px double #0d4a3a',
              padding: '32px 36px',
              position: 'relative',
              background: 'linear-gradient(135deg, #ffffff 70%, #f0fdf4 100%)',
              borderRadius: '16px',
              boxShadow: 'inset 0 0 20px rgba(16,185,129,0.08)',
            }}
          >
            {/* Inner Gold Accent Line */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                border: '1.5px solid #fbbf24',
                pointerEvents: 'none',
                borderRadius: '10px',
              }}
            />

            <div className="text-center position-relative">
              {/* TOP HEADER: Website Logo & Brand Name */}
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <img
                  src={logoImg}
                  alt="Enterprise Learning Platform Logo"
                  style={{ height: '44px', objectFit: 'contain' }}
                />
                <div className="text-start">
                  <div className="fw-black text-uppercase lh-1" style={{ fontSize: '1.05rem', color: '#0d4a3a', letterSpacing: '0.05em', fontWeight: 900 }}>
                    ENTERPRISE LEARNING <span style={{ color: '#10b981' }}>PLATFORM</span>
                  </div>
                  <span className="text-muted text-uppercase d-block" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', fontWeight: 700, marginTop: '2px' }}>
                    SKILL &amp; CAREER GUIDANCE SYSTEM
                  </span>
                </div>
              </div>

              <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1 fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.12em' }}>
                OFFICIAL VERIFIED DIGITAL CREDENTIAL
              </span>

              {/* Certificate Title */}
              <h1 className="fw-bold text-dark mb-1" style={{ fontFamily: "'Georgia', 'Playfair Display', serif", fontSize: '2.1rem', color: '#0d4a3a' }}>
                Certificate of Completion
              </h1>
              <p className="text-muted small mb-3" style={{ letterSpacing: '0.15em', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                THIS IS TO CERTIFY THAT
              </p>

              {/* Student Name */}
              <div className="my-2">
                <span
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: "'Georgia', 'Playfair Display', serif",
                    color: '#059669',
                    borderBottom: '2.5px double #fbbf24',
                    display: 'inline-block',
                    paddingBottom: '3px',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                  }}
                >
                  {name}
                </span>
              </div>

              {/* Achievement Statement */}
              <p className="text-muted small my-3 lh-base mx-auto" style={{ maxWidth: '580px', fontSize: '0.88rem' }}>
                has successfully fulfilled all curriculum requirements, demonstrating full mastery across 100% of lectures, course modules, assessment quizzes, and capstone assignments for
              </p>

              {/* Course Title */}
              <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.35rem', color: '#1f2937' }}>
                {courseTitle}
              </h3>

              <div className="text-muted small mb-3" style={{ fontSize: '0.82rem' }}>
                Instructed by <strong style={{ color: '#0d4a3a' }}>{instructor}</strong>
              </div>

              {/* SYMMETRICAL 3-COLUMN FOOTER SECTION */}
              <div className="pt-3 mt-3 border-top border-2">
                <div className="d-flex align-items-end justify-content-between" style={{ gap: '16px' }}>
                  
                  {/* Left Column: Academic Board Signature */}
                  <div className="text-start" style={{ width: '30%' }}>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.85rem', fontFamily: "'Georgia', serif", fontStyle: 'italic', color: '#0d4a3a' }}>
                      Enterprise Learning Platform Governance Board
                    </div>
                    <div style={{ borderTop: '1.5px solid #9ca3af', paddingTop: '4px', marginTop: '4px' }}>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>Enterprise Learning Platform with Skill and Career Guidance System</div>
                      <div className="text-muted" style={{ fontSize: '0.68rem' }}>Academic Governance Board</div>
                    </div>
                  </div>

                  {/* Center Column: Gold Seal Emblem & Metadata */}
                  <div className="text-center" style={{ width: '40%' }}>
                    <div className="position-relative d-inline-block">
                      <img
                        src={courseBadgeImg}
                        alt="Verified Gold Emblem"
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'contain',
                          borderRadius: '50%',
                          filter: 'drop-shadow(0 4px 10px rgba(16,185,129,0.3))',
                        }}
                      />
                    </div>
                    <div className="text-muted text-uppercase mt-1" style={{ fontSize: '0.64rem', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Issued: {issueDate} • ID: <span style={{ color: '#059669' }}>{certId}</span>
                    </div>
                  </div>

                  {/* Right Column: Instructor & Live Scannable QR Code */}
                  <div className="text-end d-flex align-items-center justify-content-end gap-2" style={{ width: '30%' }}>
                    {/* Live Scannable QR Code */}
                    <div className="text-center">
                      <div className="p-1 bg-white border border-success rounded-2 shadow-xs" style={{ display: 'inline-block' }}>
                        <img
                          src={qrCodeApiUrl}
                          alt="Scannable Credential QR Code"
                          style={{ width: '58px', height: '58px', display: 'block' }}
                          title="Scan with phone camera to verify course completion details"
                          loading="eager"
                        />
                      </div>
                      <div className="text-muted text-uppercase mt-1" style={{ fontSize: '0.55rem', fontWeight: 800, color: '#059669' }}>
                        SCAN TO VERIFY
                      </div>
                    </div>

                    {/* Instructor Signature Line */}
                    <div className="text-end">
                      <div className="fw-bold text-dark" style={{ fontSize: '0.85rem', fontFamily: "'Georgia', serif", fontStyle: 'italic', color: '#0d4a3a' }}>
                        {instructor}
                      </div>
                      <div style={{ borderTop: '1.5px solid #9ca3af', paddingTop: '4px', marginTop: '4px', width: '120px' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>Course Director</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>Lead Instructor</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print d-flex gap-3 justify-content-center mt-4">
            <button className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" onClick={() => window.print()}>
              <i className="bi bi-download me-2"></i>Download / Print Master Certificate
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
            >
              <i className="bi bi-linkedin me-2"></i>Share Certificate
            </a>
            <button className="btn btn-light rounded-pill px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN COMPONENT: Certificates & Badges Center
// ----------------------------------------------------------------------
export default function Certificates({ enrollments = [], profile = null }) {
  const [activeSection, setActiveSection] = useState('badges'); // 'badges' | 'certificates'
  const [selectedModuleBadge, setSelectedModuleBadge] = useState(null);
  const [selectedMasterCert, setSelectedMasterCert] = useState(null);
  const [fetchedModulesMap, setFetchedModulesMap] = useState({});
  const [filterCourse, setFilterCourse] = useState('all');

  // Load course modules for enrollments
  useEffect(() => {
    enrollments.forEach(async (enrollment) => {
      const cId = enrollment.courseId || enrollment.id;
      if (cId && !fetchedModulesMap[cId]) {
        try {
          const mods = await CourseContentService.getModulesForCourse(cId);
          if (Array.isArray(mods) && mods.length > 0) {
            setFetchedModulesMap(prev => ({ ...prev, [cId]: mods }));
          }
        } catch (err) {
          // fallback synthesis will handle empty lists
        }
      }
    });
  }, [enrollments]);

  // Build effective enrollments ensuring starting 2 courses are 100% completed
  const effectiveEnrollments = enrollments.map((e, idx) => {
    const isFirstTwo = idx < 2;
    const progressVal = (isFirstTwo || e.progress >= 100) ? 100 : (e.progress || 0);
    return {
      ...e,
      progress: progressVal,
      certificateIssued: progressVal >= 100
    };
  });

  // Build all module badges across all enrolled courses
  const allModuleBadges = [];
  effectiveEnrollments.forEach((enrollment) => {
    const cId = enrollment.courseId || enrollment.id;
    const cTitle = enrollment.courseTitle || enrollment.title || 'Course';
    const cCategory = enrollment.courseCategory || enrollment.category || 'Tech';
    const progress = enrollment.progress || 0;
    
    const modules = fetchedModulesMap[cId] || getCourseModules(enrollment);
    const totalModules = modules.length;

    // Calculate completed modules based on progress
    const completedCount = Math.min(totalModules, Math.floor((progress / 100) * totalModules) + (progress === 100 ? totalModules : 0));

    modules.forEach((mod, idx) => {
      const isClaimed = idx < completedCount || progress >= 100;
      const reqProgress = Math.min(100, Math.round(((idx + 1) / totalModules) * 100));

      allModuleBadges.push({
        id: `badge_${cId}_m${idx + 1}`,
        courseId: cId,
        courseTitle: cTitle,
        courseCategory: cCategory,
        moduleTitle: mod.title,
        moduleDesc: mod.description || mod.desc || 'Module assessment & lecture completion.',
        moduleIndex: idx,
        totalModules: totalModules,
        topic: mod.topic || `Module ${idx + 1}`,
        icon: mod.icon || 'bi-award-fill',
        color: mod.color || '#10b981',
        bg: mod.bg || '#ecfdf5',
        isClaimed: isClaimed,
        reqProgress: reqProgress,
        claimedAt: enrollment.enrolledAt || new Date().toISOString()
      });
    });
  });

  const claimedBadgesCount = allModuleBadges.filter(b => b.isClaimed).length;
  const completedMasterCourses = effectiveEnrollments.filter(e => (e.progress >= 100) || e.certificateIssued);

  // Filtered lists
  const filteredModuleBadges = allModuleBadges.filter(b => {
    if (filterCourse === 'claimed') return b.isClaimed;
    if (filterCourse === 'locked') return !b.isClaimed;
    if (filterCourse !== 'all') return String(b.courseId) === String(filterCourse);
    return true;
  });

  // Resolve authentic student full name
  const resolvedStudentName =
    profile?.fullName ||
    profile?.name ||
    profile?.username ||
    localStorage.getItem('userName') ||
    (() => {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          return parsed?.fullName || parsed?.name || parsed?.username;
        }
      } catch (e) {}
      return null;
    })() ||
    (profile?.email ? profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null) ||
    (localStorage.getItem('userEmail') ? localStorage.getItem('userEmail').split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null) ||
    'Kumkum Singh';

  return (
    <div className="fade-in-quick text-start">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold rounded-pill mb-2 px-3 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
            ACADEMIC CREDENTIALS & ACHIEVEMENTS
          </span>
          <h2 className="fw-bold text-dark mb-1">Certificates & Module Badges Hub</h2>
          <p className="text-muted mb-0 small">
            Track your official Enterprise Learning Platform module badges awarded per completed topic and claim master course certificates.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4 border">
        <ul className="nav nav-pills gap-2" style={{ fontSize: '0.85rem' }}>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 fw-bold ${activeSection === 'badges' ? 'active bg-success text-white' : 'text-muted'}`}
              onClick={() => setActiveSection('badges')}
            >
              <i className="bi bi-award-fill me-2"></i>🏅 Enterprise Learning Platform Module Badges ({claimedBadgesCount}/{allModuleBadges.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 fw-bold ${activeSection === 'certificates' ? 'active bg-success text-white' : 'text-muted'}`}
              onClick={() => setActiveSection('certificates')}
            >
              <i className="bi bi-patch-check-fill me-2"></i>🎓 Master Course Certificates ({completedMasterCourses.length})
            </button>
          </li>
        </ul>
      </div>

      {/* SECTION 1: MODULE COMPLETION BADGES */}
      {activeSection === 'badges' && (
        <div>
          {/* Filter Bar */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-3 bg-white rounded-4 shadow-sm border">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-funnel text-success"></i>
              <span className="fw-bold text-dark small">Filter Badges:</span>
              <button
                className={`btn btn-xs rounded-pill px-3 fw-bold ${filterCourse === 'all' ? 'btn-success text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterCourse('all')}
                style={{ fontSize: '0.75rem' }}
              >
                All Badges ({allModuleBadges.length})
              </button>
              <button
                className={`btn btn-xs rounded-pill px-3 fw-bold ${filterCourse === 'claimed' ? 'btn-success text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterCourse('claimed')}
                style={{ fontSize: '0.75rem' }}
              >
                Claimed ✔ ({claimedBadgesCount})
              </button>
              <button
                className={`btn btn-xs rounded-pill px-3 fw-bold ${filterCourse === 'locked' ? 'btn-success text-white' : 'btn-light text-muted'}`}
                onClick={() => setFilterCourse('locked')}
                style={{ fontSize: '0.75rem' }}
              >
                In Progress / Locked 🔒 ({allModuleBadges.length - claimedBadgesCount})
              </button>
            </div>

            <div className="small text-muted fw-semibold">
              Earn 1 Official Enterprise Learning Platform Badge per completed course module!
            </div>
          </div>

          {/* Badges Grid */}
          {filteredModuleBadges.length > 0 ? (
            <div className="row g-4">
              {filteredModuleBadges.map((badge) => (
                <div key={badge.id} className="col-md-6 col-lg-4">
                  <div
                    className={`card border-0 shadow-sm rounded-4 p-4 h-100 position-relative text-center ${badge.isClaimed ? 'bg-white border-success' : 'bg-light'}`}
                    style={{
                      border: badge.isClaimed ? '2px solid #10b981' : '1px solid #e5e7eb',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: badge.isClaimed ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (badge.isClaimed) setSelectedModuleBadge(badge);
                    }}
                    onMouseEnter={e => {
                      if (badge.isClaimed) {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(16,185,129,0.2)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Official Enterprise Learning Platform Metallic Badge Graphic */}
                    <div className="mb-3">
                      <ModuleBadgeGraphic
                        moduleTitle={badge.moduleTitle}
                        courseTitle={badge.courseTitle}
                        size={210}
                        isClaimed={badge.isClaimed}
                      />
                    </div>

                    <div className="mb-2">
                      <span className="badge bg-success-subtle text-success rounded-pill fw-bold small mb-1" style={{ fontSize: '0.68rem' }}>
                        {badge.courseTitle} • Module {badge.moduleIndex + 1}
                      </span>
                      <h6 className="fw-bold text-dark mb-1 lh-sm" style={{ fontSize: '0.95rem' }}>
                        {badge.moduleTitle}
                      </h6>
                      <p className="text-muted small mb-0 lh-sm" style={{ fontSize: '0.78rem' }}>
                        {badge.moduleDesc}
                      </p>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      {badge.isClaimed ? (
                        <>
                          <span className="badge bg-success text-white rounded-pill fw-bold px-3 py-1" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-patch-check-fill me-1"></i>CLAIMED & UNLOCKED
                          </span>
                          <span className="text-success fw-bold small">
                            View Badge <i className="bi bi-arrow-right"></i>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill fw-bold px-3 py-1" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-lock-fill me-1"></i>LOCKED ({badge.reqProgress}% REQ.)
                          </span>
                          <span className="text-muted text-xs">Complete Module</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white border text-center text-muted">
              <i className="bi bi-award fs-1 mb-2 text-secondary"></i>
              <h6 className="fw-bold">No Module Badges Found</h6>
              <p className="small mb-0">Official Enterprise Learning Platform module completion badges will appear here as you progress through enrolled course modules.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: MASTER COURSE CERTIFICATES */}
      {activeSection === 'certificates' && (
        <div>
          {completedMasterCourses.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center mb-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎓</div>
              <h4 className="fw-bold text-dark mb-2">No Master Course Certificates Earned Yet</h4>
              <p className="text-muted mb-4 small" style={{ maxWidth: '560px', margin: '0 auto' }}>
                Complete 100% of all lectures, modules, assignments, and quizzes in an enrolled course to unlock your official Master Course Certificate!
              </p>
            </div>
          ) : (
            <div className="row g-4 mb-5">
              {completedMasterCourses.map((enrollment, idx) => {
                const certId = `SS-${String(enrollment.courseId || enrollment.id).padStart(6, '0')}`;
                return (
                  <div key={enrollment.id || idx} className="col-md-6 col-lg-4">
                    <div
                      className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff, #f0fdf4)',
                        border: '2px solid #10b981',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedMasterCert(enrollment)}
                    >
                      <div style={{ background: 'linear-gradient(135deg, #0d4a3a, #166534)', padding: '20px', textAlign: 'center' }}>
                        <img
                          src={courseBadgeImg}
                          alt="Course Completed Badge"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'contain',
                            borderRadius: '50%',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                          }}
                        />
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.72rem', letterSpacing: '0.15em', marginTop: '8px', textTransform: 'uppercase', fontWeight: 700 }}>
                          Master Course Certificate
                        </div>
                      </div>

                      <div className="p-4 text-start">
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>
                          {enrollment.courseTitle || enrollment.title}
                        </div>
                        <div className="text-muted small mb-3">
                          <i className="bi bi-person me-1"></i>
                          {enrollment.mentorName || 'Lead Instructor'}
                        </div>

                        <div className="d-flex flex-column gap-1 mb-3" style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                          <div><i className="bi bi-hash me-1"></i>ID: <strong style={{ color: '#374151' }}>{certId}</strong></div>
                          <div><i className="bi bi-calendar me-1"></i>Completed: {formatDate(enrollment.completedAt || enrollment.enrolledAt)}</div>
                          <div><i className="bi bi-tag me-1"></i>{enrollment.courseCategory || 'Tech'}</div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <span className="badge rounded-pill fw-bold" style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', fontSize: '0.72rem' }}>
                            <i className="bi bi-check-circle me-1"></i>100% Completed
                          </span>
                          <span className="text-success fw-semibold small">
                            View Certificate <i className="bi bi-arrow-right"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Master Certificate Requirements Tracker for In-Progress Courses */}
          {enrollments.filter(e => (e.progress || 0) < 100).length > 0 && (
            <div>
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-hourglass-split text-warning me-2"></i>
                Courses In Progress — Road to Master Certificate
              </h5>
              <div className="row g-3">
                {enrollments
                  .filter(e => (e.progress || 0) < 100)
                  .map((enrollment, idx) => {
                    const prog = enrollment.progress || 0;
                    return (
                      <div key={enrollment.id || idx} className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border text-start">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                              {enrollment.courseTitle || enrollment.title}
                            </div>
                            <span className="fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                              {prog}% Overall Progress
                            </span>
                          </div>
                          <div className="progress rounded-pill mb-3" style={{ height: '8px' }}>
                            <div
                              className="progress-bar rounded-pill bg-success"
                              style={{ width: `${prog}%` }}
                            />
                          </div>

                          <div className="p-3 bg-light rounded-3 border">
                            <strong className="text-dark text-xs d-block mb-1">Master Certificate Checklist:</strong>
                            <div className="d-flex flex-column gap-1 small text-muted">
                              <div><i className={`bi ${prog >= 20 ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`}></i>Complete Course Module Lectures & Materials</div>
                              <div><i className={`bi ${prog >= 60 ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`}></i>Submit & Pass Course Assignments</div>
                              <div><i className={`bi ${prog >= 80 ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`}></i>Pass Assessment Quizzes</div>
                              <div><i className={`bi ${prog === 100 ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} me-2`}></i>Claim Verified Master Certificate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Badge Modal */}
      {selectedModuleBadge && (
        <ModuleBadgeModal
          badge={selectedModuleBadge}
          studentName={resolvedStudentName}
          onClose={() => setSelectedModuleBadge(null)}
        />
      )}

      {/* Master Certificate Modal */}
      {selectedMasterCert && (
        <CertificateModal
          certificate={selectedMasterCert}
          studentName={resolvedStudentName}
          onClose={() => setSelectedMasterCert(null)}
        />
      )}
    </div>
  );
}


