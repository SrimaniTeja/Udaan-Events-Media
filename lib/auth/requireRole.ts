import "server-only";

import { redirect } from "next/navigation";
import type { SessionUser, UserRole } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) redirect("/unauthorized");
  return user;
}


