import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, Link } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import { useState } from "react";

export const meta: MetaFunction = () => [{ title: "Notes" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const backendUrl = getBackendUrl();
  
  // Fetch groups for both logged-in users and guests (guest cookies are forwarded)
  let groups: { id: string; name: string; code: string; createdAt: string; pageCount?: number; memberCount?: number; lastActivity?: string }[] = [];
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

  let activity: { id: string; editedByName: string; pageId: string; pageTitle: string; groupId: string; groupName: string; createdAt: string }[] = [];
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

  // If not logged in AND no groups (pure anonymous visitor), redirect to login
  if (!user && groups.length === 0) return redirect("/login");

  return { user, backendUrl, groups, activity };
}

export default function HomePage() {
  const { user, backendUrl, groups, activity } = useLoaderData<typeof loader>();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]"
      />

      <header style={{ borderBottom: '1px solid var(--border)' }} className="relative flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <NotesMark />
          </div>
          <span className="text-sm font-medium tracking-tight">Notes</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
            style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
          >
            <span>⌘K</span>
          </button>
          
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:opacity-80 transition-opacity"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
              </button>
              
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border p-1 shadow-lg z-50" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Profile settings
                    </Link>
                    <div className="my-1 h-px w-full" style={{ background: 'var(--border)' }} />
                    <LogoutButton backendUrl={backendUrl} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-[#e8e8e8]"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-8 py-16">
        <div className="mb-10">
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {user ? `Welcome, ${user.name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Your groups will show up here. Create one, or join with a code.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard
            to="/create"
            title="Create a group"
            description="Start a fresh space for pages you and others can edit together."
            icon={<PlusIcon />}
          />
          <ActionCard
            to="/join"
            title="Join a group"
            description="Have a code from someone else? Drop it in to join their group."
            icon={<ArrowRightIcon />}
          />
        </div>

        {groups.length > 0 ? (
          <div className="mt-14">
            <h2 className="mb-4 text-lg font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Your groups
            </h2>
            <ul className="flex flex-col gap-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    to={`/group/${group.id}/pages`}
                    className="group flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-150 active:scale-[0.99]"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)';
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-1)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        {group.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{group.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {group.pageCount || 0} pages · {group.memberCount || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(group.code); }}
                          title="Copy code"
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ background: 'var(--surface-2)', color: 'var(--text-tertiary)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M6 13h5.5a1.5 1.5 0 001.5-1.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-14 rounded-2xl p-10 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              No groups yet — once you create or join one, your pages will
              appear here.
            </p>
          </div>
        )}

        {activity.length > 0 && (
          <div className="mt-10">
            <h2 style={{ color: 'var(--text-primary)' }} className="mb-3 text-sm font-semibold uppercase tracking-wider" >
              Recent activity
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {activity.slice(0, 5).map((a, i) => (
                <Link
                  key={a.id}
                  to={`/group/${a.groupId}/pages/${a.pageId}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    borderBottom: i < Math.min(activity.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="truncate flex-1">
                    <span style={{ color: 'var(--text-primary)' }} className="font-medium">{a.editedByName}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> edited </span>
                    <span style={{ color: 'var(--text-primary)' }} className="font-medium">{a.pageTitle}</span>
                  </span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-quaternary)' }}>
                    {formatTimeAgo(new Date(a.createdAt))}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
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
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-2)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface-1)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-150 group-hover:text-current" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
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
      style={{ color: 'var(--text-primary)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      Sign out
    </button>
  );
}

function NotesMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" />
      <path d="M6.5 7H13.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 10.5H13.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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