import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeTrainingPath, trainingPathInclude } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string; stepId: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("training.progress");
  if (!auth.ok) return auth.response;
  const { id, stepId } = await ctx.params;

  try {
    const path = await prisma.trainingPath.findUnique({
      where: { id },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    if (!path || !path.active) return jsonError("المسار غير موجود", 404);

    const step = path.steps.find((s) => s.id === stepId);
    if (!step) return jsonError("الخطوة غير موجودة", 404);

    let enrollment = await prisma.trainingEnrollment.findUnique({
      where: { pathId_userId: { pathId: id, userId: auth.user.id } },
      include: { progress: true },
    });

    if (!enrollment) {
      enrollment = await prisma.trainingEnrollment.create({
        data: {
          pathId: id,
          userId: auth.user.id,
          status: "in_progress",
          startedAt: new Date(),
        },
        include: { progress: true },
      });
    }

    const doneIds = new Set(enrollment.progress.map((p) => p.stepId));
    for (const s of path.steps) {
      if (s.id === stepId) break;
      if (s.required && !doneIds.has(s.id)) {
        return jsonError("يجب إكمال الخطوات السابقة أولًا", 400);
      }
    }

    await prisma.trainingStepProgress.upsert({
      where: { enrollmentId_stepId: { enrollmentId: enrollment.id, stepId } },
      create: { enrollmentId: enrollment.id, stepId },
      update: { completedAt: new Date() },
    });

    const progress = await prisma.trainingStepProgress.findMany({ where: { enrollmentId: enrollment.id } });
    const requiredIds = path.steps.filter((s) => s.required).map((s) => s.id);
    const allRequiredDone = requiredIds.every((sid) => progress.some((p) => p.stepId === sid) || sid === stepId);
    const allDone = path.steps.every((s) => progress.some((p) => p.stepId === s.id) || s.id === stepId);

    await prisma.trainingEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: allDone || allRequiredDone ? "completed" : "in_progress",
        startedAt: enrollment.startedAt ?? new Date(),
        completedAt: allDone || allRequiredDone ? new Date() : null,
      },
    });

    const fresh = await prisma.trainingPath.findUniqueOrThrow({ where: { id }, include: trainingPathInclude });
    const sopIds = fresh.steps.map((s) => s.sopId).filter(Boolean) as string[];
    const titles = sopIds.length
      ? Object.fromEntries(
          (
            await prisma.sop.findMany({ where: { id: { in: sopIds } }, select: { id: true, title: true } })
          ).map((r) => [r.id, r.title]),
        )
      : {};
    return jsonOk(serializeTrainingPath(fresh, { currentUserId: auth.user.id, sopTitles: titles }));
  } catch {
    return jsonError("فشل تسجيل إكمال الخطوة.", 500);
  }
}
