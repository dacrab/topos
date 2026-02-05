// Role constants
export const TEAM_ROLES = ["owner", "admin", "agent", "viewer"] as const;
export const NON_OWNER_ROLES = TEAM_ROLES.filter((r) => r !== "owner");

// Status constants
