import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listNotificationsForUser, markNotificationRead } from "@/lib/mock/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ notifications: listNotificationsForUser(user.id) });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id ?? "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updated = markNotificationRead(id, user.id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ notification: updated });
}


