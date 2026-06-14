"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createAppointment } from "@/app/(dashboard)/appointments/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APPOINTMENT_TYPES, RECURRENCE_OPTIONS } from "@/lib/config";

export function NewAppointmentForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = {
          title: formData.get("title")?.toString() ?? "",
          type: (formData.get("type")?.toString() ??
            "viewing") as (typeof APPOINTMENT_TYPES)[number],
          startAt: new Date(formData.get("startAt")?.toString() ?? ""),
          endAt: new Date(formData.get("endAt")?.toString() ?? ""),
          notes: formData.get("notes")?.toString() || null,
          recurrence: (formData.get("recurrence")?.toString() || null) as
            | (typeof RECURRENCE_OPTIONS)[number]
            | null,
        };
        await createAppointment(data);
        toast.success("Appointment created");
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create");
      }
    });
  };

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        New Appointment
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border-2 border-foreground p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Property viewing..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Dropdown
            name="type"
            defaultValue="viewing"
            options={APPOINTMENT_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startAt">Start</Label>
          <Input id="startAt" name="startAt" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">End</Label>
          <Input id="endAt" name="endAt" type="datetime-local" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurrence">Recurrence</Label>
          <Dropdown
            name="recurrence"
            placeholder="One-time"
            options={[
              { value: "", label: "One-time" },
              ...RECURRENCE_OPTIONS.map((r) => ({ value: r, label: r })),
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Optional notes..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
