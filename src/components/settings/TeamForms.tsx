"use client";

import { Clock, Crown, Mail, Shield, Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  cancelInvitation,
  inviteTeamMember,
  removeMember,
  updateMemberRole,
} from "@/app/(dashboard)/settings/actions";
import { ArchTopBar } from "@/components/ui/arch-top";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import type { InvitationData, TeamMemberData, TeamRole } from "@/lib/types";
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
    <div className="border border-border/40 bg-card shadow-card rounded-2xl overflow-hidden">
      <ArchTopBar opacity="5" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t("inviteTeamMember")}</h3>
        </div>
        <form ref={formRef} action={handleSubmit} className="flex flex-col sm:flex-row gap-4">
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
          <Button type="submit" disabled={isPending} className="py-2">
            {isPending ? t("sending") : t("sendInvite")}
          </Button>
        </form>
      </div>
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
    <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="avatar-sm">{getInitials(memberUser.name, memberUser.email)}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{memberUser.name}</span>
            {isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
            {member.role === "admin" && <Shield className="w-4 h-4 text-blue-500" />}
            {isSelf && <Badge variant={isSelf ? "primary" : "default"}>{t("you")}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground font-mono">{memberUser.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && !isOwner ? (
          <form action={handleRoleChange} className="flex items-center gap-2">
            <input type="hidden" name="memberId" value={member.id} />
            <Select
              name="role"
              defaultValue={member.role}
              disabled={isPending}
              onChange={(e) => e.target.form?.requestSubmit()}
            >
              {NON_OWNER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </Select>
          </form>
        ) : (
          <Badge variant="default">{t(member.role as TeamRole)}</Badge>
        )}
        {isAdmin && !isOwner && !isSelf && (
          <form action={handleRemove}>
            <input type="hidden" name="memberId" value={member.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-red-500"
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
    <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-dashed border-border/50 rounded-full flex items-center justify-center text-muted-foreground">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium font-mono text-sm">{inv.email}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {t("expires")} {formatDate(inv.expiresAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="default">{t(inv.role as TeamRole)}</Badge>
        <Badge variant="primary">{t("pending")}</Badge>
        {isAdmin && (
          <form action={handleCancel}>
            <input type="hidden" name="invitationId" value={inv.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-red-500"
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
