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

async function polarPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${POLAR_BASE}${path}`, {
    method: "POST",
    headers: polarHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.detail?.[0]?.msg || data.error || "Polar API error";
    throw new Error(msg);
  }
  return data as T;
}

async function polarGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${POLAR_BASE}${path}`, {
    headers: { Authorization: `Bearer ${polarToken()}` },
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.detail?.[0]?.msg || data.error || "Polar API error";
    throw new Error(msg);
  }
  return data as T;
}

export async function createCheckout(args: {
  productId: string;
  email?: string;
  tenantId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  return polarPost<{ url: string }>("/checkouts/", {
    products: [args.productId],
    ...(args.email ? { customer_email: args.email } : {}),
    customer_metadata: { tenant_id: args.tenantId, plan_id: args.planId },
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  });
}

export async function getCheckout(checkoutId: string): Promise<Record<string, unknown>> {
  return polarGet(`/checkouts/${checkoutId}`);
}

export { polarGet };
