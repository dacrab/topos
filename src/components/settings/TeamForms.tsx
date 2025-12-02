"use client";

import { Clock, Crown, Mail, Shield, Trash2, UserPlus } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  cancelInvitation,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
} from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

const ROLES = [
  {
    value: "owner",
    label: "Owner",
    description: "Full access, can delete the organization",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Can manage team members and all settings",
  },
  {
    value: "agent",
    label: "Agent",
    description: "Can manage listings, contacts, and transactions",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to dashboard",
  },
];

type TeamMemberData = {
  member: {
    id: string;
    role: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type InvitationData = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

// Invite Form
export function InviteForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await inviteTeamMember(formData);
      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="border border-border p-6 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Invite Team Member</h3>
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            type="email"
            name="email"
            required
            placeholder="colleague@company.com"
          />
        </div>
        <div className="sm:w-40">
          <Select name="role">
            {ROLES.filter((r) => r.value !== "owner").map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="submit"
          variant="submit"
          size="auto"
          className="py-2"
          disabled={isPending}
        >
          {isPending ? "Sending..." : "Send Invite"}
        </Button>
      </form>
    </div>
  );
}

// Role Legend
export function RoleLegend() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {ROLES.map((role) => (
        <div
          key={role.value}
          className="border border-border p-3 bg-secondary/20"
        >
          <div className="flex items-center gap-2 mb-1">
            {role.value === "owner" && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
            {role.value === "admin" && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
            <span className="font-medium text-sm">{role.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{role.description}</p>
        </div>
      ))}
    </div>
  );
}

// Member Row with role update
export function MemberRow({
  member,
  memberUser,
  isAdmin,
  currentUserId,
}: {
  member: TeamMemberData["member"];
  memberUser: TeamMemberData["user"];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleRoleChange(formData: FormData) {
    startTransition(async () => {
      const result = await updateMemberRole(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  async function handleRemove(formData: FormData) {
    startTransition(async () => {
      const result = await removeMember(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-foreground flex items-center justify-center text-sm font-bold text-background">
          {memberUser.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{memberUser.name}</span>
            {member.role === "owner" && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
            {member.role === "admin" && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
            {memberUser.id === currentUserId && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 font-bold uppercase tracking-widest">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {memberUser.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && member.role !== "owner" ? (
          <form action={handleRoleChange} className="flex items-center gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <select
              name="role"
              defaultValue={member.role}
              disabled={isPending}
              onChange={(e) => e.target.form?.requestSubmit()}
              className="border border-input bg-background py-1 px-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              {ROLES.filter((r) => r.value !== "owner").map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </form>
        ) : (
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-2 py-1 bg-secondary">
            {member.role}
          </span>
        )}

        {isAdmin &&
          member.role !== "owner" &&
          memberUser.id !== currentUserId && (
            <form action={handleRemove}>
              <input type="hidden" name="memberId" value={member.id} />
              <button
                type="submit"
                disabled={isPending}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                title="Remove member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          )}
      </div>
    </div>
  );
}

// Invitation Row
export function InvitationRow({
  inv,
  isAdmin,
}: {
  inv: InvitationData;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleCancel(formData: FormData) {
    startTransition(async () => {
      const result = await cancelInvitation(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-dashed border-border flex items-center justify-center text-muted-foreground">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium font-mono text-sm">{inv.email}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-2 py-1 bg-secondary">
          {inv.role}
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-yellow-600 px-2 py-1 bg-yellow-500/10">
          Pending
        </span>

        {isAdmin && (
          <form action={handleCancel}>
            <input type="hidden" name="invitationId" value={inv.id} />
            <button
              type="submit"
              disabled={isPending}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 disabled:opacity-50"
              title="Cancel invitation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
