"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePipelineTemplate } from "./actions";

export function PipelineEditor({
  initialStages,
}: {
  initialStages: { name: string; order: number }[];
}) {
  const t = useTranslations("Pipeline");
  const [stages, setStages] = useState(initialStages);
  const [newStage, setNewStage] = useState("");
  const [isPending, startTransition] = useTransition();

  const swap = (a: number, b: number) => {
    setStages((prev) =>
      prev.map((s, idx) => {
        if (idx === a) return { ...prev[b], order: a } as { name: string; order: number };
        if (idx === b) return { ...prev[a], order: b } as { name: string; order: number };
        return s;
      }),
    );
  };

  const moveUp = (i: number) => {
    if (i > 0) swap(i, i - 1);
  };

  const moveDown = (i: number) => {
    if (i < stages.length - 1) swap(i, i + 1);
  };

  const addStage = () => {
    if (!newStage.trim()) return;
    setStages([...stages, { name: newStage.trim(), order: stages.length }]);
    setNewStage("");
  };

  const removeStage = (i: number) => {
    setStages(stages.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })));
  };

  const save = () => {
    startTransition(async () => {
      try {
        const result = await savePipelineTemplate(stages);
        toast[result.success ? "success" : "error"](result.message);
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="card-base divide-y divide-border rounded-xl overflow-hidden">
        {stages.map((stage) => (
          <div
            key={`stage-${stage.name}-${stage.order}`}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <span className="mono-caption text-micro">
                {String(stage.order + 1).padStart(2, "0")}
              </span>
              {stage.name}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveUp(stage.order)}
                disabled={stage.order === 0}
                aria-label="Move up"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveDown(stage.order)}
                disabled={stage.order === stages.length - 1}
                aria-label="Move down"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => removeStage(stage.order)}
                aria-label="Remove"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStage()}
          placeholder={t("placeholder")}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addStage}>
          {t("add")}
        </Button>
      </div>

      <Button type="button" variant="default" onClick={save} disabled={isPending}>
        {isPending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
