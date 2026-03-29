"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadType } from "@/lib/constants";

type UseImageUploadOptions = {
  initialUrl?: string | null;
  maxSizeMB?: number;
  uploadEndpoint?: string;
  uploadType: UploadType;
};

export function useImageUpload({
  initialUrl = null,
  maxSizeMB = 10,
  uploadEndpoint = "/api/upload",
  uploadType,
}: UseImageUploadOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function remove() {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview("");
  }

  function openPicker() {
    inputRef.current?.click();
  }

  async function upload(): Promise<string> {
    if (!file) return preview;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", uploadType);

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const { url } = await response.json();
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
