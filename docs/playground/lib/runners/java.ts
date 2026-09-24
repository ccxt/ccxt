import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COMPILE_TIMEOUT_MS,
  RUNTIME_ROOT,
  runProcess,
  type OnChunk,
  type RunResult,
} from "./sandbox";

// Java is provisioned by scripts/setup-runtimes.sh: runtime/java/libs holds the
// published io.github.ccxt:ccxt jar set (resolved via Maven at build time) and
// runtime/java/classes holds the precompiled Playground proxy helper. Each run
// gets its own dir (like Go) — javac/java write only where told, so concurrent
// runs never collide. Compile+launch is ~1s, so COMPILE_TIMEOUT_MS is ample.
const JAVA_ROOT = path.join(RUNTIME_ROOT, "java");

// ccxt-java ignores HTTP(S)_PROXY env vars entirely (System.getenv never
// appears in io/github/ccxt/**) and java.net.http.HttpClient defaults to no
// proxy — so REST only reaches exchanges through the sandbox's egress allowlist
// proxy if the JVM -D flags are set. WebSockets (Netty, ws/WsClient.java)
// ignore these flags too; watch* snippets set exchange.wssProxy via the
// Playground.proxy() helper instead.
function javaProxyFlags(): string[] {
  const raw =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (!raw) return [];
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return [];
  }
  const port = u.port || (u.protocol === "https:" ? "443" : "80");
  const flags = [
    `-Dhttps.proxyHost=${u.hostname}`, `-Dhttps.proxyPort=${port}`,
    `-Dhttp.proxyHost=${u.hostname}`, `-Dhttp.proxyPort=${port}`,
  ];
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (noProxy) {
    const hosts = noProxy.split(",").map((s) => s.trim()).filter(Boolean).join("|");
    if (hosts) flags.push(`-Dhttp.nonProxyHosts=${hosts}`);
  }
  return flags;
}

// Runs go through a generated Launcher, not Main directly: ccxt-java's pro
// close() leaves Netty's shared event loop running (a non-daemon thread), so a
// watch* snippet's JVM would otherwise linger until the hard timeout after
// main() returns. The Launcher preserves the exit code (0, or 1 + stack trace
// on uncaught exceptions) and forces the JVM down once user code is done.
const LAUNCHER = `public class Launcher {
    public static void main(String[] args) {
        int status = 0;
        try {
            Main.main(args);
        } catch (Throwable t) {
            t.printStackTrace();
            status = 1;
        }
        System.exit(status);
    }
}
`;

export async function runJava(code: string, onChunk?: OnChunk): Promise<RunResult> {
  if (!existsSync(path.join(JAVA_ROOT, "libs"))) {
    return notProvisioned();
  }
  // The file is written as Main.java and the Launcher calls Main.main, so a
  // missing/misnamed class fails javac with a confusing message — catch the
  // common cases early with clear ones.
  const publicClass = /public\s+(?:final\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(code);
  if (publicClass && publicClass[1] !== "Main") {
    return earlyError(
      `The playground runs your code as Main.java, so the public class must be named Main (found "${publicClass[1]}").`,
    );
  }
  if (!/\bclass\s+Main\b/.test(code)) {
    return earlyError(
      "Your code must declare a class Main with public static void main(String[] args).",
    );
  }
  // ccxt-java's data methods are synchronous (fetchTicker returns Ticker); only
  // the ...Async variants return CompletableFuture. Snippets that assume the
  // async shape fail with "cannot find symbol: method join()" on a type javac
  // reports as Ticker/OrderBook/…, which reads like a broken library. Point at
  // the actual rule instead. Scoped to the fetch/watch/load/trade verbs, because
  // close() really does return a CompletableFuture — close().join() is correct.
  const joined =
    /\b((?:fetch|watch|load|create|cancel|edit)[A-Z]\w*)\s*\([^()]*\)\s*\.\s*(?:join|get)\s*\(\s*\)/.exec(code);
  if (joined && !joined[1].endsWith("Async")) {
    return earlyError(
      `ccxt's Java ${joined[1]}(...) is synchronous — it returns the value directly, so drop the .join().\n` +
        `Only the ...Async variants return a CompletableFuture (e.g. ${joined[1]}Async(...).join()).`,
    );
  }
  const runRoot = path.join(RUNTIME_ROOT, "tmp");
  await mkdir(runRoot, { recursive: true });
  const dir = await mkdtemp(path.join(runRoot, "java-"));
  try {
    const classpath =
      path.join(JAVA_ROOT, "classes") + path.delimiter + path.join(JAVA_ROOT, "libs", "*");
    await writeFile(path.join(dir, "Main.java"), code, "utf8");
    await writeFile(path.join(dir, "Launcher.java"), LAUNCHER, "utf8");
    const compiled = await runProcess(
      { cmd: "javac", args: ["-cp", classpath, "-d", dir, "Main.java", "Launcher.java"] },
      dir,
      COMPILE_TIMEOUT_MS,
    );
    if (compiled.exitCode !== 0) return compiled; // javac names Main.java + line
    // Stream stdout as-is; strip the known SLF4J no-provider warning (fires on
    // every ccxt.pro run — web3j pulls slf4j-api but no logger backend) so the
    // live view matches the filtered final result, mirroring python.ts.
    const onStream: OnChunk | undefined = onChunk
      ? (stream, data) => {
          const out = stream === "stderr" ? stripSlf4jNoise(data) : data;
          if (out) onChunk(stream, out);
        }
      : undefined;
    const result = await runProcess(
      {
        cmd: "java",
        args: [
          ...javaProxyFlags(),
          "-XX:TieredStopAtLevel=1",
          "-XX:+UseSerialGC",
          "-Xmx512m",
          "-cp",
          dir + path.delimiter + classpath,
          "Launcher",
        ],
      },
      dir,
      COMPILE_TIMEOUT_MS,
      onStream,
    );
    return { ...result, stderr: stripSlf4jNoise(result.stderr) };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function earlyError(stderr: string): RunResult {
  return { stdout: "", stderr, exitCode: null, durationMs: 0, timedOut: false, truncated: false };
}

// ccxt.pro runs always print a harmless "no SLF4J providers" warning trio
// (web3j depends on slf4j-api but no backend is on the classpath) — strip just
// those lines so genuine stderr still surfaces (mirrors python.ts import noise).
function stripSlf4jNoise(stderr: string): string {
  return stderr
    .split("\n")
    .filter((line) => !line.startsWith("SLF4J(W): "))
    .join("\n");
}

function notProvisioned(): RunResult {
  return earlyError(
    "Java runtime not provisioned. Run `npm run setup-runtimes` in the playground/ directory (needs JDK 21+ and Maven).",
  );
}
