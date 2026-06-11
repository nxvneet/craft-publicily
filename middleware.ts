import { NextResponse, type NextRequest } from "next/server";

// Reserved subdomains that should NOT be treated as a published site slug.
const RESERVED = new Set(["www", "app", "api", "admin", "dashboard", "create", "billing", "s"]);

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // Root domain, e.g. "voxel.site". In dev we also support "*.localhost".
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").split(":")[0].toLowerCase();

  let sub: string | null = null;
  if (root && host.endsWith(`.${root}`)) {
    sub = host.slice(0, host.length - root.length - 1);
  } else if (host.endsWith(".localhost")) {
    sub = host.slice(0, host.length - ".localhost".length);
  }

  // A real subdomain → serve the published site at its slug.
  if (sub && !RESERVED.has(sub) && !sub.includes(".")) {
    const rewritten = url.clone();
    rewritten.pathname = `/s/${sub}`;
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes, and static assets (incl. /presets/*).
  matcher: ["/((?!api|_next/static|_next/image|presets|favicon.ico|.*\\..*).*)"],
};
