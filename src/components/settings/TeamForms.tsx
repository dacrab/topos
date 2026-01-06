"use client";

import { Clock, Crown, Mail, Shield, Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  cancelInvitation,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
} from "@/app/(dashboard)/settings/actions";
import { Button, Input, Select } from "@/components/ui";
import { useFormAction } from "@/hooks/useFormAction";
import { NON_OWNER_ROLES, TEAM_ROLES } from "@/lib/constants";
import type { InvitationData, TeamMemberData, TeamRole } from "@/lib/types";

export function InviteForm() {
  const t = useTranslations("Team");
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, execute } = useFormAction();

  return (
    <div className="border border-border p-6 bg-card space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t("inviteTeamMember")}</h3>
      </div>
      <form
        ref={formRef}
        action={execute(inviteTeamMember, () => formRef.current?.reset())}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Input
          type="email"
          name="email"
          required
          placeholder={t("emailPlaceholder")}
          className="flex-1"
        />
        <Select name="role" className="sm:w-40">
          {NON_OWNER_ROLES.map((r) => (
            <option key={r} value={r}>
              {t(r)}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="submit" size="auto" className="py-2" disabled={isPending}>
          {isPending ? t("sending") : t("sendInvite")}
        </Button>
      </form>
    </div>
  );
}

export function RoleLegend() {
  const t = useTranslations("Team");
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {TEAM_ROLES.map((role) => (
        <div key={role} className="border border-border p-3 bg-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            {role === "owner" && <Crown className="w-4 h-4 text-yellow-500" />}
            {role === "admin" && <Shield className="w-4 h-4 text-blue-500" />}
            <span className="font-medium text-sm">{t(role)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t(`${role}Desc`)}</p>
        </div>
      ))}
    </div>
  );
}

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
  const t = useTranslations("Team");
  const { isPending, execute } = useFormAction();
  const isOwner = member.role === "owner";
  const isSelf = memberUser.id === currentUserId;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-foreground flex items-center justify-center text-sm font-bold text-background">
          {memberUser.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{memberUser.name}</span>
            {isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
            {member.role === "admin" && <Shield className="w-4 h-4 text-blue-500" />}
            {isSelf && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 font-bold uppercase tracking-widest">
                {t("you")}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">{memberUser.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && !isOwner ? (
          <form action={execute(updateMemberRole)} className="flex items-center gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <select
              name="role"
              defaultValue={member.role}
              disabled={isPending}
              onChange={(e) => e.target.form?.requestSubmit()}
              className="border border-input bg-background py-1 px-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              {NON_OWNER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </select>
          </form>
        ) : (
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-2 py-1 bg-secondary">
            {t(member.role as TeamRole)}
          </span>
        )}
        {isAdmin && !isOwner && !isSelf && (
          <form action={execute(removeMember)}>
            <input type="hidden" name="memberId" value={member.id} />
            <button
              type="submit"
              disabled={isPending}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 disabled:opacity-50"
              title={t("removeMember")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function InvitationRow({ inv, isAdmin }: { inv: InvitationData; isAdmin: boolean }) {
  const t = useTranslations("Team");
  const { isPending, execute } = useFormAction();

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
            <span>
              {t("expires")} {new Date(inv.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-2 py-1 bg-secondary">
          {t(inv.role as TeamRole)}
        </span>
        <span className="text-xs font-medium uppercase tracking-widest text-yellow-600 px-2 py-1 bg-yellow-500/10">
          {t("pending")}
        </span>
        {isAdmin && (
          <form action={execute(cancelInvitation)}>
            <input type="hidden" name="invitationId" value={inv.id} />
            <button
              type="submit"
              disabled={isPending}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 disabled:opacity-50"
              title={t("cancelInvitation")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
