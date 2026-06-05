"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DocumentPreview({
  url,
  type,
  children,
}: {
  url: string;
  type: string;
  children: React.ReactNode;
}) {
  const isImage = type.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg)$/i.test(url);
  const isPdf = type === "application/pdf" || url.endsWith(".pdf");

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
