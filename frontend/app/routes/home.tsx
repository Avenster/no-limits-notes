import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { useEffect, useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Noteblock — Collaborative docs, no friction" },
    {
      name: "description",
      content:
        "Share a code. Anyone joins instantly — no account, no setup. Edit together in real time with a block editor that stays out of your way.",
    },
    { property: "og:title", content: "Noteblock — Collaborative docs, no friction" },
    {
      property: "og:description",
      content: "Share a code. Anyone joins instantly. Edit together in real time.",
    },
    { property: "og:type", content: "website" },
    { name: "theme-color", content: "#070708" },
  ];
};

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
        <path
          d="M10 2L13 8H17L14 12L15.5 18L10 15L4.5 18L6 12L3 8H7L10 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
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
        <path
          d="M10 3C10 3 4 6 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 6 10 3 10 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
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

const stats = [
  { value: "5K+", label: "Documents created" },
  { value: "<12ms", label: "Sync latency" },
  { value: "Zero", label: "Signups required" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  {
    quote:
      "We replaced Google Docs for sprint planning. The zero-signup flow means even external contractors can jump in without a single email.",
    name: "Maya Chen",
    role: "Engineering Lead",
    initials: "MC",
    color: "#a78bfa",
  },
  {
    quote:
      "The sync is genuinely instant. No 'syncing…' spinners, no conflict dialogs. It just works like a local app that happens to be shared.",
    name: "Daniel Okonkwo",
    role: "Founder, Basecase",
    initials: "DO",
    color: "#34d399",
  },
  {
    quote:
      "I sent a 6-char code in Slack and my whole team was editing within 15 seconds. That's the entire product thesis, delivered.",
    name: "Sarah Kim",
    role: "Product Manager",
    initials: "SK",
    color: "#fb923c",
  },
];

function PlayableMockup() {
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorArjunRef = useRef<HTMLDivElement>(null);
  const cursorPriyaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let raf: number;
    let t = 0;
    const animate = () => {
      t += 0.015;
      if (cursorArjunRef.current) {
        cursorArjunRef.current.style.transform = `translate(${Math.sin(t) * 8}px, ${Math.cos(t * 0.7) * 6}px)`;
      }
      if (cursorPriyaRef.current) {
        cursorPriyaRef.current.style.transform = `translate(${Math.cos(t * 0.8) * 10}px, ${Math.sin(t * 1.1) * 5}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleCopy = async () => {
    const code = document.querySelector(".code-content") as HTMLElement;
    if (code) {
      await navigator.clipboard.writeText(code.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleFocus = () => {
    if (cardRef.current) {
      cardRef.current.style.boxShadow =
        "0 40px 96px rgba(0,0,0,0.65), 0 0 40px rgba(139,92,246,0.08), 0 0 0 1px rgba(255,255,255,0.04) inset";
    }
  };

  const handleBlur = () => {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = "";
    }
  };

  return (
    <div className="mockup-wrap">
      <div className="mockup-glow" />
      <div className="card-shadow card-shadow-2" />
      <div className="card-shadow card-shadow-1" />

      <div className="mockup-card" ref={cardRef}>
        <div className="mockup-topbar">
          <div className="topbar-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div
            className="topbar-title"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            Q3 Planning — Team Docs
          </div>
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
            <div
              className="avatar-chip you"
              style={{ borderColor: "#60a5fa", color: "#60a5fa" }}
              title="You"
            >
              YO
            </div>
          </div>
        </div>

        <div className="mockup-body">
          <div className="page-icon">📄</div>
          <div
            className="page-title"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            Q3 Roadmap
          </div>

          <div className="block-row editable-row">
            <div className="drag-handle">⋮⋮</div>
            <div
              className="block-content"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              Launch dark-mode dashboard
            </div>
          </div>

          <div className="block-row editable-row">
            <div className="drag-handle">⋮⋮</div>
            <div
              className="block-content"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              Refactor auth flow with OAuth2
            </div>
          </div>

          <div className="block-row editable-row code-block">
            <div className="drag-handle">⋮⋮</div>
            <div className="code-header">
              <span className="code-lang">typescript</span>
              <span className="code-copy" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </span>
            </div>
            <pre
              className="block-content code-content"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              {`const sync = async () => {
  const doc = await crdt.open(id);
  doc.on('change', (ops) => {
    applyOps(ops); // live 🔥
  });
};`}
            </pre>
          </div>

          <div className="block-row editable-row">
            <div className="drag-handle">⋮⋮</div>
            <div
              className="block-content"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              Update landing page animations
            </div>
          </div>

          <div className="cursor-wrap cursor-1" ref={cursorArjunRef}>
            <div className="cursor-line" style={{ background: "#a78bfa" }} />
            <div className="cursor-label" style={{ background: "#a78bfa" }}>
              Arjun
            </div>
          </div>

          <div className="cursor-wrap cursor-2" ref={cursorPriyaRef}>
            <div className="cursor-line" style={{ background: "#34d399" }} />
            <div
              className="cursor-label"
              style={{ background: "#34d399", color: "#0a0a0a" }}
            >
              Priya
            </div>
          </div>

          <div className="block-callout">
            <span className="callout-icon">💡</span>
            <div className="callout-text">Try typing in any block above — it really works.</div>
          </div>
        </div>
      </div>

      <div className="mockup-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        Click any block to start editing
      </div>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="home">
      {/* ── NAV ── */}
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.5" />
            <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.5" />
            <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.25" />
          </svg>
          <span>Noteblock</span>
        </Link>
        <div className="nav-links">
          <Link to="/login" className="nav-link">
            Sign in
          </Link>
          <Link to="/new" className="nav-cta">
            Start free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-dot" />
            <span>Now with live code blocks</span>
          </div>
          <h1 className="hero-headline">
            Your team&apos;s notes,
            <br />
            <span className="gradient-text">live and in sync.</span>
          </h1>
          <p className="hero-sub">
            Share a code. Anyone joins instantly — no account, no setup. Edit
            together in real time with a block editor that stays out of your way.
          </p>
          <div className="hero-actions">
            <Link to="/new" className="btn-primary">
              Create a group
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link to="/join" className="btn-ghost">
              Join with a code
            </Link>
          </div>
          <p className="hero-note">No credit card. No account required to join.</p>
        </div>

        <div className="hero-visual">
          <PlayableMockup />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats reveal">
        <div className="stats-inner">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features reveal">
        <p className="section-label">What&apos;s inside</p>
        <h2 className="section-heading">
          Everything your team needs,
          <br />
          nothing it doesn&apos;t.
        </h2>
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

      {/* ── HOW IT WORKS ── */}
      <section className="how reveal">
        <div className="how-inner">
          <p className="section-label">How it works</p>
          <h2 className="section-heading">Up in 30 seconds.</h2>
          <div className="steps">
            {[
              {
                n: "01",
                t: "Create a group",
                d: "Hit 'Create a group'. You get a short code — no signup needed.",
              },
              {
                n: "02",
                t: "Share the code",
                d: "Send it to your team. They paste it in, pick a name, and they're in.",
              },
              {
                n: "03",
                t: "Write together",
                d: "Open a page and start typing. Changes appear for everyone instantly.",
              },
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

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials reveal">
        <div className="testimonials-inner">
          <p className="section-label">What people say</p>
          <h2 className="section-heading">Teams that switched.</h2>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div
                    className="testimonial-avatar"
                    style={{
                      borderColor: t.color,
                      color: t.color,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section reveal">
        <div className="cta-card">
          <h2 className="cta-heading">Ready to write together?</h2>
          <p className="cta-sub">
            No setup. No billing. Just paste a code and start.
          </p>
          <div className="cta-actions">
            <Link to="/new" className="btn-primary">
              Create a group
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link to="/join" className="btn-ghost">
              Join with a code
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <Link to="/" className="footer-logo">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.6" />
            <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.15" />
          </svg>
          <span>Noteblock</span>
        </Link>
        <p className="footer-copy">
          &copy; 2025 Noteblock. Built for teams who&apos;d rather write than configure.
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        /* ── RESET & BASE ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .home {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #070708;
          color: #e8e8e8;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          position: relative;
          overflow-x: hidden;
        }

        /* ── BACKGROUND EFFECTS ── */
        .home::before,
        .home::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
        }
        .home::before {
          top: -10%;
          right: -5%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%);
          animation: orbFloat1 24s ease-in-out infinite;
        }
        .home::after {
          bottom: -15%;
          left: -8%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%);
          animation: orbFloat2 28s ease-in-out infinite;
        }
        .home > * {
          position: relative;
          z-index: 1;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 40px) scale(1.08); }
          66% { transform: translate(30px, -30px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.05); }
          66% { transform: translate(-25px, 40px) scale(0.96); }
        }

        /* ── DOT GRID ── */
        .home {
          background-image: radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── NAV ── */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(7,7,8,0.75);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-cta {
          background: #fff;
          color: #070708;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .nav-cta:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,255,255,0.15); }

        /* ── HERO ── */
        .hero {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 80px;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 100px 40px 80px;
        }
        .hero-text {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hero-visual {
          display: flex;
          justify-content: center;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 10px;
          border-radius: 100px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.15);
          font-size: 12px;
          font-weight: 600;
          color: rgba(167,139,250,0.9);
          margin-bottom: 24px;
          letter-spacing: 0.01em;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 8px rgba(167,139,250,0.6);
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        .hero-headline {
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          color: #fff;
          margin-bottom: 24px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #c4b5fd 0%, #6ee7b7 60%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 17px;
          line-height: 1.75;
          color: rgba(255,255,255,0.4);
          max-width: 460px;
          margin-bottom: 40px;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-wrap: wrap;
        }
        .hero-note {
          margin-top: 16px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.2);
        }

        /* ── BUTTONS ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #070708;
          padding: 13px 24px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .btn-primary:hover {
          opacity: 0.93;
          transform: translateY(-1.5px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.12);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          padding: 13px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.18);
        }

        /* ── PLAYABLE MOCKUP ── */
        .mockup-wrap {
          position: relative;
          width: 100%;
          max-width: 520px;
        }
        .mockup-glow {
          position: absolute;
          inset: -50px;
          background: radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.1) 0%, rgba(52,211,153,0.05) 40%, transparent 70%);
          pointer-events: none;
          z-index: -1;
          animation: glowPulse 5s ease-in-out infinite alternate;
        }
        @keyframes glowPulse {
          from { opacity: 0.6; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1.03); }
        }
        .card-shadow {
          position: absolute;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.03);
          background: rgba(255,255,255,0.01);
        }
        .card-shadow-1 {
          top: 12px; left: 12px; right: -12px; bottom: -12px;
        }
        .card-shadow-2 {
          top: 24px; left: 24px; right: -24px; bottom: -24px;
          opacity: 0.4;
        }
        .mockup-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(24px);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.02) inset;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .mockup-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 40px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }
        .mockup-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }
        .topbar-dots { display: flex; gap: 7px; }
        .dot { width: 11px; height: 11px; border-radius: 50%; display: block; }
        .dot-red { background: #ff5f57; }
        .dot-yellow { background: #febc2e; }
        .dot-green {
          background: #28c840;
          animation: pulseGreen 2.5s ease-in-out infinite;
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(40,200,64,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(40,200,64,0); }
        }
        .topbar-title {
          flex: 1;
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          letter-spacing: -0.1px;
          outline: none;
          cursor: text;
        }
        .topbar-title:focus { color: rgba(255,255,255,0.7); }
        .avatar-row { display: flex; gap: 6px; }
        .avatar-chip {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.03em;
          background: rgba(0,0,0,0.5);
          cursor: default;
          transition: transform 0.2s;
        }
        .avatar-chip:hover { transform: scale(1.15); }
        .avatar-chip.you {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }

        .mockup-body { padding: 28px 28px 32px; position: relative; }
        .page-icon { font-size: 26px; margin-bottom: 6px; }
        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.6px;
          margin-bottom: 20px;
          outline: none;
          cursor: text;
        }
        .page-title:focus { color: #fff; }

        /* Editable blocks */
        .block-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 6px;
          padding: 6px 8px;
          border-radius: 8px;
          position: relative;
          transition: background 0.15s;
        }
        .block-row:hover { background: rgba(255,255,255,0.03); }
        .block-row:hover .drag-handle { opacity: 1; }
        .drag-handle {
          opacity: 0;
          font-size: 10px;
          color: rgba(255,255,255,0.15);
          cursor: grab;
          padding-top: 3px;
          transition: opacity 0.15s;
          user-select: none;
          line-height: 1;
        }
        .drag-handle:active { cursor: grabbing; }
        .block-content {
          flex: 1;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.55);
          outline: none;
          cursor: text;
          min-height: 1.6em;
        }
        .block-content:focus { color: rgba(255,255,255,0.85); }

        /* Code block */
        .code-block {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 0;
          margin: 10px 0 14px;
          flex-direction: column;
          gap: 0;
        }
        .code-block:hover { background: rgba(0,0,0,0.4); }
        .code-block .drag-handle { position: absolute; left: 6px; top: 8px; }
        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          width: 100%;
        }
        .code-lang {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
        }
        .code-copy {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          transition: color 0.15s;
        }
        .code-copy:hover { color: rgba(255,255,255,0.55); }
        .code-content {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          line-height: 1.7;
          color: rgba(255,255,255,0.6);
          padding: 12px 14px;
          margin: 0;
          white-space: pre-wrap;
        }
        .code-content:focus { color: rgba(255,255,255,0.85); }

        /* Cursors */
        .cursor-wrap {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          position: absolute;
          pointer-events: none;
          z-index: 10;
        }
        .cursor-1 { left: 28px; top: 168px; }
        .cursor-2 { left: 58%; top: 210px; }
        .cursor-line {
          width: 2.5px;
          height: 20px;
          border-radius: 2px;
          animation: blink 1.2s step-start infinite;
        }
        .cursor-label {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 5px;
          color: #fff;
          letter-spacing: 0.02em;
          margin-top: -2px;
          white-space: nowrap;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .block-callout {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(251,146,60,0.06);
          border: 1px solid rgba(251,146,60,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          margin-top: 18px;
        }
        .callout-icon { font-size: 16px; flex-shrink: 0; }
        .callout-text { font-size: 13px; color: rgba(255,255,255,0.35); }

        .mockup-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          animation: fadeUp 0.8s 0.6s both;
        }

        /* ── STATS ── */
        .stats {
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding: 48px 40px;
          background: rgba(255,255,255,0.01);
        }
        .stats-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          text-align: center;
        }
        .stat { display: flex; flex-direction: column; gap: 6px; }
        .stat-value {
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.4));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        /* ── FEATURES ── */
        .features {
          max-width: 1280px;
          margin: 0 auto;
          padding: 120px 40px;
        }
        .section-label {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 16px;
        }
        .section-heading {
          font-size: clamp(28px, 3.2vw, 40px);
          font-weight: 800;
          letter-spacing: -1px;
          color: #fff;
          margin-bottom: 56px;
          max-width: 580px;
          line-height: 1.15;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.035);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .feature-card {
          background: rgba(10,10,11,0.92);
          padding: 36px 32px;
          transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
          cursor: default;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          box-shadow: inset 0 0 80px rgba(139,92,246,0.04);
          transform: translateY(-2px);
        }
        .feature-icon {
          width: 42px; height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          margin-bottom: 20px;
          transition: background 0.3s, color 0.3s, transform 0.3s;
        }
        .feature-card:hover .feature-icon {
          background: rgba(139,92,246,0.12);
          color: rgba(167,139,250,0.85);
          transform: scale(1.05);
        }
        .feature-title {
          font-size: 15.5px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -0.2px;
        }
        .feature-desc {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(255,255,255,0.35);
        }

        /* ── HOW IT WORKS ── */
        .how {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 120px 40px;
        }
        .how-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .steps {
          display: flex;
          flex-direction: column;
          max-width: 600px;
          position: relative;
        }
        .steps::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 10px;
          bottom: 10px;
          width: 1.5px;
          background: linear-gradient(to bottom, rgba(139,92,246,0.2), rgba(52,211,153,0.1), rgba(255,255,255,0.02));
          border-radius: 1px;
        }
        .step {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          padding: 32px 0;
          position: relative;
        }
        .step-num {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.15);
          min-width: 32px;
          margin-top: 2px;
          position: relative;
          z-index: 1;
          background: #070708;
          padding-right: 8px;
        }
        .step-title {
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.2px;
          margin-bottom: 6px;
        }
        .step-desc {
          font-size: 14.5px;
          line-height: 1.65;
          color: rgba(255,255,255,0.35);
        }

        /* ── TESTIMONIALS ── */
        .testimonials {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 120px 40px;
        }
        .testimonials-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.035);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .testimonial-card {
          background: rgba(10,10,11,0.92);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
          transition: background 0.3s, transform 0.3s;
        }
        .testimonial-card:hover {
          background: rgba(255,255,255,0.035);
          transform: translateY(-2px);
        }
        .testimonial-quote {
          font-size: 14.5px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .testimonial-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 700;
          background: rgba(0,0,0,0.4);
          flex-shrink: 0;
        }
        .testimonial-name {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }
        .testimonial-role {
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
          margin-top: 1px;
        }

        /* ── CTA ── */
        .cta-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 40px 120px;
        }
        .cta-card {
          position: relative;
          background: #070708;
          border-radius: 24px;
          padding: 80px 64px;
          text-align: center;
          overflow: hidden;
        }
        .cta-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1.5px;
          background: linear-gradient(
            135deg,
            rgba(139,92,246,0.3) 0%,
            rgba(52,211,153,0.2) 50%,
            rgba(255,255,255,0.08) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .cta-card::after {
          content: '';
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-heading {
          font-size: clamp(30px, 3.8vw, 46px);
          font-weight: 800;
          letter-spacing: -1.2px;
          color: #fff;
          margin-bottom: 14px;
          position: relative;
        }
        .cta-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 40px;
          position: relative;
        }
        .cta-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: 0 auto;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-logo:hover { color: rgba(255,255,255,0.55); }
        .footer-copy {
          font-size: 12.5px;
          color: rgba(255,255,255,0.15);
          text-align: right;
        }

        /* ── SCROLL REVEAL ── */
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            padding: 80px 28px 48px;
            gap: 64px;
            text-align: center;
          }
          .hero-sub { max-width: 100%; margin-left: auto; margin-right: auto; }
          .hero-actions { justify-content: center; }
          .nav { padding: 14px 28px; }
          .stats { padding: 36px 28px; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .features { padding: 80px 28px; }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .how { padding: 80px 28px; }
          .testimonials { padding: 80px 28px; }
          .testimonial-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 28px 28px 80px; }
          .cta-card { padding: 52px 28px; }
          .footer {
            flex-direction: column;
            gap: 14px;
            padding: 28px;
            text-align: center;
          }
          .footer-copy { text-align: center; }
        }
        @media (max-width: 600px) {
          .feature-grid { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .hero-headline { letter-spacing: -1.2px; }
          .mockup-card { border-radius: 14px; }
          .mockup-body { padding: 20px; }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .cursor-line,
          .dot-green,
          .mockup-glow,
          .home::before,
          .home::after,
          .badge-dot {
            animation: none !important;
          }
          .btn-primary, .btn-ghost, .nav-cta, .nav-link,
          .feature-card, .feature-icon, .testimonial-card, .mockup-card {
            transition: none !important;
          }
          .hero-text, .hero-visual {
            animation: none !important;
            opacity: 1;
            transform: none;
          }
          .reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}