"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "@/lib/config";
import type { UploadType } from "@/lib/types";

export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please select an image file";
  if (file.size > MAX_FILE_SIZE) return "File too large (max 10MB)";
  return null;
}

export function useImageUpload(initialUrl: string | null | undefined, uploadType: UploadType) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const error = validateImage(selected);
    if (error) {
      toast.error(error);
      return;
    }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const remove = () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = async (): Promise<string> => {
    if (!file) return preview;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", uploadType);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const body: { url: string; error?: string } = await res.json();
    if (!res.ok) throw new Error(body.error || "Upload failed");
    setFile(null);
    setPreview(body.url);
    return body.url;
  };

  return {
    preview,
    inputRef,
    handleSelect,
    upload,
    remove,
  };
}
