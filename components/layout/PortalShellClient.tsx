"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import type { SessionUser, UserRole } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

function Icon({ name }: { name: "grid" | "bell" | "user" | "folder" | "briefcase" }) {
  const common = "h-5 w-5";
  if (name === "grid")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
      </svg>
    );
  if (name === "folder")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    );
  if (name === "briefcase")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6a3 3 0 0 1 6 0v2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4z" />
        <path d="M9 8V6M15 8V6" />
      </svg>
    );
  if (name === "bell")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function iconForItem(item: NavItem): React.ComponentProps<typeof Icon>["name"] {
  if (item.href.includes("/dashboard")) return "grid";
  if (item.href.includes("/events")) return "folder";
  if (item.href.includes("/notifications")) return "bell";
  if (item.href.includes("/profile")) return "user";
  return "briefcase";
}

export function PortalShellClient({
  user,
  role,
  navItems,
  children,
}: {
  user: SessionUser;
  role: UserRole;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const roleLabel =
    role === "ADMIN" ? "Admin Portal" : role === "CAMERAMAN" ? "Cameraman Portal" : "Editor Portal";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-surface-2/40">
      <div className="flex items-center justify-between px-5 py-5">
        <div>
          <div className="text-sm font-semibold tracking-wide">Event Media</div>
          <div className="mt-1 text-xs text-muted-foreground">{roleLabel}</div>
        </div>
        <div className="text-xs rounded-full border border-border bg-surface px-2 py-1 text-muted-foreground">
          v0
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/12 text-foreground ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={iconForItem(item)} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-border bg-surface px-4 py-4">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-3">
            <Button variant="secondary" className="w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-[1400px]">
        <div className="hidden md:block">{Sidebar}</div>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72">{Sidebar}</div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-surface/40 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="text-sm font-semibold">Dashboard</div>
                <div className="text-xs text-muted-foreground">
                  Welcome back, {user.name.split(" ")[0]}.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
                <Icon name="bell" />
                <span>0</span>
              </div>
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}


