import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              Your account role does not have access to this portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full" variant="secondary">
                Go to home
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full">Switch account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


