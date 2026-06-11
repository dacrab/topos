import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow } from "@/components/settings/TeamForms";
import { SectionHeader } from "@/components/ui/page";
import { invitation, teamMember, user } from "@/db/schema";
import { ADMIN_ROLES, type TeamRole } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export default async function TeamSettingsPage() {
  const t = await getTranslations("Settings");
  const { userId, tenantId, tenant } = await requireDashboardAuth();

  const [currentMemberRow, members, pendingInvitations] = await Promise.all([
    db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
      .limit(1),
    db
      .select({
        member: teamMember,
        user: { id: user.id, name: user.name, email: user.email, image: user.image },
      })
      .from(teamMember)
      .innerJoin(user, eq(teamMember.userId, user.id))
      .where(eq(teamMember.tenantId, tenantId)),
    db
      .select()
      .from(invitation)
      .where(and(eq(invitation.tenantId, tenantId), eq(invitation.status, "pending"))),
  ]);

  const currentMember = currentMemberRow[0];
  const isAdmin = !!currentMember && ADMIN_ROLES.includes(currentMember.role as TeamRole);

  return (
    <>
      <SectionHeader
        title={t("teamTitle")}
        description={t("manageTeamFor", { tenantName: tenant.name })}
      />
      {isAdmin && <InviteForm />}

      <div className="space-y-4">
        <h3 className="section-title">
          {t("teamMembersCount")} ({members.length})
        </h3>
        <div className="border border-border divide-y divide-border bg-card">
          {members.map(({ member, user: memberUser }) => (
            <MemberRow
              key={member.id}
              member={member}
              memberUser={memberUser}
              isAdmin={isAdmin}
              currentUserId={userId}
            />
          ))}
        </div>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title">
            {t("pendingInvitations")} ({pendingInvitations.length})
          </h3>
          <div className="border border-border divide-y divide-border bg-card">
            {pendingInvitations.map((inv) => (
              <InvitationRow key={inv.id} inv={inv} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
