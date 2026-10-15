import { cn } from "@/lib/utils";

/*
 * The Tokenly mark: five bars on a rounded tile, drawn on the brand's 720-unit grid.
 * Same concept as the original lime-on-forest mark, recoloured white-on-black.
 * Kept as inline SVG so it stays sharp at every size and picks up the brand tokens.
 */
const bars = [
  { x: 160, y: 190, h: 340 },
  { x: 247, y: 241, h: 183 },
  { x: 335, y: 347, h: 183 },
  { x: 422, y: 280, h: 182 },
  { x: 510, y: 190, h: 340 },
];

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 720 720"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
    >
      {title && <title>{title}</title>}
      <rect width="720" height="720" rx="56" fill="var(--tokenly-forest)" />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width="50"
          height={bar.h}
          fill="var(--tokenly-accent)"
        />
      ))}
    </svg>
  );
}

/** Mark + wordmark. The wordmark hides itself when the sidebar collapses to icons. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-7 rounded-[7px] dark:ring-1 dark:ring-brand-lime/25" />
      <span className="truncate text-[17px] font-semibold tracking-[-0.02em] group-data-[collapsible=icon]:hidden">
        tokenly
      </span>
    </span>
  );
}
