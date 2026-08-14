import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { requirePerm, sanitizeUser } from "@/lib/auth";
import { issueInclude, serializeIssue, serializeSop, sopInclude } from "@/lib/serialize";

export async function GET() {
  const auth = await requirePerm("backup.manage");
  if (!auth.ok) return auth.response;
  try {
    const [users, countries, sops, issues] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.country.findMany(),
      prisma.sop.findMany({ include: sopInclude, orderBy: { createdAt: "asc" } }),
      prisma.issue.findMany({ include: issueInclude, orderBy: { createdAt: "asc" } }),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      users: users.map(sanitizeUser),
      countries,
      sops: sops.map((s) => serializeSop(s)),
      issues: issues.map(serializeIssue),
    };
    return jsonOk(payload);
  } catch {
    return jsonError("فشل إنشاء النسخة الاحتياطية. يرجى المحاولة مرة أخرى.", 500);
  }
}
