import { generateKeyPairSync } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const testKeyFile = join(__dirname, ".test-rsa-key.p8");

function request(port, opts) {
  const { method = "GET", path = "/", body, headers = {} } = opts;
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path, method, headers },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        });
      }
    );
    req.on("error", reject);
    if (body != null) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

/** Mock Snowflake SQL API: OPTIMIZE returns a variant JSON string in `data[0][0]`. */
async function mockSnowflakeFetch(url, init) {
  const u = String(url);
  if (!u.includes("snowflakecomputing.com/api/v2/statements")) {
    return new Response("unexpected URL", { status: 500 });
  }
  const payload = JSON.parse(init.body);
  const stmt = payload.statement || "";

  if (stmt.includes("OPTIMIZE")) {
    const variant = {
      optimized_text: "mocked-short",
      estimated_tokens_before: 8,
      estimated_tokens_after: 4,
      estimated_tokens_saved: 4,
      model: "mock"
    };
    return new Response(JSON.stringify({ data: [[JSON.stringify(variant)]] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("POST /api/optimize", () => {
  let server;
  let port;
  let createApiServer;

  beforeAll(async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    writeFileSync(testKeyFile, privateKey.export({ type: "pkcs8", format: "pem" }));

    process.env.NODE_ENV = "test";
    process.env.SNOWFLAKE_HTTP_ACCOUNT = "test-account";
    process.env.SNOWFLAKE_ACCOUNT = "TESTACCT";
    process.env.SNOWFLAKE_USER = "TESTUSER";
    process.env.SNOWFLAKE_PUBLIC_KEY_FP = "SHA256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    process.env.SNOWFLAKE_WAREHOUSE = "WH";
    process.env.SNOWFLAKE_DATABASE = "DB";
    process.env.SNOWFLAKE_SCHEMA = "SC";
    process.env.SNOWFLAKE_LOG_SCHEMA = "SC";
    process.env.SNOWFLAKE_ROLE = "RL";
    process.env.SF_PRIVATE_KEY_PATH = "./.test-rsa-key.p8";

    vi.stubGlobal("fetch", vi.fn(mockSnowflakeFetch));

    ({ createApiServer } = await import("./http-app.mjs"));
    server = createApiServer();
    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    port = server.address().port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    try {
      unlinkSync(testKeyFile);
    } catch {
      /* ignore */
    }
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns 400 when tag is missing", async () => {
    const { status, body } = await request(port, {
      method: "POST",
      path: "/api/optimize",
      headers: { "Content-Type": "application/json" },
      body: { raw_text: "hello" }
    });
    expect(status).toBe(400);
    expect(JSON.parse(body)).toEqual({ error: "MISSING_TAG" });
  });

  it("returns 200 with optimized payload when Snowflake succeeds", async () => {
    const { status, body } = await request(port, {
      method: "POST",
      path: "/api/optimize",
      headers: { "Content-Type": "application/json", Origin: "https://chatgpt.com" },
      body: { tag: "demo", raw_text: "please shorten this prompt", model: null }
    });
    expect(status).toBe(200);
    const json = JSON.parse(body);
    expect(json.optimized_text).toBe("mocked-short");
    expect(json.estimated_tokens_saved).toBe(4);
    expect(fetch).toHaveBeenCalled();
  });

  it("handles OPTIONS /api/optimize for CORS preflight", async () => {
    const { status } = await request(port, {
      method: "OPTIONS",
      path: "/api/optimize",
      headers: { Origin: "https://chatgpt.com" }
    });
    expect(status).toBe(200);
  });

  it("returns 404 for unknown routes", async () => {
    const { status, body } = await request(port, { method: "GET", path: "/" });
    expect(status).toBe(404);
    expect(body).toBe("Not found");
  });
});
