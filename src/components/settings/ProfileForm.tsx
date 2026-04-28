"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
import { ImageUploadField } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/useImageUpload";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProfileFormProps = {
  currentUser: {
    name: string | null;
    email: string;
    image: string | null;
    teamRole: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    banned: boolean | null;
  };
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const t = useTranslations("Profile");
  const [isPending, startTransition] = useTransition();
  const image = useImageUpload(currentUser?.image, "user");

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const imageUrl = await image.upload();
      formData.set("image", imageUrl);
      const result = await updateProfile(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 max-w-xl">
      <ImageUploadField
        image={image}
        label={t("selectImage")}
        hint={t("imageHint")}
        disabled={isPending}
        fallback={
          <div className="w-20 h-20 bg-foreground flex items-center justify-center text-2xl font-bold text-background">
            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        }
      />

      <div className="space-y-2">
        <Label htmlFor="name">{t("fullName")}</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={currentUser?.name ?? ""}
          placeholder={t("namePlaceholder")}
        />
      </div>

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

      {currentUser?.teamRole && (
        <div className="space-y-2">
          <Label htmlFor="role">{t("role")}</Label>
          <Input id="role" disabled className="capitalize" defaultValue={currentUser.teamRole} />
        </div>
      )}

      <div className="info-box">
        <h3 className="label-caps">{t("accountInfo")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("memberSince")}</span>
            <p className={cn("font-mono")}>
              {currentUser ? formatDate(currentUser.createdAt) : ""}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("lastUpdated")}</span>
            <p className={cn("font-mono")}>
              {currentUser ? formatDate(currentUser.updatedAt) : ""}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("emailVerified")}</span>
            <p className={cn("font-mono")}>{currentUser?.emailVerified ? t("yes") : t("no")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("accountStatus")}</span>
            <p className={cn("font-mono")}>{currentUser?.banned ? t("banned") : t("active")}</p>
          </div>
        </div>
      </div>

      <Button type="submit" variant="submit" size="submit" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
