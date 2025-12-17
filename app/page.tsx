import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function Home() {
  // Route users to their portal if logged in; otherwise go to login.
  // This page stays intentionally minimal.
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.role === "ADMIN") redirect("/admin/dashboard");
  if (user.role === "CAMERAMAN") redirect("/cameraman/dashboard");
  redirect("/editor/dashboard");
}
