import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PY_BACKEND_URL = process.env.PY_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    username?: string;
    maxPages?: number;
    pageSize?: number;
    platform?: string;
    platforms?: string[];
  } | null;

  const username = body?.username?.trim();
  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 },
    );
  }

  const normalizedPlatforms = (() => {
    const incoming = [
      ...(Array.isArray(body?.platforms) ? body!.platforms : []),
      ...(body?.platform ? [body.platform] : []),
    ];

    const allowed = new Set(["instagram", "reddit"]);
    const cleaned = incoming
      .map((p) => p?.trim().toLowerCase())
      .filter((p): p is string => Boolean(p && allowed.has(p)));

    return cleaned.length > 0 ? Array.from(new Set(cleaned)) : ["instagram"];
  })();

  const res = await fetch(`${PY_BACKEND_URL}/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username,
      maxPages: body?.maxPages ?? 5,
      pageSize: body?.pageSize ?? 10,
      platforms: normalizedPlatforms,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
