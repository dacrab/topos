import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  InvitationRow,
  InviteForm,
  MemberRow,
  RoleLegend,
} from "@/components/settings/TeamForms";
import { invitation, teamMember, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const tenant = await getCurrentTenant();

  // Get current user's role
  const [currentMember] = await db
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.userId, session.user.id),
        eq(teamMember.tenantId, tenant.id),
      ),
    )
    .limit(1);

  const isAdmin =
    currentMember && ["owner", "admin"].includes(currentMember.role);

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
    .where(
      and(eq(invitation.tenantId, tenant.id), eq(invitation.status, "pending")),
    );

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">Team Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage team members and their permissions for {tenant.name}
        </p>
      </div>

      {/* Invite Form (only for admins) */}
      {isAdmin && <InviteForm />}

      {/* Role Legend */}
      <RoleLegend />

      {/* Team Members */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Team Members ({members.length})
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
            Pending Invitations ({pendingInvitations.length})
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
          How Invitations Work
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Invitations expire after 7 days</li>
          <li>• Invited users will receive an email with a link to join</li>
          <li>• New users will need to create an account first</li>
          <li>• Existing users will be added to the team automatically</li>
        </ul>
      </div>
    </div>
  );
}
