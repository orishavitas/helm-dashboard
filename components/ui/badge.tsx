import { cn } from "@/lib/utils";

const styles = {
  green: "border-emerald-800 bg-emerald-950 text-emerald-200",
  amber: "border-amber-800 bg-amber-950 text-amber-200",
  red: "border-red-800 bg-red-950 text-red-200",
  zinc: "border-zinc-700 bg-zinc-900 text-zinc-300",
  indigo: "border-indigo-800 bg-indigo-950 text-indigo-200",
};

export function Badge({
  children,
  tone = "zinc",
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", styles[tone])}>
      {children}
    </span>
  );
}
