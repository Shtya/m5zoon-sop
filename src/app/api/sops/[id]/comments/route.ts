import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeSop, sopInclude } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requirePerm("sop.comment");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<{ text?: string }>(request);
  const text = body?.text?.trim();
  if (!text) return jsonError("يرجى كتابة تعليق", 400);

  try {
    const exists = await prisma.sop.findUnique({ where: { id } });
    if (!exists) return jsonError("الإجراء غير موجود", 404);
    await prisma.sopComment.create({ data: { sopId: id, userId: user.id, text } });
    const sop = await prisma.sop.findUniqueOrThrow({ where: { id }, include: sopInclude });
    return jsonOk(serializeSop(sop, user.id), 201);
  } catch {
    return jsonError("فشل إرسال التعليق. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
