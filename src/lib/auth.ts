import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import type { Permission } from "./permissions";
import { can } from "./permissions";
import { jsonError } from "./http";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string | null;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  createdAt: string;
};

const COOKIE = "makhzon_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(payload: { id: string; role: Role; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string | null;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  createdAt: Date;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
    phone: user.phone,
    avatar: user.avatar,
    active: user.active,
    createdAt: user.createdAt.toISOString().slice(0, 10),
  };
}

export async function getAuthUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = String(payload.id || "");
    if (!id) return null;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.active) return null;
    return sanitizeUser(user);
  } catch {
    return null;
  }
}

type AuthOk = { ok: true; user: SessionUser };
type AuthFail = { ok: false; response: Response };

export async function requireUser(): Promise<AuthOk | AuthFail> {
  const user = await getAuthUser();
  if (!user) return { ok: false, response: jsonError("غير مصرح — يرجى تسجيل الدخول", 401) };
  return { ok: true, user };
}

export async function requirePerm(perm: Permission): Promise<AuthOk | AuthFail> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (!can(auth.user.role, perm)) {
    return { ok: false, response: jsonError("غير مصرح بتنفيذ هذه العملية", 403) };
  }
  return auth;
}
