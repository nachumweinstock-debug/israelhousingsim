/**
 * Anonymous simulation capture endpoint.
 *
 * POST /api/capture, called fire-and-forget when a user reaches the
 * summary screen; stores the full answer set and computed results.
 * GET  /api/capture?key=ADMIN_KEY, returns the latest captures.
 *
 * Primary store: the Railway Redis instance in the simcapture project,
 * reached over its public TCP proxy via REDIS_URL. Falls back to the
 * Upstash REST API when only KV_REST_API_URL/KV_REST_API_TOKEN (or
 * UPSTASH_*) are configured. With no store at all, captures still land
 * in the function logs so nothing breaks.
 */
import Redis from "ioredis";

const LIST_KEY = "simulations";
const MAX_STORED = 5000;
const MAX_PAYLOAD_BYTES = 10_000;

function upstashConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function upstashCommand(config, command) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`kv ${command[0]} failed: ${response.status}`);
  }
  return response.json();
}

/** Runs `fn(client)` against the Railway Redis and always disconnects. */
async function withRedis(fn) {
  const client = new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 2,
    lazyConnect: true,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    client.disconnect();
  }
}

async function storePush(serialized) {
  if (process.env.REDIS_URL) {
    await withRedis(async (client) => {
      await client.lpush(LIST_KEY, serialized);
      await client.ltrim(LIST_KEY, 0, MAX_STORED - 1);
    });
    return "railway-redis";
  }
  const upstash = upstashConfig();
  if (upstash) {
    await upstashCommand(upstash, ["LPUSH", LIST_KEY, serialized]);
    await upstashCommand(upstash, ["LTRIM", LIST_KEY, 0, MAX_STORED - 1]);
    return "upstash";
  }
  return null;
}

async function storeRange(limit) {
  if (process.env.REDIS_URL) {
    const entries = await withRedis((client) => client.lrange(LIST_KEY, 0, limit - 1));
    return { backend: "railway-redis", entries };
  }
  const upstash = upstashConfig();
  if (upstash) {
    const { result } = await upstashCommand(upstash, ["LRANGE", LIST_KEY, 0, limit - 1]);
    return { backend: "upstash", entries: result ?? [] };
  }
  return { backend: null, entries: [] };
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      res.status(400).json({ error: "expected a JSON body" });
      return;
    }
    const record = {
      ts: new Date().toISOString(),
      country: req.headers["x-vercel-ip-country"] ?? null,
      ua: req.headers["user-agent"] ?? null,
      ...payload,
    };
    const serialized = JSON.stringify(record);
    if (serialized.length > MAX_PAYLOAD_BYTES) {
      res.status(413).json({ error: "payload too large" });
      return;
    }

    console.log("simulation_capture", serialized);
    try {
      await storePush(serialized);
    } catch (error) {
      // Log only; the user-facing flow must never notice a storage hiccup.
      console.error("simulation_capture_store_failed", String(error));
    }
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || req.query.key !== adminKey) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const { backend, entries } = await storeRange(limit);
    if (!backend) {
      res.status(200).json({
        configured: false,
        note: "No Redis store configured. Set REDIS_URL (Railway) or the Upstash env vars.",
        entries: [],
      });
      return;
    }
    const parsed = entries.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return { raw: item };
      }
    });
    res.status(200).json({ configured: true, backend, count: parsed.length, entries: parsed });
    return;
  }

  res.status(405).json({ error: "method not allowed" });
}
