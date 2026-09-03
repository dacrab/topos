"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-8">
      <section className="card-base">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold">API Keys</h2>
        </div>
        <div className="p-5 space-y-4">
          {newKey && (
            <div className="bg-primary/5 border border-primary/25 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-primary">New API Key Generated</p>
              <code className="block bg-background border border-border rounded-md px-3 py-2 text-sm font-mono break-all select-all">
                {newKey}
              </code>
              <p className="text-xs text-muted-foreground">
                Copy this key now. It will not be shown again.
              </p>
              <Button variant="outline" size="sm" onClick={() => setNewKey(null)}>
                Dismiss
              </Button>
            </div>
          )}
          <form action={run(generateApiKey)} className="flex gap-2">
            <Input
              name="name"
              placeholder="Key name"
              required
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" variant="default" disabled={isPending}>
              Generate
            </Button>
          </form>
          {keys.length > 0 && (
            <div className="divide-y divide-border">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{k.name}</p>
                    <p className="mono-caption">
                      {"•".repeat(28)}
                      {k.keyLast4}
                    </p>
                  </div>
                  <form action={run(deleteApiKey)}>
                    <input type="hidden" name="id" value={k.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card-base">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold">Webhooks</h2>
        </div>
        <div className="p-5 space-y-4">
          <form action={run(createWebhook)} className="space-y-3">
            <Input
              name="url"
              type="url"
              placeholder="https://example.com/webhook"
              required
              disabled={isPending}
            />
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {events.map((event) => (
                <label
                  key={event}
                  className="flex items-center gap-2 text-sm rounded-lg border border-border px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="events"
                    value={event}
                    className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                  />
                  <span className="mono-caption">{event}</span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" variant="default" disabled={isPending}>
              Add Webhook
            </Button>
          </form>
          {hooks.length > 0 && (
            <div className="divide-y divide-border">
              {hooks.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{h.url}</p>
                    <p className="mono-caption truncate">{h.events.join(", ")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={run(toggleWebhook)}>
                      <input type="hidden" name="id" value={h.id} />
                      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                        {h.active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={run(deleteWebhook)}>
                      <input type="hidden" name="id" value={h.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
