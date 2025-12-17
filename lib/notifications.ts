export type NotificationType =
  | "EVENT_ASSIGNED"
  | "RAW_UPLOADED"
  | "FINAL_UPLOADED"
  | "COMPLETED";

export type Notification = {
  id: string;
  userId: string;
  eventId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO
};


