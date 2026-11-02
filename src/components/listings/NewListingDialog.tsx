"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";
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
import { AMENITIES, PROPERTY_TYPES } from "@/lib/config";
import { uploadFile, validateImage } from "@/lib/upload";

const SECTION_TITLE = "border-b border-border pb-2 meta-caps text-muted-foreground";

export function NewListingDialog({ trigger }: { trigger?: ReactElement }) {
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
      const error = validateImage(f);
      if (error) {
        toast.error(`${f.name}: ${tc(error)}`);
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
        const imageUrls = await Promise.all(images.map(({ file }) => uploadFile(file, "listing")));
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
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger className="btn-primary btn-sm">{tc("newListing")}</DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[900px]">
        <div className="border-b-2 border-foreground/85 px-6 py-5">
          <p className="meta-caps text-accent">01 / {tc("listings")}</p>
          <DialogTitle className="mt-2 card-title">{t("createListing")}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {t("createListingDesc")}
          </DialogDescription>
        </div>

        <form ref={formRef} action={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            {error && (
              <div className="border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-7">
                <div className="space-y-4">
                  <h3 className={SECTION_TITLE}>{t("basicInfo")}</h3>
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
                  <h3 className={SECTION_TITLE}>{t("propertyDetails")}</h3>
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
                  <h3 className={SECTION_TITLE}>{t("location")}</h3>
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

              <div className="space-y-7">
                <div className="space-y-4">
                  <h3 className={SECTION_TITLE}>{t("images")}</h3>
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
                    className="flex h-auto w-full flex-col gap-2 border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-foreground hover:bg-transparent hover:text-foreground"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-medium">{t("selectImages")}</span>
                    <span className="micro-caps text-muted-foreground">{t("imageHint")}</span>
                  </Button>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map(({ preview }) => (
                        <div key={preview} className="group relative aspect-square">
                          <Image
                            src={preview}
                            alt="Listing"
                            fill
                            className="border border-border object-cover"
                            unoptimized
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            aria-label={t("removeImage")}
                            onClick={() => removeImage(preview)}
                            className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className={SECTION_TITLE}>{t("amenities")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((a) => (
                      <label
                        key={a}
                        className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                      >
                        <input
                          type="checkbox"
                          name={a}
                          className="h-3.5 w-3.5 border-input accent-[var(--accent)]"
                        />
                        <span>{t(`amenity${a.charAt(0).toUpperCase()}${a.slice(1)}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
