import type { RunnableLanguageId } from "../languages";
import type { OnChunk, RunResult } from "./sandbox";
import { runTs } from "./ts";
import { runPython } from "./python";
import { runPhp } from "./php";
import { runGo } from "./go";
import { runCsharp } from "./csharp";
import { runJava } from "./java";

const runners: Record<
  RunnableLanguageId,
  (code: string, onChunk?: OnChunk) => Promise<RunResult>
> = {
  ts: runTs,
  python: runPython,
  php: runPhp,
  go: runGo,
  csharp: runCsharp,
  java: runJava,
};

export async function runCode(
  language: RunnableLanguageId,
  code: string,
  onChunk?: OnChunk,
): Promise<RunResult> {
  // Runners can reject a snippet before spawning anything (unknown import,
  // wrong class name, runtime not provisioned). Those results carry their
  // message in `stderr` without ever calling onChunk, and the run route only
  // forwards streamed chunks — so the message would never reach the output
  // pane. Stream it here, once, for every runner.
  let streamed = false;
  const track: OnChunk | undefined = onChunk
    ? (stream, data) => {
        streamed = true;
        onChunk(stream, data);
      }
    : undefined;
  const result = await runners[language](code, track);
  if (onChunk && !streamed && result.stderr) onChunk("stderr", result.stderr);
  return result;
}

export type { OnChunk, RunResult } from "./sandbox";
