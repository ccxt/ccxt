import { NextResponse } from "next/server";
import { isLanguageId, isRunnable } from "@/lib/languages";
import { runCode } from "@/lib/runners";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CODE_BYTES = 64 * 1024;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { language, code } = (body ?? {}) as { language?: string; code?: string };

  if (typeof language !== "string" || !isLanguageId(language)) {
    return NextResponse.json({ error: "unsupported or missing language" }, { status: 400 });
  }
  if (!isRunnable(language)) {
    return NextResponse.json(
      { error: `${language} runs locally, not in the browser playground — see the install command.` },
      { status: 400 },
    );
  }
  if (typeof code !== "string" || code.length === 0) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  if (Buffer.byteLength(code, "utf8") > MAX_CODE_BYTES) {
    return NextResponse.json({ error: "code too large" }, { status: 413 });
  }

  try {
    const result = await runCode(language, code);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `execution failed: ${message}` }, { status: 500 });
  }
}
