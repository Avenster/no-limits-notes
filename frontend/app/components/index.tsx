import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, Link, Await, useRevalidator } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import { useState, useMemo, Suspense } from "react";
import { FileEdit, Activity, Clock, Users, FileText, Zap } from "lucide-react";
import { Reveal } from "~/hooks/useScrollReveal";
import { useCountUp } from "~/hooks/useCountUp";
import CommandPalette, { type SearchItem } from "~/components/CommandPalette";
import { PlusIcon, ArrowRightIcon } from "~/components/icons";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Skeleton, SkeletonCard } from "~/components/ui/Skeleton";
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
  const cookie = request.headers.get("Cookie") || "";

  // Synchronous redirect for unauthenticated users without guest cookies
  if (!user && !cookie.includes("guest_")) return redirect("/login");

  const groupsPromise = fetch(`${backendUrl}/group/my-groups`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  }).then(async (res) => {
    if (!res.ok) throw new Error("Failed to fetch groups");
    const data = await res.json();
    return data.groups || [];
  }).catch((err) => {
    console.error("Failed to fetch groups:", err);
    return [];
  });

  const activityPromise = fetch(`${backendUrl}/activity/recent`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  }).then(async (res) => {
    if (!res.ok) throw new Error("Failed to fetch activity");
    const actData = await res.json();
    return actData.activity || [];
  }).catch(() => []);

  return { user, backendUrl, groups: groupsPromise, activity: activityPromise };
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

  return (
    <main
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      className="relative h-screen flex flex-col overflow-hidden"
    >
      {/* Ambient accent orb */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-[140px]"
        style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.15), rgb(var(--accent-light) / 0.08))" }}
      />

      {/* ── Header ── */}
      <header
        style={{ borderBottom: "1px solid var(--border)", background: "rgb(var(--bg-secondary) / 0.6)", backdropFilter: "blur(12px)" }}
        className="shrink-0 sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 sm:px-8"
      >
        <Link to="/home" className="flex items-center gap-2.5 no-underline" style={{ color: "var(--text-primary)" }}>
          <NoteblockMark />
          <span className="text-[15px] font-bold tracking-[-0.3px]">Noteblock</span>
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

          <ThemeToggle />

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

      <Suspense fallback={<DashboardSkeleton />}>
        <Await resolve={Promise.all([groups, activity])}>
          {([resolvedGroups, resolvedActivity]) => (
            <DashboardContent user={user} backendUrl={backendUrl} groups={resolvedGroups} activity={resolvedActivity} />
          )}
        </Await>
      </Suspense>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 pb-20 pt-8 sm:px-8 custom-scrollbar">
      <div className="mx-auto max-w-6xl space-y-12 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-12 lg:grid-cols-3 pt-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
               <Skeleton className="h-6 w-32" />
               <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-[72px] w-full rounded-xl" />
              <Skeleton className="h-[72px] w-full rounded-xl" />
              <Skeleton className="h-[72px] w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-4">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ user, backendUrl, groups, activity }: { user: any, backendUrl: string, groups: Group[], activity: ActivityItem[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const revalidator = useRevalidator();
  const firstName = user?.name.split(" ")[0] || "";

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

  return (
    <>
      <CommandPalette items={paletteItems} />

      {/* ── Hero with spotlight + dynamic stats ── */}
      <section
        className="shrink-0 relative z-10 mx-auto w-full max-w-6xl px-6 pt-14 pb-2 sm:px-8"
      >
        <div className="relative">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "rgb(var(--accent))" }}>
              {greeting()}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
              {firstName ? `Welcome back, ${firstName}.` : "Welcome."}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Your workspaces and recent activity, at a glance.
            </p>
          </div>

          {/* Dynamic count-up stats */}
          <div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<FileText size={15} />} label="Groups" end={stats.groups} />
              <StatCard icon={<FileEdit size={15} />} label="Pages" end={stats.totalPages} />
              <StatCard icon={<Users size={15} />} label="Members" end={stats.totalMembers} />
              <StatCard icon={<Zap size={15} />} label="Edits / week" end={stats.editsThisWeek} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-8 pt-10 sm:px-8 flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 flex-1 min-h-0">
          {/* Left column — 2/3 */}
          <div className="flex flex-col gap-8 lg:col-span-2 overflow-y-auto custom-scrollbar p-2 -m-2">
            {/* Groups list */}
            <Reveal>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Your Groups
                  </h2>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "var(--surface-1)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {stats.groups}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to="/join"
                    className="group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all duration-150 active:scale-95 hover:bg-[var(--surface-1)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]" />
                    <span className="text-xs font-medium group-hover:text-[var(--text-primary)]">Join</span>
                  </Link>
                  <Link
                    to="/create"
                    className="group flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all duration-150 active:scale-95 hover:bg-[var(--surface-1)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Plus size={13} className="transition-transform group-hover:scale-110 group-hover:text-[var(--text-primary)]" />
                    <span className="text-xs font-medium group-hover:text-[var(--text-primary)]">Create</span>
                  </Link>
                </div>
              </div>
              {groups.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {groups.map((group, i) => (
                    <Reveal key={group.id} delay={i * 50} as="div">
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
            </Reveal>
          </div>

          {/* Right column — 1/3 — Activity feed */}
          <div className="lg:col-span-1 relative">
            <div className="lg:absolute lg:inset-0 flex flex-col">
              <Reveal>
                <div className="mb-4 flex items-center justify-between shrink-0">
                  <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Recent activity
                  </h2>
                  <Activity size={14} style={{ color: "var(--text-quaternary)" }} />
                </div>
              </Reveal>

              {groupedActivity.length > 0 ? (
                <div
                  className="flex flex-col gap-0.5 rounded-xl p-1.5 overflow-y-auto custom-scrollbar lg:flex-1"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                >
                  {groupedActivity.slice(0, 8).map((a, i) => (
                    <div key={a.id}>
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
                    </div>
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
    </>
  );
}

function NoteblockMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="2" y="2" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="12" y="2" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="2" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.25" />
    </svg>
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
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
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

function GroupCard({
  group,
  copied,
  onCopy,
  onRename,
}: {
  group: Group;
  copied: boolean;
  onCopy: () => void;
  onRename: (newName: string) => void;
}) {
  return (
    <div
      className="group relative flex items-center justify-between gap-4 rounded-xl p-3 transition-all duration-150 active:scale-[0.995]"
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
      <Link to={`/group/${group.id}/pages`} className="absolute inset-0 z-0 rounded-xl" />

      <div className="relative z-10 flex items-center gap-4 min-w-0 pointer-events-none">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold uppercase transition-transform duration-200 group-hover:scale-105"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        >
          {group.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {group.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span>{group.pageCount || 0} pages</span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-quaternary)]" />
            <span>{group.memberCount || 0} members</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] mr-2" style={{ color: "var(--text-quaternary)" }}>
          <Clock size={11} />
          <span>active {group.lastActivity ? formatTimeAgo(new Date(group.lastActivity)) : formatTimeAgo(new Date(group.createdAt))}</span>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy();
          }}
          title="Copy invite code"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-mono font-medium tracking-wider opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--surface-3)]"
          style={{ background: "var(--surface-2)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
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

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newName = window.prompt("Enter new group name:", group.name);
            if (newName && newName !== group.name) {
              onRename(newName);
            }
          }}
          title="Rename group"
          className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--surface-3)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <FileEdit size={13} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Delete group functionality coming soon!");
          }}
          title="Delete group"
          className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
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
