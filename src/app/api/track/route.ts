import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TABLE_PREFIX = process.env.NEXT_PUBLIC_TABLE_PREFIX ?? "";
const TABLE = `${TABLE_PREFIX}page_views`;

// Lazy-initialize Supabase client (avoids build-time crash when env vars aren't set)
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// In-memory rate limit: key = "ip:page" -> last write timestamp
const recent = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

// Prune stale entries every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of recent) {
    if (now - ts > RATE_LIMIT_MS) recent.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  let body: { page?: string; referrer?: string; ua?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const page = body.page;
  if (!page || typeof page !== "string") {
    return new Response(null, { status: 400 });
  }

  const ip = getClientIP(req);
  const rateKey = `${ip}:${page}`;
  const now = Date.now();
  const last = recent.get(rateKey);

  if (last && now - last < RATE_LIMIT_MS) {
    return new Response(null, { status: 204 });
  }
  recent.set(rateKey, now);

  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null;

  // Fire and forget -- don't block the response on the DB write
  const supabase = getSupabase();
  if (!supabase) return new Response(null, { status: 204 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase.from(TABLE) as any)
    .insert({
      page,
      referrer: body.referrer || null,
      user_agent: body.ua || null,
      country,
    })
    .then(({ error }: { error: { message: string } | null }) => {
      if (error) console.error("[track] insert error:", error.message);
    });

  return new Response(null, { status: 204 });
}
