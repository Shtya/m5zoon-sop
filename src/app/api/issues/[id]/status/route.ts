import { IssueStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { issueInclude, serializeIssue } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requirePerm("issues.edit");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<{ status?: IssueStatus }>(request);
  if (!body?.status || !Object.values(IssueStatus).includes(body.status)) {
    return jsonError("حالة غير صالحة", 400);
  }
  try {
    const issue = await prisma.issue.update({
      where: { id },
      data: { status: body.status, updatedById: user.id },
      include: issueInclude,
    });
    return jsonOk(serializeIssue(issue));
  } catch {
    return jsonError("فشل تحديث الحالة. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
