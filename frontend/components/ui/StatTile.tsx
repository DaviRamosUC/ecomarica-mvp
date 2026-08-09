import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

export default function StatTile({ label, value, icon: Icon }: StatTileProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-brand-500" />}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gov-navy">{value}</p>
    </div>
  );
}
