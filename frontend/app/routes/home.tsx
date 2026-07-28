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

function EditableBlock({
  children,
  onFocus,
  onBlur,
  isCode = false,
}: {
  children: React.ReactNode;
  onFocus: () => void;
  onBlur: () => void;
  isCode?: boolean;
}) {
  return (
    <div
      className="group flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-white/[0.03]"
    >
      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-white/15 cursor-grab active:cursor-grabbing pt-0.5 select-none transition-opacity duration-150 leading-none">
        ⋮⋮
      </span>
      <div
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={onFocus}
        onBlur={onBlur}
        className={
          isCode
            ? "flex-1 text-[13px] leading-[1.7] text-white/60 outline-none cursor-text focus:text-white/85 font-mono"
            : "flex-1 text-sm leading-[1.6] text-white/55 outline-none cursor-text focus:text-white/85"
        }
      >
        {children}
      </div>
    </div>
  );
}

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
    const code = document.querySelector(".code-content-pre") as HTMLElement;
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

  const codeContent = `const sync = async () => {
  const doc = await crdt.open(id);
  doc.on('change', (ops) => {
    applyOps(ops); // live 🔥
  });
};`;

  return (
    <div className="relative w-full max-w-[520px]">
      {/* Glow */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          inset: "-50px",
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.1) 0%, rgba(52,211,153,0.05) 40%, transparent 70%)",
          animation: "glowPulse 5s ease-in-out infinite alternate",
        }}
      />
      {/* Shadow cards */}
      <div
        className="absolute rounded-[18px] border border-white/[0.03] bg-white/[0.01]"
        style={{ top: 24, left: 24, right: -24, bottom: -24, opacity: 0.4 }}
      />
      <div
        className="absolute rounded-[18px] border border-white/[0.03] bg-white/[0.01]"
        style={{ top: 12, left: 12, right: -12, bottom: -12 }}
      />

      {/* Main card */}
      <div
        ref={cardRef}
        className="relative bg-white/[0.03] border border-white/[0.08] rounded-[18px] overflow-hidden backdrop-blur-2xl transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3.5 px-[18px] py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex gap-[7px]">
            <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] block" />
            <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e] block" />
            <span
              className="w-[11px] h-[11px] rounded-full bg-[#28c840] block"
              style={{ animation: "pulseGreen 2.5s ease-in-out infinite" }}
            />
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex-1 text-[12.5px] font-medium text-white/35 tracking-[-0.1px] outline-none cursor-text focus:text-white/70"
          >
            Q3 Planning — Team Docs
          </div>
          <div className="flex gap-1.5">
            {avatars.map((a) => (
              <div
                key={a.name}
                title={a.name}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold tracking-wide bg-black/50 cursor-default transition-transform duration-200 hover:scale-110"
                style={{ borderColor: a.color, color: a.color }}
              >
                {a.initials}
              </div>
            ))}
            <div
              title="You"
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold tracking-wide bg-black/50 cursor-default transition-transform duration-200 hover:scale-110"
              style={{
                borderColor: "#60a5fa",
                color: "#60a5fa",
                animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              YO
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-7 pb-8 relative">
          <div className="text-[26px] mb-1.5">📄</div>
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="text-[22px] font-bold text-white tracking-[-0.6px] mb-5 outline-none cursor-text"
          >
            Q3 Roadmap
          </div>

          {/* Blocks */}
          <EditableBlock onFocus={handleFocus} onBlur={handleBlur}>
            Launch dark-mode dashboard
          </EditableBlock>

          <EditableBlock onFocus={handleFocus} onBlur={handleBlur}>
            Refactor auth flow with OAuth2
          </EditableBlock>

          {/* Code block */}
          <div className="group my-2.5 mb-3.5 bg-black/35 border border-white/[0.06] rounded-[10px] overflow-hidden transition-colors hover:bg-black/40">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">
                typescript
              </span>
              <span
                onClick={handleCopy}
                className="text-[10px] font-medium text-white/25 cursor-pointer transition-colors hover:text-white/55"
              >
                {copied ? "Copied!" : "Copy"}
              </span>
            </div>
            <pre
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="code-content-pre font-mono text-[12.5px] leading-[1.7] text-white/60 px-3.5 py-3 m-0 whitespace-pre-wrap outline-none cursor-text focus:text-white/85"
            >
              {codeContent}
            </pre>
          </div>

          <EditableBlock onFocus={handleFocus} onBlur={handleBlur}>
            Update landing page animations
          </EditableBlock>

          {/* Cursors — positioned relative to body, fixed to block rows */}
          <div
            ref={cursorArjunRef}
            className="flex items-start gap-1.5 absolute pointer-events-none z-10"
            style={{ left: 28, top: 166 }}
          >
            <div
              className="w-[2.5px] h-5 rounded-sm"
              style={{
                background: "#a78bfa",
                animation: "blink 1.2s step-start infinite",
              }}
            />
            <div
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[5px] text-white mt-[-2px] whitespace-nowrap"
              style={{ background: "#a78bfa" }}
            >
              Arjun
            </div>
          </div>

          <div
            ref={cursorPriyaRef}
            className="flex items-start gap-1.5 absolute pointer-events-none z-10"
            style={{ left: "58%", top: 206 }}
          >
            <div
              className="w-[2.5px] h-5 rounded-sm"
              style={{
                background: "#34d399",
                animation: "blink 1.2s step-start infinite 0.4s",
              }}
            />
            <div
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[5px] mt-[-2px] whitespace-nowrap"
              style={{ background: "#34d399", color: "#0a0a0a" }}
            >
              Priya
            </div>
          </div>

          {/* Callout */}
          <div className="flex items-center gap-2.5 bg-[rgba(251,146,60,0.06)] border border-[rgba(251,146,60,0.1)] rounded-[10px] px-4 py-3 mt-[72px]">
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-[13px] text-white/35">
              Try typing in any block above — it really works.
            </p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div
        className="flex items-center justify-center gap-2 mt-5 text-xs text-white/20"
        style={{ animation: "fadeUp 0.8s 0.6s both" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        Click any block to start editing
      </div>

      <style>{`
        @keyframes glowPulse {
          from { opacity: 0.6; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1.03); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(40,200,64,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(40,200,64,0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden text-[#e8e8e8] antialiased"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#070708",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Ambient orbs */}
      <div
        className="fixed pointer-events-none -z-0 rounded-full"
        style={{
          top: "-10%",
          right: "-5%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "orbFloat1 24s ease-in-out infinite",
        }}
      />
      <div
        className="fixed pointer-events-none -z-0 rounded-full"
        style={{
          bottom: "-15%",
          left: "-8%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "orbFloat2 28s ease-in-out infinite",
        }}
      />

      <div className="relative z-10">
        {/* ── NAV ── */}
        <nav
          className="flex items-center justify-between px-10 py-4 sticky top-0 z-[100] border-b border-white/[0.04]"
          style={{
            background: "rgba(7,7,8,0.75)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          }}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[15px] font-bold text-white tracking-[-0.3px] no-underline"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.9" />
              <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.5" />
              <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.5" />
              <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.25" />
            </svg>
            <span>Noteblock</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="text-white/45 no-underline text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors hover:text-white hover:bg-white/[0.06]"
            >
              Sign in
            </Link>
            <Link
              to="/new"
              className="bg-white text-[#070708] px-[18px] py-2 rounded-[10px] text-sm font-semibold no-underline transition-all hover:opacity-90 hover:-translate-y-px"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              Start free
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-20 items-center max-w-[1280px] mx-auto px-10 pt-24 pb-20">
          <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold mb-6 tracking-[0.01em]"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.15)",
                color: "rgba(167,139,250,0.9)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"
                style={{
                  boxShadow: "0 0 8px rgba(167,139,250,0.6)",
                  animation: "pulseDot 2s ease-in-out infinite",
                }}
              />
              Now with live code blocks
            </div>

            <h1
              className="text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-2px] text-white mb-6"
            >
              Your team&apos;s notes,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #c4b5fd 0%, #6ee7b7 60%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                live and in sync.
              </span>
            </h1>
            <p className="text-[17px] leading-[1.75] text-white/40 max-w-[460px] mb-10">
              Share a code. Anyone joins instantly — no account, no setup. Edit together in real
              time with a block editor that stays out of your way.
            </p>
            <div className="flex gap-3.5 items-center flex-wrap">
              <Link
                to="/new"
                className="inline-flex items-center gap-2 bg-white text-[#070708] px-6 py-3.5 rounded-xl text-[14.5px] font-semibold no-underline transition-all hover:opacity-95 hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
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
              <Link
                to="/join"
                className="inline-flex items-center gap-2 text-white/60 px-6 py-3.5 rounded-xl border border-white/[0.08] text-[14.5px] font-medium no-underline transition-all bg-white/[0.04] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.18]"
              >
                Join with a code
              </Link>
            </div>
            <p className="mt-4 text-[12.5px] text-white/20">
              No credit card. No account required to join.
            </p>
          </div>

          <div
            className="flex justify-center"
            style={{ animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
          >
            <PlayableMockup />
          </div>
        </section>

        {/* ── STATS ── */}
        <section
          className="reveal opacity-0 translate-y-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-b border-white/[0.04] py-12 px-10 bg-white/[0.01]"
        >
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <span
                  className="text-[clamp(26px,3vw,34px)] font-extrabold tracking-[-1px]"
                  style={{
                    background: "linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.4))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </span>
                <span className="text-[12.5px] text-white/30 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="reveal opacity-0 translate-y-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[1280px] mx-auto px-10 py-[120px]">
          <p className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-white/22 mb-4">
            What&apos;s inside
          </p>
          <h2 className="text-[clamp(28px,3.2vw,40px)] font-extrabold tracking-[-1px] text-white mb-14 max-w-[580px] leading-[1.15]">
            Everything your team needs,
            <br />
            nothing it doesn&apos;t.
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-[20px] overflow-hidden border border-white/[0.05]"
            style={{ background: "rgba(255,255,255,0.035)" }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="group px-8 py-9 cursor-default transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: "rgba(10,10,11,0.92)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(10,10,11,0.92)")
                }
              >
                <div className="w-[42px] h-[42px] flex items-center justify-center rounded-[11px] bg-white/[0.05] text-white/50 mb-5 transition-all duration-300 group-hover:bg-[rgba(139,92,246,0.12)] group-hover:text-[rgba(167,139,250,0.85)] group-hover:scale-105">
                  {f.icon}
                </div>
                <h3 className="text-[15.5px] font-semibold text-white tracking-[-0.2px] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm leading-[1.65] text-white/35">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="reveal opacity-0 translate-y-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-white/[0.04] py-[120px] px-10">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-white/22 mb-4">
              How it works
            </p>
            <h2 className="text-[clamp(28px,3.2vw,40px)] font-extrabold tracking-[-1px] text-white mb-14 leading-[1.15]">
              Up in 30 seconds.
            </h2>
            <div className="flex flex-col max-w-[600px] relative">
              {/* Vertical line */}
              <div
                className="absolute left-[15px] top-2.5 bottom-2.5 w-[1.5px] rounded-sm"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(139,92,246,0.2), rgba(52,211,153,0.1), rgba(255,255,255,0.02))",
                }}
              />
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
                <div key={s.n} className="flex gap-7 items-start py-8">
                  <span
                    className="text-[13px] font-bold tracking-[0.06em] text-white/15 min-w-[32px] mt-0.5 relative z-10 pr-2"
                    style={{ backgroundColor: "#070708" }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-white tracking-[-0.2px] mb-1.5">
                      {s.t}
                    </h3>
                    <p className="text-[14.5px] leading-[1.65] text-white/35">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="reveal opacity-0 translate-y-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-white/[0.04] py-[120px] px-10">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-white/22 mb-4">
              What people say
            </p>
            <h2 className="text-[clamp(28px,3.2vw,40px)] font-extrabold tracking-[-1px] text-white mb-14 leading-[1.15]">
              Teams that switched.
            </h2>
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-px rounded-[20px] overflow-hidden border border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.035)" }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="px-8 py-9 flex flex-col justify-between gap-7 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: "rgba(10,10,11,0.92)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.035)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(10,10,11,0.92)")
                  }
                >
                  <p className="text-[14.5px] leading-[1.7] text-white/50 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-[34px] h-[34px] rounded-full border-2 flex items-center justify-center text-[10.5px] font-bold flex-shrink-0"
                      style={{
                        borderColor: t.color,
                        color: t.color,
                        background: "rgba(0,0,0,0.4)",
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-white/80">{t.name}</div>
                      <div className="text-[12.5px] text-white/30 mt-px">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="reveal opacity-0 translate-y-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] max-w-[1280px] mx-auto px-10 pb-[120px] pt-10">
          <div
            className="relative rounded-[24px] px-16 py-20 text-center overflow-hidden"
            style={{ background: "#070708" }}
          >
            {/* Gradient border */}
            <div
              className="absolute inset-0 rounded-[24px] pointer-events-none"
              style={{
                padding: "1.5px",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(52,211,153,0.2) 50%, rgba(255,255,255,0.08) 100%)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            {/* Radial glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-40%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 500,
                height: 500,
                background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
              }}
            />
            <h2 className="relative text-[clamp(30px,3.8vw,46px)] font-extrabold tracking-[-1.2px] text-white mb-3.5">
              Ready to write together?
            </h2>
            <p className="relative text-base text-white/35 mb-10">
              No setup. No billing. Just paste a code and start.
            </p>
            <div className="relative flex gap-3.5 justify-center flex-wrap">
              <Link
                to="/new"
                className="inline-flex items-center gap-2 bg-white text-[#070708] px-6 py-3.5 rounded-xl text-[14.5px] font-semibold no-underline transition-all hover:opacity-95 hover:-translate-y-0.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
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
              <Link
                to="/join"
                className="inline-flex items-center gap-2 text-white/60 px-6 py-3.5 rounded-xl border border-white/[0.08] text-[14.5px] font-medium no-underline bg-white/[0.04] transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/[0.18]"
              >
                Join with a code
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/[0.04] py-9 px-10 flex items-center justify-between max-w-[1280px] mx-auto flex-wrap gap-3.5">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13.5px] font-semibold text-white/30 no-underline transition-colors hover:text-white/55"
          >
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="2" fill="white" opacity="0.6" />
              <rect x="12" y="2" width="8" height="8" rx="2" fill="white" opacity="0.3" />
              <rect x="2" y="12" width="8" height="8" rx="2" fill="white" opacity="0.3" />
              <rect x="12" y="12" width="8" height="8" rx="2" fill="white" opacity="0.15" />
            </svg>
            <span>Noteblock</span>
          </Link>
          <p className="text-[12.5px] text-white/15">
            &copy; 2025 Noteblock. Built for teams who&apos;d rather write than configure.
          </p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
          .reveal { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </main>
  );
}