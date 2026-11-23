/*
  Shared email builder for the Vercel serverless alert function.
  NOTE: mirrors server/index.js buildEmail() — keep the two in sync if you edit.
  Files in /api whose name starts with "_" are NOT exposed as routes.
*/
export function buildEmail(v) {
  const APP_EMAIL = process.env.APP_EMAIL;
  const NOTIFY_TO = process.env.NOTIFY_TO || APP_EMAIL;
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
