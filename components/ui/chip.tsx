import { cn } from "@/lib/utils";

const styles = {
  green: "border-emerald-900/70 bg-emerald-950/50 text-emerald-200",
  amber: "border-amber-900/70 bg-amber-950/50 text-amber-200",
  red: "border-red-900/70 bg-red-950/50 text-red-200",
  zinc: "border-zinc-800 bg-zinc-950 text-zinc-300",
  indigo: "border-indigo-900/70 bg-indigo-950/50 text-indigo-200",
  blue: "border-blue-900/70 bg-blue-950/50 text-blue-200",
} as const;

export function Chip({
  children,
  tone = "zinc",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
