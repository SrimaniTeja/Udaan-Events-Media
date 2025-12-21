import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getSessionUser } from "@/lib/auth/session";
import {
  addFile,
  autoAssignFreeEditor,
  createNotification,
  createNotificationsForRole,
  getEventById,
  transitionEvent,
} from "@/lib/db/store";
import { canUploadFile } from "@/lib/workflow";
import { validateFile } from "@/lib/validation";
import { uploadFileStream } from "@/lib/googleDrive";
import type { FileType } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? "";
  const fileType = (searchParams.get("fileType") ?? "RAW") as FileType;

  console.log("[UPLOAD] user:", user.id, user.role);
  console.log("[UPLOAD] eventId:", eventId);
  console.log("[UPLOAD] fileType:", fileType);

  const event = await getEventById(eventId);
  if (!event) {
    console.error("[UPLOAD] Invalid eventId:", eventId);
    return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
  }

  console.log("[UPLOAD] event status:", event.status);
  console.log("[UPLOAD] driveRawId:", event.driveFolderId_raw);
  console.log("[UPLOAD] driveFinalId:", event.driveFolderId_final);

  // Assignment checks
  if (user.role === "CAMERAMAN" && event.cameramanId !== user.id) {
    console.warn("[UPLOAD] Cameraman not assigned to event", { userId: user.id, eventId });
    return NextResponse.json({ error: "Not assigned to this event" }, { status: 403 });
  }
  if (user.role === "EDITOR" && event.editorId !== user.id) {
    console.warn("[UPLOAD] Editor not assigned to event", { userId: user.id, eventId });
    return NextResponse.json({ error: "Not assigned to this event" }, { status: 403 });
  }

  const allowAdminRawDebug = process.env.ALLOW_ADMIN_RAW_UPLOAD_FOR_DEBUG === "true";
  if (user.role === "ADMIN") {
    if (!(allowAdminRawDebug && fileType === "RAW")) {
      console.warn("[UPLOAD] Admin attempted upload without debug flag", { userId: user.id, fileType });
      return NextResponse.json({ error: "Admin cannot upload media" }, { status: 403 });
    }
    console.log("[UPLOAD] Admin RAW upload allowed due to debug flag");
  }

  if (!canUploadFile({ role: user.role, fileType, status: event.status })) {
    let message = "Upload not allowed in current status";
    if (user.role === "CAMERAMAN" && fileType === "RAW") {
      message = "Cameraman can upload RAW only when event status is CREATED";
    } else if (user.role === "EDITOR" && fileType === "FINAL") {
      message = "Editor can upload FINAL only when event status is EDITING";
    }
    console.warn("[UPLOAD] Status guard blocked upload", {
      userId: user.id,
      role: user.role,
      fileType,
      status: event.status,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const form = await req.formData().catch((err) => {
    console.error("[UPLOAD] Failed to parse multipart form", err);
    return null;
  });
  if (!form) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

  const incoming = form.getAll("files");
  if (incoming.length === 0) {
    console.warn("[UPLOAD] No files in form under 'files' field");
    return NextResponse.json({ error: "No files provided (use form field name 'files')" }, { status: 400 });
  }

  // Validate all files before processing
  const validationErrors: string[] = [];
  const validFiles: File[] = [];

  for (const part of incoming) {
    if (!(part instanceof File)) continue;
    console.log("[UPLOAD] Incoming file candidate:", {
      name: part.name,
      size: part.size,
      type: part.type,
    });

    if (!part || part.size === 0) {
      validationErrors.push(`${part.name || "(unnamed)"}: Uploaded file is empty or missing`);
      continue;
    }

    const validation = validateFile(part, fileType);
    if (!validation.valid) {
      validationErrors.push(`${part.name}: ${validation.error}`);
    } else {
      validFiles.push(part);
    }
  }

  // If any validation fails, return error without saving anything
  if (validationErrors.length > 0) {
    console.warn("[UPLOAD] Validation failed for files", validationErrors);
    return NextResponse.json(
      { error: `Validation failed:\n${validationErrors.join("\n")}` },
      { status: 400 },
    );
  }

  if (validFiles.length === 0) {
    console.warn("[UPLOAD] No valid files after validation");
    return NextResponse.json({ error: "No valid files to upload" }, { status: 400 });
  }

  // Determine correct Drive folder based on file type.
  const folderId =
    fileType === "RAW" ? event.driveFolderId_raw : fileType === "FINAL" ? event.driveFolderId_final : null;

  if (!folderId) {
    const msg =
      fileType === "RAW"
        ? "RAW Drive folder ID missing for event"
        : "FINAL Drive folder ID missing for event";
    console.error("[UPLOAD] Missing Drive folder ID", { eventId, fileType, driveRawId: event.driveFolderId_raw, driveFinalId: event.driveFolderId_final });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  console.log("[UPLOAD] Using Drive folder", { folderId, fileType });

  // All files are valid, stream them to Drive and store metadata only.
  const created = [];
  for (const file of validFiles) {
    const mimeType = file.type || "application/octet-stream";
    const fileName = file.name || "upload.bin";

    console.log("[UPLOAD] Processing file", {
      name: fileName,
      size: file.size,
      mimeType,
    });

    const nodeStream = Readable.fromWeb(file.stream() as any);

    let driveFileId: string;
    try {
      const result = await uploadFileStream({
        folderId,
        fileStream: nodeStream,
        fileName,
        mimeType,
      });
      driveFileId = result.fileId;
      console.log("[UPLOAD] Drive upload successful", { driveFileId, fileName });
    } catch (err: any) {
      console.error("[UPLOAD] Drive upload failed", {
        error: err?.message,
        code: err?.code,
        response: err?.response?.data,
      });
      return NextResponse.json({ error: "Google Drive upload failed" }, { status: 502 });
    }

    try {
      const dbFile = await addFile({
        eventId,
        uploadedBy: user.id,
        fileType,
        name: fileName,
        size: file.size,
        mimeType,
        driveFileId,
      });
      console.log("[UPLOAD] DB file record created", {
        id: dbFile.id,
        driveFileId: dbFile.driveFileId,
      });
      created.push(dbFile);
    } catch (err) {
      console.error("[UPLOAD] Failed to persist file metadata", err);
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 });
    }
  }

  // Minimal workflow updates (Drive integration will replace this later)
  try {
    if (fileType === "RAW" && event.status === "CREATED") {
      await transitionEvent(eventId, "RAW_UPLOADED");
      
      // Notify admin that RAW media has been uploaded
      await createNotificationsForRole({
        role: "ADMIN",
        type: "RAW_UPLOADED",
        eventId,
        title: "RAW media uploaded",
        message: `Cameraman uploaded RAW media for "${event.name}".`,
      });
      
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
      
      // Notify admin that FINAL media is available
      await createNotificationsForRole({
        role: "ADMIN",
        type: "FINAL_UPLOADED",
        eventId,
        title: "FINAL media uploaded",
        message: `Editor uploaded FINAL output for "${event.name}".`,
      });
      
      // Notify cameraman that FINAL media is ready
      if (event.cameramanId) {
        await createNotification({
          userId: event.cameramanId,
          type: "FINAL_UPLOADED",
          eventId,
          title: "FINAL media ready",
          message: `Editor uploaded FINAL output for "${event.name}".`,
        });
      }
    }
  } catch (e) {
    console.error("[UPLOAD] Failed to update workflow status or notifications", e);
  }

  return NextResponse.json({ files: created }, { status: 201 });
}

