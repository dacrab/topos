"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import {
  Button,
  FormField,
  ImageUploadField,
  InfoBox,
  Input,
} from "@/components/ui";
import { useImageUpload } from "@/hooks/useImageUpload";

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
  const image = useImageUpload({
    initialUrl: currentUser?.image,
    uploadType: "user",
  });

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        formData.set("image", await image.upload());
        const result = await updateProfile(formData);
        toast[result.success ? "success" : "error"](result.message);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("uploadFailed"));
      }
    });
  }

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

      <FormField id="role" label={t("role")}>
        <Input
          id="role"
          disabled
          className="capitalize"
          defaultValue={currentUser?.role ?? "user"}
        />
      </FormField>

      <InfoBox title={t("accountInfo")}>
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
      </InfoBox>

      <Button type="submit" variant="submit" size="auto" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
