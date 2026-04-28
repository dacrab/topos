export type ActionResult = { success: boolean; message: string };

export type TeamMemberData = {
  member: { id: string; role: string };
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export type InvitationData = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");
export type TeamRole = (typeof TEAM_ROLES)[number];

export const UPLOAD_TYPES = ["listing", "logo", "agent", "user"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];
