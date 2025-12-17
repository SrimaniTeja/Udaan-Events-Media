import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/event/StatusBadge";
import { requireRole } from "@/lib/auth/requireRole";
import { listEventsForUser } from "@/lib/db/store";
import { formatDate } from "@/utils/format";

export default async function CameramanDashboardPage() {
  const user = await requireRole("CAMERAMAN");
  const events = (await listEventsForUser(user)).sort((a, b) => b.date.localeCompare(a.date));

  const pendingUploads = events.filter((e) => e.status === "CREATED");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Cameraman Dashboard</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Upload RAW media to Drive (streaming will be added next) and mark your work done.
          </div>
        </div>
        <LinkButton href="/cameraman/events" variant="secondary">
          My Events
        </LinkButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assigned events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{events.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Total events assigned to you</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending RAW</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pendingUploads.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Need your upload</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {events.filter((e) => e.status !== "CREATED").length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Moved forward in pipeline</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Event</th>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 8).map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3">{e.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                    <td className="py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3 text-right">
                      <LinkButton href={`/cameraman/event/${e.id}`} variant="secondary" size="sm">
                        Upload
                      </LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


