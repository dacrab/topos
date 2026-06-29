"use client";

import { ArchTopBar } from "@/components/ui/arch-top";
import { Button } from "@/components/ui/button";
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
  const { run, isPending } = useFormAction();

  return (
    <div className="space-y-8">
      <section className="border border-border bg-card rounded-2xl overflow-hidden">
        <ArchTopBar className="h-2" />
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">API Keys</h2>
          <form action={run(generateApiKey)} className="flex gap-2">
            <input
              name="name"
              placeholder="Key name"
              required
              className="input flex-1"
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
                    <p className="text-xs text-muted-foreground font-mono">
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
                      className="text-destructive"
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

      <section className="border border-border bg-card rounded-2xl overflow-hidden">
        <ArchTopBar className="h-2" />
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <form action={run(createWebhook)} className="space-y-3">
            <input
              name="url"
              type="url"
              placeholder="https://example.com/webhook"
              required
              className="input w-full"
              disabled={isPending}
            />
            <fieldset className="grid grid-cols-2 gap-2">
              {events.map((event) => (
                <label key={event} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="events" value={event} className="checkbox" />
                  {event}
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
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm font-mono">{h.url}</p>
                    <p className="text-xs text-muted-foreground">{h.events.join(", ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={run(toggleWebhook)}>
                      <input type="hidden" name="id" value={h.id} />
                      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
                        {h.active ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={run(deleteWebhook)}>
                      <input type="hidden" name="id" value={h.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
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
