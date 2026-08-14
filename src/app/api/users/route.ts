import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm, sanitizeUser } from "@/lib/auth";
import { initials } from "@/lib/constants";
import { userBodySchema } from "@/lib/validation";

export async function GET() {
  const auth = await requirePerm("sop.view");
  if (!auth.ok) return auth.response;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return jsonOk(users.map(sanitizeUser));
}

export async function POST(request: Request) {
  const auth = await requirePerm("users.create");
  if (!auth.ok) return auth.response;
  const body = await readJson<unknown>(request);
  const parsed = userBodySchema.safeParse(body);
  if (!parsed.success) return jsonError("يرجى ملء الحقول المطلوبة", 400);
  if (!parsed.data.password) return jsonError("يرجى إدخال كلمة المرور", 400);

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
      },
    });
    return jsonOk(sanitizeUser(user), 201);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") return jsonError("البريد الإلكتروني مسجل مسبقاً", 400);
    return jsonError("فشل حفظ المستخدم. لم يتم إنشاء الحساب. يرجى المحاولة مرة أخرى.", 500);
  }
}
