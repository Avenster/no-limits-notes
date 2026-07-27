import { Link } from "react-router";

const avatars = [
  { name: "Arjun", color: "#a78bfa", initials: "AJ" },
  { name: "Priya", color: "#34d399", initials: "PR" },
  { name: "Sam", color: "#fb923c", initials: "SM" },
];

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="2" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="3" y="7.5" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="3" y="11" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="3" y="14.5" width="7" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    title: "Block editor",
    desc: "Slash commands, drag-to-reorder, nested pages. Type / to insert anything.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="6" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8.8" y1="8.5" x2="11.2" y2="6.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <line x1="8.8" y1="11.5" x2="11.2" y2="13.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      </svg>
    ),
    title: "No account needed",
    desc: "Share a 6-character code. Anyone joins with a display name — no sign-up friction.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L13 8H17L14 12L15.5 18L10 15L4.5 18L6 12L3 8H7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Live presence",
    desc: "See who's editing in real time. Colored cursors, no collisions, no conflicts.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8H18" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <rect x="5" y="11" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
        <rect x="11" y="11" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    title: "Nested pages",
    desc: "Build a doc tree. Drag pages into each other. Notion-style hierarchy, your structure.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3C10 3 4 6 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 6 10 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="10" cy="11" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    title: "Version history",
    desc: "Every edit is recorded. Rewind to any point, compare snapshots, restore in one click.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Always in sync",
    desc: "CRDT-powered. Edits merge automatically — even if two people type at the same time.",
  },
];

function PageMockup() {
  return (
    <div className="mockup-wrap">
      {/* Shadow card behind */}
      <div className="card-shadow card-shadow-2" />
      <div className="card-shadow card-shadow-1" />

      {/* Main card */}
      <div className="mockup-card">
        {/* Top bar */}
        <div className="mockup-topbar">
          <div className="topbar-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="topbar-title">Q3 Planning — Team Docs</div>
          <div className="avatar-row">
            {avatars.map((a) => (
              <div
                key={a.name}
                className="avatar-chip"
                style={{ borderColor: a.color, color: a.color }}
                title={a.name}
              >
                {a.initials}
              </div>
            ))}
          </div>
        </div>

        {/* Page content */}
        <div className="mockup-body">
          <div className="page-icon">📋</div>
          <div className="page-title">Q3 Roadmap</div>

          <div className="block-row">
            <div className="block-line" style={{ width: "85%" }} />
          </div>
          <div className="block-row">
            <div className="block-line" style={{ width: "60%" }} />
          </div>

          {/* Cursor 1 */}
          <div className="cursor-wrap cursor-1">
            <div className="cursor-line" style={{ background: "#a78bfa" }} />
            <div className="cursor-label" style={{ background: "#a78bfa" }}>
              Arjun
            </div>
          </div>

          <div className="block-row" style={{ marginTop: 28 }}>
            <div className="block-bullet" />
            <div className="block-line" style={{ width: "70%" }} />
          </div>
          <div className="block-row">
            <div className="block-bullet" />
            <div className="block-line" style={{ width: "55%" }} />
          </div>
          <div className="block-row">
            <div className="block-bullet" />
            <div className="block-line" style={{ width: "80%", opacity: 0.3 }} />
          </div>

          {/* Cursor 2 */}
          <div className="cursor-wrap cursor-2">
            <div className="cursor-line" style={{ background: "#34d399" }} />
            <div className="cursor-label" style={{ background: "#34d399", color: "#0a0a0a" }}>
              Priya
            </div>
          </div>

          <div className="block-callout">
            <span className="callout-icon">💡</span>
            <div className="block-line" style={{ width: "75%", opacity: 0.6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="home">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.5" />
            <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.5" />
            <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.25" />
          </svg>
          <span>Noteblock</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Sign in</Link>
          <Link to="/new" className="nav-cta">Start free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-eyebrow">Collaborative docs, no friction</p>
          <h1 className="hero-headline">
            Your team's notes,<br />
            <em>live and in sync.</em>
          </h1>
          <p className="hero-sub">
            Share a code. Anyone joins instantly — no account, no setup.
            Edit together in real time with a block editor that stays out of your way.
          </p>
          <div className="hero-actions">
            <Link to="/new" className="btn-primary">
              Create a group
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/join" className="btn-ghost">Join with a code</Link>
          </div>
          <p className="hero-note">No credit card. No account required to join.</p>
        </div>

        <div className="hero-visual">
          <PageMockup />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <p className="section-label">What's inside</p>
        <h2 className="section-heading">Everything your team needs, nothing it doesn't.</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="how-inner">
          <p className="section-label">How it works</p>
          <h2 className="section-heading">Up in 30 seconds.</h2>
          <div className="steps">
            {[
              { n: "01", t: "Create a group", d: "Hit 'Create a group'. You get a short code — no signup needed." },
              { n: "02", t: "Share the code", d: "Send it to your team. They paste it in, pick a name, and they're in." },
              { n: "03", t: "Write together", d: "Open a page and start typing. Changes appear for everyone instantly." },
            ].map((s) => (
              <div key={s.n} className="step">
                <span className="step-num">{s.n}</span>
                <div>
                  <h3 className="step-title">{s.t}</h3>
                  <p className="step-desc">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-heading">Ready to write together?</h2>
          <p className="cta-sub">No setup. No billing. Just paste a code and start.</p>
          <div className="cta-actions">
            <Link to="/new" className="btn-primary">
              Create a group
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/join" className="btn-ghost">Join with a code</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.6" />
            <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.15" />
          </svg>
          <span>Noteblock</span>
        </div>
        <p className="footer-copy">© 2025 Noteblock. Built for teams who'd rather write than configure.</p>
      </footer>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0a0a;
          color: #e0e0e0;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.3px;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-link {
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #fff; }
        .nav-cta {
          background: #fff;
          color: #0a0a0a;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .nav-cta:hover { opacity: 0.88; }

        /* HERO */
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 96px 48px 80px;
        }
        .hero-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 20px;
        }
        .hero-headline {
          font-size: clamp(38px, 4.5vw, 58px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: #fff;
          margin-bottom: 20px;
        }
        .hero-headline em {
          font-style: normal;
          color: rgba(255,255,255,0.45);
        }
        .hero-sub {
          font-size: 16px;
          line-height: 1.65;
          color: rgba(255,255,255,0.5);
          max-width: 440px;
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .hero-note {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }

        /* BUTTONS */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #0a0a0a;
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          padding: 11px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* MOCKUP */
        .hero-visual {
          display: flex;
          justify-content: center;
        }
        .mockup-wrap {
          position: relative;
          width: 100%;
          max-width: 480px;
        }
        .card-shadow {
          position: absolute;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .card-shadow-1 {
          top: 12px;
          left: 12px;
          right: -12px;
          bottom: -12px;
        }
        .card-shadow-2 {
          top: 22px;
          left: 22px;
          right: -22px;
          bottom: -22px;
          opacity: 0.5;
        }
        .mockup-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }
        .mockup-topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
        }
        .topbar-dots { display: flex; gap: 6px; }
        .dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          display: block;
        }
        .dot-red { background: #ff5f57; }
        .dot-yellow { background: #febc2e; }
        .dot-green { background: #28c840; }
        .topbar-title {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: -0.1px;
        }
        .avatar-row { display: flex; gap: 6px; }
        .avatar-chip {
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.03em;
          background: rgba(0,0,0,0.4);
        }
        .mockup-body {
          padding: 28px 28px 32px;
        }
        .page-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }
        .block-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .block-line {
          height: 10px;
          border-radius: 4px;
          background: rgba(255,255,255,0.12);
        }
        .block-bullet {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .cursor-wrap {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin: 10px 0;
        }
        .cursor-1 { margin-left: 0; }
        .cursor-2 { margin-left: 60%; }
        .cursor-line {
          width: 2px;
          height: 18px;
          border-radius: 1px;
          animation: blink 1.1s step-start infinite;
        }
        .cursor-label {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          color: #fff;
          letter-spacing: 0.02em;
          margin-top: -2px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .block-callout {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px 14px;
          margin-top: 16px;
        }
        .callout-icon { font-size: 16px; }

        /* FEATURES */
        .features {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 48px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 14px;
        }
        .section-heading {
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 700;
          letter-spacing: -0.8px;
          color: #fff;
          margin-bottom: 48px;
          max-width: 560px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .feature-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 28px 26px;
          transition: background 0.2s;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.05);
        }
        .feature-icon {
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.7);
          margin-bottom: 16px;
        }
        .feature-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -0.2px;
        }
        .feature-desc {
          font-size: 13.5px;
          line-height: 1.6;
          color: rgba(255,255,255,0.4);
        }

        /* HOW IT WORKS */
        .how {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 100px 48px;
        }
        .how-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 600px;
        }
        .step {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          padding: 28px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .step:last-child { border-bottom: none; }
        .step-num {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.2);
          min-width: 28px;
          margin-top: 2px;
        }
        .step-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.2px;
          margin-bottom: 6px;
        }
        .step-desc {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.4);
        }

        /* CTA SECTION */
        .cta-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 48px 100px;
        }
        .cta-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 64px;
          text-align: center;
          box-shadow: 0 0 80px rgba(255,255,255,0.03) inset;
        }
        .cta-heading {
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 700;
          letter-spacing: -1px;
          color: #fff;
          margin-bottom: 12px;
        }
        .cta-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }
        .cta-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 32px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
        }
        .footer-copy {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          max-width: 380px;
          text-align: right;
          line-height: 1.5;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            padding: 64px 24px 48px;
            gap: 48px;
          }
          .hero-sub { max-width: 100%; }
          .nav { padding: 16px 24px; }
          .features { padding: 72px 24px; }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .how { padding: 72px 24px; }
          .cta-section { padding: 24px 24px 72px; }
          .cta-card { padding: 40px 24px; }
          .footer { flex-direction: column; gap: 12px; padding: 28px 24px; }
          .footer-copy { text-align: center; }
        }
        @media (max-width: 560px) {
          .feature-grid { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cursor-line { animation: none; }
          .btn-primary, .btn-ghost { transition: none; }
        }
      `}</style>
    </main>
  );
}