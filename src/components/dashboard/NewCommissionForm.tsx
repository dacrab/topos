"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createCommission } from "@/app/(dashboard)/commissions/actions";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { COMMISSION_TYPES } from "@/lib/config";

export function NewCommissionForm() {
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
        toast.success("Commission recorded");
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
        Record Commission
      </Button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border-2 border-foreground p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dealId">Deal ID</Label>
          <Input id="dealId" name="dealId" required placeholder="Deal ID..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agentId">Agent ID</Label>
          <Input id="agentId" name="agentId" required placeholder="Agent ID..." />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min="0" required placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Dropdown
            name="type"
            defaultValue="listing_side"
            options={COMMISSION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
