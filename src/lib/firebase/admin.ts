/**
 * Firebase Admin SDK
 *
 * Initializes the Firebase Admin app for use in server-side contexts:
 *   - Route Handlers (app/api/)
 *   - Server Components
 *   - Server Actions
 *
 * IMPORTANT: Never import this file in Client Components.
 * The private key is server-only and must not be exposed to the browser.
 *
 * Usage:
 *   import { adminAuth, adminDb } from "@/lib/firebase/admin";
 */

import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initAdminApp() {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      // Replace escaped newlines from env var string with actual newlines
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const adminApp = initAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
