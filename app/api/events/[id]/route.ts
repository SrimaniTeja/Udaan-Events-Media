import { NextResponse, type NextRequest } from "next/server";
import type { EventStatus } from "@/lib/types";
import { getSessionUser } from "@/lib/auth/session";
import { createNotification, getEventById, listFilesForEvent, setEditor, setEditorFree, transitionEvent } from "@/lib/db/store";
import { canTransition } from "@/lib/workflow";

function canAccessEvent(params: {
  role: "ADMIN" | "CAMERAMAN" | "EDITOR";
  userId: string;
  event: { cameramanId: string | null; editorId: string | null; status: EventStatus };
}) {
  const { role, userId, event } = params;
  if (role === "ADMIN") return true;
  if (role === "CAMERAMAN") return event.cameramanId === userId;
  // Editor can see assigned events + available tasks (raw uploaded / assigned)
  return event.editorId === userId || event.status === "RAW_UPLOADED" || event.status === "ASSIGNED";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessEvent({ role: user.role, userId: user.id, event }))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const files = await listFilesForEvent(id);
  return NextResponse.json({ event, files });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessEvent({ role: user.role, userId: user.id, event }))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as
    | { nextStatus?: EventStatus; editorId?: string | null }
    | null;

  if (body?.editorId !== undefined) {
    if (user.role !== "ADMIN")
      return NextResponse.json({ error: "Only admin can assign editor" }, { status: 403 });
    const prevEditorId = event.editorId;
    const nextEditorId = body.editorId ?? null;
    await setEditor(id, nextEditorId);

    // Update free/busy status and notify assigned editor.
    if (prevEditorId && prevEditorId !== nextEditorId) await setEditorFree(prevEditorId, true);
    if (nextEditorId) {
      await setEditorFree(nextEditorId, false);
      await createNotification({
        userId: nextEditorId,
        type: "EVENT_ASSIGNED",
        eventId: id,
        title: "Event assigned to you",
        message: `You have been assigned as editor for "${event.name}".`,
      });
    }
  }

  if (body?.nextStatus) {
    const nextStatus = body.nextStatus;

    // Role-based guardrails for status operations (scaffold-level rules).
    const roleAllows =
      (user.role === "CAMERAMAN" && nextStatus === "RAW_UPLOADED") ||
      (user.role === "ADMIN" && nextStatus === "ASSIGNED") ||
      (user.role === "EDITOR" &&
        (nextStatus === "EDITING" || nextStatus === "FINAL_UPLOADED" || nextStatus === "COMPLETED"));

    if (!roleAllows)
      return NextResponse.json({ error: "Operation not allowed for this role" }, { status: 403 });

    if (!canTransition(event.status, nextStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition: ${event.status} -> ${nextStatus}` },
        { status: 400 },
      );
    }

    const updated = await transitionEvent(id, nextStatus);

    // When completed, free up editor for future auto-assignment and notify admin.
    if (nextStatus === "COMPLETED") {
      if (event.editorId) await setEditorFree(event.editorId, true);
      await createNotification({
        userId: "u_admin_1",
        type: "COMPLETED",
        eventId: id,
        title: "Event completed",
        message: `"${event.name}" has been marked as COMPLETED.`,
      });
    }
    return NextResponse.json({ event: updated });
  }

  return NextResponse.json({ event: await getEventById(id) });
}


