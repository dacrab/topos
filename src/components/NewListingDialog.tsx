"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AMENITIES,
  getAmenityLabel,
  PROPERTY_TYPES,
} from "@/lib/listing-constants";

type ImageFile = {
  file: File;
  preview: string;
};

type NewListingDialogProps = {
  createListing: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  trigger?: React.ReactNode;
};

export function NewListingDialog({
  createListing,
  trigger,
}: NewListingDialogProps) {
  const t = useTranslations("Listings");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const img of imageFiles) {
        URL.revokeObjectURL(img.preview);
      }
    };
  }, [imageFiles]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: ImageFile[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage(preview: string) {
    setImageFiles((prev) => {
      const toRemove = prev.find((img) => img.preview === preview);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter((img) => img.preview !== preview);
    });
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = [];

    for (const { file } of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "listing");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await response.json();
      urls.push(url);
    }

    return urls;
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    const amenities: string[] = [];
    for (const amenity of AMENITIES) {
      if (formData.get(amenity) === "on") {
        amenities.push(amenity);
        formData.delete(amenity);
      }
    }
    formData.set("amenities", JSON.stringify(amenities));

    startTransition(async () => {
      try {
        let imageUrls: string[] = [];
        if (imageFiles.length > 0) {
          imageUrls = await uploadImages();
        }
        formData.set("images", JSON.stringify(imageUrls));

        const result = await createListing(formData);
        if (result.success) {
          setOpen(false);
          for (const img of imageFiles) {
            URL.revokeObjectURL(img.preview);
          }
          setImageFiles([]);
          toast.success(t("listingCreated"));
          router.refresh();
        } else {
          const errorMsg = result.error || t("createFailed");
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : t("createFailed");
        setError(errorMsg);
        toast.error(errorMsg);
      }
    });
  }

  const inputClass =
    "w-full border border-input bg-background py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass =
    "text-xs font-bold uppercase tracking-widest text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="text-xs font-bold uppercase tracking-widest">
            {tc("newListing")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t("createListing")}
          </DialogTitle>
          <DialogDescription>{t("createListingDesc")}</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              {t("basicInfo")}
            </h4>

            <div className="space-y-2">
              <label htmlFor="title" className={labelClass}>
                {t("title")} *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className={inputClass}
                placeholder={t("titlePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className={labelClass}>
                {t("description")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="propertyType" className={labelClass}>
                  {t("propertyType")}
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className={inputClass}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="listingType" className={labelClass}>
                  {t("listingType")}
                </label>
                <select
                  id="listingType"
                  name="listingType"
                  className={inputClass}
                >
                  <option value="sale">{t("forSale")}</option>
                  <option value="rent">{t("forRent")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className={labelClass}>
                  {t("price")} (€) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="1000"
                  className={inputClass}
                  placeholder="250000"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className={labelClass}>
                  {t("status")}
                </label>
                <select id="status" name="status" className={inputClass}>
                  <option value="DRAFT">{t("draft")}</option>
                  <option value="PUBLISHED">{t("published")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              {t("propertyDetails")}
            </h4>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="beds" className={labelClass}>
                  {t("beds")}
                </label>
                <input
                  id="beds"
                  name="beds"
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="baths" className={labelClass}>
                  {t("baths")}
                </label>
                <input
                  id="baths"
                  name="baths"
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sqft" className={labelClass}>
                  {t("size")}
                </label>
                <input
                  id="sqft"
                  name="sqft"
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="120"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="yearBuilt" className={labelClass}>
                  {t("yearBuilt")}
                </label>
                <input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  className={inputClass}
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              {t("location")}
            </h4>

            <div className="space-y-2">
              <label htmlFor="street" className={labelClass}>
                {t("streetAddress")}
              </label>
              <input
                id="street"
                name="street"
                type="text"
                className={inputClass}
                placeholder={t("streetPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className={labelClass}>
                  {t("city")}
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className={inputClass}
                  placeholder={t("cityPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="area" className={labelClass}>
                  {t("area")}
                </label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  className={inputClass}
                  placeholder={t("areaPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="postalCode" className={labelClass}>
                  {t("postalCode")}
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className={inputClass}
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              {t("images")}
            </h4>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="listing-images"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t("selectImages")}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t("imageHint")}
              </p>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageFiles.map(({ preview }) => (
                  <div key={preview} className="relative group aspect-square">
                    <Image
                      src={preview}
                      alt="Listing image"
                      fill
                      className="object-cover border border-border"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(preview)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b border-border pb-2">
              {t("amenities")}
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={amenity}
                    className="w-4 h-4 border border-input bg-background"
                  />
                  <span>{getAmenityLabel(amenity)}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
