"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function fileExtension(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  } catch {
    return "";
  }
}

export function DocumentPreview({ url, children }: { url: string; children: React.ReactNode }) {
  const ext = fileExtension(url);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <Dialog>
      <DialogTrigger className="hover:underline text-left">{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">Document Preview</DialogTitle>
        {isImage ? (
          <Image
            src={url}
            alt="Document preview"
            width={800}
            height={600}
            className="max-h-[70vh] w-auto rounded object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={url}
            loading="lazy"
            className="h-[70vh] w-full rounded border"
            title="PDF Preview"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">Preview not available for this file type.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Download file
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
