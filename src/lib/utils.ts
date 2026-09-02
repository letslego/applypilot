import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSalary(min?: number | null, max?: number | null, currency = "USD") {
  if (!min && !max) return "Competitive";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: n >= 1000 ? "compact" : "standard",
    }).format(n);
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function statusColor(status: string) {
  switch (status) {
    case "saved":
      return "bg-stone-200 text-stone-800";
    case "queued":
      return "bg-amber-100 text-amber-900";
    case "applied":
      return "bg-teal-100 text-teal-900";
    case "interview":
      return "bg-sky-100 text-sky-900";
    case "offer":
      return "bg-emerald-100 text-emerald-900";
    case "rejected":
      return "bg-rose-100 text-rose-900";
    default:
      return "bg-stone-100 text-stone-700";
  }
}
