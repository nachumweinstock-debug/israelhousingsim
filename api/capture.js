/**
 * Anonymous simulation capture endpoint.
 *
 * POST /api/capture  — called fire-and-forget when a user reaches the
 * summary screen; stores the full answer set and computed results.
 * GET  /api/capture?key=ADMIN_KEY — returns the latest captures.
 *
 * Storage is Upstash Redis via its REST API (zero dependencies). The
 * Vercel marketplace Upstash integration injects KV_REST_API_URL and
 * KV_REST_API_TOKEN automatically; plain Upstash uses the UPSTASH_*
 * names. Without either, captures still land in the function logs so
 * nothing breaks before the store is provisioned.
 */

const LIST_KEY = "simulations";
const MAX_STORED = 5000;
const MAX_PAYLOAD_BYTES = 10_000;

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function kvCommand(config, command) {
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

export default async function handler(req, res) {
  const config = kvConfig();

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
    if (config) {
      try {
        await kvCommand(config, ["LPUSH", LIST_KEY, serialized]);
        await kvCommand(config, ["LTRIM", LIST_KEY, 0, MAX_STORED - 1]);
      } catch (error) {
        // Log only; the user-facing flow must never notice a storage hiccup.
        console.error("simulation_capture_store_failed", String(error));
      }
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
    if (!config) {
      res.status(200).json({
        configured: false,
        note: "No Redis store configured yet. Add the Upstash integration in Vercel and captures will persist.",
        entries: [],
      });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const { result } = await kvCommand(config, ["LRANGE", LIST_KEY, 0, limit - 1]);
    const entries = (result ?? []).map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return { raw: item };
      }
    });
    res.status(200).json({ configured: true, count: entries.length, entries });
    return;
  }

  res.status(405).json({ error: "method not allowed" });
}
