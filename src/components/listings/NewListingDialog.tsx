"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createListing } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, Label } from "@/components/ui/form";
import { AMENITIES, MAX_FILE_SIZE, PROPERTY_TYPES } from "@/lib/config";

export function NewListingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations("Listings");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    setImages((p) => [
      ...p,
      ...valid.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (preview: string) => {
    setImages((p) => {
      const img = p.find((i) => i.preview === preview);
      if (img) URL.revokeObjectURL(img.preview);
      return p.filter((i) => i.preview !== preview);
    });
  };

  async function uploadImages(imgs: Array<{ file: File; preview: string }>): Promise<string[]> {
    return Promise.all(
      imgs.map(async ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "listing");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        return (await res.json()).url as string;
      }),
    );
  }

  function cleanup() {
    for (const img of images) URL.revokeObjectURL(img.preview);
    setImages([]);
    formRef.current?.reset();
  }

  function handleCancel() {
    cleanup();
    setOpen(false);
  }

  function handleSuccess() {
    setOpen(false);
    cleanup();
    toast.success(t("listingCreated"));
    router.refresh();
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const amenities = AMENITIES.filter((a) => formData.get(a) === "on");
    for (const a of AMENITIES) formData.delete(a);
    formData.set("amenities", JSON.stringify(amenities));

    startTransition(async () => {
      try {
        const imageUrls = await uploadImages(images);
        formData.set("images", JSON.stringify(imageUrls));
        const result = await createListing(formData);
        if ("success" in result && result.success) {
          handleSuccess();
        } else {
          const msg = "message" in result ? String(result.message) : t("createFailed");
          setError(msg);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("createFailed"));
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) cleanup();
        setOpen(next);
      }}
    >
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-card px-5 py-2 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
          {tc("newListing")}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 pb-0">
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
            {t("createListing")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("createListingDesc")}
          </DialogDescription>
        </div>

        <form ref={formRef} action={handleSubmit} className="p-6 pt-4">
          {error && (
            <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="label-caps">{t("basicInfo")}</h3>
                <Field
                  label={t("title")}
                  name="title"
                  required
                  placeholder={t("titlePlaceholder")}
                />
                <Field
                  label={t("description")}
                  name="description"
                  type="textarea"
                  rows={3}
                  placeholder={t("descriptionPlaceholder")}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">{t("propertyType")}</Label>
                    <Dropdown
                      name="propertyType"
                      defaultValue="apartment"
                      options={PROPERTY_TYPES.map((type) => ({
                        value: type,
                        label: t(`propertyType${type.charAt(0).toUpperCase()}${type.slice(1)}`),
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="listingType">{t("listingType")}</Label>
                    <Dropdown
                      name="listingType"
                      defaultValue="sale"
                      options={[
                        { value: "sale", label: t("forSale") },
                        { value: "rent", label: t("forRent") },
                      ]}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={t("price")}
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder={t("pricePlaceholder")}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("status")}</Label>
                    <Dropdown
                      name="status"
                      defaultValue="DRAFT"
                      options={[
                        { value: "DRAFT", label: t("draft") },
                        { value: "PUBLISHED", label: t("published") },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="label-caps">{t("propertyDetails")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("beds")} name="beds" type="number" min="0" placeholder="0" />
                  <Field label={t("baths")} name="baths" type="number" min="0" placeholder="0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("size")} name="sqft" type="number" min="0" placeholder="m²" />
                  <Field
                    label={t("yearBuilt")}
                    name="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="label-caps">{t("location")}</h3>
                <Field
                  label={t("streetAddress")}
                  name="street"
                  placeholder={t("streetPlaceholder")}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Field label={t("city")} name="city" placeholder={t("cityPlaceholder")} />
                  <Field label={t("area")} name="area" placeholder={t("areaPlaceholder")} />
                  <Field
                    label={t("postalCode")}
                    name="postalCode"
                    placeholder={t("postalCodePlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="label-caps">{t("images")}</h3>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={addImages}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border/40 py-8 flex-col gap-2 text-muted-foreground hover:border-primary/30 hover:text-foreground h-auto rounded-2xl transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">{t("selectImages")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("imageHint")}</span>
                </Button>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map(({ preview }) => (
                      <div key={preview} className="relative group aspect-square">
                        <Image
                          src={preview}
                          alt="Listing"
                          fill
                          className="object-cover border border-border/60 rounded-2xl"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          aria-label={t("removeImage")}
                          onClick={() => removeImage(preview)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="label-caps">{t("amenities")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map((a) => (
                    <label
                      key={a}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-border/40 rounded-full hover:bg-accent/10 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        name={a}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span>{t(`amenity${a.charAt(0).toUpperCase()}${a.slice(1)}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/50">
            <Button
              type="button"
              variant="primaryOutline"
              onClick={handleCancel}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
