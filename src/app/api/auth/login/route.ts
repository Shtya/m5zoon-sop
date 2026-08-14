import { unstable_rethrow } from "next/navigation";
import { loginSchema } from "@/lib/validation";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { sanitizeUser, setSessionCookie, signSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return jsonError("DATABASE_URL غير موجود على Vercel. أضفه من Settings → Environment Variables ثم Redeploy.", 500);
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return jsonError("AUTH_SECRET غير مضبوط على Vercel (لازم 32 حرف على الأقل) ثم Redeploy.", 500);
  }

  const body = await readJson<unknown>(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("يرجى إدخال البريد وكلمة المرور", 400);

  const email = parsed.data.email.toLowerCase();

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("البريد أو كلمة المرور غير صحيحة", 401);
    if (!user.active) return jsonError("هذا الحساب موقوف", 403);

    const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!match) return jsonError("البريد أو كلمة المرور غير صحيحة", 401);

    const token = await signSession({ id: user.id, role: user.role, email: user.email });
    await setSessionCookie(token);
    return jsonOk({ user: sanitizeUser(user) });
  } catch (e) {
    unstable_rethrow(e);
    const message = e instanceof Error ? e.message : String(e);
    console.error("LOGIN_FAILED", message, e);
    if (
      message.includes("DATABASE_URL") ||
      message.includes("Can't reach database") ||
      message.includes("P1001") ||
      message.includes("P1017") ||
      message.includes("P2021") ||
      message.includes("PrismaClientInitialization") ||
      message.includes("Engine") ||
      message.includes("Query Engine")
    ) {
      return jsonError("تعذر الاتصال بقاعدة البيانات من Vercel. تأكد من DATABASE_URL (Supabase pooler + sslmode=require).", 500);
    }
    return jsonError("فشل تسجيل الدخول بسبب خطأ في الخادم. راجع Vercel Logs.", 500);
  }
}
