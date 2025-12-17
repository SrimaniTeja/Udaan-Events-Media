import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/event/StatusBadge";
import { requireRole } from "@/lib/auth/requireRole";
import { listEventsForUser } from "@/lib/mock/store";
import { formatDate } from "@/utils/format";

export default async function EditorDashboardPage() {
  const user = await requireRole("EDITOR");
  const events = listEventsForUser(user).sort((a, b) => b.date.localeCompare(a.date));

  const available = events.filter((e) => e.status === "RAW_UPLOADED" || e.status === "ASSIGNED");
  const active = events.filter((e) => e.status === "EDITING");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Editor Dashboard</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Download RAW media (streamed later), upload FINAL edits, and complete events.
          </div>
        </div>
        <LinkButton href="/editor/events" variant="secondary">
          Available Tasks
        </LinkButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{available.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Ready to start</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{active.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">In progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{events.filter((e) => e.status === "COMPLETED").length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Closed out</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
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
                      <LinkButton href={`/editor/event/${e.id}`} variant="secondary" size="sm">
                        Open
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


