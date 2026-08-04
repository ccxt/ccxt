import { NextResponse } from "next/server";
import { PROMPTS } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAMPLE = 8;

// Sampled server-side so the full prompt list never ships in the client bundle.
export async function GET() {
  const idx = PROMPTS.map((_, i) => i);
  const take = Math.min(SAMPLE, idx.length);
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(Math.random() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const prompts = idx.slice(0, take).map((i) => PROMPTS[i]);
  return NextResponse.json({ prompts }, { headers: { "Cache-Control": "no-store" } });
}
