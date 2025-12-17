import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/mock/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  const user = findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}


