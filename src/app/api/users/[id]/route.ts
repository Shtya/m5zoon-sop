import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm, requireUser, sanitizeUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { COUNTRIES, DEPARTMENTS } from "@/lib/constants";
import { can, isPermission, isSuperAdmin } from "@/lib/permissions";
import { userBodySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

function aclFields(
  actor: SessionUser,
  body: {
    extraPermissions?: string[];
    deniedPermissions?: string[];
    allowedCountries?: string[];
    allowedDepartments?: string[];
    role: string;
  },
) {
  if (!isSuperAdmin(actor) || body.role === "super_admin") {
    return {
      extraPermissions: [] as string[],
      deniedPermissions: [] as string[],
      allowedCountries: [] as string[],
      allowedDepartments: [] as string[],
    };
  }
  const countryIds = new Set(COUNTRIES.map((c) => c.id));
  const deptIds = new Set(DEPARTMENTS.map((d) => d.id));
  return {
    extraPermissions: (body.extraPermissions ?? []).filter(isPermission),
    deniedPermissions: (body.deniedPermissions ?? []).filter(isPermission),
    allowedCountries: (body.allowedCountries ?? []).filter((id) => countryIds.has(id as (typeof COUNTRIES)[number]["id"])),
    allowedDepartments: (body.allowedDepartments ?? []).filter((id) => deptIds.has(id as (typeof DEPARTMENTS)[number]["id"])),
  };
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const isSelf = user.id === id;
  if (!isSelf && !can(user, "users.edit")) {
    return jsonError("غير مصرح بتنفيذ هذه العملية", 403);
  }

  const body = await readJson<unknown>(request);
  const parsed = userBodySchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.[0];
    if (path === "email") return jsonError("البريد الإلكتروني غير صالح", 400);
    if (path === "password") return jsonError("كلمة المرور يجب أن تكون 4 أحرف على الأقل", 400);
    if (path === "name") return jsonError("يرجى كتابة الاسم", 400);
    if (path === "department") return jsonError("يرجى اختيار القسم", 400);
    if (path === "role") return jsonError("الدور غير صالح", 400);
    return jsonError(issue?.message || "بيانات غير صالحة", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return jsonError("المستخدم غير موجود", 404);

  if (!can(user, "users.edit")) {
    parsed.data.role = user.role;
    parsed.data.active = user.active;
    parsed.data.department = user.department;
  }

  if (parsed.data.role === "super_admin" && !isSuperAdmin(user)) {
    return jsonError("فقط Super Admin يمكنه تعيين هذا الدور", 403);
  }
  if (existing.role === "super_admin" && !isSuperAdmin(user)) {
    return jsonError("لا يمكن تعديل حساب Super Admin", 403);
  }

  try {
    const data: {
      name: string;
      email: string;
      role: typeof parsed.data.role;
      department: string;
      position: string | null;
      phone: string | null;
      active: boolean;
      passwordHash?: string;
      extraPermissions?: string[];
      deniedPermissions?: string[];
      allowedCountries?: string[];
      allowedDepartments?: string[];
    } = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      department: parsed.data.department,
      position: parsed.data.position || null,
      phone: parsed.data.phone || null,
      active: parsed.data.active,
    };
    if (isSuperAdmin(user) && !isSelf) {
      Object.assign(data, aclFields(user, parsed.data));
    }
    if (parsed.data.password) {
      data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    }
    const updated = await prisma.user.update({ where: { id }, data });
    return jsonOk(sanitizeUser(updated));
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") return jsonError("المستخدم غير موجود", 404);
    if (code === "P2002") return jsonError("البريد الإلكتروني مسجل مسبقاً", 400);
    return jsonError("فشل حفظ المستخدم. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("users.delete");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  if (id === user.id) return jsonError("لا يمكنك حذف حسابك الحالي", 400);
  try {
    await prisma.user.delete({ where: { id } });
    return jsonOk({ message: "تم الحذف" });
  } catch {
    return jsonError("فشل حذف المستخدم. يرجى المحاولة مرة أخرى.", 500);
  }
}
