type Tone = "success" | "info" | "warning" | "neutral" | "danger";

const toneClasses: Record<Tone, string> = {
  success: "bg-brand-50 text-brand-700",
  info: "bg-gov-blue/10 text-gov-blue",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-gov-navy/8 text-gov-navy/60",
  danger: "bg-gov-red/10 text-gov-red",
};

export default function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
