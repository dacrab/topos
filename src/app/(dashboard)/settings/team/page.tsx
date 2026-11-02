import { and, eq, gt } from "drizzle-orm";
import { Mail, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow } from "@/components/settings/TeamForms";
import { Badge } from "@/components/ui/badge";
import { Panel, SectionHeader } from "@/components/ui/page";
import { invitation, teamMember, user } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { ADMIN_ROLES, isTeamRole } from "@/lib/config";
import { db } from "@/lib/db";

export default async function TeamSettingsPage() {
  const t = await getTranslations("Settings");
  const { userId, tenantId, tenant } = await requireTenant();

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
      .where(
        and(
          eq(invitation.tenantId, tenantId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      ),
  ]);

  const currentMember = currentMemberRow[0];
  const role = isTeamRole(currentMember?.role) ? currentMember?.role : undefined;
  const isAdmin = !!currentMember && !!role && ADMIN_ROLES.includes(role);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("teamTitle")}
        description={t("manageTeamFor", { tenantName: tenant.name })}
      />

      {isAdmin && <InviteForm />}

      <Panel
        title={t("teamMembersCount")}
        description={t("teamMembersDesc")}
        icon={<Users className="h-4 w-4" />}
        action={<Badge variant="primary">{members.length}</Badge>}
        bodyClassName="p-0"
      >
        <div className="divide-y divide-border">
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
      </Panel>

      {pendingInvitations.length > 0 && (
        <Panel
          title={t("pendingInvitations")}
          icon={<Mail className="h-4 w-4" />}
          action={<Badge variant="warning">{pendingInvitations.length}</Badge>}
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border">
            {pendingInvitations.map((inv) => (
              <InvitationRow key={inv.id} inv={inv} isAdmin={isAdmin} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
