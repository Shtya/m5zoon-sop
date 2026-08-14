import { getAuthUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return jsonError("غير مصرح — يرجى تسجيل الدخول", 401);
  return jsonOk({ user });
}
