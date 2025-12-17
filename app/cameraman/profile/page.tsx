import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/requireRole";

export default async function CameramanProfilePage() {
  const user = await requireRole("CAMERAMAN");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Name</div>
          <div className="mt-1">{user.name}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Email</div>
          <div className="mt-1">{user.email}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Role</div>
          <div className="mt-1">{user.role}</div>
        </div>
      </CardContent>
    </Card>
  );
}


