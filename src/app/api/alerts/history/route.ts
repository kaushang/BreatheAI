/**
 * GET  /api/alerts/history  — fetch this user's alert log from Firestore
 * POST /api/alerts/history  — internal use: record a sent alert (called by /check)
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
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

  const snapshot = await adminDb
    .collection("alert_logs")
    .where("uid", "==", uid)
    .orderBy("sent_at", "desc")
    .limit(20)
    .get();

  const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  // This endpoint is called server-to-server by the /check route
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_API_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  await adminDb.collection("alert_logs").add({
    ...body,
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
