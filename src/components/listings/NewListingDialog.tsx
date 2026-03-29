"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createListing } from "@/app/(dashboard)/actions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  FormSection,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { AMENITIES, getAmenityLabel, PROPERTY_TYPES } from "@/lib/listing";

type ImageFile = { file: File; preview: string };

function useMultiImageUpload() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: ImageFile[] = [];
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

  const remove = (preview: string) => {
    setImages((p) => {
      const img = p.find((i) => i.preview === preview);
      if (img) URL.revokeObjectURL(img.preview);
      return p.filter((i) => i.preview !== preview);
    });
  };

  const clear = () => {
    for (const i of images) URL.revokeObjectURL(i.preview);
    setImages([]);
  };

  const upload = async (): Promise<string[]> => {
    return Promise.all(
      images.map(async ({ file }) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "listing");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        return (await res.json()).url as string;
      }),
    );
  };

  return {
    images,
    inputRef,
    add,
    remove,
    clear,
    upload,
    open: () => inputRef.current?.click(),
  };
}

export function NewListingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations("Listings");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const img = useMultiImageUpload();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const amenities = AMENITIES.filter((a) => formData.get(a) === "on");
    for (const a of AMENITIES) formData.delete(a);
    formData.set("amenities", JSON.stringify(amenities));

    startTransition(async () => {
      try {
        const imageUrls = img.images.length ? await img.upload() : [];
        formData.set("images", JSON.stringify(imageUrls));
        const result = await createListing(formData);
        if (result.success) {
          setOpen(false);
          img.clear();
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

        <form ref={formRef} action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <FormSection title={t("basicInfo")}>
            <FormField id="title" label={`${t("title")} *`}>
              <Input id="title" name="title" required placeholder={t("titlePlaceholder")} />
            </FormField>
            <FormField id="description" label={t("description")}>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder={t("descriptionPlaceholder")}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField id="propertyType" label={t("propertyType")}>
                <Select id="propertyType" name="propertyType">
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField id="listingType" label={t("listingType")}>
                <Select id="listingType" name="listingType">
                  <option value="sale">{t("forSale")}</option>
                  <option value="rent">{t("forRent")}</option>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField id="price" label={`${t("price")} (€) *`}>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="250000"
                />
              </FormField>
              <FormField id="status" label={t("status")}>
                <Select id="status" name="status">
                  <option value="DRAFT">{t("draft")}</option>
                  <option value="PUBLISHED">{t("published")}</option>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title={t("propertyDetails")}>
            <div className="grid grid-cols-4 gap-4">
              <FormField id="beds" label={t("beds")}>
                <Input id="beds" name="beds" type="number" min="0" placeholder="3" />
              </FormField>
              <FormField id="baths" label={t("baths")}>
                <Input id="baths" name="baths" type="number" min="0" placeholder="2" />
              </FormField>
              <FormField id="sqft" label={t("size")}>
                <Input id="sqft" name="sqft" type="number" min="0" placeholder="120" />
              </FormField>
              <FormField id="yearBuilt" label={t("yearBuilt")}>
                <Input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="2020"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title={t("location")}>
            <FormField id="street" label={t("streetAddress")}>
              <Input id="street" name="street" placeholder={t("streetPlaceholder")} />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField id="city" label={t("city")}>
                <Input id="city" name="city" placeholder={t("cityPlaceholder")} />
              </FormField>
              <FormField id="area" label={t("area")}>
                <Input id="area" name="area" placeholder={t("areaPlaceholder")} />
              </FormField>
              <FormField id="postalCode" label={t("postalCode")}>
                <Input id="postalCode" name="postalCode" placeholder="12345" />
              </FormField>
            </div>
          </FormSection>

          <FormSection title={t("images")}>
            <input
              ref={img.inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={img.add}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={img.open}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("selectImages")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">{t("imageHint")}</p>
            {img.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {img.images.map(({ preview }) => (
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
                      onClick={() => img.remove(preview)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>

          <FormSection title={t("amenities")}>
            <div className="grid grid-cols-3 gap-3">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name={a}
                    className="w-4 h-4 border border-input bg-background"
                  />
                  <span>{getAmenityLabel(a)}</span>
                </label>
              ))}
            </div>
          </FormSection>

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
