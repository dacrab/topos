"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createDeal } from "@/app/(dashboard)/deals/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { Input } from "@/components/ui/input";

export function NewDealForm({ stages }: { stages: { name: string; order: number }[] }) {
  const t = useTranslations("Deals");
  const firstStage = stages[0]?.name ?? "new";

  async function handleSubmit(formData: FormData) {
    const price = Number(formData.get("price"));
    const data = {
      name: formData.get("name")?.toString() ?? "",
      stage: formData.get("stage")?.toString() ?? firstStage,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">{t("dealName")}</Label>
          <Input id="name" name="name" required placeholder={t("dealNamePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">{t("stage")}</Label>
          <Dropdown
            name="stage"
            defaultValue={firstStage}
            options={stages.map((s) => ({
              value: s.name,
              label: s.name.replace(/_/g, " "),
            }))}
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
