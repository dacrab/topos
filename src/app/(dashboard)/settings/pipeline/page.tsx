"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
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
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="card-bordered divide-y divide-border">
        {stages.map((stage) => (
          <div
            key={`stage-${stage.name}-${stage.order}`}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm font-medium">{stage.name}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveUp(stage.order)}
                disabled={stage.order === 0}
                className="px-2 py-1 text-xs border rounded disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveDown(stage.order)}
                disabled={stage.order === stages.length - 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeStage(stage.order)}
                className="px-2 py-1 text-xs border rounded text-red-500"
              >
                ×
              </button>
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
          className="flex-1 px-3 py-2 border rounded text-sm bg-background"
        />
        <button
          type="button"
          onClick={addStage}
          className="px-4 py-2 text-sm font-medium border rounded hover:bg-muted"
        >
          {t("add")}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? t("saving") : t("save")}
        </button>
        {saved && <span className="text-sm text-green-600">{t("saved")}</span>}
      </div>
    </div>
  );
}
