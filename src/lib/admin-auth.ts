import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

const COOKIE = "pd_admin";

function matches(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Reviewer access. With no ADMIN_TOKEN set it is open in dev and closed in production.
export async function isAdmin(): Promise<boolean> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return process.env.NODE_ENV !== "production";
  const got = (await cookies()).get(COOKIE)?.value;
  return !!got && matches(got, token);
}

export async function adminLogin(input: string): Promise<boolean> {
  const token = process.env.ADMIN_TOKEN;
  if (!token || !matches(input, token)) return false;
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return true;
}
