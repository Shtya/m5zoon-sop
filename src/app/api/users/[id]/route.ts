import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm, requireUser, sanitizeUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { userBodySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const isSelf = user.id === id;
  if (!isSelf && !can(user.role, "users.edit")) {
    return jsonError("غير مصرح بتنفيذ هذه العملية", 403);
  }

  const body = await readJson<unknown>(request);
  const parsed = userBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("بيانات غير صالحة", 400);

  if (!can(user.role, "users.edit")) {
    parsed.data.role = user.role;
    parsed.data.active = user.active;
    parsed.data.department = user.department;
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
    } = {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      department: parsed.data.department,
      position: parsed.data.position || null,
      phone: parsed.data.phone || null,
      active: parsed.data.active,
    };
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
