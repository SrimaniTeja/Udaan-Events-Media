import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEventById, getFileById } from "@/lib/db/store";

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
    "image/png": ".png",
    "image/heic": ".heic",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
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

  // Use stored MIME type, fallback to application/octet-stream
  const mimeType = f.mimeType || "application/octet-stream";
  const extension = getFileExtension(f.name, mimeType);
  
  // Ensure filename has correct extension
  let downloadFilename = f.name;
  if (!downloadFilename.toLowerCase().endsWith(extension.toLowerCase())) {
    downloadFilename = downloadFilename + extension;
  }

  // Mock content (will be replaced with Drive streaming later)
  const content = `Mock download for ${f.name}\n(Drive streaming will be wired later)\n`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
    },
  });

}


