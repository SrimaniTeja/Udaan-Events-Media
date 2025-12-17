import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/event/StatusBadge";
import { requireRole } from "@/lib/auth/requireRole";
import { listEventsForUser } from "@/lib/mock/store";
import { formatDate } from "@/utils/format";

export default async function AdminEventsPage() {
  const user = await requireRole("ADMIN");
  const events = listEventsForUser(user).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Events</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Create events and track their pipeline progress.
          </div>
        </div>
        <LinkButton href="/admin/events/new">Create Event</LinkButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3">{e.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                    <td className="py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3 text-right">
                      <LinkButton href={`/admin/events/${e.id}`} variant="secondary" size="sm">
                        Details
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


