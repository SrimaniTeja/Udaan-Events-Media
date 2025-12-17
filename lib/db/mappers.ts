import type { Event, MediaFile, SessionUser, User } from "@/lib/types";
import type { Notification as UiNotification } from "@/lib/notifications";
import type { Event as DbEvent, File as DbFile, Notification as DbNotification, User as DbUser } from "@prisma/client";

export function mapUser(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User["role"],
    passwordHash: u.passwordHash,
    isFree: u.role === "EDITOR" ? u.isFree : undefined,
  };
}

export function mapSessionUser(u: DbUser): SessionUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role as SessionUser["role"] };
}

export function mapEvent(e: DbEvent): Event {
  return {
    id: e.id,
    name: e.name,
    date: e.date.toISOString(),
    cameramanId: e.cameramanId ?? null,
    editorId: e.editorId ?? null,
    status: e.status as Event["status"],
    driveFolderId_root: e.driveRootId ?? null,
    driveFolderId_raw: e.driveRawId ?? null,
    driveFolderId_edited: e.driveEditedId ?? null,
    driveFolderId_final: e.driveFinalId ?? null,
  };
}

export function mapFile(f: DbFile): MediaFile {
  return {
    id: f.id,
    eventId: f.eventId,
    uploadedBy: f.uploaderId,
    fileType: f.fileType as MediaFile["fileType"],
    driveFileId: f.driveFileId ?? "",
    size: f.size,
    timestamp: f.createdAt.toISOString(),
    name: f.name,
  };
}

export function mapNotification(n: DbNotification): UiNotification {
  return {
    id: n.id,
    userId: n.userId,
    eventId: n.eventId ?? undefined,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    type: (n.type ?? "EVENT_ASSIGNED") as UiNotification["type"],
    createdAt: n.createdAt.toISOString(),
  };
}


