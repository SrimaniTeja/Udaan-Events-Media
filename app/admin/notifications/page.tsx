import { requireRole } from "@/lib/auth/requireRole";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default async function AdminNotificationsPage() {
  await requireRole("ADMIN");
  return <NotificationsList />;
}


