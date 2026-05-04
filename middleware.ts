import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ARTIST_ROUTES = /^\/artist(\/|$)/;
const ADMIN_ROUTES = /^\/admin(\/|$)/;
const AUTH_REQUIRED_ROUTES = /^\/(buyer|checkout)(\/|$)/;
const API_WRITE_ROUTES = /^\/api\/(artworks|upload|payments\/initialize|conversations)(\/|$)/;

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  const isAdminRoute = ADMIN_ROUTES.test(pathname);
  const isArtistRoute = ARTIST_ROUTES.test(pathname);
  const isAuthRequired = AUTH_REQUIRED_ROUTES.test(pathname);

  if (!session) {
    if (isAdminRoute || isArtistRoute || isAuthRequired) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isArtistRoute && role !== "ARTIST" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/artist/:path*",
    "/admin/:path*",
    "/buyer/:path*",
    "/checkout/:path*",
    "/checkout",
    "/api/artworks",
    "/api/artworks/:path*",
    "/api/upload/:path*",
    "/api/payments/initialize",
    "/api/conversations/:path*",
  ],
};
