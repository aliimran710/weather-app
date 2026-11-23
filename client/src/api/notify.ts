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
  } catch(error) {
    console.error("Failed to notify owner:", error);
  }
}
