import type { Event, EventStatus, FileType, MediaFile, SessionUser, User, UserRole } from "@/lib/types";
import { canTransition } from "@/lib/workflow";
import type { Notification, NotificationType } from "@/lib/notifications";

type MockDb = {
  users: User[];
  events: Event[];
  files: MediaFile[];
  notifications: Notification[];
};

declare global {
  // eslint-disable-next-line no-var
  var __eventMediaMockDb: MockDb | undefined;
}

function iso(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function seed(): MockDb {
  const users: User[] = [
    {
      id: "u_admin_1",
      name: "Admin",
      email: "admin@udaan.local",
      role: "ADMIN",
      passwordHash: "password",
    },
    {
      id: "u_cam_1",
      name: "Cameraman One",
      email: "cameraman@udaan.local",
      role: "CAMERAMAN",
      passwordHash: "password",
    },
    {
      id: "u_edit_1",
      name: "Editor One",
      email: "editor@udaan.local",
      role: "EDITOR",
      passwordHash: "password",
      isFree: true,
    },
  ];

  const events: Event[] = [
    {
      id: "ev_1001",
      name: "Udaan Launch Day",
      date: iso(-1),
      cameramanId: "u_cam_1",
      editorId: "u_edit_1",
      status: "ASSIGNED",
      driveFolderId_root: null,
      driveFolderId_raw: null,
      driveFolderId_edited: null,
      driveFolderId_final: null,
    },
    {
      id: "ev_1002",
      name: "Corporate Meetup",
      date: iso(3),
      cameramanId: "u_cam_1",
      editorId: null,
      status: "CREATED",
      driveFolderId_root: null,
      driveFolderId_raw: null,
      driveFolderId_edited: null,
      driveFolderId_final: null,
    },
  ];

  const files: MediaFile[] = [
    {
      id: "f_raw_1",
      eventId: "ev_1001",
      uploadedBy: "u_cam_1",
      fileType: "RAW",
      driveFileId: "mock-drive-raw-1",
      size: 12_400_000,
      timestamp: iso(-1),
      name: "DSC_0001.MP4",
    },
  ];

  const notifications: Notification[] = [];

  return { users, events, files, notifications };
}

function db(): MockDb {
  if (!globalThis.__eventMediaMockDb) globalThis.__eventMediaMockDb = seed();
  return globalThis.__eventMediaMockDb;
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function listUsers(role?: UserRole) {
  const { users } = db();
  return role ? users.filter((u) => u.role === role) : [...users];
}

export function listFreeEditors() {
  const { users } = db();
  return users.filter((u) => u.role === "EDITOR" && u.isFree);
}

export function setEditorFree(editorId: string, isFree: boolean) {
  const { users } = db();
  const u = users.find((x) => x.id === editorId);
  if (!u) return null;
  if (u.role !== "EDITOR") return null;
  u.isFree = isFree;
  return u;
}

export function findUserByEmail(email: string) {
  const { users } = db();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function listEventsForUser(user: SessionUser) {
  const { events } = db();
  if (user.role === "ADMIN") return [...events];
  if (user.role === "CAMERAMAN") return events.filter((e) => e.cameramanId === user.id);
  return events.filter((e) => e.editorId === user.id);
}

export function getEventById(eventId: string) {
  const { events } = db();
  return events.find((e) => e.id === eventId) ?? null;
}

export function listFilesForEvent(eventId: string, fileType?: FileType) {
  const { files } = db();
  return files
    .filter((f) => f.eventId === eventId)
    .filter((f) => (fileType ? f.fileType === fileType : true))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getFileById(fileId: string) {
  const { files } = db();
  return files.find((f) => f.id === fileId) ?? null;
}

function newNotificationId() {
  return newId("notif");
}

export function createNotification(params: {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
}) {
  const { notifications } = db();
  const n: Notification = {
    id: newNotificationId(),
    userId: params.userId,
    title: params.title,
    body: params.body,
    type: params.type,
    eventId: params.eventId,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
  notifications.unshift(n);
  return n;
}

export function listNotificationsForUser(userId: string) {
  const { notifications } = db();
  return notifications.filter((n) => n.userId === userId);
}

export function markNotificationRead(notificationId: string, userId: string) {
  const { notifications } = db();
  const n = notifications.find((x) => x.id === notificationId && x.userId === userId);
  if (!n) return null;
  if (!n.readAt) n.readAt = new Date().toISOString();
  return n;
}

export function createEvent(input: {
  name: string;
  date: string;
  cameramanId: string | null;
  editorId: string | null;
}) {
  const { events } = db();
  const event: Event = {
    id: newId("ev"),
    name: input.name,
    date: input.date,
    cameramanId: input.cameramanId,
    editorId: input.editorId,
    status: "CREATED",
    driveFolderId_root: null,
    driveFolderId_raw: null,
    driveFolderId_edited: null,
    driveFolderId_final: null,
  };
  events.push(event);
  return event;
}

export function transitionEvent(eventId: string, nextStatus: EventStatus) {
  const { events } = db();
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  if (!canTransition(event.status, nextStatus)) {
    throw new Error(`Invalid status transition: ${event.status} -> ${nextStatus}`);
  }
  event.status = nextStatus;
  return event;
}

export function setEditor(eventId: string, editorId: string | null) {
  const event = getEventById(eventId);
  if (!event) return null;
  event.editorId = editorId;
  return event;
}

export function autoAssignFreeEditor(eventId: string) {
  const event = getEventById(eventId);
  if (!event) return null;
  if (event.editorId) return event;

  const freeEditors = listFreeEditors();
  if (freeEditors.length === 0) return event;

  const picked = freeEditors[0];
  event.editorId = picked.id;
  setEditorFree(picked.id, false);
  return event;
}

export function addFile(params: {
  eventId: string;
  uploadedBy: string;
  fileType: FileType;
  name: string;
  size: number;
}) {
  const { files } = db();
  const f: MediaFile = {
    id: newId("file"),
    eventId: params.eventId,
    uploadedBy: params.uploadedBy,
    fileType: params.fileType,
    driveFileId: `mock-drive-${params.fileType.toLowerCase()}-${Date.now()}`,
    size: params.size,
    timestamp: new Date().toISOString(),
    name: params.name,
  };
  files.push(f);
  return f;
}


