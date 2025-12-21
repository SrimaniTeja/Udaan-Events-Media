import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createEvent, createNotification, listEventsForUser } from "@/lib/db/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ events: await listEventsForUser(user) });
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
  if (!cameramanId)
    return NextResponse.json({ error: "Cameraman is required" }, { status: 400 });

  try {
    const event = await createEvent({ name, date, cameramanId, editorId });
    
    // Notify cameraman about new event assignment
    if (cameramanId) {
      await createNotification({
        userId: cameramanId,
        type: "EVENT_ASSIGNED",
        eventId: event.id,
        title: "New event assigned",
        message: `You have been assigned to event "${event.name}". Please upload RAW media when ready.`,
      });
    }

    // Notify editor if assigned at creation
    if (editorId) {
      await createNotification({
        userId: editorId,
        type: "EVENT_ASSIGNED",
        eventId: event.id,
        title: "Event assigned to you",
        message: `You have been assigned as editor for "${event.name}".`,
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    console.error("Failed to create event with Drive folders", e);
    return NextResponse.json(
      { error: "Failed to create event folders in Drive. Please try again." },
      { status: 500 },
    );
  }
}

