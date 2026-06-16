import { CURRENCY } from "./config";

export function formatCurrency(value: number, abbreviated = false): string {
  const s = CURRENCY.symbol;
  if (abbreviated && value >= 1_000_000) return `${s}${(value / 1_000_000).toFixed(1)}M`;
  if (abbreviated && value >= 1_000) return `${s}${(value / 1_000).toFixed(0)}k`;
  return `${s}${value.toLocaleString()}`;
}

export function formatDate(date: Date | string, locale?: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale);
}

export function formatTime(date: Date | string, locale?: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}
