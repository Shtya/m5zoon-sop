import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeSop, sopInclude } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requirePerm("sop.view");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<{ type?: string }>(request);
  const helpful = body?.type === "helpful";
  if (body?.type !== "helpful" && body?.type !== "notHelpful") {
    return jsonError("نوع التقييم غير صالح", 400);
  }

  try {
    const sop = await prisma.$transaction(async (tx) => {
      await tx.sopFeedback.upsert({
        where: { sopId_userId: { sopId: id, userId: user.id } },
        create: { sopId: id, userId: user.id, helpful },
        update: { helpful },
      });
      const counts = await tx.sopFeedback.groupBy({
        by: ["helpful"],
        where: { sopId: id },
        _count: { _all: true },
      });
      const helpfulCount = counts.find((c) => c.helpful)?._count._all ?? 0;
      const notHelpfulCount = counts.find((c) => !c.helpful)?._count._all ?? 0;
      await tx.sop.update({ where: { id }, data: { helpfulCount, notHelpfulCount } });
      return tx.sop.findUniqueOrThrow({ where: { id }, include: sopInclude });
    });
    return jsonOk(serializeSop(sop, user.id));
  } catch {
    return jsonError("فشل حفظ التقييم. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
