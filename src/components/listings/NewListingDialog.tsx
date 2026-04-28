"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { Label } from "@/components/ui/form";
import { Input, Select, Textarea } from "@/components/ui/input";
import { MAX_FILE_SIZE } from "@/lib/config";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/listing";

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
    const files = e.target.files;
    if (!files) return;
    const newFiles: { file: File; preview: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      newFiles.push({ file, preview: URL.createObjectURL(file) });
    }
    if (newFiles.length) setImages((p) => [...p, ...newFiles]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (preview: string) => {
    setImages((p) => {
      const img = p.find((i) => i.preview === preview);
      if (img) URL.revokeObjectURL(img.preview);
      return p.filter((i) => i.preview !== preview);
    });
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    const amenities = AMENITIES.filter((a) => formData.get(a) === "on");
    for (const a of AMENITIES) formData.delete(a);
    formData.set("amenities", JSON.stringify(amenities));

    startTransition(async () => {
      try {
        const imageUrls = await Promise.all(
          images.map(async ({ file }) => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("type", "listing");
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Upload failed");
            return (await res.json()).url as string;
          }),
        );
        formData.set("images", JSON.stringify(imageUrls));
        const result = await createListing(formData);
        if (result.success) {
          setOpen(false);
          for (const img of images) URL.revokeObjectURL(img.preview);
          setImages([]);
          formRef.current?.reset();
          toast.success(t("listingCreated"));
          router.refresh();
        } else {
          setError(result.error || t("createFailed"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("createFailed"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="label-caps">{tc("newListing")}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t("createListing")}
          </DialogTitle>
          <DialogDescription>{t("createListingDesc")}</DialogDescription>
        </div>

        <form ref={formRef} action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="section-title">{t("basicInfo")}</h3>
            <div className="space-y-2">
              <Label htmlFor="title">{t("title")} *</Label>
              <Input id="title" name="title" required placeholder={t("titlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">{t("propertyType")}</Label>
                <Select id="propertyType" name="propertyType">
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`propertyType${type.charAt(0).toUpperCase()}${type.slice(1)}`)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="listingType">{t("listingType")}</Label>
                <Select id="listingType" name="listingType">
                  <option value="sale">{t("forSale")}</option>
                  <option value="rent">{t("forRent")}</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("price")} (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder={t("pricePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select id="status" name="status">
                  <option value="DRAFT">{t("draft")}</option>
                  <option value="PUBLISHED">{t("published")}</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="section-title">{t("propertyDetails")}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds">{t("beds")}</Label>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  min="0"
                  placeholder={t("bedsPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">{t("baths")}</Label>
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  min="0"
                  placeholder={t("bathsPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqft">{t("size")}</Label>
                <Input
                  id="sqft"
                  name="sqft"
                  type="number"
                  min="0"
                  placeholder={t("sizePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">{t("yearBuilt")}</Label>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder={t("yearBuiltPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="section-title">{t("location")}</h3>
            <div className="space-y-2">
              <Label htmlFor="street">{t("streetAddress")}</Label>
              <Input id="street" name="street" placeholder={t("streetPlaceholder")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("city")}</Label>
                <Input id="city" name="city" placeholder={t("cityPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">{t("area")}</Label>
                <Input id="area" name="area" placeholder={t("areaPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("postalCode")}</Label>
                <Input id="postalCode" name="postalCode" placeholder={t("postalCodePlaceholder")} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="section-title">{t("images")}</h3>
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
              variant="outline"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("selectImages")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">{t("imageHint")}</p>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map(({ preview }) => (
                  <div key={preview} className="relative group aspect-square">
                    <Image
                      src={preview}
                      alt="Listing"
                      fill
                      className="object-cover border border-border"
                      unoptimized
                    />
                    <button
                      type="button"
                      aria-label={t("removeImage")}
                      onClick={() => removeImage(preview)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="section-title">{t("amenities")}</h3>
            <div className="grid grid-cols-3 gap-3">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name={a}
                    className="w-4 h-4 border border-input bg-background"
                  />
                  <span>{t(`amenity${a.charAt(0).toUpperCase()}${a.slice(1)}`)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
