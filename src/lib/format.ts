export function formatCurrency(value: number, abbreviated = false): string {
  if (abbreviated && value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (abbreviated && value >= 1_000) return `€${(value / 1_000).toFixed(0)}k`;
  return `€${value.toLocaleString()}`;
}

export const formatPrice = formatCurrency;

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function truncateId(id: string): string {
  return `${id.slice(0, 8)}...`;
}
