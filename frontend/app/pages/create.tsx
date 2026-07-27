import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useNavigation, Form } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";

export const meta: MetaFunction = () => [{ title: "Create a group · Notes" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

type ActionData =
  | { error: string; ok?: never; code?: never; name?: never; groupId?: never }
  | { ok: true; code: string; name: string; groupId: string; error?: never }
  | undefined;

export async function action({ request }: ActionFunctionArgs) {
  const backendUrl = getBackendUrl();
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();

  if (!name) {
    return { error: "Enter a group name." };
  }

  const cookie = request.headers.get("Cookie");

  const res = await fetch(`${backendUrl}/group/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ name, displayName }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { error: data?.error || "Couldn't create the group. Try again." };
  }

  // Note: unlike /join, we don't redirect straight to /home — there's no
  // group dashboard yet, so we show the code here so it can be copied and
  // shared. The backend's Set-Cookie (guest cookie, if anonymous) is
  // already applied to this response by the browser since this is a
  // same-origin fetch made from the Remix server on the user's behalf;
  // forward it along explicitly so the browser picks it up.
  const setCookie = res.headers.get("set-cookie");
  const headers = new Headers();
  if (setCookie) headers.append("Set-Cookie", setCookie);

  return Response.json(
    { ok: true, code: data.group.code, name: data.group.name, groupId: data.group.id },
    { headers }
  );
}

export default function CreatePage() {
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
            <PlusMark />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#e8e8e8]">
            Create a group
          </h1>
          <p className="text-sm text-white/40">
            Give it a name — you'll get a code to share.
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

          {actionData?.ok ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <p className="text-sm text-white/50">
                <span className="text-[#e8e8e8]">{actionData.name}</span> is
                ready. Share this code:
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3">
                <span className="text-2xl font-medium tracking-[0.2em] text-[#e8e8e8]">
                  {actionData.code}
                </span>
              </div>

              <CopyButton code={actionData.code} />

              <a
                href={`/group/${actionData.groupId}/pages`}
                className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#e8e8e8] transition-all duration-150 hover:bg-white/[0.14] hover:border-white/[0.2] active:scale-[0.98]"
              >
                Continue
              </a>
            </div>
          ) : (
            <Form method="post" className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-medium text-white/50"
                >
                  Group name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Product team notes"
                  maxLength={60}
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
                  Already signed in? This is optional — we'll use your
                  account name instead.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#e8e8e8] transition-all duration-150 hover:bg-white/[0.14] hover:border-white/[0.2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating…" : "Create group"}
              </button>
            </Form>
          )}

          {!actionData?.ok && (
            <>
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
                Join a group instead
              </a>
            </>
          )}
        </div>

        {!actionData?.ok && (
          <p className="mt-6 text-center text-xs text-white/30">
            No account needed — you'll be the group's owner as a guest.
          </p>
        )}
      </div>
    </main>
  );
}

function CopyButton({ code }: { code: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(code);
      }}
      className="flex items-center justify-center rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.06] hover:text-[#e8e8e8] active:scale-[0.98]"
    >
      Copy code
    </button>
  );
}

function PlusMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2.5"
        y="2.5"
        width="15"
        height="15"
        rx="4"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <path
        d="M10 6.5v7M6.5 10h7"
        stroke="#e8e8e8"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}