import { NextRequest, NextResponse } from "next/server";

/**
 * Skill Store Global Access & Maintenance Middleware
 *
 * Maintenance Behavior:
 * - Public visitors: Shows ONLY the Maintenance page across all public pages & returns 503 for public customer APIs.
 * - Admin panel & backend (/admin, /admin/*): MUST remain 100% accessible to admin users.
 * - Admin APIs (/api/admin/*) & Auth (/api/auth/*): Fully accessible so dashboard and logins continue working.
 * - Controlled by environment variable: MAINTENANCE_MODE=true / false (or NEXT_PUBLIC_MAINTENANCE_MODE=true / false).
 * - When MAINTENANCE_MODE=false or unset: Normal website works exactly as before.
 */
export function middleware(req: NextRequest) {
  // Website is LIVE by default (can be turned into maintenance mode by setting MAINTENANCE_MODE=true)
  const isMaintenanceMode =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // If maintenance mode is not active, allow all normal traffic
  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  // If user is a logged-in admin, allow full access to the entire frontend so they can inspect and test products!
  const adminCookie = req.cookies.get("skill_store_admin_token")?.value;
  if (adminCookie === "logged_in") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // 1. Allow Next.js internal files and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/android-chrome") ||
    pathname.startsWith("/icon") ||
    pathname === "/site.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|json|map|txt)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Allow Admin Panel pages (/admin, /admin/login, etc.)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  // 3. Allow Admin API endpoints (/api/admin/*) required by the Admin dashboard
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // 4. Allow Authentication endpoints (/api/auth/*) required for login / session validation
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 5. Allow the maintenance page itself to avoid redirect/rewrite loops
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  // 6. Block customer / public API calls with 503 Service Unavailable during maintenance
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        success: false,
        error: "Skill Store is currently undergoing scheduled maintenance. Please try again shortly.",
        maintenance: true,
      },
      {
        status: 503,
        headers: {
          "Retry-After": "3600",
        },
      }
    );
  }

  // 7. For all other public website URLs, rewrite to the Maintenance Page
  const maintenanceUrl = req.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  return NextResponse.rewrite(maintenanceUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
