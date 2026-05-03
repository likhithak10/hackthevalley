//Service Worker that handles messages from the content script
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001/api"; //reads backend url in .env files

console.log(`[EcoToken] SW running`, { API_BASE });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => { //listens for msg from content script
  const respond = sendResponse as unknown as (response: unknown) => void;

  //PING handler
  //health check to check if the SW is awake before sending real msg
  if (msg?.type === "PING") {
    respond({ ok: true });
    return false; // responded synchronously
  }

  (async () => {
    if (msg?.type !== "OPTIMIZE") {
      respond({ error: "BAD_MESSAGE" });
      return;
    }

    //take text from content script, send to backend API, return response
    try {
      const r = await fetch(`${API_BASE}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: msg.tag, raw_filter: msg.raw_filter ?? null, raw_text: msg.raw_text ?? null })
      });

      //error msg: backend is down or fetch fails
      if (!r.ok) {
        respond({ error: "BACKEND_FETCH_FAILED", detail: await r.text() }); 
        return;
      }
      respond(await r.json());
    } catch (e) {
      respond({ error: "NETWORK_ERROR", detail: String(e) });
    }
  })();

  return true; //keep the msg channel open so response can come back after await is done
});
