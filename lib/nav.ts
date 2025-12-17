import type { UserRole } from "@/lib/types";

export type NavItem = {
  label: string;
  href: string;
};

export function getNavItems(role: UserRole): NavItem[] {
  if (role === "ADMIN") {
    return [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Events", href: "/admin/events" },
      { label: "Notifications", href: "/admin/notifications" },
      { label: "Profile", href: "/admin/profile" },
    ];
  }

  if (role === "CAMERAMAN") {
    return [
      { label: "Dashboard", href: "/cameraman/dashboard" },
      { label: "My Events", href: "/cameraman/events" },
      { label: "Notifications", href: "/cameraman/notifications" },
      { label: "Profile", href: "/cameraman/profile" },
    ];
  }

  return [
    { label: "Dashboard", href: "/editor/dashboard" },
    { label: "Available Tasks", href: "/editor/events" },
    { label: "Notifications", href: "/editor/notifications" },
    { label: "Profile", href: "/editor/profile" },
  ];
}


