import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1.5 text-sm text-zinc-300">
      <span>{label}</span>
      <Input
        className={cn(
          className,
        )}
        {...props}
      />
    </label>
  );
}
