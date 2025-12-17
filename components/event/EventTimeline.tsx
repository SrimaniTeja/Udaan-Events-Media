import { EVENT_STATUSES } from "@/lib/workflow";
import type { EventStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export function EventTimeline({ current }: { current: EventStatus }) {
  const currentIdx = EVENT_STATUSES.indexOf(current);

  return (
    <div className="grid gap-3">
      {EVENT_STATUSES.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={s} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full border",
                done ? "border-success/40 bg-success/20" : active ? "border-primary/50 bg-primary/20" : "border-border bg-surface-2",
              )}
            />
            <div>
              <div className={cn("text-sm", active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s}
              </div>
              {idx < EVENT_STATUSES.length - 1 ? (
                <div className="mt-2 h-5 w-px bg-border/60" />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}


