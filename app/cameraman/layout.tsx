import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/requireRole";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function CameramanLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("CAMERAMAN");
  return (
    <PortalShell user={user} role="CAMERAMAN">
      {children}
    </PortalShell>
  );
}


