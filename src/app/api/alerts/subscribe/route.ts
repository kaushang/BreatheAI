/**
 * POST /api/alerts/subscribe
 *
 * Save or update the authenticated user's AQI alert threshold and
 * email preferences in their Firestore profile.
 *
 * Body: { threshold: number, emailEnabled: boolean, email?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { threshold, emailEnabled, email } = await request.json() as {
    threshold: number;
    emailEnabled: boolean;
    email?: string;
  };

  if (typeof threshold !== "number" || threshold < 0 || threshold > 500) {
    return NextResponse.json(
      { error: "threshold must be a number between 0 and 500" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {
    aqi_alert_threshold: threshold,
    alert_email_enabled: emailEnabled,
    updated_at: new Date().toISOString(),
  };
  if (email) update.alert_email = email;

  await adminDb.collection("users").doc(uid).set(update, { merge: true });

  return NextResponse.json({ success: true, threshold, emailEnabled });
}
