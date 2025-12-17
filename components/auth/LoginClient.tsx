"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Role = "ADMIN" | "CAMERAMAN" | "EDITOR";

const demoAccounts: { label: string; email: string; role: Role }[] = [
  { label: "Admin", email: "admin@udaan.local", role: "ADMIN" },
  { label: "Cameraman", email: "cameraman@udaan.local", role: "CAMERAMAN" },
  { label: "Editor", email: "editor@udaan.local", role: "EDITOR" },
  { label: "Editor Two", email: "editor2@udaan.local", role: "EDITOR" },
];

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = React.useState(demoAccounts[0].email);
  const [password, setPassword] = React.useState("password");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      setLoading(false);
      setError(data?.error ?? "Login failed");
      return;
    }

    const role: Role = data.user.role;
    if (next) {
      router.push(next);
      router.refresh();
      return;
    }

    router.push(
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "CAMERAMAN"
          ? "/cameraman/dashboard"
          : "/editor/dashboard",
    );
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-center">
            <div className="text-sm font-semibold tracking-wide text-muted-foreground">
              Event Media Workflow Management
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              Calm, role-based portals for Admin, Cameraman, and Editor.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
              This is the initial scaffold. Google Drive integration will be added next (backend-owned credentials, streaming upload/download, and status validations).
            </p>
            <div className="mt-6 grid max-w-md gap-3">
              <div className="rounded-2xl border border-border bg-surface/60 p-4">
                <div className="text-sm font-medium">Demo accounts</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {demoAccounts.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface"
                      onClick={() => setEmail(a.email)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Password: <span className="text-foreground/90">password</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your role account to enter the portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Password</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>
                {error ? (
                  <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                    {error}
                  </div>
                ) : null}
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


