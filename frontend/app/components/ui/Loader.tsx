export function Loader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

export function ProgressBar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div className="h-1.5 w-full animate-[progress_1s_ease-in-out_infinite] bg-[rgb(var(--accent))]" />
    </div>
  );
}
