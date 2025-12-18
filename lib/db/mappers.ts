import type { Event, MediaFile, SessionUser, User } from "@/lib/types";
import type { Notification as UiNotification } from "@/lib/notifications";

// Minimal DB record shapes (keeps typing stable even if tooling can't resolve Prisma model type exports).
type DbUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isFree: boolean;
};

type DbEvent = {
  id: string;
  name: string;
  date: Date;
  cameramanId: string;
  editorId: string | null;
  status: string;
  driveRootId: string | null;
  driveRawId: string | null;
  driveEditedId: string | null;
  driveFinalId: string | null;
};

type DbFile = {
  id: string;
  eventId: string;
  uploaderId: string;
  fileType: string;
  driveFileId: string | null;
  size: number;
  createdAt: Date;
  name: string;
  mimeType: string;
};

type DbNotification = {
  id: string;
  userId: string;
  eventId: string | null;
  title: string;
  message: string;
  type: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function mapUser(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User["role"],
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
    mimeType: f.mimeType,
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


