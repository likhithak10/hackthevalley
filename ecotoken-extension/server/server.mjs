import fs from "fs";
import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url) }); // load server/.env

const {
  PORT = "3000",
  SNOWFLAKE_HTTP_ACCOUNT,
  SNOWFLAKE_ACCOUNT,
  SNOWFLAKE_USER,
  SNOWFLAKE_PUBLIC_KEY_FP,
  SNOWFLAKE_WAREHOUSE,
  SNOWFLAKE_DATABASE,
  SNOWFLAKE_SCHEMA,
  SNOWFLAKE_LOG_SCHEMA = "ECOTOKEN",
  SNOWFLAKE_ROLE,
  SF_PRIVATE_KEY_PATH = "./rsa_key.p8",
  SF_PRIVATE_KEY_PASSPHRASE,
  EXTENSION_ID,
  ALLOW_ORIGIN
} = process.env;

function makeSnowflakeJWT() {
  const account = SNOWFLAKE_ACCOUNT.toUpperCase();
  const user    = SNOWFLAKE_USER.toUpperCase();
  const iss = `${account}.${user}.${SNOWFLAKE_PUBLIC_KEY_FP}`;
  const sub = `${account}.${user}`;
  const iat = Math.floor(Date.now()/1000);
  const exp = iat + 59*60;

  const key = SF_PRIVATE_KEY_PASSPHRASE
    ? { key: fs.readFileSync(new URL(SF_PRIVATE_KEY_PATH, import.meta.url)), passphrase: SF_PRIVATE_KEY_PASSPHRASE }
    : fs.readFileSync(new URL(SF_PRIVATE_KEY_PATH, import.meta.url));

  return jwt.sign({ iss, sub, iat, exp }, key, { algorithm: "RS256" });
}

async function execSqlApi(statement, bindings) {
  const token = makeSnowflakeJWT();
  const url = `https://${SNOWFLAKE_HTTP_ACCOUNT}.snowflakecomputing.com/api/v2/statements`;
  const payload = {
    statement,
    warehouse: SNOWFLAKE_WAREHOUSE,
    database:  SNOWFLAKE_DATABASE,
    schema:    SNOWFLAKE_SCHEMA,
    role:      SNOWFLAKE_ROLE,
    timeout:   60,
    bindings
  };
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function insertPromptSample(tag, rawText) {
  if (!rawText) return false; // nothing to write
  // Insert into ECOTOKEN_DB.ECOTOKEN.PROMPT_TUNING by default (matches proc)
  const tableFqn = `${SNOWFLAKE_DATABASE}.${SNOWFLAKE_LOG_SCHEMA}.PROMPT_TUNING`;
  for (const tsCol of ["CREATED_AT", "created_ts"]) {
    try {
      const stmt = `INSERT INTO ${tableFqn} (tag, raw_sample, ${tsCol}) VALUES (?, ?, CURRENT_TIMESTAMP())`;
      await execSqlApi(stmt, {
        "1": { type: "TEXT", value: tag },
        "2": { type: "TEXT", value: rawText }
      });
      console.log(`[EcoToken API] inserted prompt`, { table: tableFqn, tsCol, tag, textLen: rawText?.length ?? 0 });
      return true; // success
    } catch (e) {
      console.error(`[EcoToken API] insert failed`, { table: tableFqn, tsCol, error: String(e) });
    }
  }
  // swallow insert errors so optimization can still proceed (proc can use raw text fallback)
  return false;
}

async function optimizeViaSqlApi(tag, raw_filter = null, model = null) {
  const token = makeSnowflakeJWT();
  const procFqn = `${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.OPTIMIZE`;
  const payload = {
    statement: `CALL ${procFqn}(?, ?, ?)`,
    warehouse: SNOWFLAKE_WAREHOUSE,
    database:  SNOWFLAKE_DATABASE,
    schema:    SNOWFLAKE_SCHEMA,
    role:      SNOWFLAKE_ROLE,
    timeout:   60,
    bindings: {
      "1": { type: "TEXT", value: tag },
      "2": { type: "TEXT", value: raw_filter },
      "3": { type: "TEXT", value: model }
    }
  };

  const url = `https://${SNOWFLAKE_HTTP_ACCOUNT}.snowflakecomputing.com/api/v2/statements`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  console.log(`[EcoToken API] optimize call done`, { tag, hasRowset: Array.isArray(data?.rowset), hasData: Array.isArray(data?.data) });

  // Robustly unwrap SQL API response for CALL results
  const tryParse = (v) => {
    if (v == null) return v;
    if (typeof v === "string") {
      try { return JSON.parse(v); } catch { return v; }
    }
    return v;
  };

  if (Array.isArray(data?.rowset) && data.rowset.length > 0) {
    const row = data.rowset[0];
    const cols = data?.resultSetMetaData?.rowType?.map(c => c.name?.toLowerCase?.()) || [];
    if (row.length === 1) return tryParse(row[0]);
    const obj = {};
    for (let i = 0; i < row.length; i++) obj[cols[i] || String(i)] = tryParse(row[i]);
    return obj;
  }
  if (Array.isArray(data?.data) && data.data.length > 0) {
    const row = data.data[0];
    return Array.isArray(row) ? tryParse(row[0]) : row;
  }
  return null;
}

async function insertOptimizationStats(tag, stats) {
  try {
    if (!stats) return false;
    const before = stats.estimated_tokens_before ?? null;
    const after  = stats.estimated_tokens_after ?? null;
    const saved  = stats.estimated_tokens_saved ?? ((before != null && after != null) ? (before - after) : null);
    const model  = stats.model ?? null;
    if (before == null && after == null && saved == null && !model) return false;

    const procFqn = `${SNOWFLAKE_DATABASE}.${SNOWFLAKE_SCHEMA}.LOG_STATS_TEST`;
    const stmt = `CALL ${procFqn}(?, ?, ?, ?, ?)`;
    await execSqlApi(stmt, {
      "1": { type: "TEXT", value: tag },
      "2": { type: "TEXT", value: model },
      // Send numerics as TEXT to avoid driver integer type issues; proc will coerce
      "3": { type: "TEXT", value: before == null ? null : String(before) },
      "4": { type: "TEXT", value: after  == null ? null : String(after)  },
      "5": { type: "TEXT", value: saved  == null ? null : String(saved)  }
    });
    console.log(`[EcoToken API] logged stats via proc`, { proc: procFqn, tag, model, before, after, saved });
    return true;
  } catch (e) {
    console.warn(`[EcoToken API] stats proc failed`, { error: String(e) });
    return false;
  }
}

function corsHeaders(origin) {
  const allowed = new Set([
    EXTENSION_ID ? `chrome-extension://${EXTENSION_ID}` : null,
    ALLOW_ORIGIN || null,
    "http://localhost:3001", // dev tools
  ].filter(Boolean));
  const ok = origin && (allowed.has(origin) || process.env.NODE_ENV !== "production");
  return {
    "Access-Control-Allow-Origin": ok ? origin : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS" && req.url === "/api/optimize") {
    res.writeHead(200, cors); res.end(); return;
  }

  if (req.method === "POST" && req.url === "/api/optimize") {
    try {
      const body = await new Promise((resolve) => {
        const bufs = []; req.on("data", c => bufs.push(c));
        req.on("end", () => resolve(Buffer.concat(bufs).toString("utf8")));
      });
      const { tag, raw_filter = null, model = null, raw_text = null } = body ? JSON.parse(body) : {};
      if (!tag) { res.writeHead(400, { ...cors, "Content-Type": "application/json" }); res.end(JSON.stringify({ error:"MISSING_TAG" })); return; }

      // 1) Persist the user's current prompt (optional)
      console.log(`[EcoToken API] /optimize`, { tag, rawTextLen: raw_text?.length ?? 0 });
      try { await insertPromptSample(tag, raw_text); } catch {}

      // 2) Optimize; also pass raw_text so the proc can fallback to it if no row
      const out = await optimizeViaSqlApi(tag, raw_text ?? raw_filter, model);
      // 3) Log analytics (best-effort)
      if (out && typeof out === "object") {
        await insertOptimizationStats(tag, out);
      }
      if (!out) console.warn(`[EcoToken API] optimize returned empty`, { tag });
      res.writeHead(200, { ...cors, "Content-Type": "application/json" });
      res.end(JSON.stringify(out || { error: "NO_RESULT" })); return;
    } catch (e) {
      console.error(`[EcoToken API] handler error`, e);
      res.writeHead(500, { ...cors, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "BACKEND_EXCEPTION", detail: String(e) })); return;
    }
  }

  res.writeHead(404, cors); res.end("Not found");
});

server.listen(Number(PORT), () => {
  console.log(`[EcoToken API] http://localhost:${PORT}`);
});
