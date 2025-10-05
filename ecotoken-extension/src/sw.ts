const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001/api"; // set in .env files

console.log(`[EcoToken] SW running`, { API_BASE });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const respond = sendResponse as unknown as (response: unknown) => void;

  // Lightweight health check used by the content script before heavy calls
  if (msg?.type === "PING") {
    respond({ ok: true });
    return false; // responded synchronously
  }

  (async () => {
    if (msg?.type !== "OPTIMIZE") {
      respond({ error: "BAD_MESSAGE" });
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: msg.tag, raw_filter: msg.raw_filter ?? null, raw_text: msg.raw_text ?? null })
      });
      if (!r.ok) {
        respond({ error: "BACKEND_FETCH_FAILED", detail: await r.text() });
        return;
      }
      respond(await r.json());
    } catch (e) {
      respond({ error: "NETWORK_ERROR", detail: String(e) });
    }
  })();

  return true; // keep the channel open
});
