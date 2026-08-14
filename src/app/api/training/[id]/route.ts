import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeTrainingPath, trainingPathInclude } from "@/lib/serialize";
import { trainingPathBodySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

async function sopTitles(sopIds: (string | null)[]) {
  const ids = [...new Set(sopIds.filter(Boolean))] as string[];
  if (!ids.length) return {} as Record<string, string>;
  const rows = await prisma.sop.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r.title]));
}

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("training.view");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    const path = await prisma.trainingPath.findUnique({ where: { id }, include: trainingPathInclude });
    if (!path) return jsonError("المسار غير موجود", 404);
    const titles = await sopTitles(path.steps.map((s) => s.sopId));
    return jsonOk(serializeTrainingPath(path, { currentUserId: auth.user.id, sopTitles: titles }));
  } catch {
    return jsonError("فشل تحميل المسار.", 500);
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requirePerm("training.manage");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await readJson<unknown>(request);
  const parsed = trainingPathBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }
  const f = parsed.data;
  try {
    const exists = await prisma.trainingPath.findUnique({ where: { id } });
    if (!exists) return jsonError("المسار غير موجود", 404);
    const path = await prisma.$transaction(async (tx) => {
      await tx.trainingPathStep.deleteMany({ where: { pathId: id } });
      return tx.trainingPath.update({
        where: { id },
        data: {
          title: f.title,
          department: f.department,
          description: f.description || "",
          active: f.active ?? true,
          steps: {
            create: f.steps.map((s, i) => ({
              sortOrder: i,
              type: s.type,
              title: s.title,
              description: s.description || "",
              content: s.content || "",
              videoUrl: s.videoUrl || "",
              sopId: s.type === "read_sop" ? s.sopId || null : null,
              required: s.required ?? true,
            })),
          },
        },
        include: trainingPathInclude,
      });
    });
    const titles = await sopTitles(path.steps.map((s) => s.sopId));
    return jsonOk(serializeTrainingPath(path, { currentUserId: auth.user.id, sopTitles: titles }));
  } catch {
    return jsonError("فشل تحديث المسار.", 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("training.manage");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    await prisma.trainingPath.delete({ where: { id } });
    return jsonOk({ message: "تم الحذف" });
  } catch {
    return jsonError("فشل حذف المسار.", 500);
  }
}
