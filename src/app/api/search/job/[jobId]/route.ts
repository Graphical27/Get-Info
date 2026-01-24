import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PY_BACKEND_URL = process.env.PY_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  const res = await fetch(
    `${PY_BACKEND_URL}/search/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
