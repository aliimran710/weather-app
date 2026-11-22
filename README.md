# Skyline — premium local weather

A single-page weather app with a living sky background, 3D glass cards, and smooth
scroll animations. It asks for the visitor's location (via the browser's native
permission prompt), then shows their local conditions in full detail. A small local
backend emails the consented coordinates to you each time someone uses it.

Built with **Vite + React + TypeScript + Tailwind + shadcn/ui**, with weather data
from the free, keyless **Open-Meteo** API.

## Features

- **Living sky** — the background renders the real conditions and day/night at the
  location (sun, moon, stars, drifting clouds, rain/snow). The UI flips between a
  light (day) and dark (night) theme automatically.
- **Full detail** — current temperature, feels-like, humidity, wind (speed, gusts,
  direction compass), pressure, visibility, UV index, dew point, sunrise/sunset,
  hourly (24 h), 7-day forecast, and air quality (EU AQI + PM2.5/PM10).
- **Units** — °C/°F and km/h / mph toggles, remembered across reloads.
- **Resilient** — if location is denied, a city search takes over. Loading and error
  states everywhere.
- **Location alert backend** — emails you the coordinates (+ map link, browser,
  platform, language) on each visit.

## Project structure

```
weather-app/
  client/   # React + Vite frontend (Tailwind, shadcn/ui) — its own package.json
  server/   # Express + nodemailer backend — its own package.json; .env lives HERE
```

The two are independent packages: each has its own `package.json` and `node_modules`,
installed and run separately.

## Prerequisites

- Node.js 18+
- A Gmail account with an **App Password** (for the alert email)

## Setup

Install each package once:

```bash
cd server && npm install
cd ../client && npm install
```

Then create the backend's `.env` (it lives in `server/`, gitignored — never commit it):

```bash
cd server
cp .env.example .env   # then edit .env with your real values
```

`server/.env`:

```
APP_EMAIL=you@gmail.com        # the account that SENDS the alert
APP_PASSWORD=xxxxxxxxxxxxxxxx   # Gmail App Password (not your login password)
NOTIFY_TO=you@gmail.com        # where the alert is delivered
PORT=8787                      # the port the backend listens on
```

**Getting a Gmail App Password:** enable 2-Step Verification on the account, then go
to <https://myaccount.google.com/apppasswords> and generate one. Paste it into
`server/.env` (spaces are fine). Without valid credentials the app still runs — alerts
are just skipped and logged to the console.

## Run

Use **two terminals**:

```bash
# Terminal 1 — backend
cd server
npm start           # -> listens on http://127.0.0.1:8787  (set by server/.env PORT)
```

```bash
# Terminal 2 — frontend
cd client
npm run dev         # -> http://localhost:5173
```

Open <http://localhost:5173>.

**How they connect:** `client/vite.config.ts` proxies every `/api/*` request to the
backend at `http://127.0.0.1:8787`. So the frontend calls same-origin `/api/notify`
and Vite forwards it to the server — no CORS to manage in dev. If you change the
backend port in `server/.env`, update the proxy `target` in `client/vite.config.ts` to
match.

Other client scripts: `npm run build` (bundle to `client/dist/`), `npm run preview`,
`npm run typecheck`. Backend: `npm run dev` runs it with `--watch` (auto-restart on
edits).

## Deploy to Vercel

The repo is set up as **one Vercel project**: the frontend is served statically from
`client/dist`, and the backend runs as serverless functions under `/api`. Because they
share one domain, the frontend's `/api/notify` call hits the function directly — no CORS,
no proxy, no code change.

Files involved:

- `vercel.json` — builds the client and declares the `api/*.js` functions.
- `package.json` (root) — installs `nodemailer` for the functions.
- `api/notify.js` → `POST /api/notify`, `api/health.js` → `GET /api/health`
  (`api/_mailer.js` is shared and not routed).

The Express app in `server/` is **not** used on Vercel — it's only for the local
two-terminal workflow. The `api/` functions are its serverless equivalent.

### Steps

1. Install the CLI and log in:
   ```bash
   npm i -g vercel
   vercel login
   ```
2. From the project root, link/create the project:
   ```bash
   vercel
   ```
3. Add the secrets as Environment Variables (Production + Preview), **never committed**:
   ```bash
   vercel env add APP_EMAIL
   vercel env add APP_PASSWORD
   vercel env add NOTIFY_TO
   ```
   (Or set them in the Vercel dashboard → Project → Settings → Environment Variables.)
4. Deploy:
   ```bash
   vercel --prod
   ```

### Notes

- **Ports:** serverless functions have no fixed port — Vercel manages that. Locally,
  `vercel dev` serves the client + functions together on one port (default 3000). The
  `8787` port only applies to the standalone `server/` Express used in the non-Vercel
  local workflow.
- **Privacy:** a public deployment emails you the real, consented location of every
  visitor who clicks Allow. Keep the footer disclosure and share the URL only with
  people who understand that.
- **Secrets:** they live solely in Vercel's environment variables. `server/.env` is
  gitignored and never uploaded (`.vercelignore` also excludes `server/`).

## How the location alert works

1. The browser shows its native location permission prompt. Nothing precise is read
   until the visitor clicks **Allow** — this cannot be bypassed.
2. On allow, the app fetches weather for those coordinates **and** POSTs them to the
   local backend (`/api/notify`), which emails them to `NOTIFY_TO`.
3. If the visitor denies, they can search for a city; no coordinates are sent.

This is intended for **localhost use**. Credentials live only in the server-side
`.env` and are never bundled into the frontend.

## Customization

A few deliberate decision points, if you want to tune them:

- **`src/lib/weatherCodes.ts`** — the WMO-code → sky-scene mapping (which conditions
  read as overcast vs. storm, etc.).
- **`server/index.js` → `buildEmail()`** — the alert email's subject, fields, styling.
- **`src/hooks/useGeolocation.ts`** — what happens when permission is denied.
- **`src/index.css`** — the day/night color tokens (`:root` and `html.theme-night`).

## Data sources

- Weather & air quality: [Open-Meteo](https://open-meteo.com/) (no key)
- Reverse geocoding: [BigDataCloud](https://www.bigdatacloud.com/) client endpoint (no key)
- City search: Open-Meteo geocoding
