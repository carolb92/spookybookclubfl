import { cn } from "@/lib/utils";

export function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-(--spooky-card) border border-(--spooky-border)",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-8 opacity-20"
        aria-hidden="true"
      >
        <path
          d="M4 4h16v16H4V4zm4 4h8M8 12h8M8 16h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
