import type { EventStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

function variantFor(status: EventStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "FINAL_UPLOADED") return "success";
  if (status === "RAW_UPLOADED") return "warning";
  return "default";
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return <Badge variant={variantFor(status)}>{status}</Badge>;
}


