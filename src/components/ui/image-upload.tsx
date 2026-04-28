"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { useImageUpload } from "@/hooks/useImageUpload";

type ImageUploadFieldProps = {
  image: ReturnType<typeof useImageUpload>;
  label: string;
  hint?: string;
  disabled?: boolean;
  size?: string;
  fallback?: React.ReactNode;
};

export function ImageUploadField({
  image,
  label,
  hint,
  disabled,
  fallback,
}: ImageUploadFieldProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        {image.preview ? (
          <>
            <Image
              src={image.preview}
              alt="Preview"
              width={80}
              height={80}
              className="w-20 h-20 object-cover border border-border"
              unoptimized
            />
            <button
              type="button"
              onClick={image.remove}
              className="absolute -top-2 -right-2 bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : fallback ? (
          fallback
        ) : (
          <div className="w-20 h-20 flex items-center justify-center border border-dashed border-border bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
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
          onClick={() => image.inputRef.current?.click()}
        >
          {label}
        </Button>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
