import { requireRole } from "@/lib/auth/requireRole";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default async function CameramanNotificationsPage() {
  await requireRole("CAMERAMAN");
  return <NotificationsList />;
}


