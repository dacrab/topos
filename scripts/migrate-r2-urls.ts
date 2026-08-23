/**
 * One-time idempotent migration: rewrites stored R2 URLs that are expired
 * 1-hour presigned GETs into stable `${R2_PUBLIC_URL}/${key}` public URLs.
 *
 * Usage:
 *   bun run db:migrate-r2          # dry run, prints what would change
 *   bun run db:migrate-r2 -- --apply
 *
 * Env: DATABASE_URL (required), R2_PUBLIC_URL (required), R2_BUCKET_NAME (optional,
 * helps strip path-style bucket prefixes).
 */
// biome-ignore-all lint/suspicious/noConsole: standalone CLI script reports via stdout
import { eq, sql } from "drizzle-orm";
import { document, listing, teamMember, tenant, user } from "../src/db/schema";
import { db } from "../src/lib/db";

const APPLY = process.argv.includes("--apply");
const PRESIGN_MARKER = "X-Amz-Signature";

const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
if (!publicBase) {
  console.error("R2_PUBLIC_URL is not set");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

type UrlLike = string | null | undefined;

function isPresigned(url: UrlLike): boolean {
  if (!url) return false;
  try {
    return new URL(url).searchParams.has(PRESIGN_MARKER);
  } catch {
    return false;
  }
}

// Strips the optional path-style bucket segment, then maps the object key onto the public base.
function canonicalize(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!parsed.searchParams.has(PRESIGN_MARKER)) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const bucket = process.env.R2_BUCKET_NAME;
  if (bucket && segments[0] === bucket) segments.shift();
  if (segments.length === 0) return null;

  return `${publicBase}/${segments.map((s) => decodeURIComponent(s)).join("/")}`;
}

async function migrateSingleValues(): Promise<number> {
  let changed = 0;
  for (const [table, column] of [
    [tenant, tenant.logoUrl],
    [user, user.image],
    [teamMember, teamMember.image],
  ] as const) {
    const rows = await db.select({ id: table.id, value: column }).from(table);
    for (const row of rows) {
      if (!isPresigned(row.value)) continue;
      const next = canonicalize(row.value as string);
      if (!next) continue;
      console.log(
        `[${APPLY ? "apply" : "dry"}] ${column.name}: ${row.id}\n  ${row.value}\n  -> ${next}`,
      );
      changed++;
      if (!APPLY) continue;
      await db
        .update(table)
        .set({ [column.name]: next } as never)
        .where(eq(table.id, row.id));
    }
  }
  return changed;
}

async function migrateDocuments(): Promise<number> {
  const rows = await db
    .select({ id: document.id, url: document.url })
    .from(document)
    .where(sql`${document.url} LIKE ${`%${PRESIGN_MARKER}%`}`);

  let changed = 0;
  for (const row of rows) {
    const next = canonicalize(row.url);
    if (!next) continue;
    console.log(`[${APPLY ? "apply" : "dry"}] document: ${row.id}\n  ${row.url}\n  -> ${next}`);
    changed++;
    if (!APPLY) continue;
    await db.update(document).set({ url: next }).where(eq(document.id, row.id));
  }
  return changed;
}

async function migrateListingImages(): Promise<number> {
  const rows = await db
    .select({ id: listing.id, images: listing.images })
    .from(listing)
    .where(sql`array_to_string(${listing.images}, ',') LIKE ${`%${PRESIGN_MARKER}%`}`);

  let changed = 0;
  for (const row of rows) {
    const images = row.images ?? [];
    if (!images.some((img) => isPresigned(img))) continue;

    let replaced = 0;
    const nextImages = images.map((img) => {
      const next = canonicalize(img);
      if (next) replaced++;
      return next ?? img;
    });

    console.log(`[${APPLY ? "apply" : "dry"}] listing: ${row.id} (${replaced} image(s))`);
    changed += replaced;
    if (!APPLY || replaced === 0) continue;
    await db.update(listing).set({ images: nextImages }).where(eq(listing.id, row.id));
  }
  return changed;
}

async function main() {
  console.log(`R2 URL migration — mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
  const [singles, docs, images] = await Promise.all([
    migrateSingleValues(),
    migrateDocuments(),
    migrateListingImages(),
  ]);

  console.log("\nSummary:");
  console.log(`  logoUrl/image fields : ${singles}`);
  console.log(`  document.url         : ${docs}`);
  console.log(`  listing.images       : ${images}`);
  console.log(`  TOTAL                : ${singles + docs + images}`);
  if (!APPLY && singles + docs + images > 0) {
    console.log("\nDry run only — re-run with --apply to write changes.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
