"use client";

import { cn } from "@/lib/utils";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <div className={cn("group/tooltip relative", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

export { Tooltip };
