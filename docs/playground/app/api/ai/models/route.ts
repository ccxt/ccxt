import { getFreeModels, getDefaultModelId } from "@/lib/ai/openrouter";

export const runtime = "nodejs";

// The playground picker's model list. Served from the process-lifetime cache
// warmed at startup (instrumentation.ts), so this is a memory read after boot.
// No key needed — OpenRouter's model catalog is public.
export async function GET() {
  const models = await getFreeModels();
  return Response.json({ models, defaultModel: getDefaultModelId(models) });
}
