// Server-side helper for talking to the separate Node/Express backend.
// Set BACKEND_URL in your frontend's .env (e.g. http://localhost:4000).
//
// IMPORTANT: everything in this file is server-only. Never import
// `getBackendUrl` (or anything else from here) and call it from a route's
// component body — only from `loader`/`action`. If a component needs the
// backend URL, return it as data from the loader instead:
//
//   export async function loader() {
//     return { backendUrl: getBackendUrl() };
//   }
//   export default function Page() {
//     const { backendUrl } = useLoaderData<typeof loader>();
//   }
//
// Calling a `.server.ts` export directly from component render code is what
// causes Vite's "Server-only module referenced by client" error — React
// Router can only strip server code out of `loader`/`action`/`middleware`/
// `headers` exports, not out of the default component export.

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export type SessionUser = {
  id: string;
  provider: "google" | "github";
  providerId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};

/**
 * Forwards the incoming request's cookies to the backend's /auth/me
 * endpoint to find out if the visitor is logged in. Returns null if not
 * logged in, and also null (rather than throwing) if the backend is
 * unreachable, so a down backend fails safe into "logged out" instead of
 * crashing every page.
 */
export async function getUser(request: Request): Promise<SessionUser | null> {
  const cookie = request.headers.get("Cookie");

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: cookie ? { Cookie: cookie } : undefined,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { user: SessionUser | null };
    return data.user;
  } catch (err) {
    console.error("getUser: backend unreachable", err);
    return null;
  }
}

export function getBackendUrl() {
  return BACKEND_URL;
}