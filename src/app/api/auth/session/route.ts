/**
 * Auth Session Route Handler
 *
 * POST /api/auth/session
 *   Exchanges a short-lived Firebase ID token (from client-side sign-in) for a
 *   long-lived, httpOnly session cookie (14 days). This cookie is what the
 *   middleware and server routes use to identify the authenticated user.
 *
 * DELETE /api/auth/session
 *   Clears the session cookie (logout). Call this alongside client-side signOut().
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "__session";
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in ms

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid idToken" }, { status: 400 });
    }

    // Create a Firebase session cookie from the ID token
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000, // maxAge is in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth Session] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create session. Please sign in again." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Expire the cookie immediately
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
