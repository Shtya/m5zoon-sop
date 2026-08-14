import { loginSchema } from "@/lib/validation";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sanitizeUser, setSessionCookie, signSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
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
}
