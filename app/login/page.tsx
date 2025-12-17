import { Suspense } from "react";
import { LoginClient } from "@/components/auth/LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <LoginClient />
    </Suspense>
  );
}


