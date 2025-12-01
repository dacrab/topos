"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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

type NewListingDialogProps = {
  createListing: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  trigger?: React.ReactNode;
};

const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "penthouse",
  "studio",
  "land",
  "commercial",
] as const;

const AMENITIES = [
  "parking",
  "pool",
  "garden",
  "balcony",
  "elevator",
  "ac",
  "heating",
  "furnished",
  "petFriendly",
  "security",
  "gym",
  "storage",
] as const;

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
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  function addImage() {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  }

  function removeImage(url: string) {
    setImages(images.filter((img) => img !== url));
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("images", JSON.stringify(images));

    const amenities: string[] = [];
    for (const amenity of AMENITIES) {
      if (formData.get(amenity) === "on") {
        amenities.push(amenity);
        formData.delete(amenity);
      }
    }
    formData.set("amenities", JSON.stringify(amenities));

    startTransition(async () => {
      const result = await createListing(formData);
      if (result.success) {
        setOpen(false);
        setImages([]);
        toast.success("Listing created successfully");
        router.refresh();
      } else {
        const errorMsg = result.error || "Failed to create listing";
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
              Basic Information
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
                  Property Type
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
                  Listing Type
                </label>
                <select
                  id="listingType"
                  name="listingType"
                  className={inputClass}
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
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
              Property Details
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
                  Size (m²)
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
                  Year Built
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
              Location
            </h4>

            <div className="space-y-2">
              <label htmlFor="street" className={labelClass}>
                Street Address
              </label>
              <input
                id="street"
                name="street"
                type="text"
                className={inputClass}
                placeholder="123 Main Street"
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
                  Area/District
                </label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  className={inputClass}
                  placeholder="Downtown"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="postalCode" className={labelClass}>
                  Postal Code
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
              Images
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className={`${inputClass} flex-1`}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addImage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-1 bg-secondary/50 px-2 py-1 text-xs"
                  >
                    <span className="max-w-[200px] truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="text-muted-foreground hover:text-foreground"
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
              Amenities
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
                  <span className="capitalize">
                    {amenity === "petFriendly"
                      ? "Pet Friendly"
                      : amenity === "ac"
                        ? "Air Conditioning"
                        : amenity}
                  </span>
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
