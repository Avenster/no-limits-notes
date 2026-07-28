import { useEffect, useState } from "react";

/**
 * Returns true after the component has mounted on the client.
 * Used to gate client-only / non-SSR-safe content (e.g. BlockNote).
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
