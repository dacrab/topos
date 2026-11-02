function fileExtension(url: string): string {
  try {
    const path = new URL(url, "https://example.com").pathname;
    const dot = path.lastIndexOf(".");
    return dot === -1 ? "" : path.slice(dot + 1).toLowerCase();
  } catch {
    return "";
  }
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"];
const SPREADSHEET_EXTENSIONS = ["csv", "xls", "xlsx"];
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz"];

export type FileKind = "image" | "pdf" | "spreadsheet" | "archive" | "document" | "other";

export function fileKind(url: string): FileKind {
  const ext = fileExtension(url);
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (SPREADSHEET_EXTENSIONS.includes(ext)) return "spreadsheet";
  if (ARCHIVE_EXTENSIONS.includes(ext)) return "archive";
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) return "document";
  return "other";
}

export function formatFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
