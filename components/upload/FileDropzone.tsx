"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { FileType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export function FileDropzone({
  eventId,
  fileType,
  label,
}: {
  eventId: string;
  fileType: FileType;
  label: string;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);

    const form = new FormData();
    for (const f of files) form.append("files", f);

    const res = await fetch(`/api/upload?eventId=${encodeURIComponent(eventId)}&fileType=${fileType}`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as any;
      setError(data?.error ?? "Upload failed");
      setBusy(false);
      return;
    }

    setBusy(false);
    router.refresh();
  }

  function onPick() {
    inputRef.current?.click();
  }

  return (
    <div className="grid gap-3">
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border bg-surface/40 p-6 transition",
          dragging ? "border-primary/60 bg-primary/10" : "hover:bg-surface/60",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          void upload(Array.from(e.dataTransfer.files));
        }}
      >
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">{label}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Drag & drop files here, or choose from your device. (Drive upload streaming will be added next.)
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onPick} disabled={busy}>
              Choose files
            </Button>
          </div>
        </div>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          multiple
          onChange={(e) => void upload(Array.from(e.target.files ?? []))}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          {error}
        </div>
      ) : null}
      {busy ? <div className="text-xs text-muted-foreground">Uploading…</div> : null}
    </div>
  );
}


