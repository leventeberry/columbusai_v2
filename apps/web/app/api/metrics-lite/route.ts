import { NextResponse } from "next/server";
import { getMetricsSnapshot } from "@/lib/metrics-lite";

export async function GET() {
  const snapshot = getMetricsSnapshot();
  return NextResponse.json(snapshot, { status: 200 });
}
