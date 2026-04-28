"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadType } from "@/lib/types";

export function useImageUpload(initialUrl: string | null | undefined, uploadType: UploadType) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
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
    if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
    const { url } = await res.json();
    setFile(null);
    setPreview(url);
    return url;
  };

  return { 
    preview, 
    inputRef, 
    handleSelect, 
    upload,
    remove,
  };
}
