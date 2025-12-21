import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getSessionUser } from "@/lib/auth/session";
import { getEventById, getFileById } from "@/lib/db/store";
import { downloadFileStream } from "@/lib/googleDrive";

// Helper to get file extension from filename or MIME type
function getFileExtension(filename: string, mimeType: string): string {
  // Try to extract from filename first
  const lastDot = filename.lastIndexOf(".");
  if (lastDot !== -1) {
    return filename.substring(lastDot);
  }

  // Fallback to MIME type mapping
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/tiff": ".tiff",
    "image/bmp": ".bmp",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/x-matroska": ".mkv",
    "video/webm": ".webm",
    "video/x-flv": ".flv",
    "video/mpeg": ".mpeg",
    "video/x-ms-wmv": ".wmv",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-m4a": ".m4a",
    "audio/ogg": ".ogg",
    "audio/aac": ".aac",
  };

  return mimeToExt[mimeType] || ".bin";
}

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId") ?? "";
  if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  const f = await getFileById(fileId);
  if (!f) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const event = await getEventById(f.eventId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const canAccess =
    user.role === "ADMIN" ||
    (user.role === "CAMERAMAN" && event.cameramanId === user.id) ||
    (user.role === "EDITOR" && event.editorId === user.id);
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!f.driveFileId) {
    return NextResponse.json(
      { error: "Drive file is not linked for this record. Please contact an administrator." },
      { status: 500 },
    );
  }

  // Use stored MIME type, fallback to application/octet-stream
  const mimeType = f.mimeType || "application/octet-stream";
  const extension = getFileExtension(f.name, mimeType);

  // Ensure filename has correct extension
  let downloadFilename = f.name;
  if (!downloadFilename.toLowerCase().endsWith(extension.toLowerCase())) {
    downloadFilename = downloadFilename + extension;
  }

  const nodeStream = await downloadFileStream(f.driveFileId);
  const webStream = Readable.toWeb(nodeStream as any) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
    },
  });
}

