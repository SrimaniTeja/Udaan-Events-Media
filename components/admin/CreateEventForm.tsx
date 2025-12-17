"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreateEventForm({
  cameramen,
  editors,
}: {
  cameramen: User[];
  editors: User[];
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [cameramanId, setCameramanId] = React.useState<string>("");
  const [editorId, setEditorId] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        date: new Date(date).toISOString(),
        cameramanId: cameramanId || null,
        editorId: editorId || null,
      }),
    });

    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      setBusy(false);
      setError(data?.error ?? "Failed to create event");
      return;
    }

    const id = data.event.id as string;
    router.push(`/admin/events/${encodeURIComponent(id)}`);
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-2">
        <label className="text-sm text-muted-foreground">Event name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Wedding Reception" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-muted-foreground">Date</label>
        <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-muted-foreground">Assign cameraman</label>
        <select
          className="h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          value={cameramanId}
          onChange={(e) => setCameramanId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {cameramen.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-muted-foreground">Assign editor</label>
        <select
          className="h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          value={editorId}
          onChange={(e) => setEditorId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {editors.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create event"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


