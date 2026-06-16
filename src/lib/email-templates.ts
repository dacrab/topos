const wrap = (content: string) =>
  `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">${content}</div>`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function newLeadAlert(
  agentName: string,
  contactName: string,
  contactEmail: string,
  listingTitle: string,
) {
  return wrap(`
    <h2 style="color:#1a1a1a">New Lead Alert</h2>
    <p>Hi ${escapeHtml(agentName)},</p>
    <p><strong>${escapeHtml(contactName)}</strong> (${escapeHtml(contactEmail)}) submitted an inquiry on <strong>${escapeHtml(listingTitle)}</strong>.</p>
    <p style="color:#666">Log in to your dashboard to follow up.</p>
  `);
}
