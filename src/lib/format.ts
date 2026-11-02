import { CURRENCY } from "./config";

const DEFAULT_LOCALE = "en-US";

/**
 * Formats an amount in the app currency. Non-abbreviated values use the full
 * currency style so symbol placement, grouping, and decimal separators follow
 * the locale. Abbreviated values keep the compact `€2.5M` / `€1k` treatment.
 */
export function formatCurrency(
  value: number,
  abbreviated = false,
  locale: string = DEFAULT_LOCALE,
): string {
  const number = (v: number, options: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(v);

  if (abbreviated && value >= 1_000_000) {
    return `${CURRENCY.symbol}${number(value / 1_000_000, { maximumFractionDigits: 1 })}M`;
  }
  if (abbreviated && value >= 1_000) {
    return `${CURRENCY.symbol}${number(value / 1_000, { maximumFractionDigits: 0 })}k`;
  }

  return number(value, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function toDate(date: Date | string): Date | null {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(date: Date | string, locale?: string): string {
  const d = toDate(date);
  return d ? d.toLocaleDateString(locale) : "—";
}

export function formatTime(date: Date | string, locale?: string): string {
  const d = toDate(date);
  return d ? d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "—";
}

export function formatDateTime(date: Date | string, locale?: string): string {
  const d = toDate(date);
  return d ? d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) : "—";
}
