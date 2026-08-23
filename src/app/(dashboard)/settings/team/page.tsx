import { and, eq, gt } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { InvitationRow, InviteForm, MemberRow } from "@/components/settings/TeamForms";
import { SectionHeader } from "@/components/ui/page";
import { CardStripe } from "@/components/ui/stripe";
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
    <>
      <SectionHeader
        title={t("teamTitle")}
        description={t("manageTeamFor", { tenantName: tenant.name })}
      />
      {isAdmin && <InviteForm />}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm text-muted-foreground font-medium">
            {t("teamMembersCount")} ({members.length})
          </h3>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="border border-border/40 divide-y divide-border/30 bg-card shadow-card rounded-2xl overflow-hidden">
          <CardStripe intensity="subtle" />
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
          <div className="flex items-center gap-4">
            <h3 className="text-sm text-muted-foreground font-medium">
              {t("pendingInvitations")} ({pendingInvitations.length})
            </h3>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="border border-border/40 divide-y divide-border/30 bg-card shadow-card rounded-2xl overflow-hidden">
            <CardStripe intensity="subtle" />
            {pendingInvitations.map((inv) => (
              <InvitationRow key={inv.id} inv={inv} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
