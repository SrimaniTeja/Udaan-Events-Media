import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/event/StatusBadge";
import { LinkButton } from "@/components/ui/LinkButton";
import { requireRole } from "@/lib/auth/requireRole";
import { listEventsForUser } from "@/lib/db/store";
import { formatDate } from "@/utils/format";

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");
  const events = await listEventsForUser(user);

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  const latest = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Admin Dashboard</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Create events, track status, and monitor progress across the pipeline.
          </div>
        </div>
        <LinkButton href="/admin/events/new">Create Event</LinkButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{counts.CREATED ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Awaiting RAW uploads</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {(counts.ASSIGNED ?? 0) + (counts.EDITING ?? 0) + (counts.RAW_UPLOADED ?? 0)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">RAW uploaded / assigned / editing</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{counts.COMPLETED ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Delivered and closed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Event</th>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3">{e.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                    <td className="py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3 text-right">
                      <LinkButton href={`/admin/events/${e.id}`} variant="secondary" size="sm">
                        View
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


