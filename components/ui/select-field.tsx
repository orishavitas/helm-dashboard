import { cn } from "@/lib/utils";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function SelectField({ label, className, children, ...props }: Props) {
  return (
    <label className="grid gap-1.5 text-sm text-zinc-300">
      <span>{label}</span>
      <select
        className={cn("h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100", className)}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
