"use client";

import { KeyRound, Webhook } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Panel } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import {
  createWebhook,
  deleteApiKey,
  deleteWebhook,
  generateApiKey,
  toggleWebhook,
} from "./actions";

interface Props {
  keys: { id: string; name: string; keyLast4: string }[];
  hooks: { id: string; url: string; events: string[]; active: boolean }[];
  events: string[];
}

export function ApiSettingsClient({ keys, hooks, events }: Props) {
  const t = useTranslations("ApiSettings");
  const [newKey, setNewKey] = useState<string | null>(null);
  const { run, isPending } = useFormAction((result) => {
    if (
      result.success &&
      typeof result.data === "object" &&
      result.data !== null &&
      "key" in result.data
    ) {
      const data = result.data as { key: string } | undefined;
      if (data?.key) setNewKey(data.key);
    }
  });

  return (
    <div className="space-y-6">
      <Panel
        title={t("apiKeys")}
        description={t("apiKeysDesc")}
        icon={<KeyRound className="h-4 w-4" />}
      >
        <div className="space-y-4">
          {newKey && (
            <div className="space-y-2 border-l-2 border-accent bg-muted/40 p-4">
              <p className="meta-caps text-accent">{t("newKeyTitle")}</p>
              <code className="block select-all break-all border border-border bg-background px-3 py-2 font-mono text-xs">
                {newKey}
              </code>
              <p className="text-xs text-muted-foreground">{t("newKeyHint")}</p>
              <Button variant="outline" size="sm" onClick={() => setNewKey(null)}>
                {t("dismiss")}
              </Button>
            </div>
          )}

          <form action={run(generateApiKey)} className="flex gap-2">
            <Input
              name="name"
              placeholder={t("keyNamePlaceholder")}
              aria-label={t("keyName")}
              required
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" variant="default" disabled={isPending}>
              {t("generate")}
            </Button>
          </form>

          {keys.length === 0 ? (
            <EmptyState className="p-8 text-sm" icon={<KeyRound className="h-4 w-4" />}>
              {t("noKeys")}
            </EmptyState>
          ) : (
            <div className="divide-y divide-border border border-border">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{key.name}</p>
                    <p className="mono-caption">
                      {"•".repeat(28)}
                      {key.keyLast4}
                    </p>
                  </div>
                  <form action={run(deleteApiKey)}>
                    <input type="hidden" name="id" value={key.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isPending}
                    >
                      {t("delete")}
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel
        title={t("webhooks")}
        description={t("webhooksDesc")}
        icon={<Webhook className="h-4 w-4" />}
      >
        <div className="space-y-4">
          <form action={run(createWebhook)} className="space-y-3">
            <Input
              name="url"
              type="url"
              placeholder={t("webhookUrl")}
              aria-label={t("webhookUrl")}
              required
              disabled={isPending}
            />
            <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <legend className="label-caps mb-2">{t("events")}</legend>
              {events.map((event) => (
                <label
                  key={event}
                  className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
                >
                  <input
                    type="checkbox"
                    name="events"
                    value={event}
                    className="h-3.5 w-3.5 border-input accent-[var(--accent)]"
                  />
                  <span className="mono-caption">{event}</span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" variant="default" disabled={isPending}>
              {t("addWebhook")}
            </Button>
          </form>

          {hooks.length === 0 ? (
            <EmptyState className="p-8 text-sm" icon={<Webhook className="h-4 w-4" />}>
              {t("noWebhooks")}
            </EmptyState>
          ) : (
            <div className="divide-y divide-border border border-border">
              {hooks.map((hook) => (
                <div key={hook.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{hook.url}</p>
                    <p className="mono-caption truncate">{hook.events.join(", ")}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={run(toggleWebhook)}>
                      <input type="hidden" name="id" value={hook.id} />
                      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                        {hook.active ? t("disable") : t("enable")}
                      </Button>
                    </form>
                    <form action={run(deleteWebhook)}>
                      <input type="hidden" name="id" value={hook.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={isPending}
                      >
                        {t("delete")}
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
