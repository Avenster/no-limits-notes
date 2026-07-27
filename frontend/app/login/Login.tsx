import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { useSearchParams } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";

export const meta: MetaFunction = () => [{ title: "Log in · Notes" }];

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
  const { backendUrl } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-6">
      {/* ambient glow, kept subtle per the design brief */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
            <NotesMark />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#e8e8e8]">
            Welcome back
          </h1>
          <p className="text-sm text-white/40">
            Sign in to open your groups and pages.
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          {error && ERROR_MESSAGES[error] && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-sm text-red-300">
              {ERROR_MESSAGES[error]}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <a
              href={`${backendUrl}/auth/google`}
              className="group flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-[#e8e8e8] transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.14] active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </a>

            <a
              href={`${backendUrl}/auth/github`}
              className="group flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-[#e8e8e8] transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.14] active:scale-[0.98]"
            >
              <GitHubIcon />
              Continue with GitHub
            </a>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs uppercase tracking-wider text-white/30">
              or
            </span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <a
            href="/join"
            className="flex items-center justify-center rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.04] hover:text-[#e8e8e8] active:scale-[0.98]"
          >
            Join a group with a code
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          No account needed to join a shared group — sign in only if you want
          your own groups and history saved.
        </p>
      </div>
    </main>
  );
}

function NotesMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
      <path
        d="M6.5 14H10.5"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8e8e8">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}