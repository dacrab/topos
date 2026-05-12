import { NextResponse } from "next/server";
import { contact } from "@/db/schema";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function POST(request: Request) {
  const { tenantId } = await requireDashboardAuth();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ imported: 0, errors: ["No file provided"] }, { status: 400 });

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2)
    return NextResponse.json({ imported: 0, errors: ["File is empty or has no data rows"] });

  const headerLine = lines[0];
  if (!headerLine) return NextResponse.json({ imported: 0, errors: ["No headers found"] });
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
  const errors: string[] = [];
  const rows: (typeof contact.$inferInsert)[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    if (!row.firstname) {
      errors.push(`Row ${i}: missing firstName`);
      continue;
    }

    rows.push({
      firstName: row.firstname,
      lastName: row.lastname || null,
      email: row.email || null,
      phone: row.phone || null,
      type: row.type || "LEAD",
      source: row.source || "csv_import",
      tenantId,
    });
  }

  if (rows.length > 0) {
    await db.insert(contact).values(rows);
  }

  return NextResponse.json({ imported: rows.length, errors });
}
