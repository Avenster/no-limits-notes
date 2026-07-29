import { useState } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, Link, redirect } from "react-router";
import { getUser, getBackendUrl } from "~/lib/auth.server";
import { ThemeChooser, AccentPicker } from "~/components/ThemeToggle";
import { Check, ChevronLeft, User, Type, Palette } from "lucide-react";

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

// ✅ Using native CSS variables for perfect light/dark theme support
const glassCardStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-card)',
};

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [name, setName] = useState(user.name);

  const isSaving = fetcher.state === "submitting";
  const saved = fetcher.data?.ok;

  return (
    // ✅ h-screen prevents main page scroll
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} className="h-screen flex flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-[-15%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-30 blur-[140px]"
        style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.15), transparent)" }}
      />

      <header style={{ borderBottom: "1px solid var(--border)" }} className="shrink-0 backdrop-blur-xl bg-[var(--bg-primary)]/60 z-10">
        <div className="mx-auto max-w-5xl flex items-center px-8 py-4">
          <Link to="/home" className="flex items-center gap-2.5 text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-tertiary)" }}>
            <ChevronLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      {/* ✅ Grid layout using side space efficiently and aligning columns */}
      <section className="flex-1 min-h-0 p-8">
        <div className="mx-auto max-w-5xl h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column (Account + Appearance) */}
          {/* ✅ h-full ensures it stretches to match the right column */}
          <div className="flex flex-col gap-6 min-h-0 h-full">
            
            {/* Account Card */}
            <div className="shrink-0 p-6 flex flex-col" style={glassCardStyle}>
              <div className="flex items-center gap-2.5 mb-6">
                <User size={18} style={{ color: 'var(--text-tertiary)' }} />
                <h2 className="text-lg font-medium">Account</h2>
              </div>

              <div className="flex items-center gap-4 mb-8">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full border" style={{ borderColor: 'var(--border)' }} />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold border"
                    style={{ background: "var(--surface-3)", color: "var(--text-secondary)", borderColor: 'var(--border)' }}
                  >
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-base font-medium">{user.email || "No email provided"}</p>
                  <p className="text-sm capitalize" style={{ color: "var(--text-tertiary)" }}>
                    Signed in via {user.provider}
                  </p>
                </div>
              </div>

              <fetcher.Form method="post" className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" style={{ color: "var(--text-tertiary)" }} className="text-xs font-medium uppercase tracking-wider">
                    Display name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
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
                  className="self-start flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: `rgb(var(--accent))`,
                    color: "white",
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
                </button>
              </fetcher.Form>
            </div>

            {/* Appearance Card */}
            {/* ✅ flex-1 makes it fill remaining vertical space to match the right side */}
            <div className="p-6 flex-1 flex flex-col" style={glassCardStyle}>
              <div className="flex items-center gap-2.5 mb-6">
                <Palette size={18} style={{ color: 'var(--text-tertiary)' }} />
                <h2 className="text-lg font-medium">Appearance</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Mode
                </p>
                <ThemeChooser />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Accent Color
                </p>
                <AccentPicker />
              </div>
            </div>

          </div>

          {/* Right Column (Font Picker - Matches height of left column) */}
          {/* ✅ h-full and flex-1 makes it stretch to exact same height as left column */}
          <div className="p-6 flex flex-col min-h-0 h-full" style={glassCardStyle}>
            <div className="flex items-center gap-2.5 mb-4 shrink-0">
              <Type size={18} style={{ color: 'var(--text-tertiary)' }} />
              <h2 className="text-lg font-medium">Editor Font</h2>
            </div>
            <p className="text-sm mb-4 shrink-0" style={{ color: "var(--text-tertiary)" }}>
              Choose the typography for your notes. Changes apply instantly.
            </p>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
              <FontPicker />
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

const fonts = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "System UI", value: "system-ui, sans-serif" },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Georgia", value: "'Georgia', 'Times New Roman', serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Poppins", value: "'Poppins', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Lora", value: "'Lora', serif" },
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
    <div className="flex flex-col gap-1">
      {fonts.map((f) => (
        <button
          key={f.name}
          type="button"
          onClick={() => select(f.value)}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors w-full text-left"
          style={{
            background: current === f.value ? 'var(--surface-3)' : 'transparent',
            color: current === f.value ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-medium" style={{ fontFamily: f.value }}>{f.name}</span>
            <span style={{ color: 'var(--text-quaternary)', fontSize: 12, fontFamily: f.value }}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
          {current === f.value && (
            <Check size={16} style={{ color: 'rgb(var(--accent))' }} />
          )}
        </button>
      ))}
    </div>
  );
}