import { cn } from "@/lib/utils";

export type DashboardWidgetSize = "full" | "wide" | "side" | "half" | "third";

const sizeClass = {
  full: "col-span-12",
  wide: "col-span-12 xl:col-span-8",
  side: "col-span-12 md:col-span-6 xl:col-span-4",
  half: "col-span-12 lg:col-span-6",
  third: "col-span-12 md:col-span-6 xl:col-span-4",
} as const satisfies Record<DashboardWidgetSize, string>;

export function DashboardWidget({
  title,
  eyebrow,
  meta,
  icon,
  action,
  size,
  children,
  className,
  framed = true,
}: {
  title: string;
  eyebrow?: string;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size: DashboardWidgetSize;
  children: React.ReactNode;
  className?: string;
  framed?: boolean;
}) {
  return (
    <section
      className={cn(
        "grid min-w-0 content-start gap-4",
        sizeClass[size],
        framed && "rounded-lg border border-zinc-800 bg-zinc-950/70 p-4",
        className,
      )}
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <div className="font-mono text-[11px] uppercase text-zinc-600">{eyebrow}</div>}
          <div className="mt-1 flex min-w-0 items-center gap-2">
            {icon}
            <h2 className="truncate text-sm font-semibold text-zinc-100">{title}</h2>
          </div>
          {meta && <div className="mt-1 text-xs text-zinc-500">{meta}</div>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
