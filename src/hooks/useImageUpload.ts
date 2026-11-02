"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadType } from "@/lib/types";
import { uploadFile, validateImage } from "@/lib/upload";

export function useImageUpload(initialUrl: string | null | undefined, uploadType: UploadType) {
  const t = useTranslations("Common");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const error = validateImage(selected);
    if (error) {
      toast.error(t(error));
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
    const url = await uploadFile(file, uploadType);
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
