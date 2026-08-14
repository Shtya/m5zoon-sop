import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm, requireUser } from "@/lib/auth";
import { canEditSop } from "@/lib/permissions";
import { bumpVersion, serializeSop, snapshotFromSop, sopInclude } from "@/lib/serialize";
import {
  cleanAttachments,
  cleanContacts,
  cleanRules,
  cleanSteps,
  cleanStrings,
  sopBodySchema,
} from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("sop.view");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;

  try {
    const existing = await prisma.sop.findUnique({ where: { id } });
    if (!existing) return jsonError("الإجراء غير موجود", 404);

    await prisma.$transaction([
      prisma.sop.update({ where: { id }, data: { views: { increment: 1 } } }),
      prisma.sopView.create({ data: { sopId: id, userId: user.id } }),
    ]);

    const sop = await prisma.sop.findUnique({ where: { id }, include: sopInclude });
    if (!sop) return jsonError("الإجراء غير موجود", 404);
    return jsonOk(serializeSop(sop, user.id));
  } catch {
    return jsonError("فشل تحميل الإجراء. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<unknown>(request);
  const parsed = sopBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }

  const existing = await prisma.sop.findUnique({ where: { id }, include: { countries: true } });
  if (!existing) return jsonError("الإجراء غير موجود", 404);
  if (!canEditSop(user.role, user.department, existing.department)) {
    return jsonError("غير مصرح بتعديل هذا الإجراء", 403);
  }

  const f = parsed.data;
  const steps = cleanSteps(f.steps);
  if (!steps.length) return jsonError("يرجى إضافة خطوة تنفيذ واحدة على الأقل", 400);
  const newVer = bumpVersion(existing.version);
  const previous = snapshotFromSop(existing);
  const current = snapshotFromSop({
    ...f,
    steps,
    videoLink: f.videoLink || "",
    reviewDate: f.reviewDate ? new Date(f.reviewDate) : null,
    countries: f.countries.map((countryId) => ({ countryId })),
  });

  try {
    const sop = await prisma.$transaction(async (tx) => {
      await tx.sopCountry.deleteMany({ where: { sopId: id } });
      return tx.sop.update({
        where: { id },
        data: {
          department: f.department,
          title: f.title,
          objective: f.objective,
          steps,
          decisionRules: cleanRules(f.decisionRules),
          escalationContacts: cleanContacts(f.escalationContacts),
          commonMistakes: cleanStrings(f.commonMistakes),
          videoLink: f.videoLink || "",
          attachments: cleanAttachments(f.attachments),
          keywords: cleanStrings(f.keywords),
          relatedStatuses: f.relatedStatuses,
          relatedActions: f.relatedActions,
          reviewDate: f.reviewDate ? new Date(f.reviewDate) : null,
          version: newVer,
          updatedById: user.id,
          countries: { create: f.countries.map((countryId) => ({ countryId })) },
          history: {
            create: {
              version: newVer,
              userId: user.id,
              changeReason: f.changeReason?.trim() || "تحديث",
              previousContent: previous,
              currentContent: current,
            },
          },
        },
        include: sopInclude,
      });
    });
    return jsonOk(serializeSop(sop, user.id));
  } catch {
    return jsonError("فشل حفظ SOP. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("sop.delete");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    await prisma.sop.delete({ where: { id } });
    return jsonOk({ message: "تم الحذف" });
  } catch {
    return jsonError("فشل حذف SOP. يرجى المحاولة مرة أخرى.", 500);
  }
}
