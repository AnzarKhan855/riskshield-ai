import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "slate";
  dot?: boolean;
}

function Badge({
  className,
  variant = "default",
  dot,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-copper-500/10 text-copper-400 border-copper-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    slate: "bg-graphite-800 text-graphite-300 border-graphite-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse mr-1",
            variant === "danger"
              ? "bg-rose-400"
              : variant === "warning"
              ? "bg-amber-400"
              : variant === "success"
              ? "bg-emerald-400"
              : "bg-copper-400"
          )}
        />
      )}
      <span>{children}</span>
    </div>
  );
}

export { Badge };
