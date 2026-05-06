import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-400",
    secondary: "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
    ghost: "text-zinc-300 hover:bg-zinc-900",
    danger: "border border-red-900 bg-red-950 text-red-100 hover:bg-red-900",
  };

  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
