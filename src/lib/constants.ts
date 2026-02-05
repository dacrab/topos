// Role constants
export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");

// Status constants


