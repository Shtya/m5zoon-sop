import type { Role } from "@prisma/client";

export type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "sop.view"
  | "sop.create"
  | "sop.edit"
  | "sop.delete"
  | "sop.version"
  | "sop.acknowledge"
  | "sop.comment"
  | "issues.view"
  | "issues.create"
  | "issues.edit"
  | "issues.delete"
  | "analytics.view"
  | "backup.manage"
  | "training.view"
  | "training.manage"
  | "training.progress";

const ROLE_PERMS: Record<Role, Permission[]> = {
  super_admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "sop.view",
    "sop.create",
    "sop.edit",
    "sop.delete",
    "sop.version",
    "sop.acknowledge",
    "sop.comment",
    "issues.view",
    "issues.create",
    "issues.edit",
    "issues.delete",
    "analytics.view",
    "backup.manage",
    "training.view",
    "training.manage",
    "training.progress",
  ],
  admin: [
    "sop.view",
    "sop.create",
    "sop.edit",
    "sop.delete",
    "sop.version",
    "sop.acknowledge",
    "sop.comment",
    "issues.view",
    "issues.create",
    "issues.edit",
    "issues.delete",
    "analytics.view",
    "training.view",
    "training.manage",
    "training.progress",
  ],
  team_leader: [
    "sop.view",
    "sop.edit",
    "sop.acknowledge",
    "sop.comment",
    "issues.view",
    "issues.create",
    "issues.edit",
    "analytics.view",
    "training.view",
    "training.progress",
  ],
  employee: [
    "sop.view",
    "sop.acknowledge",
    "sop.comment",
    "issues.view",
    "issues.create",
    "training.view",
    "training.progress",
  ],
};

export function can(role: Role, perm: Permission) {
  return ROLE_PERMS[role]?.includes(perm) ?? false;
}

export function permissionsFor(role: Role) {
  return ROLE_PERMS[role] ?? [];
}

/** Team leaders may edit SOPs in their own department only. */
export function canEditSop(role: Role, userDept: string, sopDept: string) {
  if (can(role, "sop.delete") || role === "admin" || role === "super_admin") return true;
  if (role === "team_leader" && can(role, "sop.edit")) return userDept === sopDept;
  return false;
}
