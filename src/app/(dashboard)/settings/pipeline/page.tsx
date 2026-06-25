"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getPipelineTemplate, savePipelineTemplate } from "./actions";

export default function PipelinePage() {
  const t = useTranslations("Pipeline");
  const [stages, setStages] = useState<{ name: string; order: number }[]>([]);
  const [newStage, setNewStage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPipelineTemplate().then(setStages);
  }, []);

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
    setSaved(false);
    startTransition(async () => {
      await savePipelineTemplate(stages);
      setSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="border border-border/40 bg-card divide-y divide-border/30 shadow-card rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-primary/5 arch-top" />
        {stages.map((stage) => (
          <div
            key={`stage-${stage.name}-${stage.order}`}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium">{stage.name}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveUp(stage.order)}
                disabled={stage.order === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveDown(stage.order)}
                disabled={stage.order === stages.length - 1}
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeStage(stage.order)}
                className="text-destructive"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStage()}
          placeholder={t("placeholder")}
          className="flex-1 px-4 py-2 border border-border/60 rounded-full text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="button" variant="outline" onClick={addStage}>
          {t("add")}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" onClick={save} disabled={isPending}>
          {isPending ? t("saving") : t("save")}
        </Button>
        {saved && <span className="text-sm text-brand">{t("saved")}</span>}
      </div>
    </div>
  );
}
