"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { EventStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function EventStatusActionButton({
  eventId,
  nextStatus,
  children,
  variant = "primary",
}: {
  eventId: string;
  nextStatus: EventStatus;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function run() {
    setBusy(true);
    await fetch(`/api/events/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextStatus }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <Button onClick={run} disabled={busy} variant={variant} className="min-w-[140px]">
      {busy ? "Working…" : children}
    </Button>
  );
}


