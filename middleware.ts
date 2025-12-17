import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { UserRole } from "@/lib/types";

const COOKIE_NAME = "event_media_session";

function secret() {
  const s = process.env.AUTH_SECRET ?? "dev-insecure-secret";
  return new TextEncoder().encode(s);
}

async function readRole(req: NextRequest): Promise<UserRole | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role;
    if (role === "ADMIN" || role === "CAMERAMAN" || role === "EDITOR") return role;
    return null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never gate API here — route handlers will enforce auth/role.
  if (pathname.startsWith("/api")) return NextResponse.next();

  const role = await readRole(req);

  // Logged-in users shouldn't see login again.
  if (pathname === "/login" && role) {
    const url = req.nextUrl.clone();
    url.pathname =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "CAMERAMAN"
          ? "/cameraman/dashboard"
          : "/editor/dashboard";
    return NextResponse.redirect(url);
  }

  const protect = (required: UserRole) => {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== required) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    return null;
  };

  if (pathname.startsWith("/admin")) return protect("ADMIN") ?? NextResponse.next();
  if (pathname.startsWith("/cameraman"))
    return protect("CAMERAMAN") ?? NextResponse.next();
  if (pathname.startsWith("/editor")) return protect("EDITOR") ?? NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


