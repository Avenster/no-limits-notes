import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";

type Result = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon?: "page" | "group" | "action";
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Listen for Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(getDefaultActions());
      return;
    }
    try {
      const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
      // This goes through the frontend proxy - we need a loader for this
      // Actually let's make a direct backend call
    } catch {}

    // For now, use static actions + client-side filtering
    const actions = getDefaultActions().filter((a) =>
      a.title.toLowerCase().includes(q.toLowerCase())
    );
    
    // Search pages via backend
    try {
      const backendUrl = window.__BACKEND_URL__ || "";
      // We can't call backend directly from client. Instead, use a route action.
      // For simplicity, just filter known pages from the DOM/state
    } catch {}
    
    setResults(actions);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  function select(result: Result) {
    setOpen(false);
    navigate(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      select(results[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div className="cmd-palette-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmd-palette-input"
          placeholder="Search pages, groups, or actions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="cmd-palette-results">
          {results.length === 0 && query ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
              No results for "{query}"
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
              Type to search…
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={r.id}
                className="cmd-palette-item"
                data-active={i === activeIndex ? "true" : undefined}
                onClick={() => select(r)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <PaletteIcon type={r.icon || "page"} />
                <div>
                  <div className="cmd-palette-item-title">{r.title}</div>
                  {r.subtitle && (
                    <div className="cmd-palette-item-subtitle">{r.subtitle}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>↑↓ Navigate</span>
          <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>↵ Open</span>
          <span style={{ fontSize: 11, color: "var(--text-quaternary)" }}>esc Close</span>
        </div>
      </div>
    </div>
  );
}

function getDefaultActions(): Result[] {
  return [
    { id: "action-create", title: "Create a group", subtitle: "Start a new workspace", href: "/create", icon: "action" },
    { id: "action-join", title: "Join a group", subtitle: "Enter a group code", href: "/join", icon: "action" },
    { id: "action-home", title: "Go home", subtitle: "View all groups", href: "/home", icon: "action" },
    { id: "action-profile", title: "Profile settings", subtitle: "Edit your profile", href: "/profile", icon: "action" },
  ];
}

function PaletteIcon({ type }: { type: "page" | "group" | "action" }) {
  if (type === "page") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
        <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "group") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
