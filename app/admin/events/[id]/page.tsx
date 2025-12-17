import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/event/StatusBadge";
import { EventTimeline } from "@/components/event/EventTimeline";
import { requireRole } from "@/lib/auth/requireRole";
import { getEventById, listFilesForEvent, listUsers } from "@/lib/mock/store";
import { formatBytes, formatDate } from "@/utils/format";

export default async function AdminEventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole("ADMIN");
  const event = getEventById(params.id);
  if (!event) notFound();

  const files = listFilesForEvent(event.id);
  const users = listUsers();
  const cameraman = users.find((u) => u.id === event.cameramanId) ?? null;
  const editor = users.find((u) => u.id === event.editorId) ?? null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">{event.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {formatDate(event.date)} • <span className="inline-flex"><StatusBadge status={event.status} /></span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-sm text-muted-foreground">No files yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-medium">Name</th>
                      <th className="py-2 text-left font-medium">Type</th>
                      <th className="py-2 text-left font-medium">Size</th>
                      <th className="py-2 text-left font-medium">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.id} className="border-b border-border/60 last:border-b-0">
                        <td className="py-3">{f.name}</td>
                        <td className="py-3 text-muted-foreground">{f.fileType}</td>
                        <td className="py-3 text-muted-foreground">{formatBytes(f.size)}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(f.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTimeline current={event.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Cameraman</div>
                <div className="mt-1">{cameraman ? cameraman.name : "Unassigned"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Editor</div>
                <div className="mt-1">{editor ? editor.name : "Unassigned"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Drive folders</div>
                <div className="mt-1 text-muted-foreground">
                  Not created yet (Drive integration comes next).
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


