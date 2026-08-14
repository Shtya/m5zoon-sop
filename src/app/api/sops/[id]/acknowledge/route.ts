import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeSop, sopInclude } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("sop.acknowledge");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;

  try {
    const existing = await prisma.sop.findUnique({ where: { id } });
    if (!existing) return jsonError("الإجراء غير موجود", 404);
    await prisma.sopAcknowledgment.upsert({
      where: { sopId_userId_version: { sopId: id, userId: user.id, version: existing.version } },
      create: { sopId: id, userId: user.id, version: existing.version },
      update: {},
    });
    const sop = await prisma.sop.findUniqueOrThrow({ where: { id }, include: sopInclude });
    return jsonOk(serializeSop(sop, user.id));
  } catch {
    return jsonError("فشل تسجيل القراءة. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
