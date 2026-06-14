"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createCommission } from "@/app/(dashboard)/commissions/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { COMMISSION_TYPES } from "@/lib/config";

export function NewCommissionForm() {
  const t = useTranslations("Commissions");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = {
          dealId: formData.get("dealId")?.toString() ?? "",
          agentId: formData.get("agentId")?.toString() ?? "",
          amount: Number(formData.get("amount")) || 0,
          type: (formData.get("type")?.toString() ??
            "listing_side") as (typeof COMMISSION_TYPES)[number],
        };
        await createCommission(data);
        toast.success(t("commissionRecorded"));
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
        {t("recordCommission")}
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border-2 border-foreground p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dealId">{t("dealId")}</Label>
          <Input id="dealId" name="dealId" required placeholder={t("dealIdPlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agentId">{t("agentId")}</Label>
          <Input id="agentId" name="agentId" required placeholder={t("agentIdPlaceholder")} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">{t("amount")}</Label>
          <Input id="amount" name="amount" type="number" min="0" required placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t("type")}</Label>
          <Dropdown
            name="type"
            defaultValue="listing_side"
            options={COMMISSION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
