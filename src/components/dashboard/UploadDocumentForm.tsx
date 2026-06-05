"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadDocument } from "@/app/(dashboard)/documents/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { DOCUMENT_TYPES } from "@/lib/config";

export function UploadDocumentForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await uploadDocument(formData);
        toast.success("Document uploaded");
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    });
  };

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Upload Document
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border border-border p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <input id="file" name="file" type="file" required className="text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
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
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
