export type UserRole = "ADMIN" | "CAMERAMAN" | "EDITOR";

export type EventStatus =
  | "CREATED"
  | "RAW_UPLOADED"
  | "ASSIGNED"
  | "EDITING"
  | "FINAL_UPLOADED"
  | "COMPLETED";

export type FileType = "RAW" | "FINAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /**
   * In real implementation store a hash, not plaintext.
   * This scaffold uses mock users and does not persist credentials.
   */
  passwordHash: string;
  isFree?: boolean; // editors only (for future automation)
}

export interface Event {
  id: string;
  name: string;
  date: string; // ISO string
  cameramanId: string | null;
  editorId: string | null;
  status: EventStatus;
  driveFolderId_root: string | null;
  driveFolderId_raw: string | null;
  driveFolderId_edited: string | null;
  driveFolderId_final: string | null;
}

export interface MediaFile {
  id: string;
  eventId: string;
  uploadedBy: string;
  fileType: FileType;
  driveFileId: string;
  size: number;
  timestamp: string; // ISO string
  name: string;
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;


