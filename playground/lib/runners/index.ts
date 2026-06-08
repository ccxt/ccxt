import type { RunnableLanguageId } from "../languages";
import type { RunResult } from "./sandbox";
import { runJs } from "./js";
import { runTs } from "./ts";
import { runPython } from "./python";
import { runPhp } from "./php";
import { runGo } from "./go";
import { runCsharp } from "./csharp";

const runners: Record<RunnableLanguageId, (code: string) => Promise<RunResult>> = {
  js: runJs,
  ts: runTs,
  python: runPython,
  php: runPhp,
  go: runGo,
  csharp: runCsharp,
};

export function runCode(language: RunnableLanguageId, code: string): Promise<RunResult> {
  return runners[language](code);
}

export type { RunResult } from "./sandbox";
