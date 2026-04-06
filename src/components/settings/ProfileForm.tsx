"use client";

import { useTranslations } from "next-intl";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { FormField, FormSubmitButton } from "@/components/ui/form";
import { ImageUploadField } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { InfoBox } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import { useImageUpload } from "@/hooks/useImageUpload";

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
  const { isPending, execute } = useFormAction();
  const image = useImageUpload({
    initialUrl: currentUser?.image,
    uploadType: "user",
  });

  const handleSubmit = execute(updateProfile, {
    prepare: async (formData) => {
      formData.set("image", await image.upload());
    },
    errorMessage: t("uploadFailed"),
  });

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

      <FormField id="name" label={t("fullName")}>
        <Input
          id="name"
          name="name"
          required
          defaultValue={currentUser?.name ?? ""}
          placeholder={t("namePlaceholder")}
        />
      </FormField>

      <FormField id="email" label={t("emailAddress")} hint={t("emailHint")}>
        <Input
          id="email"
          name="email"
          type="email"
          disabled
          defaultValue={currentUser?.email ?? ""}
        />
      </FormField>

      {currentUser?.teamRole && (
        <FormField id="role" label={t("role")}>
          <Input id="role" disabled className="capitalize" defaultValue={currentUser.teamRole} />
        </FormField>
      )}

      <InfoBox title={t("accountInfo")}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t("memberSince")}</span>
            <p className="font-mono">{currentUser?.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("lastUpdated")}</span>
            <p className="font-mono">{currentUser?.updatedAt.toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("emailVerified")}</span>
            <p className="font-mono">{currentUser?.emailVerified ? t("yes") : t("no")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("accountStatus")}</span>
            <p className="font-mono">{currentUser?.banned ? t("banned") : t("active")}</p>
          </div>
        </div>
      </InfoBox>

      <FormSubmitButton
        isPending={isPending}
        pendingLabel={t("saving")}
        idleLabel={t("saveChanges")}
      />
    </form>
  );
}
