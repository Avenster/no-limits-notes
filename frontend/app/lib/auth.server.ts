const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export type SessionUser = {
  id: string;
  provider: "google" | "github";
  providerId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
};
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