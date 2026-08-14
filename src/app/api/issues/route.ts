import { IssueSeverity, IssueStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { issueCountryWhere, issueInclude, serializeIssue } from "@/lib/serialize";
import { cleanStrings, issueBodySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requirePerm("issues.view");
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const department = searchParams.get("department") || "all";
  const category = searchParams.get("category") || "all";
  const severity = searchParams.get("severity") || "all";
  const status = searchParams.get("status") || "all";
  const country = searchParams.get("country") || "all";
  const recurring = searchParams.get("recurring");

  const where: Prisma.IssueWhereInput = {
    AND: [
      issueCountryWhere(country),
      department !== "all" ? { department } : {},
      category !== "all" ? { category } : {},
      severity !== "all" ? { severity: severity as IssueSeverity } : {},
      status !== "all" ? { status: status as IssueStatus } : {},
      recurring === "1" ? { isRecurring: true } : {},
      recurring === "0" ? { isRecurring: false } : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  try {
    const issues = await prisma.issue.findMany({
      where,
      include: issueInclude,
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ issues: issues.map(serializeIssue) });
  } catch {
    return jsonError("فشل تحميل المشاكل. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requirePerm("issues.create");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const body = await readJson<unknown>(request);
  const parsed = issueBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }
  const f = parsed.data;
  try {
    const issue = await prisma.issue.create({
      data: {
        title: f.title,
        department: f.department,
        category: f.category,
        severity: f.severity,
        status: f.status,
        issueDate: new Date(f.date),
        reportedById: user.id,
        createdById: user.id,
        updatedById: user.id,
        description: f.description,
        rootCauses: cleanStrings(f.rootCauses),
        solution: f.solution,
        preventionSteps: cleanStrings(f.preventionSteps),
        videoLink: f.videoLink || "",
        isRecurring: f.isRecurring || f.status === "recurring",
        recurrenceCount: f.isRecurring || f.status === "recurring" ? f.recurrenceCount : 1,
        countries: { create: f.countries.map((countryId) => ({ countryId })) },
        affectedUsers: {
          create: [...new Set(f.affectedUsers.length ? f.affectedUsers : [user.id])].map((userId) => ({ userId })),
        },
      },
      include: issueInclude,
    });
    return jsonOk(serializeIssue(issue), 201);
  } catch {
    return jsonError("فشل حفظ المشكلة. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
