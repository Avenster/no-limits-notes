import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, useSearchParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import { ThemeToggle } from "~/components/ThemeToggle";

export const meta: MetaFunction = () => [{ title: "Log in · Noteblock" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) return redirect("/home");
  return { backendUrl: getBackendUrl() };
}

const ERROR_MESSAGES: Record<string, string> = {
  google: "Google sign-in didn't go through. Try again.",
  github: "GitHub sign-in didn't go through. Try again.",
};

export default function LoginPage() {
  const data = useLoaderData<typeof loader>();
  const backendUrl = data?.backendUrl ?? "http://localhost:4000";
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const navigate = useNavigate();

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Subtle noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Animated glow behind card */}
      {/* <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[100px]"
        style={{ background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-light)))" }}
      /> */}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm backdrop-blur-xl transition-colors duration-200"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface-1)",
            color: "var(--text-tertiary)",
          }}
        >
          <ArrowLeft size={15} strokeWidth={2} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-[fadeIn_0.6s_ease-out]">
        <div
          className="rounded-[20px] px-8 py-10 backdrop-blur-2xl"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 80px -20px rgb(var(--accent) / 0.08), 0 24px 60px -24px rgba(0,0,0,0.5)",
          }}
        >
          <div className="mb-9 flex flex-col items-center gap-5 text-center">
            <NoteblockMark />
            <div className="flex flex-col gap-2">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
                Welcome to Noteblock
              </h1>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                Sign in to open your groups and pages.
              </p>
            </div>
          </div>

          {error && ERROR_MESSAGES[error] && (
            <div className="mb-5 rounded-lg border border-red-500/15 bg-red-500/[0.05] px-4 py-2.5 text-[13px] text-red-300/90">
              {ERROR_MESSAGES[error]}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <GlassLink href={`${backendUrl}/auth/google`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <GoogleGlyph />
              </span>
              Continue with Google
            </GlassLink>

            <GlassLink href={`${backendUrl}/auth/github`}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <GitHubGlyph />
              </span>
              Continue with GitHub
            </GlassLink>

            <div className="my-1 flex items-center gap-3 px-1">
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--text-quaternary)" }}>or</span>
              <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            <GlassLink href="/join" muted>
              Join a group with a code
            </GlassLink>
          </div>
        </div>

        <p className="mt-6 text-center text-[12px]" style={{ color: "var(--text-quaternary)" }}>
          By continuing you agree to Noteblock's terms and privacy policy.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </main>
  );
}

function NoteblockMark() {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-[14px] backdrop-blur-xl"
      style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
    >
      <div className="grid grid-cols-2 gap-[3px]">
        <div className="h-[9px] w-[9px] rounded-[2.5px]" style={{ background: "var(--text-primary)" }} />
        <div className="h-[9px] w-[9px] rounded-[2.5px]" style={{ background: "var(--text-tertiary)" }} />
        <div className="h-[9px] w-[9px] rounded-[2.5px]" style={{ background: "var(--text-quaternary)" }} />
        <div className="h-[9px] w-[9px] rounded-[2.5px]" style={{ background: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

function GlassLink({
  href,
  children,
  muted = false,
}: {
  href: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-center gap-3.5 rounded-xl px-4 py-3.5 text-[14.5px] font-medium backdrop-blur-sm transition-all duration-150 hover:scale-[1.01]"
      style={{
        border: "1px solid var(--border)",
        background: muted ? "transparent" : "var(--surface-2)",
        color: muted ? "var(--text-tertiary)" : "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.background = "var(--surface-3)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = muted ? "transparent" : "var(--surface-2)";
        e.currentTarget.style.color = muted ? "var(--text-tertiary)" : "var(--text-primary)";
      }}
    >
      {children}
    </a>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function GitHubGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "var(--text-secondary)" }}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}