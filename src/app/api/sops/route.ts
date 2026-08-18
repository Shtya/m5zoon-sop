import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { canAccessDepartment } from "@/lib/permissions";
import { sanitizeRecordCountries, scopedCountryWhere, scopedDepartmentWhere, serializeSop, snapshotFromSop, sopInclude } from "@/lib/serialize";
import {
  cleanAttachments,
  cleanContacts,
  cleanRules,
  cleanSteps,
  cleanStrings,
  sopBodySchema,
} from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requirePerm("sop.view");
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const department = searchParams.get("department") || "all";
  const country = searchParams.get("country") || "all";
  const status = (searchParams.get("status") || "").trim();
  const action = (searchParams.get("action") || "").trim();
  const smart = searchParams.get("smart") === "1";

  const where: Prisma.SopWhereInput = {
    AND: [
      scopedCountryWhere(user, country),
      scopedDepartmentWhere(user, department),
      status ? { relatedStatuses: { has: status } } : {},
      action ? { relatedActions: { has: action } } : {},
    ],
  };

  if (q) {
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);
    where.AND = [
      ...(where.AND as Prisma.SopWhereInput[]),
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { objective: { contains: q, mode: "insensitive" } },
          ...tokens.map((t) => ({ title: { contains: t, mode: "insensitive" as const } })),
          ...tokens.map((t) => ({ objective: { contains: t, mode: "insensitive" as const } })),
          { keywords: { hasSome: tokens } },
          { relatedStatuses: { hasSome: tokens } },
          { relatedActions: { hasSome: tokens } },
        ],
      },
    ];
  }

  try {
    const sops = await prisma.sop.findMany({
      where,
      include: sopInclude,
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({
      sops: sops.map((s) => serializeSop(s, user.id)),
      reason: smart && q ? `نتائج البحث عن «${q}» من قاعدة البيانات` : undefined,
    });
  } catch {
    return jsonError("فشل تحميل الإجراءات. يرجى المحاولة مرة أخرى.", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requirePerm("sop.create");
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const body = await readJson<unknown>(request);
  const parsed = sopBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "بيانات غير صالحة", 400);
  }
  const f = parsed.data;
  if (!canAccessDepartment(user, f.department, "write")) {
    return jsonError("غير مصرح بإنشاء إجراء لهذا القسم", 403);
  }
  const steps = cleanSteps(f.steps);
  if (!steps.length) return jsonError("يرجى إضافة خطوة تنفيذ واحدة على الأقل", 400);
  const countries = sanitizeRecordCountries(user, f.countries);

  try {
    const sop = await prisma.sop.create({
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
        version: "1.0",
        createdById: user.id,
        updatedById: user.id,
        countries: { create: countries.map((countryId) => ({ countryId })) },
        history: {
          create: {
            version: "1.0",
            userId: user.id,
            changeReason: f.changeReason?.trim() || "إنشاء أولي",
            currentContent: snapshotFromSop({
              ...f,
              steps,
              videoLink: f.videoLink || "",
              reviewDate: f.reviewDate ? new Date(f.reviewDate) : null,
              countries: countries.map((countryId) => ({ countryId })),
            }),
          },
        },
      },
      include: sopInclude,
    });
    return jsonOk(serializeSop(sop, user.id), 201);
  } catch {
    return jsonError("فشل حفظ SOP. لم يتم حفظ التغييرات. يرجى المحاولة مرة أخرى.", 500);
  }
}
