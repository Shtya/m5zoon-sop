import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { serializeTrainingPath, trainingPathInclude } from "@/lib/serialize";
import { trainingEnrollSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requirePerm("training.progress");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await readJson<unknown>(request);
  const parsed = trainingEnrollSchema.safeParse(body ?? {});
  if (!parsed.success) return jsonError("بيانات غير صالحة", 400);

  const targetUserId = parsed.data.userId || auth.user.id;
  if (targetUserId !== auth.user.id && !can(auth.user.role, "training.manage")) {
    return jsonError("غير مصرح بتسجيل موظف آخر في المسار", 403);
  }

  try {
    const path = await prisma.trainingPath.findUnique({ where: { id } });
    if (!path || !path.active) return jsonError("المسار غير موجود", 404);

    await prisma.trainingEnrollment.upsert({
      where: { pathId_userId: { pathId: id, userId: targetUserId } },
      create: {
        pathId: id,
        userId: targetUserId,
        status: "in_progress",
        startedAt: new Date(),
      },
      update: {
        status: "in_progress",
        startedAt: new Date(),
        completedAt: null,
      },
    });

    const fresh = await prisma.trainingPath.findUniqueOrThrow({ where: { id }, include: trainingPathInclude });
    return jsonOk(serializeTrainingPath(fresh, { currentUserId: auth.user.id }), 201);
  } catch {
    return jsonError("فشل التسجيل في المسار.", 500);
  }
}
