import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";

export const meta: MetaFunction = () => [{ title: "Notes" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  return { user, backendUrl: getBackendUrl() };
}

export default function HomePage() {
  const { user, backendUrl } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]"
      />

      <header className="relative flex items-center justify-between border-b border-white/[0.08] px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <NotesMark />
          </div>
          <span className="text-sm font-medium tracking-tight">Notes</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-white/70">{user.name}</span>
          </div>

          <LogoutButton backendUrl={backendUrl} />
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-8 py-16">
        <div className="mb-10">
          <h1 className="text-2xl font-medium tracking-tight text-[#e8e8e8]">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            Your groups will show up here. Create one, or join with a code.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard
            title="Create a group"
            description="Start a fresh space for pages you and others can edit together."
            icon={<PlusIcon />}
          />
          <ActionCard
            title="Join a group"
            description="Have a code from someone else? Drop it in to join their group."
            icon={<ArrowRightIcon />}
          />
        </div>

        <div className="mt-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
          <p className="text-sm text-white/40">
            No groups yet — once you create or join one, your pages will
            appear here.
          </p>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="group flex flex-col items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 text-left backdrop-blur-xl transition-all duration-150 hover:bg-white/[0.07] hover:border-white/[0.14] active:scale-[0.99]"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/70 transition-colors duration-150 group-hover:text-[#e8e8e8]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[#e8e8e8]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/40">
          {description}
        </p>
      </div>
    </button>
  );
}

function LogoutButton({ backendUrl }: { backendUrl: string }) {
  // Plain fetch + reload keeps this independent of the frontend's own
  // action/session handling, since auth state lives on the backend.
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
      className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-[#e8e8e8]"
    >
      Sign out
    </button>
  );
}

function NotesMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect
        x="3"
        y="2"
        width="14"
        height="16"
        rx="2"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 7H13.5"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10.5H13.5"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}