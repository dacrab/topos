"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createCommission } from "@/app/(dashboard)/commissions/actions";
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
          dealId: formData.get("dealId") as string,
          agentId: formData.get("agentId") as string,
          amount: Number(formData.get("amount")) || 0,
          type: formData.get("type") as (typeof COMMISSION_TYPES)[number],
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
      <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 py-2 text-xs">
        Record Commission
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="border border-border p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dealId">Deal ID</Label>
          <Input id="dealId" name="dealId" required placeholder="Deal ID..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agentId">Agent ID</Label>
          <Input id="agentId" name="agentId" required placeholder="Agent ID..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-secondary px-4 py-2 text-xs"
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary px-4 py-2 text-xs">
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
