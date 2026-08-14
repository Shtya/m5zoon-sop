import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { serializeTrainingPath, trainingPathInclude } from "@/lib/serialize";
import { trainingPathBodySchema } from "@/lib/validation";

async function sopTitles(sopIds: (string | null)[]) {
  const ids = [...new Set(sopIds.filter(Boolean))] as string[];
  if (!ids.length) return {} as Record<string, string>;
  const rows = await prisma.sop.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r.title]));
}

export async function GET(request: Request) {
  const auth = await requirePerm("training.view");
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department") || "all";
  const mine = searchParams.get("mine") === "1";

  const where: Prisma.TrainingPathWhereInput = {
    AND: [
      { active: true },
      department !== "all" ? { department } : {},
      mine ? { enrollments: { some: { userId: auth.user.id } } } : {},
    ],
  };

  try {
    const paths = await prisma.trainingPath.findMany({
      where,
      include: trainingPathInclude,
      orderBy: { createdAt: "desc" },
    });
    const titles = await sopTitles(paths.flatMap((p) => p.steps.map((s) => s.sopId)));
    return jsonOk({
      paths: paths.map((p) => serializeTrainingPath(p, { currentUserId: auth.user.id, sopTitles: titles })),
    });
  } catch {
    return jsonError("فشل تحميل مسارات التدريب.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requirePerm("training.manage");
  if (!auth.ok) return auth.response;
  const body = await readJson<unknown>(request);
  const parsed = trainingPathBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }
  const f = parsed.data;
  try {
    const path = await prisma.trainingPath.create({
      data: {
        title: f.title,
        department: f.department,
        description: f.description || "",
        active: f.active ?? true,
        createdById: auth.user.id,
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
    const titles = await sopTitles(path.steps.map((s) => s.sopId));
    return jsonOk(serializeTrainingPath(path, { currentUserId: auth.user.id, sopTitles: titles }), 201);
  } catch {
    return jsonError("فشل حفظ مسار التدريب.", 500);
  }
}
