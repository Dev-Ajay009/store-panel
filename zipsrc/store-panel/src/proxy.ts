import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

// Optimistic check only: it keeps signed-out visitors away from the panel.
// The real checks (user exists, role allows the action) happen on the server
// in requireUser() and in the product service.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === "/login";

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|ico)$).*)"],
};
