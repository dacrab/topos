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

export function appointmentReminder(userName: string, title: string, date: string, time: string) {
  return wrap(`
    <h2 style="color:#1a1a1a">Appointment Reminder</h2>
    <p>Hi ${userName},</p>
    <p>You have an upcoming appointment: <strong>${title}</strong></p>
    <p>📅 ${date} at ${time}</p>
  `);
}

export function invitationEmail(
  inviterName: string,
  agencyName: string,
  role: string,
  acceptUrl: string,
) {
  return wrap(`
    <h2 style="color:#1a1a1a">You're Invited</h2>
    <p><strong>${inviterName}</strong> invited you to join <strong>${agencyName}</strong> as ${role}.</p>
    <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Accept Invitation</a>
  `);
}

export function weeklyDigest(
  agencyName: string,
  stats: { newLeads: number; newDeals: number; closedDeals: number },
) {
  return wrap(`
    <h2 style="color:#1a1a1a">Weekly Digest — ${agencyName}</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;border-bottom:1px solid #eee">New Leads</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${stats.newLeads}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee">New Deals</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${stats.newDeals}</td></tr>
      <tr><td style="padding:8px">Closed Deals</td><td style="padding:8px;font-weight:bold">${stats.closedDeals}</td></tr>
    </table>
  `);
}
