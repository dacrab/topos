"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormProps = {
  currentUser: {
    name: string | null;
    email: string;
    image: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    banned: boolean | null;
  };
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const t = useTranslations("Profile");
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(currentUser?.image ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        let finalImageUrl = imagePreview;

        if (imageFile) {
          const uploadData = new FormData();
          uploadData.append("file", imageFile);
          uploadData.append("type", "user");

          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || t("uploadFailed"));
          }

          const { url } = await response.json();
          finalImageUrl = url;
        }

        formData.set("image", finalImageUrl);
        const result = await updateProfile(formData);

        if (result.success) {
          setImageFile(null);
          if (finalImageUrl !== imagePreview) {
            setImagePreview(finalImageUrl);
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
    <form action={handleSubmit} className="space-y-6 max-w-xl">
      {/* Profile Picture */}
      <div className="flex items-start gap-6">
        {imagePreview ? (
          <div className="relative flex-shrink-0">
            <Image
              src={imagePreview}
              alt="Profile"
              width={80}
              height={80}
              className="w-20 h-20 object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 bg-foreground flex items-center justify-center text-2xl font-bold text-background flex-shrink-0">
            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Label>{t("profileImage")}</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="profile-image"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" /> {t("selectImage")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t("fullName")}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={currentUser?.name ?? ""}
          placeholder={t("namePlaceholder")}
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailAddress")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          disabled
          defaultValue={currentUser?.email ?? ""}
        />
        <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
      </div>

      {/* Role (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="role">{t("role")}</Label>
        <Input
          id="role"
          name="role"
          type="text"
          disabled
          className="capitalize"
          defaultValue={currentUser?.role ?? "user"}
        />
      </div>

      {/* Account Info */}
      <div className="border border-border p-4 space-y-3 bg-secondary/30">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("accountInfo")}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("memberSince")}</span>
            <p className="font-mono">
              {currentUser?.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("lastUpdated")}</span>
            <p className="font-mono">
              {currentUser?.updatedAt.toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("emailVerified")}</span>
            <p className="font-mono">
              {currentUser?.emailVerified ? t("yes") : t("no")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("accountStatus")}</span>
            <p className="font-mono">
              {currentUser?.banned ? t("banned") : t("active")}
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
