import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getEventById, getFileById } from "@/lib/db/store";

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

  const content = `Mock download for ${f.name}\n(Drive streaming will be wired later)\n`;
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(f.name)}.txt"`,
    },
  });

}


