import { Link } from "react-router";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional primary action rendered as a link. */
  actionTo?: string;
  actionLabel?: string;
};

/** Reusable empty-state block with an optional CTA. */
export function EmptyState({
  icon,
  title,
  description,
  actionTo,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-fg">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      )}
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="mt-5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
