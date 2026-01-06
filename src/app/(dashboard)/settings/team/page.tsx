import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow, RoleLegend } from "@/components/settings/TeamForms";
import { invitation, teamMember, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const t = await getTranslations("Settings");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const tenant = await getCurrentTenant();

  // Get current user's role
  const [currentMember] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenant.id)))
    .limit(1);

  const isAdmin = !!currentMember && ["owner", "admin"].includes(currentMember.role);

  // Get team members with user details
  const members = await db
    .select({
      member: teamMember,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.tenantId, tenant.id));

  // Get pending invitations
  const pendingInvitations = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.tenantId, tenant.id), eq(invitation.status, "pending")));

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">{t("teamTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("manageTeamFor", { tenantName: tenant.name })}
        </p>
      </div>

      {/* Invite Form (only for admins) */}
      {isAdmin && <InviteForm />}

      {/* Role Legend */}
      <RoleLegend />

      {/* Team Members */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("teamMembersCount")} ({members.length})
        </h3>

        <div className="border border-border divide-y divide-border bg-card">
          {members.map(({ member, user: memberUser }) => (
            <MemberRow
              key={member.id}
              member={member}
              memberUser={memberUser}
              isAdmin={isAdmin}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold border-b border-border pb-2">
            {t("pendingInvitations")} ({pendingInvitations.length})
          </h3>

          <div className="border border-border divide-y divide-border bg-card">
            {pendingInvitations.map((inv) => (
              <InvitationRow key={inv.id} inv={inv} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="border border-border p-4 bg-secondary/20">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          {t("howInvitationsWork")}
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• {t("invitationsExpire")}</li>
          <li>• {t("invitationsEmail")}</li>
          <li>• {t("invitationsNewUsers")}</li>
          <li>• {t("invitationsExisting")}</li>
        </ul>
      </div>
    </div>
  );
}
