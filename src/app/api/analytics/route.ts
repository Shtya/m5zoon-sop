import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { requirePerm } from "@/lib/auth";
import { countryWhere, issueCountryWhere } from "@/lib/serialize";
import { COUNTRIES, DEPARTMENTS, ISSUE_CATS, SEVERITY } from "@/lib/constants";

export async function GET(request: Request) {
  const auth = await requirePerm("analytics.view");
  if (!auth.ok) return auth.response;
  const country = new URL(request.url).searchParams.get("country") || "all";
  const sopWhere = countryWhere(country);
  const issueWhere = issueCountryWhere(country);

  try {
    const [
      sops,
      issues,
      views,
      feedback,
      acks,
      users,
    ] = await Promise.all([
      prisma.sop.findMany({
        where: sopWhere,
        include: { countries: true, acknowledgments: true },
      }),
      prisma.issue.findMany({
        where: issueWhere,
        include: { countries: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sopView.findMany({
        where: { sop: sopWhere },
        include: { user: true, sop: { include: { countries: true } } },
      }),
      prisma.sopFeedback.findMany({ where: { sop: sopWhere } }),
      prisma.sopAcknowledgment.findMany({ where: { sop: sopWhere } }),
      prisma.user.findMany({ where: { active: true } }),
    ]);

    const now = Date.now();
    const reviewNeeded = sops.filter((s) => {
      if (!s.reviewDate) return false;
      const diff = (s.reviewDate.getTime() - now) / 864e5;
      return diff <= 30;
    });

    const byUser = users.map((u) => ({
      userId: u.id,
      name: u.name,
      views: views.filter((v) => v.userId === u.id).length,
      acks: acks.filter((a) => a.userId === u.id).length,
    })).sort((a, b) => b.views - a.views);

    const byDept = DEPARTMENTS.map((d) => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      color: d.color,
      sops: sops.filter((s) => s.department === d.id).length,
      views: views.filter((v) => v.sop.department === d.id).length,
      issues: issues.filter((i) => i.department === d.id).length,
    })).filter((d) => d.sops || d.views || d.issues);

    const byCountry = COUNTRIES.map((c) => ({
      id: c.id,
      name: c.name,
      flag: c.flag,
      color: c.color,
      sops: sops.filter((s) => s.countries.length === 0 || s.countries.some((x) => x.countryId === c.id)).length,
      issues: issues.filter((i) => i.countries.length === 0 || i.countries.some((x) => x.countryId === c.id)).length,
      views: views.filter(
        (v) => v.sop.countries.length === 0 || v.sop.countries.some((x) => x.countryId === c.id),
      ).length,
    }));

    const byCategory = ISSUE_CATS.map((c) => ({
      ...c,
      count: issues.filter((i) => i.category === c.id).length,
    })).filter((c) => c.count > 0);

    const bySeverity = SEVERITY.map((s) => ({
      ...s,
      count: issues.filter((i) => i.severity === s.id).length,
    })).filter((s) => s.count > 0);

    return jsonOk({
      sop: {
        total: sops.length,
        views: sops.reduce((a, s) => a + s.views, 0),
        helpful: feedback.filter((f) => f.helpful).length,
        notHelpful: feedback.filter((f) => !f.helpful).length,
        acknowledgments: acks.length,
        reviewNeeded: reviewNeeded.map((s) => ({
          id: s.id,
          title: s.title,
          reviewDate: s.reviewDate?.toISOString().slice(0, 10),
          expired: s.reviewDate ? s.reviewDate.getTime() < now : false,
        })),
        mostViewed: [...sops]
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map((s) => ({ id: s.id, title: s.title, department: s.department, views: s.views })),
        byDepartment: byDept,
        byCountry,
        byUser,
      },
      issues: {
        total: issues.length,
        open: issues.filter((i) => i.status === "open").length,
        progress: issues.filter((i) => i.status === "progress").length,
        resolved: issues.filter((i) => i.status === "resolved").length,
        recurring: issues.filter((i) => i.isRecurring).length,
        byDepartment: byDept,
        byCountry,
        byCategory,
        bySeverity,
        mostCommon: [...issues]
          .filter((i) => i.isRecurring)
          .sort((a, b) => b.recurrenceCount - a.recurrenceCount)
          .slice(0, 5)
          .map((i) => ({ id: i.id, title: i.title, department: i.department, recurrenceCount: i.recurrenceCount })),
        recent: issues.slice(0, 8).map((i) => ({
          id: i.id,
          title: i.title,
          status: i.status,
          severity: i.severity,
          date: i.issueDate.toISOString().slice(0, 10),
        })),
      },
    });
  } catch {
    return jsonError("فشل تحميل التحليلات. يرجى المحاولة مرة أخرى.", 500);
  }
}
