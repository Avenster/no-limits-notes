import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type AccentChoice =
  | "violet"
  | "blue"
  | "emerald"
  | "rose"
  | "amber"
  | "cyan";

export const ACCENTS: AccentChoice[] = [
  "violet",
  "blue",
  "emerald",
  "rose",
  "amber",
  "cyan",
];

const THEME_KEY = "theme";
const ACCENT_KEY = "accent";

type ThemeContextValue = {
  /** The user's selection: light | dark | system. */
  theme: ThemeChoice;
  /** The effective theme after resolving "system". */
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeChoice) => void;
  cycleTheme: () => void;
  accent: AccentChoice;
  setAccent: (a: AccentChoice) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "dark";
}

function readStoredAccent(): AccentChoice {
  if (typeof window === "undefined") return "violet";
  const v = window.localStorage.getItem(ACCENT_KEY);
  return (ACCENTS as string[]).includes(v || "") ? (v as AccentChoice) : "violet";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(readStoredTheme);
  const [accent, setAccentState] = useState<AccentChoice>(readStoredAccent);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  // Track OS preference changes (only matters when theme === "system").
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  // Reflect theme + accent onto <html> and persist.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", accent);
  }, [accent]);

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore quota / privacy mode */
    }
  }, []);

  const setAccent = useCallback((a: AccentChoice) => {
    setAccentState(a);
    try {
      window.localStorage.setItem(ACCENT_KEY, a);
    } catch {
      /* ignore */
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next =
        prev === "dark" ? "light" : prev === "light" ? "system" : "dark";
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      cycleTheme,
      accent,
      setAccent,
    }),
    [theme, resolvedTheme, setTheme, cycleTheme, accent, setAccent],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
