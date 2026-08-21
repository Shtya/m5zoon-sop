import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm, requireUser, sanitizeUser } from "@/lib/auth";
import { COUNTRIES, DEPARTMENTS, initials } from "@/lib/constants";
import { isPermission, isSuperAdmin } from "@/lib/permissions";
import { userBodySchema } from "@/lib/validation";
import type { SessionUser } from "@/lib/auth";

function aclFields(actor: SessionUser, body: {
  extraPermissions?: string[];
  deniedPermissions?: string[];
  allowedCountries?: string[];
  allowedDepartments?: string[];
  role: string;
}) {
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
    allowedCountries: (body.allowedCountries ?? []).filter((id) => countryIds.has(id as typeof COUNTRIES[number]["id"])),
    allowedDepartments: (body.allowedDepartments ?? []).filter((id) => deptIds.has(id as typeof DEPARTMENTS[number]["id"])),
  };
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return jsonOk(
    users.map((u) => {
      const safe = sanitizeUser(u);
      if (isSuperAdmin(auth.user) || safe.id === auth.user.id) return safe;
      return { ...safe, extraPermissions: [], deniedPermissions: [], allowedCountries: [], allowedDepartments: [] };
    }),
  );
}

export async function POST(request: Request) {
  const auth = await requirePerm("users.create");
  if (!auth.ok) return auth.response;
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
    return jsonError(issue?.message || "يرجى ملء الحقول المطلوبة", 400);
  }
  if (!parsed.data.password) return jsonError("يرجى إدخال كلمة المرور", 400);
  if (parsed.data.role === "super_admin" && !isSuperAdmin(auth.user)) {
    return jsonError("فقط Super Admin يمكنه تعيين هذا الدور", 403);
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        role: parsed.data.role,
        department: parsed.data.department,
        position: parsed.data.position || null,
        phone: parsed.data.phone || null,
        avatar: initials(parsed.data.name),
        active: parsed.data.active,
        ...aclFields(auth.user, parsed.data),
      },
    });
    return jsonOk(sanitizeUser(user), 201);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") return jsonError("البريد الإلكتروني مسجل مسبقاً", 400);
    return jsonError("فشل حفظ المستخدم. لم يتم إنشاء الحساب. يرجى المحاولة مرة أخرى.", 500);
  }
}
