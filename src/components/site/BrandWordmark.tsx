import { cn } from "@/lib/utils";

/** up2linkd wordmark. The lime "2" = two channels, one forward motion. */
export function BrandWordmark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-bold leading-none tracking-[-0.06em]",
        tone === "light" ? "text-snow" : "text-obsidian",
        className,
      )}
      aria-label="up2linkd"
    >
      <span aria-hidden>up</span>
      <span aria-hidden className="relative mx-[0.02em] inline-block -skew-x-12 text-lime">
        2
      </span>
      <span aria-hidden>linkd</span>
    </span>
  );
}

/** Compact square mark for small sizes. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-8 place-items-center rounded-sm bg-lime font-display text-lg font-bold text-obsidian",
        className,
      )}
    >
      <span className="-skew-x-12">2</span>
    </span>
  );
}
