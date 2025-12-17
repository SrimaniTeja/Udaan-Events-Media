import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/requireRole";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("ADMIN");
  return (
    <PortalShell user={user} role="ADMIN">
      {children}
    </PortalShell>
  );
}


