"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createDeal } from "@/app/(dashboard)/deals/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { Input } from "@/components/ui/input";
import { DEAL_STAGES } from "@/lib/config";

export function NewDealForm() {
  const t = useTranslations("Deals");

  async function handleSubmit(formData: FormData) {
    const price = Number(formData.get("price"));
    const data = {
      name: formData.get("name")?.toString() ?? "",
      stage: (formData.get("stage")?.toString() ?? "new") as (typeof DEAL_STAGES)[number],
      status: "active" as const,
      price: Number.isFinite(price) && price > 0 ? price : undefined,
    };
    const result = await createDeal(data);
    if (result.success) toast.success(t("dealCreated"));
    else toast.error(result.message);
  }

  return (
    <InlineForm
      trigger={t("newDeal")}
      cancelLabel={t("cancel")}
      submitLabel={t("create")}
      submittingLabel={t("creating")}
      onSubmit={handleSubmit}
    >
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
    </InlineForm>
  );
}
