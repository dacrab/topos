"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createCommission } from "@/app/(dashboard)/commissions/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { Input } from "@/components/ui/input";
import { COMMISSION_TYPES } from "@/lib/config";

export function NewCommissionForm() {
  const t = useTranslations("Commissions");

  async function handleSubmit(formData: FormData) {
    const data = {
      dealId: formData.get("dealId")?.toString() ?? "",
      agentId: formData.get("agentId")?.toString() ?? "",
      amount: Number(formData.get("amount")) || 0,
      type: (formData.get("type")?.toString() ??
        "listing_side") as (typeof COMMISSION_TYPES)[number],
    };
    await createCommission(data);
    toast.success(t("commissionRecorded"));
  }

  return (
    <InlineForm
      trigger={t("recordCommission")}
      cancelLabel={t("cancel")}
      submitLabel={t("save")}
      submittingLabel={t("saving")}
      onSubmit={handleSubmit}
    >
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
    </InlineForm>
  );
}
