import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route mobile devices to the /mobile endpoint. Desktop stays on "/".
// /mobile remains directly visitable on any device (useful for testing).
const MOBILE_UA =
  /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile/i;

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (MOBILE_UA.test(ua) && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/mobile";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
