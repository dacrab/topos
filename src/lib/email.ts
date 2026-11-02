import * as Sentry from "@sentry/nextjs";

const FROM = process.env.EMAIL_FROM || "Topos <onboarding@resend.dev>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Resend responded with ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
      );
    }
  } catch (error) {
    // Email is best-effort: a failed send must not roll back the action that
    // triggered it (e.g. an invitation that was already created).
    Sentry.captureException(error, { extra: { scope: "email", subject } });
  }
}
