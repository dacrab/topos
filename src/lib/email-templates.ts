const wrap = (content: string) =>
  `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">${content}</div>`;

export function newLeadAlert(
  agentName: string,
  contactName: string,
  contactEmail: string,
  listingTitle: string,
) {
  return wrap(`
    <h2 style="color:#1a1a1a">New Lead Alert</h2>
    <p>Hi ${agentName},</p>
    <p><strong>${contactName}</strong> (${contactEmail}) submitted an inquiry on <strong>${listingTitle}</strong>.</p>
    <p style="color:#666">Log in to your dashboard to follow up.</p>
  `);
}
