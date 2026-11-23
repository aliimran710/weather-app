/* Vercel serverless function -> GET /api/health */
export default function handler(_req, res) {
  const configured = !!(
    process.env.APP_EMAIL &&
    process.env.APP_PASSWORD &&
    process.env.APP_PASSWORD !== "your-16-char-gmail-app-password"
  );
  res.status(200).json({ ok: true, mailerConfigured: configured });
}
