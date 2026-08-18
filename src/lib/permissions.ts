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

export const ALL_PERMISSIONS: Permission[] = [
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
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "users.view": "عرض المستخدمين",
  "users.create": "إنشاء مستخدم",
  "users.edit": "تعديل مستخدم",
  "users.delete": "حذف مستخدم",
  "sop.view": "عرض الإجراءات",
  "sop.create": "إنشاء SOP",
  "sop.edit": "تعديل SOP",
  "sop.delete": "حذف SOP",
  "sop.version": "إصدارات SOP",
  "sop.acknowledge": "تأكيد قراءة SOP",
  "sop.comment": "التعليق على SOP",
  "issues.view": "عرض المشاكل",
  "issues.create": "تسجيل مشكلة",
  "issues.edit": "تعديل مشكلة",
  "issues.delete": "حذف مشكلة",
  "analytics.view": "عرض التحليلات",
  "backup.manage": "النسخ الاحتياطي",
  "training.view": "عرض مسارات التدريب",
  "training.manage": "إنشاء وإدارة المسارات",
  "training.progress": "التسجيل وإكمال الخطوات",
};

export const PERMISSION_GROUPS: { title: string; keys: Permission[] }[] = [
  { title: "المستخدمين", keys: ["users.view", "users.create", "users.edit", "users.delete"] },
  {
    title: "الإجراءات (SOP)",
    keys: ["sop.view", "sop.create", "sop.edit", "sop.delete", "sop.version", "sop.acknowledge", "sop.comment"],
  },
  { title: "المشاكل اليومية", keys: ["issues.view", "issues.create", "issues.edit", "issues.delete"] },
  { title: "التدريب", keys: ["training.view", "training.manage", "training.progress"] },
  { title: "أخرى", keys: ["analytics.view", "backup.manage"] },
];

const ROLE_PERMS: Record<Role, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
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

export type PermissionHolder = {
  role: Role;
  department?: string;
  extraPermissions?: string[];
  deniedPermissions?: string[];
  allowedCountries?: string[];
  allowedDepartments?: string[];
};

export function isPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}

export function isSuperAdmin(user: PermissionHolder | Role) {
  return (typeof user === "string" ? user : user.role) === "super_admin";
}

export function permissionsFor(role: Role) {
  return ROLE_PERMS[role] ?? [];
}

export function effectivePermissions(user: PermissionHolder): Permission[] {
  if (isSuperAdmin(user)) return [...ALL_PERMISSIONS];
  const granted = new Set<Permission>(permissionsFor(user.role));
  for (const p of user.extraPermissions ?? []) {
    if (isPermission(p)) granted.add(p);
  }
  for (const p of user.deniedPermissions ?? []) {
    if (isPermission(p)) granted.delete(p);
  }
  return ALL_PERMISSIONS.filter((p) => granted.has(p));
}

export function can(userOrRole: Role | PermissionHolder, perm: Permission) {
  if (typeof userOrRole === "string") {
    return ROLE_PERMS[userOrRole]?.includes(perm) ?? false;
  }
  return effectivePermissions(userOrRole).includes(perm);
}

export function applyPermissionToggle(
  role: Role,
  extra: string[],
  denied: string[],
  perm: Permission,
  enabled: boolean,
) {
  const inRole = permissionsFor(role).includes(perm);
  const extraSet = new Set(extra.filter(isPermission));
  const deniedSet = new Set(denied.filter(isPermission));
  if (enabled) {
    deniedSet.delete(perm);
    if (!inRole) extraSet.add(perm);
    else extraSet.delete(perm);
  } else {
    extraSet.delete(perm);
    if (inRole) deniedSet.add(perm);
    else deniedSet.delete(perm);
  }
  return {
    extraPermissions: ALL_PERMISSIONS.filter((p) => extraSet.has(p)),
    deniedPermissions: ALL_PERMISSIONS.filter((p) => deniedSet.has(p)),
  };
}

export function viewCountryIds(user: PermissionHolder): string[] | null {
  if (isSuperAdmin(user)) return null;
  const allowed = user.allowedCountries ?? [];
  return allowed.length ? allowed : null;
}

export function viewDepartmentIds(user: PermissionHolder): string[] | null {
  if (isSuperAdmin(user)) return null;
  const allowed = user.allowedDepartments ?? [];
  return allowed.length ? allowed : null;
}

export function writeDepartmentIds(user: PermissionHolder): string[] | null {
  if (isSuperAdmin(user)) return null;
  const allowed = user.allowedDepartments ?? [];
  if (allowed.length) return allowed;
  if (user.role === "admin" || can(user, "sop.delete") || can(user, "issues.delete") || can(user, "training.manage")) {
    return null;
  }
  return user.department ? [user.department] : [];
}

export function canAccessCountry(user: PermissionHolder, countryId: string) {
  const ids = viewCountryIds(user);
  return !ids || ids.includes(countryId);
}

export function canAccessDepartment(user: PermissionHolder, dept: string, mode: "view" | "write") {
  const ids = mode === "view" ? viewDepartmentIds(user) : writeDepartmentIds(user);
  return !ids || ids.includes(dept);
}

export function canSeeCountries(user: PermissionHolder, recordCountries: string[]) {
  const ids = viewCountryIds(user);
  if (!ids) return true;
  if (!recordCountries.length) return true;
  return recordCountries.some((id) => ids.includes(id));
}

export function canEditSop(user: PermissionHolder, sopDept: string) {
  if (!can(user, "sop.edit")) return false;
  return canAccessDepartment(user, sopDept, "write");
}
