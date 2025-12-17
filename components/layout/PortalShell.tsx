import type { ReactNode } from "react";
import type { NavItem } from "@/lib/nav";
import { getNavItems } from "@/lib/nav";
import type { SessionUser, UserRole } from "@/lib/types";
import { PortalShellClient } from "@/components/layout/PortalShellClient";

export function PortalShell({
  user,
  role,
  children,
}: {
  user: SessionUser;
  role: UserRole;
  children: ReactNode;
}) {
  const navItems: NavItem[] = getNavItems(role);
  return (
    <PortalShellClient user={user} role={role} navItems={navItems}>
      {children}
    </PortalShellClient>
  );
}


