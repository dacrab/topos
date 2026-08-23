"use client";

import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { uploadDocument } from "@/app/(dashboard)/documents/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { DOCUMENT_TYPES } from "@/lib/config";

export function UploadDocumentForm() {
  const t = useTranslations("Documents");

  async function handleSubmit(formData: FormData) {
    const result = await uploadDocument(formData);
    toast[result.success ? "success" : "error"](result.message);
  }

  return (
    <InlineForm
      trigger={
        <>
          <Upload className="w-4 h-4" />
          {t("uploadDocument")}
        </>
      }
      cancelLabel={t("cancel")}
      submitLabel={t("upload")}
      submittingLabel={t("uploading")}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="file">{t("file")}</Label>
          <input id="file" name="file" type="file" required className="text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t("type")}</Label>
          <Dropdown
            name="type"
            defaultValue="other"
            options={DOCUMENT_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            }))}
          />
        </div>
      </div>
    </InlineForm>
  );
}
