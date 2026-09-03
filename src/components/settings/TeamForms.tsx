"use client";

import { Clock, Mail, Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  cancelInvitation,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
} from "@/app/(dashboard)/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import type { InvitationData, TeamMemberData } from "@/lib/types";
import { NON_OWNER_ROLES } from "@/lib/types";
import { getInitials } from "@/lib/utils";

export function InviteForm() {
  const t = useTranslations("Team");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await inviteTeamMember(formData);
      toast[result.success ? "success" : "error"](result.message);
      if (result.success) formRef.current?.reset();
    });
  };

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{t("inviteTeamMember")}</h3>
      </div>
      <form ref={formRef} action={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
  const [isPending, startTransition] = useTransition();
  const isOwner = member.role === "owner";
  const isSelf = memberUser.id === currentUserId;

  const handleRoleChange = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateMemberRole(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  };

  const handleRemove = async (formData: FormData) => {
    startTransition(async () => {
      const result = await removeMember(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="avatar-sm">{getInitials(memberUser.name, memberUser.email)}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{memberUser.name}</span>
            {isOwner && <Badge variant="warning">{t(member.role)}</Badge>}
            {isSelf && <Badge variant="primary">{t("you")}</Badge>}
          </div>
          <p className="mono-caption truncate">{memberUser.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isAdmin && !isOwner ? (
          <form action={handleRoleChange} className="flex items-center gap-2">
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
          <form action={handleRemove}>
            <input type="hidden" name="memberId" value={member.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={t("removeMember")}
              aria-label={t("removeMember")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function InvitationRow({ inv, isAdmin }: { inv: InvitationData; isAdmin: boolean }) {
  const t = useTranslations("Team");
  const [isPending, startTransition] = useTransition();

  const handleCancel = async (formData: FormData) => {
    startTransition(async () => {
      const result = await cancelInvitation(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 border border-dashed border-border rounded-full flex items-center justify-center text-muted-foreground shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{inv.email}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {t("expires")} {formatDate(inv.expiresAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge>{t(inv.role)}</Badge>
        <Badge variant="warning">{t("pending")}</Badge>
        {isAdmin && (
          <form action={handleCancel}>
            <input type="hidden" name="invitationId" value={inv.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title={t("cancelInvitation")}
              aria-label={t("cancelInvitation")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
