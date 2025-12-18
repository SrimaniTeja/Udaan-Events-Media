import type { EventStatus, FileType, UserRole } from "@/lib/types";

export const EVENT_STATUSES: EventStatus[] = [
  "CREATED",
  "RAW_UPLOADED",
  "ASSIGNED",
  "EDITING",
  "FINAL_UPLOADED",
  "COMPLETED",
];

export function canTransition(from: EventStatus, to: EventStatus) {
  const allowed: Record<EventStatus, EventStatus[]> = {
    CREATED: ["RAW_UPLOADED"],
    RAW_UPLOADED: ["ASSIGNED"],
    ASSIGNED: ["EDITING"],
    EDITING: ["FINAL_UPLOADED"],
    FINAL_UPLOADED: ["COMPLETED"],
    COMPLETED: [],
  };
  return allowed[from].includes(to);
}

export function canUploadFile(params: {
  role: UserRole;
  fileType: FileType;
  status: EventStatus;
}) {
  const { role, fileType, status } = params;

  if (role === "CAMERAMAN" && fileType === "RAW") return status === "CREATED";
  if (role === "EDITOR" && fileType === "FINAL") return status === "EDITING";

  return false;
}

export function canMarkWorkDone(role: UserRole, status: EventStatus) {
  return role === "CAMERAMAN" && status === "CREATED";
}

export function canStartEditing(role: UserRole, status: EventStatus) {
  return role === "EDITOR" && status === "ASSIGNED";
}

export function canMarkCompleted(role: UserRole, status: EventStatus) {
  return role === "EDITOR" && status === "FINAL_UPLOADED";
}


