import { z } from "zod";

const POLAR_BASE = "https://api.polar.sh/v1";

function polarToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set");
  return token;
}

let _polarHeaders: Record<string, string> | null = null;
function polarHeaders(): Record<string, string> {
  if (!_polarHeaders) {
    _polarHeaders = {
      Authorization: `Bearer ${polarToken()}`,
      "Content-Type": "application/json",
    };
  }
  return _polarHeaders;
}

async function polarPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${POLAR_BASE}${path}`, {
    method: "POST",
    headers: polarHeaders(),
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    const err = data as { detail?: { msg?: string }[]; error?: string };
    throw new Error(err.detail?.[0]?.msg || err.error || "Polar API error");
  }
  return data;
}

const checkoutSchema = z.object({ url: z.string().url() });

export async function createCheckout(args: {
  productId: string;
  email?: string;
  tenantId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const checkout = checkoutSchema.parse(
    await polarPost("/checkouts/", {
      products: [args.productId],
      ...(args.email ? { customer_email: args.email } : {}),
      customer_metadata: { tenant_id: args.tenantId, plan_id: args.planId },
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
    }),
  );
  return checkout;
}

export function getPortalUrl(customerId: string): string {
  return `https://polar.sh/customers/${customerId}/portal`;
}
