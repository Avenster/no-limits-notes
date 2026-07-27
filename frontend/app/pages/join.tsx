import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useActionData, useNavigation, Form } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
// import remix-react-router from "@remix-run/react-router";
export const meta: MetaFunction = () => [{ title: "Join a group · Notes" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

type ActionData = { error: string } | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const backendUrl = getBackendUrl();
  const formData = await request.formData();

  const code = String(formData.get("code") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();

  if (!code) {
    return { error: "Enter a group code." };
  }

  const cookie = request.headers.get("Cookie");

  const res = await fetch(`${backendUrl}/group/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ code, displayName }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { error: data?.error || "Couldn't join that group. Try again." };
  }

  // Forward any Set-Cookie header from the backend (guest cookie) to the
  // browser, then redirect into the app.
  const setCookie = res.headers.get("set-cookie");
  const headers = new Headers();
  if (setCookie) headers.append("Set-Cookie", setCookie);

  const groupId = data?.group?.id;
  return redirect(groupId ? `/group/${groupId}/pages` : "/home", { headers });
}

export default function JoinPage() {
  const actionData = useActionData() as ActionData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
            <GroupMark />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#e8e8e8]">
            Join a group
          </h1>
          <p className="text-sm text-white/40">
            Enter the code someone shared with you.
          </p>
        </div>

        <div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          {actionData?.error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-sm text-red-300">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="code"
                className="text-xs font-medium text-white/50"
              >
                Group code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="e.g. 7QK3PZ"
                maxLength={8}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-[#e8e8e8] placeholder:text-white/25 outline-none transition-colors duration-150 focus:border-white/[0.2] focus:bg-white/[0.05]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="displayName"
                className="text-xs font-medium text-white/50"
              >
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                placeholder="What should we call you?"
                maxLength={40}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-[#e8e8e8] placeholder:text-white/25 outline-none transition-colors duration-150 focus:border-white/[0.2] focus:bg-white/[0.05]"
              />
              <p className="text-xs text-white/30">
                Already signed in? This is optional — we'll use your account
                name instead.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#e8e8e8] transition-all duration-150 hover:bg-white/[0.14] hover:border-white/[0.2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Joining…" : "Join group"}
            </button>
          </Form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs uppercase tracking-wider text-white/30">
              or
            </span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <a
            href="/login"
            className="flex items-center justify-center rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.04] hover:text-[#e8e8e8] active:scale-[0.98]"
          >
            Sign in instead
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          No account needed — you'll join as a guest with just a display name.
        </p>
      </div>
    </main>
  );
}

function GroupMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="7"
        cy="7"
        r="3"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <circle
        cx="14"
        cy="9"
        r="2.3"
        stroke="#e8e8e8"
        strokeOpacity="0.5"
        strokeWidth="1.4"
      />
      <path
        d="M2.5 16c.6-2.6 2.4-4 4.5-4s3.9 1.4 4.5 4"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11.8 12.4c1.6.2 2.9 1.4 3.4 3.6"
        stroke="#e8e8e8"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}