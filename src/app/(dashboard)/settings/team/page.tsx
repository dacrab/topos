import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow, RoleLegend } from "@/components/settings/TeamForms";
import { SectionHeader } from "@/components/ui";
import { invitation, teamMember, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const t = await getTranslations("Settings");
  const session = await getSession();

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
      <SectionHeader
        bordered
        title={t("teamTitle")}
        description={t("manageTeamFor", { tenantName: tenant.name })}
      />

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
        <h4 className="label-caps mb-2">{t("howInvitationsWork")}</h4>
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
