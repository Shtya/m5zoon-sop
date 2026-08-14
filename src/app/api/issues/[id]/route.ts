import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { issueInclude, serializeIssue } from "@/lib/serialize";
import { cleanStrings, issueBodySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("issues.view");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const issue = await prisma.issue.findUnique({ where: { id }, include: issueInclude });
  if (!issue) return jsonError("المشكلة غير موجودة", 404);
  return jsonOk(serializeIssue(issue));
}

export async function PUT(request: Request, ctx: Ctx) {
  const auth = await requirePerm("issues.edit");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<unknown>(request);
  const parsed = issueBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }
  const f = parsed.data;
  try {
    const issue = await prisma.$transaction(async (tx) => {
      await tx.issueCountry.deleteMany({ where: { issueId: id } });
      await tx.issueAffectedUser.deleteMany({ where: { issueId: id } });
      return tx.issue.update({
        where: { id },
        data: {
          title: f.title,
          department: f.department,
          category: f.category,
          severity: f.severity,
          status: f.status,
          issueDate: new Date(f.date),
          updatedById: user.id,
          description: f.description,
          rootCauses: cleanStrings(f.rootCauses),
          solution: f.solution,
          preventionSteps: cleanStrings(f.preventionSteps),
          videoLink: f.videoLink || "",
          isRecurring: f.isRecurring,
          recurrenceCount: f.isRecurring ? f.recurrenceCount : 1,
          countries: { create: f.countries.map((countryId) => ({ countryId })) },
          affectedUsers: {
            create: [...new Set(f.affectedUsers)].map((userId) => ({ userId })),
          },
        },
        include: issueInclude,
      });
    });
    return jsonOk(serializeIssue(issue));
  } catch {
    return jsonError("فشل حفظ المشكلة. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requirePerm("issues.delete");
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    await prisma.issue.delete({ where: { id } });
    return jsonOk({ message: "تم الحذف" });
  } catch {
    return jsonError("فشل حذف المشكلة. يرجى المحاولة مرة أخرى.", 500);
  }
}
