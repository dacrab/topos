export const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
export const CSS_LENGTH = /^\d*\.?\d+(?:rem|em|px|%)?$/;

export function isValidColor(v: unknown): v is string {
  return typeof v === "string" && HEX_COLOR.test(v.trim());
}

export function isValidLength(v: unknown): v is string {
  return typeof v === "string" && CSS_LENGTH.test(v.trim());
}
