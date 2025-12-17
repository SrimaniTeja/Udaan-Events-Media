import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/requireRole";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function EditorLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("EDITOR");
  return (
    <PortalShell user={user} role="EDITOR">
      {children}
    </PortalShell>
  );
}


