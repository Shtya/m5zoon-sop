import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  if (!can(auth.user, "sop.create") && !can(auth.user, "sop.edit")) {
    return jsonError("غير مصرح برفع صور للإجراءات", 403);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("يرجى اختيار صورة", 400);
    if (file.size > MAX_BYTES) return jsonError("حجم الصورة أكبر من 2MB", 400);
    const mime = file.type || "application/octet-stream";
    if (!ALLOWED.has(mime)) return jsonError("يُسمح بصور JPG أو PNG أو WEBP أو GIF فقط", 400);

    const data = Buffer.from(await file.arrayBuffer());
    const row = await prisma.upload.create({
      data: {
        mimeType: mime,
        filename: file.name.slice(0, 180) || "image",
        data,
        createdById: auth.user.id,
      },
    });
    return jsonOk({ id: row.id, url: `/api/uploads/${row.id}` }, 201);
  } catch {
    return jsonError("فشل رفع الصورة. يرجى المحاولة مرة أخرى.", 500);
  }
}
