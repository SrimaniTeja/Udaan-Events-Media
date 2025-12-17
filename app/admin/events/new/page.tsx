import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/requireRole";
import { listUsers } from "@/lib/db/store";
import { CreateEventForm } from "@/components/admin/CreateEventForm";

export default async function AdminCreateEventPage() {
  await requireRole("ADMIN");
  const cameramen = await listUsers("CAMERAMAN");
  const editors = await listUsers("EDITOR");

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-lg font-semibold">Create Event</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This will later create Google Drive folders automatically (RAW / EDITED / FINAL).
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>Assign cameraman and editor (optional for now).</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEventForm cameramen={cameramen} editors={editors} />
        </CardContent>
      </Card>
    </div>
  );
}


