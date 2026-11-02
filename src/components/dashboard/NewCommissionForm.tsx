"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createCommission } from "@/app/(dashboard)/commissions/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { Input } from "@/components/ui/input";
import { COMMISSION_TYPES } from "@/lib/config";
import { COMMISSION_TYPE_LABELS, labelKey } from "@/lib/labels";

type Option = { value: string; label: string };

export function NewCommissionForm({ deals, agents }: { deals: Option[]; agents: Option[] }) {
  const t = useTranslations("Commissions");

  async function handleSubmit(formData: FormData) {
    const data = {
      dealId: formData.get("dealId")?.toString() ?? "",
      agentId: formData.get("agentId")?.toString() ?? "",
      amount: Number(formData.get("amount")) || 0,
      type: (formData.get("type")?.toString() ??
        "listing_side") as (typeof COMMISSION_TYPES)[number],
    };
    const result = await createCommission(data);
    if (result.success) toast.success(t("commissionRecorded"));
    else toast.error(result.message);
  }

  return (
    <InlineForm
      trigger={t("recordCommission")}
      cancelLabel={t("cancel")}
      submitLabel={t("save")}
      submittingLabel={t("saving")}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dealId">{t("deal")}</Label>
          <Dropdown name="dealId" placeholder={t("selectDeal")} options={deals} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agentId">{t("agent")}</Label>
          <Dropdown name="agentId" placeholder={t("selectAgent")} options={agents} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">{t("amount")}</Label>
          <Input id="amount" name="amount" type="number" min="0" required placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t("type")}</Label>
          <Dropdown
            name="type"
            defaultValue="listing_side"
            options={COMMISSION_TYPES.map((type) => ({
              value: type,
              label: t(labelKey(COMMISSION_TYPE_LABELS, type)),
            }))}
          />
        </div>
      </div>
    </InlineForm>
  );
}
