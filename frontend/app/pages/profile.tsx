import { useState } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, Link, redirect } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import ThemeToggle from "~/components/ThemeToggle";

export const meta: MetaFunction = () => [{ title: "Profile · Notes" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user) return redirect("/login");
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const backendUrl = getBackendUrl();
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();

  if (!name) return Response.json({ error: "Name is required." });

  const cookie = request.headers.get("Cookie");
  const res = await fetch(`${backendUrl}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) return Response.json({ error: "Couldn't update profile." });
  const data = await res.json();
  return Response.json({ ok: true, user: data.user });
}

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [name, setName] = useState(user.name);

  const isSaving = fetcher.state === "submitting";
  const saved = fetcher.data?.ok;

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} className="min-h-screen">
      <header style={{ borderBottom: "1px solid var(--border)" }} className="flex items-center justify-between px-8 py-4">
        <Link to="/home" className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "var(--text-tertiary)" }} className="text-sm">Back to home</span>
        </Link>
      </header>

      <section className="mx-auto max-w-lg px-8 py-16">
        <h1 className="mb-8 text-2xl font-medium tracking-tight">Profile</h1>

        <div className="mb-8 flex items-center gap-4">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold"
              style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <p style={{ color: "var(--text-tertiary)" }} className="text-sm">
              {user.email || "No email"} · {user.provider}
            </p>
          </div>
        </div>

        <fetcher.Form method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" style={{ color: "var(--text-secondary)" }} className="text-sm font-medium">
              Display name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="self-start rounded-xl px-6 py-2.5 text-sm font-medium transition-all"
            style={{
              background: `rgb(var(--accent))`,
              color: "white",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </fetcher.Form>

        <div className="mt-12">
          <h2 className="mb-4 text-lg font-medium">Appearance</h2>
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-medium">Editor Font</h2>
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            <FontPicker />
          </div>
        </div>
      </section>
    </main>
  );
}

const fonts = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "System", value: "system-ui, sans-serif" },
  { name: "Serif", value: "'Georgia', 'Times New Roman', serif" },
  { name: "Mono", value: "'JetBrains Mono', 'Fira Code', monospace" },
];

function FontPicker() {
  const [current, setCurrent] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editor-font") || "'Inter', sans-serif";
    }
    return "'Inter', sans-serif";
  });

  function select(value: string) {
    setCurrent(value);
    localStorage.setItem("editor-font", value);
    document.documentElement.style.setProperty("--font-editor", value);
  }

  return (
    <div className="flex flex-col gap-2">
      {fonts.map((f) => (
        <button
          key={f.name}
          type="button"
          onClick={() => select(f.value)}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors"
          style={{
            background: current === f.value ? 'var(--surface-3)' : 'transparent',
            color: current === f.value ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: f.value,
          }}
        >
          <span>{f.name}</span>
          <span style={{ color: 'var(--text-quaternary)', fontSize: 12 }}>
            The quick brown fox
          </span>
        </button>
      ))}
    </div>
  );
}
