import type { CSSProperties } from "react";

type GlassTint = "default" | "danger";

export function glassPanelStyle(tint: GlassTint = "default"): CSSProperties {
  const borderColor =
    tint === "danger"
      ? "color-mix(in srgb, #ef4444 35%, var(--border))"
      : "var(--border)";

  return {
    background: "color-mix(in srgb, var(--bg-secondary) 68%, transparent)",
    backdropFilter: "blur(32px) saturate(200%) brightness(1.04)",
    WebkitBackdropFilter: "blur(32px) saturate(200%) brightness(1.04)",
    border: `1px solid color-mix(in srgb, ${borderColor} 85%, transparent)`,
    boxShadow: [
      "var(--shadow-modal)",
      "inset 0 1px 0 rgba(255,255,255,0.35)",
      "inset 0 0 0 1px color-mix(in srgb, var(--text-primary) 4%, transparent)",
    ].join(", "),
  };
}

export const glassInputStyle: CSSProperties = {
  background: "color-mix(in srgb, var(--surface-2) 55%, transparent)",
  border: "1px solid color-mix(in srgb, var(--border) 80%, transparent)",
  color: "var(--text-primary)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

export const glassOverlayStyle: CSSProperties = {
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(10px) saturate(150%)",
  WebkitBackdropFilter: "blur(10px) saturate(150%)",
};