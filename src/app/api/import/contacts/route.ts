import { NextResponse } from "next/server";
import { contact } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

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

function buildRows(
  headers: string[],
  lines: string[],
  tenantId: string,
): { rows: (typeof contact.$inferInsert)[]; errors: string[] } {
  const errors: string[] = [];
  const rows: (typeof contact.$inferInsert)[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    if (!row.firstname) {
      errors.push(`Row ${i}: missing firstName`);
      continue;
    }

    const email = row.email;
    if (email && !EMAIL_RE.test(email)) {
      errors.push(`Row ${i}: invalid email`);
      continue;
    }

    rows.push({
      firstName: row.firstname,
      lastName: row.lastname || null,
      email: email || null,
      phone: row.phone || null,
      type: row.type || "LEAD",
      source: row.source || "csv_import",
      tenantId,
    });
  }

  return { rows, errors };
}

export async function POST(request: Request) {
  const { tenantId } = await requireDashboardAuth();
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
  const { rows, errors } = buildRows(headers, lines, tenantId);

  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, errors }, { status: 400 });
  }

  await db.insert(contact).values(rows);

  return NextResponse.json({ imported: rows.length, errors });
}
