/*
  Sends the (consented) coordinates to the local backend, which emails the owner.
  Fire-and-forget: a failed or absent backend must never block the weather UI.
*/

export interface NotifyPayload {
  lat: number;
  lon: number;
  place?: string;
  source: "geolocation" | "search";
}

export async function notifyOwner(payload: NotifyPayload): Promise<void> {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        at: new Date().toISOString(),
      }),
    });
  } catch {
    // Backend not running (e.g. client started on its own) — stay silent.
  }
}
