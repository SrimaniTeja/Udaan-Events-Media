import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/event/StatusBadge";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { EventStatusActionButton } from "@/components/event/EventStatusActionButton";
import { requireRole } from "@/lib/auth/requireRole";
import { getEventById, listFilesForEvent } from "@/lib/db/store";
import { formatBytes, formatDate } from "@/utils/format";

export default async function CameramanEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("CAMERAMAN");
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  if (event.cameramanId !== user.id) notFound();

  const rawFiles = await listFilesForEvent(event.id, "RAW");

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">{event.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {formatDate(event.date)} • <span className="inline-flex"><StatusBadge status={event.status} /></span>
          </div>
        </div>
        <EventStatusActionButton eventId={event.id} nextStatus="RAW_UPLOADED" variant="secondary">
          Mark My Work Done
        </EventStatusActionButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload RAW media</CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropzone eventId={event.id} fileType="RAW" label="RAW upload" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RAW files</CardTitle>
        </CardHeader>
        <CardContent>
          {rawFiles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No RAW files uploaded yet.</div>
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
                  {rawFiles.map((f) => (
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


