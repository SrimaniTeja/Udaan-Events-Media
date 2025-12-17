"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Notification } from "@/lib/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function NotificationsList() {
  const router = useRouter();
  const [items, setItems] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/notifications");
    const data = (await res.json().catch(() => null)) as any;
    setItems((data?.notifications ?? []) as Notification[]);
    setLoading(false);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
    router.refresh();
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {n.title}{" "}
                  {n.readAt ? (
                    <span className="ml-2 text-xs text-muted-foreground">(read)</span>
                  ) : (
                    <span className="ml-2 text-xs text-primary">(new)</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>
                {n.eventId ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Event:{" "}
                    <Link href="#" className="text-primary hover:underline">
                      {n.eventId}
                    </Link>
                  </div>
                ) : null}
              </div>
              {!n.readAt ? (
                <Button variant="secondary" onClick={() => void markRead(n.id)}>
                  Mark read
                </Button>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}


