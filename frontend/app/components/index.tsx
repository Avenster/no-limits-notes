import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, Link } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import { useState, useMemo } from "react";
import { FileEdit, Activity, Clock, Users, FileText, Zap } from "lucide-react";
import { Reveal } from "~/hooks/useScrollReveal";
import { useCountUp } from "~/hooks/useCountUp";
import CommandPalette, { type SearchItem } from "~/components/CommandPalette";
import { NotesMark, PlusIcon, ArrowRightIcon } from "~/components/icons";

export const meta: MetaFunction = () => [{ title: "Notes" }];

type Group = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  pageCount?: number;
  memberCount?: number;
  lastActivity?: string;
};

type ActivityItem = {
  id: string;
  editedByName: string;
  pageId: string;
  pageTitle: string;
  groupId: string;
  groupName: string;
  createdAt: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const backendUrl = getBackendUrl();

  let groups: Group[] = [];
  try {
    const cookie = request.headers.get("Cookie");
    const res = await fetch(`${backendUrl}/group/my-groups`, {
      headers: cookie ? { Cookie: cookie } : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      groups = data.groups || [];
    }
  } catch (err) {
    console.error("Failed to fetch groups:", err);
  }

  let activity: ActivityItem[] = [];
  try {
    const cookie = request.headers.get("Cookie");
    const actRes = await fetch(`${backendUrl}/activity/recent`, {
      headers: cookie ? { Cookie: cookie } : undefined,
    });
    if (actRes.ok) {
      const actData = await actRes.json();
      activity = actData.activity || [];
    }
  } catch {}

  if (!user && groups.length === 0) return redirect("/login");

  return { user, backendUrl, groups, activity };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { user, backendUrl, groups, activity } = useLoaderData<typeof loader>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number } | null>(null);

  // Dynamic stats derived from real loader data (never hardcoded).
  const stats = useMemo(() => {
    const totalPages = groups.reduce((s, g) => s + (g.pageCount || 0), 0);
    const totalMembers = groups.reduce((s, g) => s + (g.memberCount || 0), 0);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const editsThisWeek = activity.filter((a) => new Date(a.createdAt).getTime() > weekAgo).length;
    return { groups: groups.length, totalPages, totalMembers, editsThisWeek };
  }, [groups, activity]);

  // Command palette gets real, dynamic items: groups + recently touched pages.
  const paletteItems: SearchItem[] = useMemo(() => {
    const groupItems: SearchItem[] = groups.map((g) => ({
      id: `group-${g.id}`,
      title: g.name,
      subtitle: `${g.pageCount || 0} pages · ${g.memberCount || 0} members`,
      href: `/group/${g.id}/pages`,
      icon: "group",
    }));
    const seenPages = new Set<string>();
    const pageItems: SearchItem[] = activity
      .filter((a) => {
        if (seenPages.has(a.pageId)) return false;
        seenPages.add(a.pageId);
        return true;
      })
      .slice(0, 8)
      .map((a) => ({
        id: `page-${a.pageId}`,
        title: a.pageTitle,
        subtitle: a.groupName,
        href: `/group/${a.groupId}/pages/${a.pageId}`,
        icon: "page",
      }));
    return [...groupItems, ...pageItems];
  }, [groups, activity]);

  // Group repetitive activities by the same user on the same page.
  const groupedActivity = activity.reduce((acc, curr) => {
    const last = acc[acc.length - 1];
    if (last && last.pageId === curr.pageId && last.editedByName === curr.editedByName) {
      last.count = (last.count || 1) + 1;
    } else {
      acc.push({ ...curr, count: 1 });
    }
    return acc;
  }, [] as (ActivityItem & { count?: number })[]);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function handleHeroMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const firstName = user?.name.split(" ")[0] || "";

  return (
    <main
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Ambient accent orb */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-[140px]"
        style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.15), rgb(var(--accent-light) / 0.08))" }}
      />

      <CommandPalette items={paletteItems} />

      {/* ── Header ── */}
      <header
        style={{ borderBottom: "1px solid var(--border)", background: "rgb(var(--bg-secondary) / 0.6)", backdropFilter: "blur(12px)" }}
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 sm:px-8"
      >
        <Link to="/home" className="flex items-center gap-2.5 no-underline" style={{ color: "var(--text-primary)" }}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
          >
            <NotesMark />
          </div>
          <span className="text-sm font-semibold tracking-tight">Notes</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            title="Search (⌘K)"
          >
            <span style={{ opacity: 0.7 }}>⌘K</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-opacity hover:opacity-80"
                style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
                  >
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                  {user.name}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border p-1 shadow-lg z-50 backdrop-blur-xl"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                  >
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Profile settings
                    </Link>
                    <div className="my-1 h-px w-full" style={{ background: "var(--border)" }} />
                    <LogoutButton backendUrl={backendUrl} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero with spotlight + dynamic stats ── */}
      <section
        onMouseMove={handleHeroMove}
        onMouseLeave={() => setSpotlight(null)}
        className="relative mx-auto max-w-6xl px-6 pt-14 pb-2 sm:px-8"
      >
        {/* Pointer-following spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: spotlight ? 1 : 0,
            background: spotlight
              ? `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, rgb(var(--accent) / 0.10), transparent 70%)`
              : "none",
          }}
        />

        <div className="relative">
          <Reveal>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "rgb(var(--accent))" }}>
              {greeting()}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
              {firstName ? `Welcome back, ${firstName}.` : "Welcome."}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Your workspaces and recent activity, at a glance.
            </p>
          </Reveal>

          {/* Dynamic count-up stats */}
          <Reveal delay={100}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<FileText size={15} />} label="Groups" end={stats.groups} />
              <StatCard icon={<FileEdit size={15} />} label="Pages" end={stats.totalPages} />
              <StatCard icon={<Users size={15} />} label="Members" end={stats.totalMembers} />
              <StatCard icon={<Zap size={15} />} label="Edits / week" end={stats.editsThisWeek} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column — 2/3 */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Quick actions */}
            <Reveal>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ActionCard
                  to="/create"
                  title="Create a group"
                  description="Start a fresh space for collaborative notes."
                  icon={<PlusIcon />}
                />
                <ActionCard
                  to="/join"
                  title="Join a group"
                  description="Have a code? Enter it to join an existing group."
                  icon={<ArrowRightIcon />}
                />
              </div>
            </Reveal>

            {/* Groups — bento grid */}
            <div>
              <Reveal>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Your groups
                  </h2>
                  <span className="text-xs" style={{ color: "var(--text-quaternary)" }}>
                    {groups.length} {groups.length === 1 ? "group" : "groups"}
                  </span>
                </div>
              </Reveal>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {groups.map((group, i) => (
                    <Reveal key={group.id} delay={i * 60} as="div">
                      <GroupCard
                        group={group}
                        copied={copiedCode === group.code}
                        onCopy={() => copyCode(group.code)}
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    No groups yet — create or join one to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column — 1/3 — Activity feed */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Recent activity
                  </h2>
                  <Activity size={14} style={{ color: "var(--text-quaternary)" }} />
                </div>
              </Reveal>

              {groupedActivity.length > 0 ? (
                <div
                  className="flex flex-col gap-0.5 rounded-xl p-1.5"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                >
                  {groupedActivity.slice(0, 8).map((a, i) => (
                    <Reveal key={a.id} delay={i * 50} as="div">
                      <Link
                        to={`/group/${a.groupId}/pages/${a.pageId}`}
                        className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors"
                          style={{ background: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          <FileEdit size={12} strokeWidth={2.5} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[13px] font-semibold leading-tight transition-colors group-hover:text-[var(--accent)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {a.pageTitle}
                          </p>
                          <p className="mt-1 truncate text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                              {a.editedByName}
                            </span>
                            {a.count && a.count > 1 ? ` · ${a.count} edits` : " edited"}
                          </p>
                          <div
                            className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium"
                            style={{ color: "var(--text-quaternary)" }}
                          >
                            <Clock size={10} strokeWidth={2.5} />
                            <span>{formatTimeAgo(new Date(a.createdAt))}</span>
                            <span>·</span>
                            <span className="truncate">{a.groupName}</span>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-xl p-8 text-center"
                  style={{ border: "1px dashed var(--border)", background: "transparent" }}
                >
                  <Activity size={24} className="mb-3 opacity-20" style={{ color: "var(--text-secondary)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    No activity
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Updates will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** A single count-up stat tile. */
function StatCard({ icon, label, end }: { icon: React.ReactNode; label: string; end: number }) {
  const { ref, value } = useCountUp<HTMLDivElement>(end, { duration: 1100 });
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))", border: "1px solid rgb(var(--accent) / 0.2)" }}
      >
        {icon}
      </div>
      <div>
        <div ref={ref} className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
          {value}
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/** A group card with letter avatar, counts, code badge + copy, and last-activity. */
function GroupCard({
  group,
  copied,
  onCopy,
}: {
  group: Group;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Link
      to={`/group/${group.id}/pages`}
      className="group flex h-full flex-col justify-between gap-4 rounded-2xl p-5 transition-all duration-150 active:scale-[0.995]"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-1)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold"
          style={{
            background: "rgb(var(--accent) / 0.12)",
            color: "rgb(var(--accent))",
            border: "1px solid rgb(var(--accent) / 0.2)",
          }}
        >
          {group.name.slice(0, 1).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy();
          }}
          title="Copy group code"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono font-medium tracking-wider opacity-0 transition-all group-hover:opacity-100"
          style={{ background: "var(--surface-3)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
        >
          {copied ? (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M4 8.5l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 13h5.5a1.5 1.5 0 001.5-1.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {copied ? "Copied" : group.code}
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {group.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <span>{group.pageCount || 0} pages</span>
          <span style={{ color: "var(--text-quaternary)" }}>·</span>
          <span>{group.memberCount || 0} members</span>
        </div>
        {group.lastActivity && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-quaternary)" }}>
            <Clock size={10} strokeWidth={2.5} />
            <span>active {formatTimeAgo(new Date(group.lastActivity))}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function ActionCard({
  to,
  title,
  description,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-start gap-4 rounded-2xl p-6 text-left transition-all duration-150 active:scale-[0.99]"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-1)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          {description}
        </p>
      </div>
    </Link>
  );
}

function LogoutButton({ backendUrl }: { backendUrl: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch(`${backendUrl}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/login";
      }}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
      style={{ color: "var(--text-primary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      Sign out
    </button>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
