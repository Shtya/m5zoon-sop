import { loginSchema } from "@/lib/validation";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sanitizeUser, setSessionCookie, signSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await readJson<unknown>(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return jsonError("يرجى إدخال البريد وكلمة المرور", 400);

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("البريد أو كلمة المرور غير صحيحة", 401);
    if (!user.active) return jsonError("هذا الحساب موقوف", 403);

    const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!match) return jsonError("البريد أو كلمة المرور غير صحيحة", 401);

    const token = await signSession({ id: user.id, role: user.role, email: user.email });
    await setSessionCookie(token);
    return jsonOk({ user: sanitizeUser(user) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    console.error("LOGIN_FAILED", e);
    if (message.includes("AUTH_SECRET")) {
      return jsonError("AUTH_SECRET غير مضبوط على السيرفر. أضفه في Vercel Environment Variables.", 500);
    }
    if (
      message.includes("DATABASE_URL") ||
      message.includes("Can't reach database") ||
      message.includes("P1001") ||
      message.includes("P1017") ||
      message.includes("PrismaClientInitialization")
    ) {
      return jsonError("تعذر الاتصال بقاعدة البيانات. تأكد أن DATABASE_URL موجود في Vercel.", 500);
    }
    return jsonError("فشل تسجيل الدخول بسبب خطأ في الخادم. يرجى المحاولة مرة أخرى.", 500);
  }
}
