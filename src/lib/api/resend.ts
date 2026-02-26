/**
 * Resend Email Client
 *
 * Client for the Resend API, used to send AQI alert notification emails
 * to users when air quality exceeds their configured thresholds.
 * Supports HTML email templates with AQI data and health advisories.
 *
 * API Documentation: https://resend.com/docs
 */

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
