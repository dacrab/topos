"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createDeal } from "@/app/(dashboard)/deals/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DEAL_STAGES } from "@/lib/config";

export function NewDealForm() {
  const t = useTranslations("Deals");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = {
          name: formData.get("name")?.toString() ?? "",
          stage: (formData.get("stage")?.toString() ?? "new") as (typeof DEAL_STAGES)[number],
          status: "active" as const,
        };
        await createDeal(data);
        toast.success(t("dealCreated"));
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("createFailed"));
      }
    });
  };

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        {t("newDeal")}
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border-2 border-foreground p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("dealName")}</Label>
          <Input id="name" name="name" required placeholder={t("dealNamePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">{t("stage")}</Label>
          <Dropdown
            name="stage"
            defaultValue="new"
            options={DEAL_STAGES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">{t("price")}</Label>
          <Input id="price" name="price" type="number" min="0" placeholder="0" />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? t("creating") : t("create")}
        </Button>
      </div>
    </form>
  );
}
