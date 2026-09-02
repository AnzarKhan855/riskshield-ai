import * as React from "react";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-graphite-900 border border-graphite-800 rounded-xl p-12 text-center space-y-4 shadow-sm",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-graphite-950 border border-graphite-800 text-copper-400 flex items-center justify-center mx-auto">
        {icon || <Layers className="w-6 h-6 text-copper-400" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        {description && (
          <p className="text-xs text-graphite-400 max-w-sm mx-auto font-sans">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
