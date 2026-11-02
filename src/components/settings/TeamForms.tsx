"use client";

import { Clock, Mail, Trash2, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import {
  cancelInvitation,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
} from "@/app/(dashboard)/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Panel } from "@/components/ui/page";
import { useFormAction } from "@/hooks/useFormAction";
import { formatDate } from "@/lib/format";
import type { InvitationData, TeamMemberData } from "@/lib/types";
import { NON_OWNER_ROLES } from "@/lib/types";
import { getInitials } from "@/lib/utils";

export function InviteForm() {
  const t = useTranslations("Team");
  const formRef = useRef<HTMLFormElement>(null);
  const { isPending, run } = useFormAction((result) => {
    if (result.success) formRef.current?.reset();
  });

  return (
    <Panel
      title={t("inviteTeamMember")}
      description={t("inviteDesc")}
      icon={<UserPlus className="h-4 w-4" />}
    >
      <form
        ref={formRef}
        action={run(inviteTeamMember)}
        className="flex flex-col gap-3 sm:flex-row"
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
        <Button type="submit" disabled={isPending}>
          {isPending ? t("sending") : t("sendInvite")}
        </Button>
      </form>
    </Panel>
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
  const { isPending, run } = useFormAction();
  const isOwner = member.role === "owner";
  const isSelf = memberUser.id === currentUserId;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <div className="avatar-sm">{getInitials(memberUser.name, memberUser.email)}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{memberUser.name}</span>
            {isOwner && <Badge variant="warning">{t(member.role)}</Badge>}
            {isSelf && <Badge variant="primary">{t("you")}</Badge>}
          </div>
          <p className="mono-caption truncate">{memberUser.email}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isAdmin && !isOwner ? (
          <form action={run(updateMemberRole)} className="flex items-center gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <Select
              name="role"
              defaultValue={member.role}
              disabled={isPending}
              onChange={(e) => e.target.form?.requestSubmit()}
              className="h-8 py-1"
            >
              {NON_OWNER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </Select>
          </form>
        ) : (
          !isOwner && <Badge>{t(member.role)}</Badge>
        )}
        {isAdmin && !isOwner && !isSelf && (
          <form action={run(removeMember)}>
            <input type="hidden" name="memberId" value={member.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title={t("removeMember")}
              aria-label={t("removeMember")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function InvitationRow({ inv, isAdmin }: { inv: InvitationData; isAdmin: boolean }) {
  const t = useTranslations("Team");
  const locale = useLocale();
  const { isPending, run } = useFormAction();

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-border text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{inv.email}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {t("expires")} {formatDate(inv.expiresAt, locale)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge>{t(inv.role)}</Badge>
        <Badge variant="warning">{t("pending")}</Badge>
        {isAdmin && (
          <form action={run(cancelInvitation)}>
            <input type="hidden" name="invitationId" value={inv.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title={t("cancelInvitation")}
              aria-label={t("cancelInvitation")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
