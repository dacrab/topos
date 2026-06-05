"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createDeal } from "@/app/(dashboard)/deals/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DEAL_STAGES } from "@/lib/config";

export function NewDealForm() {
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
        toast.success("Deal created");
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
        New Deal
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border border-border p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Deal Name</Label>
          <Input id="name" name="name" required placeholder="123 Main St sale..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Dropdown
            name="stage"
            defaultValue="new"
            options={DEAL_STAGES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" min="0" placeholder="0" />
        </div>
      </div>
      <div className="flex gap-3">
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
