import { useEffect, useRef, useState } from "react";

/**
 * Animate a number from 0 → `end` when the returned ref enters the viewport.
 *
 * Uses requestAnimationFrame with an ease-out curve, runs once, and snaps to
 * the final value instantly when the user prefers reduced motion.
 *
 * Usage:
 *   const { ref, value } = useCountUp(12500, { duration: 1200, decimals: 0 });
 *   <span ref={ref}>{value}</span>
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  end: number,
  { duration = 1200, decimals = 0 }: { duration?: number; decimals?: number } = {}
) {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion → show final value immediately.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(end);
      started.current = true;
      return;
    }

    const startAnimation = () => {
      if (started.current) return;
      started.current = true;

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(end * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else setValue(end);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return { ref, value: formatted };
}
