import { PRODUCT_STAGES, type ProductProgress } from "@/lib/product-progress";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/chip";

export function ProductProgressSummary({ progress }: { progress: ProductProgress }) {
  return (
    <div className="grid gap-3 border-t border-zinc-800 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="blue">{progress.stage}</Chip>
          <Chip tone="indigo">{progress.maturity}</Chip>
        </div>
        <span className="font-mono text-xs text-zinc-500">{progress.percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-950">
        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${progress.percent}%` }} />
      </div>
      <ol className="grid grid-cols-7 gap-1" aria-label="Product stage ladder">
        {PRODUCT_STAGES.map((stage) => (
          <li
            key={stage}
            className={cn(
              "h-1.5 rounded-full bg-zinc-800",
              PRODUCT_STAGES.indexOf(stage) <= PRODUCT_STAGES.indexOf(progress.stage) && "bg-indigo-400",
            )}
            title={stage}
          />
        ))}
      </ol>
      <div className="grid gap-1.5">
        {progress.signals.map((signal) => (
          <div key={signal.label} className="flex min-w-0 items-center justify-between gap-3 text-xs">
            <span className="text-zinc-600">{signal.label}</span>
            <span className="flex min-w-0 items-center gap-2 text-right text-zinc-400">
              <span className="truncate">{signal.value}</span>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  signal.status === "known" && "bg-emerald-400",
                  signal.status === "attention" && "bg-amber-400",
                  signal.status === "missing" && "bg-zinc-600",
                )}
              />
            </span>
          </div>
        ))}
      </div>
      {progress.blockers.length > 0 && (
        <p className="line-clamp-2 text-xs text-amber-200">{progress.blockers.slice(0, 2).join(" / ")}</p>
      )}
    </div>
  );
}
export function ProductProgressBlockers({ progress }: { progress: ProductProgress }) {
  if (progress.blockers.length === 0) {
    return <p className="text-sm text-zinc-500">No missing progress signals.</p>;
  }

  return (
    <ul className="grid gap-2 text-xs text-zinc-400">
      {progress.blockers.map((blocker) => (
        <li key={blocker} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
          {blocker}
        </li>
      ))}
    </ul>
  );
}
