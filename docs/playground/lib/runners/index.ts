import type { RunnableLanguageId } from "../languages";
import type { OnChunk, RunResult } from "./sandbox";
import { runTs } from "./ts";
import { runPython } from "./python";
import { runPhp } from "./php";
import { runGo } from "./go";
import { runCsharp } from "./csharp";

const runners: Record<
  RunnableLanguageId,
  (code: string, onChunk?: OnChunk) => Promise<RunResult>
> = {
  ts: runTs,
  python: runPython,
  php: runPhp,
  go: runGo,
  csharp: runCsharp,
};

export function runCode(
  language: RunnableLanguageId,
  code: string,
  onChunk?: OnChunk,
): Promise<RunResult> {
  return runners[language](code, onChunk);
}

export type { OnChunk, RunResult } from "./sandbox";
