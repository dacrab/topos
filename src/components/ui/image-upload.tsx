"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { useImageUpload } from "@/hooks/useImageUpload";

type ImageUploadFieldProps = {
  image: ReturnType<typeof useImageUpload>;
  label: string;
  hint?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  fallback?: React.ReactNode;
};

const SIZE = {
  sm: { px: 64, cls: "w-16 h-16" },
  md: { px: 80, cls: "w-20 h-20" },
} as const;

export function ImageUploadField({
  image,
  label,
  hint,
  size = "md",
  disabled,
  fallback,
}: ImageUploadFieldProps) {
  const { px, cls } = SIZE[size];

  return (
    <div className="flex items-start gap-4">
      {image.hasPreview ? (
        <div className="relative flex-shrink-0">
          <Image
            src={image.preview}
            alt="Preview"
            width={px}
            height={px}
            className={`${cls} object-cover border border-border`}
            unoptimized
          />
          <button
            type="button"
            onClick={image.remove}
            className="absolute -top-2 -right-2 bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : fallback ? (
        <div className={`${cls} flex-shrink-0`}>{fallback}</div>
      ) : (
        <div
          className={`${cls} flex items-center justify-center border border-dashed border-border bg-muted`}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          ref={image.inputRef}
          type="file"
          accept="image/*"
          onChange={image.handleSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={image.openPicker}
        >
          {label}
        </Button>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
