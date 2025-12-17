import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/event/StatusBadge";
import { EventTimeline } from "@/components/event/EventTimeline";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { EventStatusActionButton } from "@/components/event/EventStatusActionButton";
import { requireRole } from "@/lib/auth/requireRole";
import { getEventById, listFilesForEvent } from "@/lib/db/store";
import { formatBytes, formatDate } from "@/utils/format";

export default async function EditorEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("EDITOR");
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  if (event.editorId !== user.id) notFound();

  const rawFiles = await listFilesForEvent(event.id, "RAW");
  const finalFiles = await listFilesForEvent(event.id, "FINAL");

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">{event.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {formatDate(event.date)} • <span className="inline-flex"><StatusBadge status={event.status} /></span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === "ASSIGNED" ? (
            <EventStatusActionButton eventId={event.id} nextStatus="EDITING" variant="secondary">
              Start Editing
            </EventStatusActionButton>
          ) : null}
          {event.status === "FINAL_UPLOADED" ? (
            <EventStatusActionButton eventId={event.id} nextStatus="COMPLETED">
              Mark Completed
            </EventStatusActionButton>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>RAW media</CardTitle>
          </CardHeader>
          <CardContent>
            {rawFiles.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No RAW files found yet. When the cameraman uploads, you will see them here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-medium">Name</th>
                      <th className="py-2 text-left font-medium">Size</th>
                      <th className="py-2 text-left font-medium">Uploaded</th>
                      <th className="py-2 text-right font-medium">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawFiles.map((f) => (
                      <tr key={f.id} className="border-b border-border/60 last:border-b-0">
                        <td className="py-3">{f.name}</td>
                        <td className="py-3 text-muted-foreground">{formatBytes(f.size)}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(f.timestamp)}</td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/api/download?fileId=${encodeURIComponent(f.id)}`}
                            className="text-sm text-primary hover:underline"
                          >
                            Download
                          </Link>
                        </td>
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
              <CardTitle>Upload FINAL output</CardTitle>
            </CardHeader>
            <CardContent>
              <FileDropzone eventId={event.id} fileType="FINAL" label="FINAL upload" />
              <div className="mt-3 text-xs text-muted-foreground">
                Tip: after uploading FINAL, set status to COMPLETED.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FINAL files</CardTitle>
        </CardHeader>
        <CardContent>
          {finalFiles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No FINAL files uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">Size</th>
                    <th className="py-2 text-left font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {finalFiles.map((f) => (
                    <tr key={f.id} className="border-b border-border/60 last:border-b-0">
                      <td className="py-3">{f.name}</td>
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
    </div>
  );
}


