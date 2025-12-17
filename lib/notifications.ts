import type { UserRole } from "@/lib/types";

export type NotificationType =
  | "EVENT_ASSIGNED"
  | "RAW_UPLOADED"
  | "FINAL_UPLOADED"
  | "COMPLETED";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
  createdAt: string;
  readAt: string | null;
  meta?: {
    role?: UserRole;
  };
};


