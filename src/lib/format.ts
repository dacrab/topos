/**
 * Format currency with € symbol and abbreviations for large values
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}k`;
  return `€${value.toLocaleString()}`;
}

/**
 * Format price with € symbol (no abbreviation)
 */
export function formatPrice(value: number): string {
  return `€${value.toLocaleString()}`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate ID for display (first 8 chars)
 */
export function truncateId(id: string): string {
  return `${id.slice(0, 8)}...`;
}
