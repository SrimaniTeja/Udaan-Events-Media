import { requireRole } from "@/lib/auth/requireRole";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default async function EditorNotificationsPage() {
  await requireRole("EDITOR");
  return <NotificationsList />;
}


