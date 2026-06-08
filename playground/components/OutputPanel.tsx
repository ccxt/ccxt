"use client";

import type { RunResult } from "@/lib/runners";

export type RunState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; result: RunResult }
  | { status: "error"; message: string };

export default function OutputPanel({ state }: { state: RunState }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label">Output</span>
        {state.status === "done" && <StatusBadge result={state.result} />}
        {state.status === "done" && (
          <div className="output-meta">
            <span>{state.result.durationMs} ms</span>
            <span>exit {state.result.exitCode ?? "—"}</span>
          </div>
        )}
      </div>
      <div className="output-body">
        {state.status === "idle" && (
          <span className="placeholder">
            Run the code (⌘/Ctrl+Enter) to see live exchange data here.
          </span>
        )}
        {state.status === "running" && (
          <span className="placeholder">
            Executing<span className="dots" />
          </span>
        )}
        {state.status === "error" && <span className="stderr">{state.message}</span>}
        {state.status === "done" && <Result result={state.result} />}
      </div>
    </div>
  );
}

function StatusBadge({ result }: { result: RunResult }) {
  if (result.timedOut) return <span className="badge warning">timed out</span>;
  if (result.truncated) return <span className="badge warning">truncated</span>;
  if (result.exitCode === 0) return <span className="badge success">success</span>;
  return <span className="badge destructive">exit {result.exitCode}</span>;
}

function Result({ result }: { result: RunResult }) {
  const hasOut = result.stdout.length > 0;
  const hasErr = result.stderr.length > 0;
  return (
    <>
      {hasOut && <span>{result.stdout}</span>}
      {hasErr && <span className="stderr">{result.stderr}</span>}
      {!hasOut && !hasErr && <span className="placeholder">(no output)</span>}
      {result.timedOut && (
        <span className="stderr">{"\n\n[killed: exceeded the execution time limit]"}</span>
      )}
      {result.truncated && (
        <span className="stderr">{"\n\n[killed: output exceeded the size limit]"}</span>
      )}
    </>
  );
}
