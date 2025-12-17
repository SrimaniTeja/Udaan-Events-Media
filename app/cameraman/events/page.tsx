import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/event/StatusBadge";
import { requireRole } from "@/lib/auth/requireRole";
import { listEventsForUser } from "@/lib/mock/store";
import { formatDate } from "@/utils/format";

export default async function CameramanEventsPage() {
  const user = await requireRole("CAMERAMAN");
  const events = listEventsForUser(user).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-lg font-semibold">My Events</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Upload RAW photos/videos and then mark your work done.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned to you</CardTitle>
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
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3">{e.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                    <td className="py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3 text-right">
                      <LinkButton href={`/cameraman/event/${e.id}`} variant="secondary" size="sm">
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


