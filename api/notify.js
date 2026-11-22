import nodemailer from "nodemailer";
import { buildEmail } from "./_mailer.js";

/*
  Vercel serverless function -> POST /api/notify
  Emails the (browser-consented) coordinates to the owner. Credentials come from
  Vercel Environment Variables (process.env) — set them in the project settings,
  never commit them.
*/
const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

// Reused across warm invocations.
let transporter = null;
if (APP_EMAIL && APP_PASSWORD && APP_PASSWORD !== "your-16-char-gmail-app-password") {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: APP_EMAIL, pass: APP_PASSWORD },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method-not-allowed" });
    return;
  }

  const { lat, lon, place, source, userAgent, platform, language, screen, at } =
    req.body || {};

  if (typeof lat !== "number" || typeof lon !== "number") {
    res.status(400).json({ ok: false, error: "lat/lon required" });
    return;
  }

  console.log(
    `[skyline] visit — ${place || "?"} (${lat}, ${lon}) via ${source || "?"}`
  );

  if (!transporter) {
    res.status(200).json({ ok: true, emailed: false, reason: "mailer-not-configured" });
    return;
  }

  try {
    await transporter.sendMail(
      buildEmail({ lat, lon, place, source, userAgent, platform, language, screen, at })
    );
    res.status(200).json({ ok: true, emailed: true });
  } catch (err) {
    console.error("[skyline] send failed:", err.message);
    res.status(502).json({ ok: false, error: "send-failed" });
  }
}
