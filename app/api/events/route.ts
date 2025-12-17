import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createEvent, listEventsForUser } from "@/lib/mock/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ events: listEventsForUser(user) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        date?: string;
        cameramanId?: string | null;
        editorId?: string | null;
      }
    | null;

  const name = body?.name?.trim() ?? "";
  const date = body?.date ?? new Date().toISOString();
  const cameramanId = body?.cameramanId ?? null;
  const editorId = body?.editorId ?? null;

  if (!name) return NextResponse.json({ error: "Event name is required" }, { status: 400 });

  const event = createEvent({ name, date, cameramanId, editorId });
  return NextResponse.json({ event }, { status: 201 });
}


