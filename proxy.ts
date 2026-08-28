import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!session && !isLoginPage) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      url.searchParams.set("keyin", `${pathname}${search}`);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
