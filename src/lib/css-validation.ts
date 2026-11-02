export const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
export const CSS_LENGTH = /^\d*\.?\d+(?:rem|em|px|%)?$/;

export function isValidColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

export function isValidLength(value: unknown): value is string {
  return typeof value === "string" && CSS_LENGTH.test(value.trim());
}

function hexToRgb(hex: string): [number, number, number] | null {
  let value = hex.replace("#", "");
  if (value.length === 3 || value.length === 4) {
    value = value
      .slice(0, 3)
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (value.length === 8) {
    value = value.slice(0, 6);
  }
  if (value.length !== 6) return null;

  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  const [r, g, b] = channels;
  if (r === undefined || g === undefined || b === undefined) return null;
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two hex colors, or null if either is invalid. */
export function contrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!(fg && bg)) return null;

  const fgLuminance = relativeLuminance(fg);
  const bgLuminance = relativeLuminance(bg);
  const [lighter, darker] =
    fgLuminance > bgLuminance ? [fgLuminance, bgLuminance] : [bgLuminance, fgLuminance];
  return (lighter + 0.05) / (darker + 0.05);
}

/** Picks the foreground that reads best on a tenant-supplied brand color. */
export function readableForeground(background: string): string {
  const ratioWithWhite = contrastRatio("#ffffff", background);
  const ratioWithInk = contrastRatio("#101211", background);
  if (!(ratioWithWhite && ratioWithInk)) return "#ffffff";
  return ratioWithWhite >= ratioWithInk ? "#ffffff" : "#101211";
}
