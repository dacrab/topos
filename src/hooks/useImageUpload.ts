"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadType } from "@/lib/types";

type UseImageUploadOptions = {
  initialUrl?: string | null;
  uploadType: UploadType;
};

export function useImageUpload({ initialUrl = null, uploadType }: UseImageUploadOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
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
    resetInput();
  }

  function remove() {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    resetInput();
  }

  function openPicker() {
    inputRef.current?.click();
  }

  async function upload(): Promise<string> {
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
  }

  return {
    file,
    preview,
    inputRef,
    handleSelect,
    remove,
    openPicker,
    upload,
    hasFile: !!file,
    hasPreview: !!preview,
  };
}
