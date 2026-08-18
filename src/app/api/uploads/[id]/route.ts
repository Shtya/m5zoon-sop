import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    const file = await prisma.upload.findUnique({ where: { id } });
    if (!file) return jsonError("الصورة غير موجودة", 404);
    return new Response(Buffer.from(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.data.length),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return jsonError("فشل تحميل الصورة.", 500);
  }
}
