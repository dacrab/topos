import { parse } from "csv-parse/sync";

export type CsvRecord = Record<string, string | undefined>;

/**
 * Parses a contact CSV into records keyed by normalized headers.
 *
 * `csv-parse` handles BOMs, quoted separators, escaped quotes, and newlines
 * inside quoted fields — cases a line-by-line parser cannot represent.
 */
export function parseContactsCsv(text: string): CsvRecord[] {
  return parse(text, {
    bom: true,
    columns: (header: string[]) =>
      header.map((name) =>
        name
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_"),
      ),
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as CsvRecord[];
}
