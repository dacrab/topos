"use client";

import { ArrowDown, ArrowUp, GitBranch, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/page";
import { savePipelineTemplate } from "./actions";

export function PipelineEditor({
  initialStages,
}: {
  initialStages: { name: string; order: number }[];
}) {
  const t = useTranslations("Pipeline");
  const tc = useTranslations("Common");
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
        toast.error(tc("somethingWentWrong"));
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Panel
        title={t("stages")}
        description={t("stagesDesc")}
        icon={<GitBranch className="h-4 w-4" />}
        action={<Badge variant="primary">{stages.length}</Badge>}
        bodyClassName="p-0"
      >
        <ol className="divide-y divide-border">
          {stages.map((stage) => (
            <li
              key={`stage-${stage.name}-${stage.order}`}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="flex min-w-0 items-center gap-3 text-sm font-medium">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border font-mono text-micro text-accent tabular-nums">
                  {String(stage.order + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{stage.name}</span>
              </span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveUp(stage.order)}
                  disabled={stage.order === 0}
                  aria-label={tc("moveUp")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveDown(stage.order)}
                  disabled={stage.order === stages.length - 1}
                  aria-label={tc("moveDown")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeStage(stage.order)}
                  aria-label={tc("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="flex gap-2">
        <Input
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStage()}
          placeholder={t("placeholder")}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addStage}>
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      <Button type="button" variant="default" size="lg" onClick={save} disabled={isPending}>
        {isPending ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
