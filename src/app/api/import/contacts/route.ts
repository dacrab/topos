import { NextResponse } from "next/server";
import { z } from "zod";
import { contact } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { CONTACT_TYPES } from "@/lib/config";
import { db } from "@/lib/db";

const MAX_IMPORT_ROWS = 1000;
const INSERT_CHUNK_SIZE = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((v) => v.trim());
}

const contactRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z
    .string()
    .refine((v) => !v || EMAIL_RE.test(v), "Invalid email")
    .optional(),
  phone: z.string().optional(),
  type: z.enum(CONTACT_TYPES).default("LEAD"),
  source: z.string().optional(),
});

function rowFromCsv(
  raw: Record<string, string>,
  tenantId: string,
): typeof contact.$inferInsert | string {
  if (!(raw.firstname || raw.first_name)) return "missing firstName";
  const parsed = contactRowSchema.safeParse({
    firstName: raw.firstname || raw.first_name,
    lastName: raw.lastname || undefined,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    type: raw.type || "LEAD",
    source: raw.source || "csv_import",
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "invalid data";
  return { ...parsed.data, tenantId };
}

function buildRows(
  headers: string[],
  lines: string[],
  tenantId: string,
): { rows: (typeof contact.$inferInsert)[]; errors: string[]; truncated: boolean } {
  const errors: string[] = [];
  const rows: (typeof contact.$inferInsert)[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (rows.length >= MAX_IMPORT_ROWS) return { rows, errors, truncated: true };
    const line = lines[i];
    if (!line) continue;
    const values = parseCsvLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = values[idx] ?? "";
    });

    const rowOrError = rowFromCsv(raw, tenantId);
    if (typeof rowOrError === "string") {
      errors.push(`Row ${i}: ${rowOrError}`);
      continue;
    }
    rows.push(rowOrError);
  }

  return { rows, errors, truncated: false };
}

export async function POST(request: Request) {
  const { tenantId } = await requireTenant();
  const formData = await request.formData();
  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File ? fileEntry : null;

  if (!file)
    return NextResponse.json({ imported: 0, errors: ["No file provided"] }, { status: 400 });

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2)
    return NextResponse.json(
      { imported: 0, errors: ["File is empty or has no data rows"] },
      { status: 400 },
    );

  const headerLine = lines[0];
  if (!headerLine)
    return NextResponse.json({ imported: 0, errors: ["No headers found"] }, { status: 400 });

  const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase());
  const { rows, errors, truncated } = buildRows(headers, lines, tenantId);

  if (truncated) errors.push(`Import capped at ${MAX_IMPORT_ROWS} rows per file`);
  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, errors }, { status: 400 });
  }

  for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
    await db.insert(contact).values(rows.slice(i, i + INSERT_CHUNK_SIZE));
  }

  return NextResponse.json({ imported: rows.length, errors });
}
