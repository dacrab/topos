"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBranding } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandingFormProps = {
  tenant: {
    name: string;
    logoUrl: string | null;
    branding: Record<string, string> | null;
  };
};

export function BrandingForm({ tenant }: BrandingFormProps) {
  const t = useTranslations("Branding");
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const branding = tenant.branding || {};

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("selectImageFile"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeLogo() {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview("");
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        let finalLogoUrl = logoPreview;

        if (logoFile) {
          const uploadData = new FormData();
          uploadData.append("file", logoFile);
          uploadData.append("type", "logo");

          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || t("uploadFailed"));
          }

          const { url } = await response.json();
          finalLogoUrl = url;
        }

        formData.set("logoUrl", finalLogoUrl);
        const result = await updateBranding(formData);

        if (result.success) {
          setLogoFile(null);
          if (finalLogoUrl !== logoPreview) {
            setLogoPreview(finalLogoUrl);
          }
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("uploadFailed"));
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("agencyName")}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={tenant.name}
            placeholder={t("agencyPlaceholder")}
          />
        </div>

        <div className="grid gap-2">
          <Label>{t("logo")}</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-contain border border-border bg-muted"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {t("selectLogo")}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("logoHint")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="primary">{t("primaryColor")}</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background:
                  branding.primary ?? "hsl(var(--primary, 222.2 47.4% 11.2%))",
              }}
            />
            <Input
              id="primary"
              name="primary"
              type="text"
              className="flex-1"
              defaultValue={branding.primary ?? ""}
              placeholder={t("primaryPlaceholder")}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accent">{t("accentColor")}</Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-10 h-10 border border-border"
              style={{
                background:
                  branding.accent ?? "hsl(var(--accent, 210 40% 96.1%))",
              }}
            />
            <Input
              id="accent"
              name="accent"
              type="text"
              className="flex-1"
              defaultValue={branding.accent ?? ""}
              placeholder={t("accentPlaceholder")}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="radius">{t("borderRadius")}</Label>
          <Input
            id="radius"
            name="radius"
            type="text"
            defaultValue={branding.radius ?? ""}
            placeholder={t("radiusPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("radiusHint")}</p>
        </div>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
