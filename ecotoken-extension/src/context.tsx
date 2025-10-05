// src/context.tsx
console.log("[EcoToken] content script loaded");

const SELECTOR = [
  '[data-testid="prompt-textarea"]',
  '#prompt-textarea',
  'textarea',
  '[contenteditable="true"]',
  'input[type="text"]',
  'input[name="q"]'
].join(',');

function waitForEditor(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const found = document.querySelector<HTMLElement>(SELECTOR);
    if (found) return resolve(found);
    const obs = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(SELECTOR);
      if (el) { obs.disconnect(); resolve(el); }
    });
    obs.observe(document.documentElement, { subtree: true, childList: true });
  });
}

async function safeSendMessage<T=any>(msg: any): Promise<T> {
  try {
    // If the extension was reloaded, chrome.runtime.id may be missing
    if (!chrome?.runtime?.id) throw new Error("EXTENSION_RELOADED");
    // Ensure SW is awake and listening
    const pong = await chrome.runtime.sendMessage({ type: "PING" }).catch(() => null);
    if (!pong?.ok) throw new Error("SW_NOT_AVAILABLE");
    // Actual call
    return await chrome.runtime.sendMessage(msg);
  } catch (e: any) {
    const m = String(e?.message || e);
    if (m.includes("Extension context invalidated") || m.includes("EXTENSION_RELOADED") || m.includes("SW_NOT_AVAILABLE")) {
      alert("EcoToken was reloaded or the page changed. Please refresh this tab and try again.");
      return { error: "EXTENSION_CONTEXT_INVALIDATED" } as any;
    }
    console.error("[EcoToken] sendMessage error", e);
    return { error: m } as any;
  }
}

function readCurrentEditorText(initialTarget: HTMLElement): string | null {
  const active = document.activeElement as HTMLElement | null;
  const nodeList = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  const candidates: HTMLElement[] = [];
  if (active && typeof (active as any).matches === "function") candidates.push(active);
  candidates.push(...nodeList);
  if (initialTarget) candidates.push(initialTarget);

  let best: string | null = null;
  for (const el of candidates) {
    if (!el) continue;
    // skip invisible elements
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    if ((el as HTMLTextAreaElement).value !== undefined) {
      const v = String((el as HTMLTextAreaElement).value || "").trim();
      if (v.length > 0 && (best === null || v.length > best.length)) best = v;
      continue;
    }
    if (el.isContentEditable) {
      const v = String((el as HTMLElement).innerText || "").trim();
      if (v.length > 0 && (best === null || v.length > best.length)) best = v;
      continue;
    }
  }
  return best;
}

function getWritableEditorElement(initialTarget: HTMLElement): HTMLElement | null {
  const active = document.activeElement as HTMLElement | null;
  const nodeList = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  const candidates: HTMLElement[] = [];
  if (active && typeof (active as any).matches === "function" && active.matches(SELECTOR)) candidates.push(active);
  candidates.push(...nodeList);
  if (initialTarget) candidates.push(initialTarget);

  for (const el of candidates) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    return el;
  }
  return null;
}

function applyOptimizedTextToElement(el: HTMLElement, text: string) {
  try {
    // textarea / input handled via native setter to trigger frameworks
    if ((el as HTMLTextAreaElement).value !== undefined) {
      const anyEl = el as unknown as { value?: string };
      const proto = Object.getPrototypeOf(el);
      const setFromProto = Object.getOwnPropertyDescriptor(proto, "value")?.set
        || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
        || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      if (setFromProto) {
        setFromProto.call(el, text);
      } else {
        (anyEl as HTMLTextAreaElement).value = text;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    // contenteditable
    if (el.isContentEditable) {
      (el as HTMLElement).innerText = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
  } catch (e) {
    console.error("[EcoToken] failed to apply optimized text", e);
  }
}

function extractOptimizedText(raw: string): string {
  try {
    if (!raw) return raw;
    // Strip fenced code blocks like ```json ... ```
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    let body = (fenced ? fenced[1] : raw).trim();
    // If it's JSON and contains optimized_text, parse it
    if (body.startsWith("{") && body.includes("optimized_text")) {
      try {
        const obj = JSON.parse(body);
        if (obj && typeof obj.optimized_text === "string") return obj.optimized_text;
      } catch {}
      // Fallback: regex extract the field
      const m = body.match(/"optimized_text"\s*:\s*"([\s\S]*?)"/i);
      if (m) return m[1].replace(/\\n/g, "\n");
    }
    return body; // plain text
  } catch {
    return raw;
  }
}

function inject(target: HTMLElement) {
  if (document.getElementById("ecotoken-root")) return;

  const host = document.createElement("div");
  host.id = "ecotoken-root";
  host.style.position = "fixed";
  host.style.bottom = "16px";
  host.style.right = "16px";
  host.style.zIndex = "2147483647";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }
    /* Ensure [hidden] actually hides, even with display styles below */
    [hidden] { display: none !important; }
    :root, .dark {
      --font-size: 16px;
      --background: #ffffff;
      --foreground: oklch(0.145 0 0);
      --primary: #030213;
      --primary-foreground: oklch(1 0 0);
      --secondary: oklch(0.95 0.0058 264.53);
      --muted: #ececf0;
      --muted-foreground: #717182;
      --accent: #e9ebef;
      --destructive: #d4183d;
      --destructive-foreground: #ffffff;
      --border: rgba(0, 0, 0, 0.1);
      --input-background: #f3f3f5;
      --ring: oklch(0.708 0 0);
      --radius: 0.625rem;
      --green-400: #34d399;
      --green-500: #22c55e;
      --yellow-300: #fde047;
    }

    .eco-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 140px;
      min-height: 44px;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid rgba(74, 222, 128, 0.35);
      background: linear-gradient(90deg, rgba(52,211,153,0.18), rgba(34,197,94,0.18));
      color: #fff;
      backdrop-filter: blur(8px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.3s ease, background 0.3s ease;
      overflow: hidden;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .eco-btn:hover:not(:disabled) { transform: scale(1.04); }
    .eco-btn:active:not(:disabled) { transform: scale(0.97); }
    .eco-btn:disabled { cursor: not-allowed; opacity: 0.9; }

    .glass {
      position: absolute; inset: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
      backdrop-filter: blur(2px);
      pointer-events: none;
    }

    .glow {
      position: absolute; inset: 0; border-radius: 12px;
      background: rgba(34,197,94,0.22);
      filter: blur(16px);
      z-index: -1;
      transition: background 0.3s ease;
    }
    .eco-btn:hover .glow { background: rgba(74,222,128,0.28); }

    .content { position: relative; display: inline-flex; align-items: center; gap: 10px; }
    .zap {
      width: 18px; height: 18px; color: var(--yellow-300);
      transition: transform 0.3s ease;
    }
    .clicked .zap { transform: rotate(-15deg); }

    .label { font-size: 16px; font-weight: 600; letter-spacing: 0.2px; }

    /* Loading dots */
    .loading { display: inline-flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 999px; background: #fff; opacity: 0.7; }
    @keyframes pulseDot { 0%{ transform: scale(1); opacity: .6;} 50%{ transform: scale(1.25); opacity: 1;} 100%{ transform: scale(1); opacity: .6;} }
    .dot:nth-child(1){ animation: pulseDot .8s ease-in-out infinite; animation-delay: 0s; }
    .dot:nth-child(2){ animation: pulseDot .8s ease-in-out infinite; animation-delay: .12s; }
    .dot:nth-child(3){ animation: pulseDot .8s ease-in-out infinite; animation-delay: .24s; }

    /* Ripple on click */
    .ripple {
      position: absolute; inset: 0; border-radius: 12px; pointer-events: none;
      background: rgba(34,197,94,0.30);
      transform: scale(0);
      opacity: 0;
    }
    .clicked .ripple { animation: rippleExpand .32s ease forwards; }
    @keyframes rippleExpand { 0%{ transform: scale(0); opacity: 1;} 100%{ transform: scale(2); opacity: 0;} }
  `;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <button id="btn" class="eco-btn" type="button">
      <div class="glass"></div>
      <span class="ripple"></span>
      <span class="content idle">
        <svg class="zap" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" fill="currentColor"/>
        </svg>
        <span class="label">Optimize</span>
      </span>
      <span class="content loading" hidden>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
      <div class="glow"></div>
    </button>
  `;

  shadow.appendChild(style);
  shadow.appendChild(wrapper);

  const btn = shadow.getElementById("btn") as HTMLButtonElement;
  const idleContent = shadow.querySelector(".idle") as HTMLElement;
  const loadingContent = shadow.querySelector(".loading") as HTMLElement;
  const label = shadow.querySelector(".label") as HTMLElement;

  async function handleClick() {
    if (btn.disabled) return;
    btn.classList.add("clicked");
    setTimeout(() => btn.classList.remove("clicked"), 300);

    btn.disabled = true;
    idleContent.hidden = true;
    loadingContent.hidden = false;
    try {
      const currentText = readCurrentEditorText(target);
      const res: any = await safeSendMessage({ type: "OPTIMIZE", tag: "lik", raw_filter: null, raw_text: currentText });
      if (res?.optimized_text) {
        const outText = extractOptimizedText(String(res.optimized_text));
        console.log("[EcoToken] optimized_text", outText, {
          estimated_tokens_saved: res.estimated_tokens_saved ?? null,
          model: res.model ?? null
        });
        const writable = getWritableEditorElement(target) ?? target;
        applyOptimizedTextToElement(writable, outText);
        label.textContent = `Saved ~${res.estimated_tokens_saved ?? 0} tokens`;
      } else {
        label.textContent = res?.error ? `Err: ${res.error}` : "No result";
      }
    } catch (e) {
      console.error("[EcoToken] optimize error", e);
      label.textContent = "Err: see console";
    } finally {
      loadingContent.hidden = true;
      idleContent.hidden = false;
      setTimeout(() => { label.textContent = "Optimize"; btn.disabled = false; }, 1800);
    }
  }

  btn.addEventListener("click", handleClick);
}

waitForEditor().then(inject);

// Re-inject on SPA navigations (ChatGPT changes routes without reload)
addEventListener("popstate", () => waitForEditor().then(inject));
addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") waitForEditor().then(inject);
});
