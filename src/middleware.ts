import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.includes(".")) {
    console.log("ミドルウェアのテストtest");
  }
  return NextResponse.next();
}

export const config = {
    matcher: ['/blog/:path*']
}