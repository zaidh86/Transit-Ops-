import { NextResponse, type NextRequest } from "next/server";
import { HOME_BY_ROLE, TOKEN_COOKIE } from "@/lib/constants";
import type { Role } from "@/lib/types";

/**
 * Edge guard (Next 16's renamed middleware). It must live under `src/`
 * alongside `app/` — at the project root it is silently never loaded.
 *
 * It checks only that a token is PRESENT, so a signed-out user is bounced to
 * /login without first downloading and rendering an authenticated screen. It
 * does not verify the signature and it does not enforce roles: the backend does
 * both on every request, and RoleGuard handles per-role UI gating.
 *
 * The token therefore has to live in a cookie rather than localStorage — edge
 * middleware cannot read localStorage.
 */

/** Readable by any role: every authenticated user can list trips. */
const FALLBACK_HOME = "/trips";

/**
 * Reads the role out of the JWT payload to pick a landing page.
 *
 * This decodes WITHOUT verifying, which is fine because the answer only selects
 * a redirect target — a forged role here buys nothing, since the backend
 * re-checks the signature and the role on every single request. It must never
 * become the basis of an access decision.
 *
 * Without this, every signed-in user would be sent to /dashboard, which is
 * built on the analytics endpoint and 403s for DRIVER and SAFETY_OFFICER —
 * landing those two roles on a dead-end "no access" screen.
 */
function homeForToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    if (!payload) return FALLBACK_HOME;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { role } = JSON.parse(json) as { role?: Role };

    return role && role in HOME_BY_ROLE ? HOME_BY_ROLE[role] : FALLBACK_HOME;
  } catch {
    // Malformed token. Send them somewhere harmless; the API will reject them
    // and the client will log them out.
    return FALLBACK_HOME;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = pathname === "/" || pathname.startsWith("/login");
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL("/login", request.url);
    // Remember where they were headed so login can send them back.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in and sitting on the login page — send them inward, to a
  // screen their role can actually read.
  // "/" stays reachable so the landing page remains viewable when signed in.
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL(homeForToken(token), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
