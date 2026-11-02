"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { FormSubmitButton, Label } from "@/components/ui/form";
import { ImageUploadField } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import { useImageUpload } from "@/hooks/useImageUpload";
import { isTeamRole } from "@/lib/config";
import { formatDate } from "@/lib/format";

type ProfileFormProps = {
  currentUser: {
    name: string | null;
    email: string;
    image: string | null;
    teamRole: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const t = useTranslations("Profile");
  const tt = useTranslations("Team");
  const locale = useLocale();
  const image = useImageUpload(currentUser?.image, "user");
  const { isPending, run } = useFormAction();

  const handleSubmit = run(updateProfile, {
    beforeSubmit: async (formData) => {
      const imageUrl = await image.upload();
      formData.set("image", imageUrl);
    },
  });

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <FormSection
        title={t("personalDetails")}
        description={t("personalDetailsDesc")}
        icon={<UserRound className="h-4 w-4" />}
      >
        <ImageUploadField
          image={image}
          label={t("selectImage")}
          hint={t("imageHint")}
          disabled={isPending}
          fallback={
            <div className="flex h-20 w-20 items-center justify-center border border-border bg-secondary font-display text-2xl text-foreground">
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
            <Input
              id="role"
              disabled
              defaultValue={
                isTeamRole(currentUser.teamRole) ? tt(currentUser.teamRole) : currentUser.teamRole
              }
            />
          </div>
        )}
      </FormSection>

      <FormSection
        title={t("accountInfo")}
        description={t("accountInfoDesc")}
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="border border-border px-4 py-3">
            <span className="micro-caps text-muted-foreground">{t("memberSince")}</span>
            <p className="mt-1 text-sm tabular-nums">
              {currentUser ? formatDate(currentUser.createdAt, locale) : ""}
            </p>
          </div>
          <div className="border border-border px-4 py-3">
            <span className="micro-caps text-muted-foreground">{t("lastUpdated")}</span>
            <p className="mt-1 text-sm tabular-nums">
              {currentUser ? formatDate(currentUser.updatedAt, locale) : ""}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("saveChanges")}
      />
    </form>
  );
}
