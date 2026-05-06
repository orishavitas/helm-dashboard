import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1.5 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        className={cn(
          "h-9 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-zinc-100 placeholder:text-zinc-600",
          className,
        )}
        {...props}
      />
    </label>
  );
}
