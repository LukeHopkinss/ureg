export const MEMBER_ROLES = ["admin", "member", "viewer"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Scopes for machine credentials (CI tokens, SDK service tokens). */
export const TOKEN_SCOPES = [
  "automation:read",
  "automation:write",
  "execution:create",
  "heartbeat:create",
] as const;
export type TokenScope = (typeof TOKEN_SCOPES)[number];
