"use client";

import { Download, FileText } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fileKind } from "@/lib/files";

export function DocumentPreview({ url, children }: { url: string; children: React.ReactNode }) {
  const t = useTranslations("Documents");
  const kind = fileKind(url);
  const isImage = kind === "image";
  const isPdf = kind === "pdf";

  return (
    <Dialog>
      <DialogTrigger className="text-left font-medium text-foreground transition-colors hover:text-accent hover:underline">
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-4 border-b-2 border-foreground/85 pb-3 pr-8">
          <DialogTitle className="truncate font-display text-xl tracking-[-0.01em]">
            {children}
          </DialogTitle>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-sm shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            {t("downloadFile")}
          </a>
        </div>
        {isImage ? (
          <Image
            src={url}
            alt={t("previewTitle")}
            width={800}
            height={600}
            className="max-h-[70vh] w-auto border border-border object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={url}
            loading="lazy"
            className="h-[70vh] w-full border border-border"
            title={t("previewTitle")}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center border border-border text-accent">
              <FileText className="h-5 w-5" />
            </span>
            <p className="text-muted-foreground">{t("previewUnavailable")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
