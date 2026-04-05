import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow } from "@/components/settings/TeamForms";
import { SettingsPageSection } from "@/components/ui/page";
import { invitation, teamMember, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export default async function TeamSettingsPage() {
  const t = await getTranslations("Settings");
  const session = await getSession();
  if (!session) return null;

  const tenant = await getCurrentTenant();

  const [currentMember] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenant.id)))
    .limit(1);

  const isAdmin = !!currentMember && ["owner", "admin"].includes(currentMember.role);

  const members = await db
    .select({
      member: teamMember,
      user: { id: user.id, name: user.name, email: user.email, image: user.image },
    })
    .from(teamMember)
    .innerJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.tenantId, tenant.id));

  const pendingInvitations = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.tenantId, tenant.id), eq(invitation.status, "pending")));

  return (
    <SettingsPageSection
      title={t("teamTitle")}
      description={t("manageTeamFor", { tenantName: tenant.name })}
    >
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
              currentUserId={session.user.id}
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
    </SettingsPageSection>
  );
}
