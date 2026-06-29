"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createAppointment } from "@/app/(dashboard)/appointments/actions";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { InlineForm } from "@/components/ui/inline-form";
import { Input } from "@/components/ui/input";
import { APPOINTMENT_TYPES, RECURRENCE_OPTIONS } from "@/lib/config";

export function NewAppointmentForm() {
  const t = useTranslations("Appointments");

  async function handleSubmit(formData: FormData) {
    const data = {
      title: formData.get("title")?.toString() ?? "",
      type: (formData.get("type")?.toString() ?? "viewing") as (typeof APPOINTMENT_TYPES)[number],
      startAt: new Date(formData.get("startAt")?.toString() ?? ""),
      endAt: new Date(formData.get("endAt")?.toString() ?? ""),
      notes: formData.get("notes")?.toString() || null,
      recurrence: (formData.get("recurrence")?.toString() || null) as
        | (typeof RECURRENCE_OPTIONS)[number]
        | null,
    };
    await createAppointment(data);
    toast.success(t("appointmentCreated"));
  }

  return (
    <InlineForm
      trigger={t("newAppointment")}
      cancelLabel={t("cancel")}
      submitLabel={t("create")}
      submittingLabel={t("creating")}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t("titleCol")}</Label>
          <Input id="title" name="title" required placeholder="Property viewing..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t("type")}</Label>
          <Dropdown
            name="type"
            defaultValue="viewing"
            options={APPOINTMENT_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startAt">{t("start")}</Label>
          <Input id="startAt" name="startAt" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">{t("end")}</Label>
          <Input id="endAt" name="endAt" type="datetime-local" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurrence">{t("recurrence")}</Label>
          <Dropdown
            name="recurrence"
            placeholder={t("oneTime")}
            options={[
              { value: "", label: t("oneTime") },
              ...RECURRENCE_OPTIONS.map((r) => ({ value: r, label: r })),
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input id="notes" name="notes" placeholder={t("notesPlaceholder")} />
        </div>
      </div>
    </InlineForm>
  );
}
