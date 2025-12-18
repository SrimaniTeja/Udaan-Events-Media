import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { addFile, autoAssignFreeEditor, createNotification, getEventById, transitionEvent } from "@/lib/db/store";
import { canUploadFile } from "@/lib/workflow";
import { validateFile } from "@/lib/validation";
import type { FileType } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? "";
  const fileType = (searchParams.get("fileType") ?? "RAW") as FileType;

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });

  // Assignment checks
  if (user.role === "CAMERAMAN" && event.cameramanId !== user.id)
    return NextResponse.json({ error: "Not assigned to this event" }, { status: 403 });
  if (user.role === "EDITOR" && event.editorId !== user.id)
    return NextResponse.json({ error: "Not assigned to this event" }, { status: 403 });
  if (user.role === "ADMIN")
    return NextResponse.json({ error: "Admin cannot upload media" }, { status: 403 });

  if (!canUploadFile({ role: user.role, fileType, status: event.status }))
    return NextResponse.json({ error: "Upload not allowed in current status" }, { status: 400 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

  const incoming = form.getAll("files");
  if (incoming.length === 0) {
    return NextResponse.json({ error: "No files provided (use form field name 'files')" }, { status: 400 });
  }

  // Validate all files before processing
  const validationErrors: string[] = [];
  const validFiles: File[] = [];

  for (const part of incoming) {
    if (!(part instanceof File)) continue;
    const validation = validateFile(part, fileType);
    if (!validation.valid) {
      validationErrors.push(`${part.name}: ${validation.error}`);
    } else {
      validFiles.push(part);
    }
  }

  // If any validation fails, return error without saving anything
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: `Validation failed:\n${validationErrors.join("\n")}` },
      { status: 400 },
    );
  }

  // All files are valid, proceed with metadata storage
  const created = [];
  for (const file of validFiles) {
    created.push(
      await addFile({
        eventId,
        uploadedBy: user.id,
        fileType,
        name: file.name || "upload.bin",
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      }),
    );
  }

  // Minimal workflow updates (Drive integration will replace this later)
  try {
    if (fileType === "RAW" && event.status === "CREATED") {
      await transitionEvent(eventId, "RAW_UPLOADED");
      // Auto-assign a free editor (if available) and notify them.
      const updated = (await autoAssignFreeEditor(eventId)) ?? event;
      if (updated.editorId) {
        await transitionEvent(eventId, "ASSIGNED");
        await createNotification({
          userId: updated.editorId,
          type: "RAW_UPLOADED",
          eventId,
          title: "New RAW media available",
          message: `RAW media has been uploaded for "${updated.name}". You can start editing now.`,
        });
      }
    }
    if (fileType === "FINAL" && (event.status === "ASSIGNED" || event.status === "EDITING")) {
      await transitionEvent(eventId, "FINAL_UPLOADED");
      if (event.cameramanId) {
        await createNotification({
          userId: event.cameramanId,
          type: "FINAL_UPLOADED",
          eventId,
          title: "FINAL media uploaded",
          message: `Editor uploaded FINAL output for "${event.name}".`,
        });
      }
    }
  } catch (e) {
    // Ignore for scaffold; client can still see uploaded file entries.
    console.error(e);
  }

  return NextResponse.json({ files: created }, { status: 201 });
}


