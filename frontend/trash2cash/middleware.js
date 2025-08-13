import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/auth/login", "/auth/signup"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const session = await verifySession();

  // Redirect to login if trying to access protected route without session
  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !session?.userId
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  // Redirect to dashboard if logged in and trying to access auth routes
  if (publicRoutes.includes(path) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
