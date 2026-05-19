import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900 p-4",
        interactive && "transition hover:border-zinc-700 hover:bg-zinc-900/80",
        className,
      )}
      {...props}
    />
  );
}
