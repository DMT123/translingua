"use client";

import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
  unit: string;
  formatValue?: (n: number) => string;
}

export function UsageMeter({ label, current, limit, unit, formatValue }: UsageMeterProps) {
  const percent = limit === Infinity ? 0 : Math.min((current / limit) * 100, 100);
  const fmt = formatValue ?? ((n: number) => n.toLocaleString());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300 font-medium">{label}</span>
        <span className="text-xs text-zinc-500">
          {fmt(current)} / {limit === Infinity ? "∞" : fmt(limit)} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percent < 80 ? "bg-blue-500" : percent < 95 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
