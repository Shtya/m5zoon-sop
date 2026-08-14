import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { issueInclude, serializeIssue } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requirePerm("issues.view");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const { id } = await ctx.params;
  const body = await readJson<{ text?: string }>(request);
  const text = body?.text?.trim();
  if (!text) return jsonError("يرجى كتابة تعليق", 400);
  try {
    const exists = await prisma.issue.findUnique({ where: { id } });
    if (!exists) return jsonError("المشكلة غير موجودة", 404);
    await prisma.issueComment.create({ data: { issueId: id, userId: user.id, text } });
    const issue = await prisma.issue.findUniqueOrThrow({ where: { id }, include: issueInclude });
    return jsonOk(serializeIssue(issue), 201);
  } catch {
    return jsonError("فشل إرسال التعليق. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
