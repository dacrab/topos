const wrap = (content: string) =>
  `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">${content}</div>`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const brand = "#0d5c6b";
const ink = "#17181a";
const muted = "#63676b";

export function newLeadAlert(
  agentName: string,
  contactName: string,
  contactEmail: string,
  listingTitle: string,
) {
  return wrap(`
    <h2 style="color:${ink}">New Lead Alert</h2>
    <p>Hi ${escapeHtml(agentName)},</p>
    <p><strong>${escapeHtml(contactName)}</strong> (${escapeHtml(contactEmail)}) submitted an inquiry on <strong>${escapeHtml(listingTitle)}</strong>.</p>
    <p style="color:${muted}">Log in to your dashboard to follow up.</p>
  `);
}

export function inviteEmailHtml(tenantName: string, acceptUrl: string) {
  const url = escapeHtml(acceptUrl);
  return wrap(`
    <h2 style="color:${ink}">Team Invitation</h2>
    <p>You've been invited to join <strong>${escapeHtml(tenantName)}</strong> on Topos.</p>
    <p>
      <a href="${url}" style="display:inline-block;background:${brand};color:#fcfcfb;padding:10px 20px;border-radius:8px;text-decoration:none">
        Accept invitation
      </a>
    </p>
    <p style="color:${muted};font-size:12px">If the button doesn't work, copy this link: ${url}</p>
  `);
}
