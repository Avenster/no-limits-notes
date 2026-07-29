import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

type PageBackButtonProps = {
  className?: string;
};

export function PageBackButton({ className = "" }: PageBackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`group inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium backdrop-blur-xl transition-all duration-200 hover:-translate-y-px active:scale-[0.98] ${className}`}
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--surface-1) 76%, transparent)",
        color: "var(--text-tertiary)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035), 0 12px 32px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "color-mix(in srgb, var(--surface-1) 76%, transparent)";
        e.currentTarget.style.color = "var(--text-tertiary)";
      }}
    >
      <ArrowLeft size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>Back</span>
    </button>
  );
}

export default PageBackButton;
