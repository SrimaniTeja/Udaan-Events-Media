import "server-only";

import type { EventStatus, FileType, SessionUser, UserRole } from "@/lib/types";
import type { NotificationType } from "@/lib/notifications";
import { prisma } from "@/lib/db/prisma";
import { canTransition } from "@/lib/workflow";
import { mapEvent, mapFile, mapNotification, mapSessionUser, mapUser } from "@/lib/db/mappers";

export async function listUsers(role?: UserRole) {
  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return users.map(mapUser);
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return user ? mapUser(user) : null;
}

export async function getDbUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function listEventsForUser(user: SessionUser) {
  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "CAMERAMAN"
        ? { cameramanId: user.id }
        : { editorId: user.id };

  const events = await prisma.event.findMany({ where, orderBy: { date: "desc" } });
  return events.map(mapEvent);
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  return event ? mapEvent(event) : null;
}

export async function listFilesForEvent(eventId: string, fileType?: FileType) {
  const files = await prisma.file.findMany({
    where: { eventId, ...(fileType ? { fileType } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return files.map(mapFile);
}

export async function getFileById(fileId: string) {
  const f = await prisma.file.findUnique({ where: { id: fileId } });
  return f ? mapFile(f) : null;
}

export async function createEvent(input: {
  name: string;
  date: string;
  cameramanId: string;
  editorId: string | null;
}) {
  const event = await prisma.event.create({
    data: {
      name: input.name,
      date: new Date(input.date),
      cameramanId: input.cameramanId,
      editorId: input.editorId ?? null,
      status: "CREATED",
    },
  });
  return mapEvent(event);
}

export async function transitionEvent(eventId: string, nextStatus: EventStatus) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) return null;

    if (!canTransition(event.status as any, nextStatus)) {
      throw new Error(`Invalid status transition: ${event.status} -> ${nextStatus}`);
    }

    const updated = await tx.event.update({
      where: { id: eventId },
      data: { status: nextStatus },
    });
    return mapEvent(updated);
  });
}

export async function setEditorFree(editorId: string, isFree: boolean) {
  const u = await prisma.user.update({
    where: { id: editorId },
    data: { isFree },
  });
  return mapUser(u);
}

export async function setEditor(eventId: string, editorId: string | null) {
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { editorId },
  });
  return mapEvent(event);
}

export async function autoAssignFreeEditor(eventId: string) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) return null;
    if (event.editorId) return mapEvent(event);

    const freeEditor = await tx.user.findFirst({
      where: { role: "EDITOR", isFree: true },
      orderBy: { createdAt: "asc" },
    });
    if (!freeEditor) return mapEvent(event);

    await tx.user.update({ where: { id: freeEditor.id }, data: { isFree: false } });
    const updated = await tx.event.update({
      where: { id: eventId },
      data: { editorId: freeEditor.id },
    });
    return mapEvent(updated);
  });
}

export async function addFile(params: {
  eventId: string;
  uploadedBy: string;
  fileType: FileType;
  name: string;
  size: number;
}) {
  const f = await prisma.file.create({
    data: {
      eventId: params.eventId,
      uploaderId: params.uploadedBy,
      fileType: params.fileType,
      name: params.name,
      size: params.size,
      driveFileId: null,
    },
  });
  return mapFile(f);
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  eventId?: string;
}) {
  const n = await prisma.notification.create({
    data: {
      userId: params.userId,
      eventId: params.eventId,
      title: params.title,
      message: params.message,
      type: params.type,
    },
  });
  return mapNotification(n);
}

export async function listNotificationsForUser(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return notifications.map(mapNotification);
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!existing || existing.userId !== userId) return null;

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return mapNotification(updated);
}

export async function getSessionUserFromDb(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  return u ? mapSessionUser(u) : null;
}


