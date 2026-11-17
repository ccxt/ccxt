# CCXT Playground

An online IDE that runs [CCXT](https://github.com/ccxt/ccxt) against **live public
exchange endpoints** in multiple languages, with an AI assistant that writes the
code for you.

- **Languages:** TypeScript, Python, PHP, **Go**, **C#**, **Java** and **Rust**
  all run in the playground. The AI assistant writes code for all seven.
  - TypeScript runs natively on Node (`--experimental-transform-types`, no tsc) — so
    `enum`/`namespace`/parameter properties work, but types are erased, not checked.
  - Go (~2–3s/run), C# (~3–4s/run), Java (~1s/run) and Rust (~1s/run) compile
    each run, but only the user's file recompiles against a pre-resolved ccxt, so
    they stay fast.
- **Editor:** Monaco (the VS Code editor) with syntax highlighting per language,
  and **CCXT IntelliSense for TypeScript** — `exchange.` autocompletes every unified
  method with signatures and JSDoc. This uses Monaco's built-in TypeScript
  service (no language server): `/api/ccxt-types` serves CCXT's base `.d.ts`
  files plus a synthetic module entry typing each exchange as `Exchange`, which
  the editor loads via `addExtraLib` (`components/Editor.tsx`). Semantic
  autocomplete for Python/PHP/Go/C#/Java would require a real LSP per language.
- **Execution:** a backend executor spawns the real interpreter for each language
  using a pinned CCXT install, so you get real responses from real exchanges.
- **AI assistant:** streamed from the chat-completions endpoint in
  `PLAYGROUND_AI_URL`; every code answer covers all seven languages at once — the
  sidebar shows **only** the language tab you have selected (Insert ready as soon
  as that block finishes streaming). One Insert files that tab immediately; the
  other languages fill their editor buffers silently in the background. The
  playground holds no inference credential: it posts `{stream, messages}` and
  streams the reply back, so the endpoint owns the backend and its keys.

## Quick start

```bash
cd docs/playground
npm install
npm run setup-runtimes        # optional but recommended (see below)
cp .env.example .env.local    # set PLAYGROUND_AI_URL for the AI panel
npm run dev                   # http://localhost:3000
```

Press **Run** (or ⌘/Ctrl+Enter) to execute the snippet. Switch languages with
the tabs, load ready-made snippets from **Examples…**, and toggle the AI panel
from the toolbar.

## Deploy with Docker (recommended for any shared/public host)

Running user code directly on a host is unsafe (see **Sandboxing & safety**).
The Docker setup makes the **container the trust boundary** — user code can only
touch the container filesystem; the host is unreachable.

```bash
cd docs/playground
PLAYGROUND_AI_URL=http://<host>:<port>/v1/chat/completions docker compose up --build
# → http://localhost:3000
```

The image bundles every runtime (Node, Python, PHP, Go, .NET, JDK, Rust) with CCXT
pre-installed and the Go/C# build caches **warmed at build time**, so first runs
are fast. Pass `--build-arg PLAYGROUND_DISABLED=go` (and/or `csharp`) to keep a
compiled language **install-only** — an escape hatch for a small host where
compiling ccxt-go (~5 GB) would OOM. Pass `--build-arg NEXT_BASE_PATH=/playground`
to serve under a sub-path. `docker-compose.yml` enforces the host protections:

- **minimal bind mounts** → the only host paths mounted are the two append-only
  log dirs (`/var/log/ccxt-playground/{app,proxy}`); nothing else on the host
  filesystem is reachable. (A run shares the app container's fs, so it could write
  to the app log dir — bounded by logrotate below — but cannot escape it; the proxy
  log lives in the separate proxy container, out of a run's reach.)
- **`mem_limit` / `cpus` / `pids_limit` + `--init`** → a user can't exhaust host RAM/CPU, fork-bomb it, or orphan processes;
- **non-root + `no-new-privileges` + `cap_drop: ALL`** → minimal blast radius;
- **egress allowlist** → the app runs on an internet-less `internal` network; all
  outbound goes through the `egress-proxy` (squid) sidecar, which permits **only
  the exchange API domains generated from CCXT** (`proxy/`). Mining pools, C2,
  data-exfil endpoints, and the host's neighbor services are all unreachable —
  even via a raw socket, because the app has no other route out;
- **no inference credential in the container** — the app posts to the endpoint in
  `PLAYGROUND_AI_URL` (deployment-local, reached directly via `NO_PROXY`); that
  endpoint holds the credential, so a run that reads the server's env finds
  nothing worth stealing. Run children also get a scrubbed env;
- **submission logging** → every `/api/run` and `/api/ai` request is logged as
  JSONL (`lib/log.ts`) for abuse inspection. In production the deploy points
  `PLAYGROUND_LOG_FILE` at a host-mounted file (`/var/log/ccxt-playground/app/`)
  and bind-mounts the squid access log (`/var/log/ccxt-playground/proxy/`), so both
  the submitted code and every outbound exchange request survive container swaps and
  the nightly clean. A logrotate config (`/etc/ccxt-playground/logrotate.conf`,
  hourly cron) hard-caps each at `size 25M × rotate 4` (compressed) so logs can't
  fill the disk; each container's Docker stdout json log is capped via `--log-opt`;
- **daily clean** → the deploy installs a cron that restarts the container nightly
  to wipe any in-container state (runs are already killed at their timeout).

### Egress allowlist — how it stays "exchanges only"
`proxy/generate-allowlist.mjs` instantiates every CCXT exchange and extracts the
hostnames from each `exchange.urls.api`/`urls.test`, producing the squid
`dstdomain` allowlist at proxy-build time. So the permitted set is exactly the
exchange API hosts for the bundled CCXT version (currently ~250 rules). The
production canary smoke test makes real exchange calls *through* the proxy, so a
mis-generated allowlist that blocked exchanges would fail the smoke and abort the
deploy — the egress path is verified on every release.

Code from different users *can* see each other inside the container — that's an
accepted trade-off; the boundary is host-vs-container, not run-vs-run. Note this
also means a run can read the server process's env via `/proc` inside the
container — which is precisely why no inference credential lives there; the
assistant's credential stays behind `PLAYGROUND_AI_URL`.

Verified: from inside the container a run **cannot** read or write host files
(the host `.env.local` doesn't exist there, writes to host paths fail), sees only
the container's `/etc/hosts` and a non-root `/home/playground`, and a crash
(even a hard `SIGILL`) leaves the server healthy.

> **Build on the target architecture.** CCXT's Python wheels crash (`SIGILL`) under
> Docker Desktop on Apple Silicon (arm64) — Python is skipped there and the build
> continues. On a normal **amd64 Linux server** (or native arm64 hardware) all
> runtimes work; build there, or `docker build --platform linux/amd64`.

## Production: docs.ccxt.com/playground

Live deploy is automated by [`.github/workflows/deploy-playground.yml`](../../.github/workflows/deploy-playground.yml)
(modeled on the Fumadocs workflow, same box + secrets). On push to `master` under
`docs/playground/**` (or manual dispatch) it: builds the amd64 image on a native
runner → pushes to `ghcr.io/ccxt/ccxt-playground` → SSHes to the docs box →
runs a **canary** on a temp port → smoke-tests (homepage + a real `6*7→42` TypeScript
run) → promotes to the live container only if green (else leaves the old one up).

It's served behind the existing nginx as `location /playground` → the app's
**static IP on the internal network** (`http://172.31.0.10:3000`), alongside the
Fumadocs site at `/`. (Publishing a host port doesn't work on a Docker
`internal` network, but the host can route *into* it — so nginx targets the
container's fixed internal IP, and the container still has no route *out* except
via the egress proxy.)

**All seven runnable languages (TypeScript/Python/PHP/Go/C#/Java/Rust) run in production.**
The Go warm build (~5 GB peak) happens on the GitHub-hosted build runner, not on
the docs box; the run container's 3 GB cap covers warm `go run`s plus concurrent
Java JVMs (`-Xmx512m` each). On a small box, add `PLAYGROUND_DISABLED=go,java`
to the workflow's build-args to make them install-only again.

One-time box setup (already done on the current box):

- `/root/ccxt-playground.env` (root-only) holding `PLAYGROUND_AI_URL=...`
- the nginx `location /playground` + rate-limited `location /playground/api` block
- GitHub repo secrets reused from the Fumadocs deploy: `DOCS_DEPLOY_SSH_KEY`,
  `DOCS_DEPLOY_KNOWN_HOSTS`, `DOCS_DEPLOY_HOST`, `DOCS_DEPLOY_USER`.

The deploy puts the app on the internal network behind the egress proxy and
installs the nightly-restart cron automatically.

## Runtimes

`npm run setup-runtimes` provisions isolated, pinned CCXT installs:

- **TypeScript** uses the playground's own `node_modules/ccxt` (run natively by Node — nothing extra).
- **Python** → `runtime/python/.venv` (`pip install ccxt`)
- **PHP** → `runtime/php/vendor` (`composer require ccxt/ccxt`)
- **Go** → `runtime/go` module (`go get github.com/ccxt/ccxt/go/v4`) with its build
  cache **pre-warmed** (cold build of ccxt is ~45s; warm runs ~2s). Needs Go 1.24+.
- **C#** → `runtime/csharp/app` project (`dotnet add package ccxt`) restored and
  build-warmed. Needs the .NET SDK.
- **Java** → `runtime/java/libs` (`io.github.ccxt:ccxt` + transitive jars resolved
  from Maven Central; latest release unless `CCXT_JAVA_VERSION` is pinned) plus a
  precompiled `Playground` proxy helper in `runtime/java/classes`. Needs JDK 21+
  and Maven at provision time (Docker resolves the jars in a throwaway build
  stage, so Maven never ships in the image).
- **Rust** → `runtime/rust` cargo project depending on the `ccxt`, `ccxt-pro` and
  `ccxt-prediction` crates (+ `tokio`, `serde_json`, `futures`), built once,
  plus `externs.json` naming the exact rlib of each crate and every directory
  holding dependency rlibs (`target/debug/deps`, or one dir per crate under
  cargo ≥ 1.100's build-dir layout). Needs a Rust toolchain (rustup) and ~6 GB of RAM at provision time;
  Docker builds it in a throwaway stage so cargo and its registry never ship.
  Only a curated set of venues is compiled in — see **How Rust runs**.

Python and PHP fall back to the surrounding monorepo's CCXT (`../../python` via
`PYTHONPATH`, `../../ccxt.php`) if not provisioned. Go, C#, Java and Rust show a "run
setup-runtimes" message until provisioned (no fallback — they need the warm
cache/restore/resolved jars/prebuilt crates to be fast).

## Sandboxing & safety

User code runs in `lib/runners/sandbox.ts` with:

- **scrubbed env** — the child process only sees `PATH`/`HOME`/`LANG`, never the
  server's secrets;
- **hard timeout** — the whole process group is `SIGKILL`ed after
  `RUN_TIMEOUT_MS` (default 15s);
- **output cap** — combined stdout/stderr is bounded (256 KB);
- **throwaway cwd** — each run gets a temp dir that is deleted afterwards.

Those bound a runaway loop, but they do **not** sandbox the filesystem, memory,
or network: code run directly on the host can read/write any file the server
user can (including secrets), allocate until OOM, and make arbitrary network
calls. So **running `npm run dev` directly is for local, trusted use only.**

For anything shared or public, use the **Docker deployment above** — the
container is the boundary (no host mounts, mem/cpu/pids limits, non-root). Still
recommended on top:

1. Put `/api/run` behind rate limiting and a per-IP concurrency cap.
2. Restrict the container's outbound network to exchange hosts if you want to be strict.
3. For untrusted multi-tenant use where runs must not see each other, run each
   execution in its own throwaway container (or gVisor) rather than the shared one.

## How Java runs (and how it reaches exchanges)

Java runs server-side like Go/C# (`lib/runners/java.ts`): each run is compiled
in a throwaway dir (the snippet must be `public class Main`) and launched
against the pre-resolved `runtime/java/libs/*` classpath. Runs go through a
generated `Launcher` that calls `Main.main` and then forces JVM exit —
ccxt-java's pro `close()` leaves Netty's shared event loop alive, so a `watch*`
snippet's JVM would otherwise linger until the hard timeout after `main`
returns.

One wrinkle the other languages don't have: **ccxt-java ignores proxy env
vars** (`System.getenv` never appears in `io/github/ccxt/**`), and its REST
client (`java.net.http.HttpClient`) defaults to *no* proxy. The runner therefore
parses `HTTPS_PROXY`/`HTTP_PROXY` into JVM flags
(`-Dhttps.proxyHost/-Dhttps.proxyPort/-Dhttp.*`), which `HttpClient` honors.
WebSockets are a separate path: ccxt's Netty `WsClient` ignores those flags and
only reads the exchange's own `wssProxy` field, so `watch*` snippets construct
exchanges via `Playground.proxy(new Binance())` — a tiny helper precompiled
into `runtime/java/classes` that sets `httpsProxy` + `wssProxy` from the env
(no-op outside the playground).

## How Rust runs

Rust runs server-side like Go/C#/Java (`lib/runners/rust.ts`), but a run never
invokes cargo. We looked at how the existing online Rust playgrounds do it:

- **play.rust-lang.org** bakes ~2,500 popular crates into one prebuilt
  `target/` per channel, then runs plain `cargo build`/`cargo run` in a **fresh
  container per request** (no network, 512 MB). Per-request containers aren't an
  option here, and `cargo` takes an exclusive lock on its target dir, so sharing
  one prebuilt `target/` would serialize every run (like the C# queue).
- **Compiler Explorer (godbolt)** prebuilds each library once per compiler and
  invokes **`rustc` directly** with `--extern name=<lib>.rlib -L dependency=<deps>`.
- In-browser toolchains (rustc compiled to WASM) can't build tokio/reqwest/rustls
  and can't open the raw sockets an exchange client needs, so they don't apply.

The playground follows Compiler Explorer. `setup-runtimes.sh` cargo-builds a
project depending on ccxt once and records, from cargo's JSON artifact messages,
the exact rlib of each crate a snippet may use (`ccxt`, `ccxt_pro`,
`ccxt_prediction`, `tokio`, `serde_json`, `futures`) plus build-script native
search paths, in `runtime/rust/externs.json`. (The dependency dirs are recorded
from those messages too, never hard-coded: since 1.100, cargo no longer collects
rlibs in `target/debug/deps` but gives each crate its own `build/<pkg>/<hash>/out`.) A run writes `main.rs` to its own
temp dir and calls the **toolchain's real `rustc`** (pinned in `externs.json`:
the rlibs only link with the exact compiler that built them, and the rustup proxy
would need `RUSTUP_HOME` in the scrubbed env) with one `--extern` per crate. This
gives:

- **~1s builds** — only the user's single-file crate compiles; the rest is a link;
- **parallel runs** — rustc writes only to the run's dir, no cargo lock;
- **an import allowlist for free** — only crates passed via `--extern` exist, so
  `use reqwest::…` fails with rustc's own "unresolved import".

Three ccxt-rust specifics the runner handles:

- **Curated venues.** ccxt-base puts every venue in one crate; a single rustc over
  all ~100 venues peaks past 14 GB even unoptimized (it OOMed a 15 GB builder). The
  runtime therefore compiles a curated set (`CCXT_RUST_VENUES`, default: binance,
  bybit, okx, coinbase, kraken, kucoin, bitget, gate, htx, mexc, bitfinex,
  hyperliquid, deribit, … — 26 venues, ~4 min and ~6 GB at 2 jobs) and
  `CCXT_RUST_PREDICTION` (polymarket, kalshi, limitless, myriad, hyperliquid).
  `CCXT_RUST_VENUES=all` builds everything on a big enough builder. A snippet that
  names a venue that isn't compiled in gets a message listing what is. The ccxt
  crates build at opt-level 0 (as ccxt's CI builds them); third-party deps
  (serde_json, tokio, rustls/ring) at opt-level 2.
- **Panic noise.** ccxt-rust signals exchange errors by panicking inside a
  `catch_unwind` and returning `Err`, so the default panic hook prints every
  *handled* error too. The runner appends a hidden module to `main.rs` (after
  the user's code, so line numbers hold) whose static constructor (`.init_array`
  on Linux, `__mod_init_func` on macOS) installs
  a hook that drops panics raised inside the ccxt crates and keeps the default
  output for everything else, so the user's own `unwrap()` panics still show. If
  a ccxt panic is ever *not* caught (exit 101), the runner prints the dropped
  message.
- **WebSocket proxy.** REST goes through reqwest, which honors `HTTPS_PROXY`.
  ccxt-pro's WebSocket dialer only uses the exchange's own `ws_proxy`, so
  `watch_*` snippets call
  `exchange.set_ws_proxy(&std::env::var("HTTPS_PROXY").unwrap_or_default())`
  (an empty value means no proxy, so the snippet works unchanged elsewhere).

Worker threads get `RUST_MIN_STACK=64 MiB`: the generated exchange code nests
deeply and tokio's workers otherwise use std's 2 MB default.

## Layout

```
app/
  page.tsx              playground shell (state lives here)
  api/run/route.ts      POST {language, code} -> execution result
  api/ai/route.ts       POST {messages, language, code} -> streamed completion
components/             Toolbar, Editor (Monaco), OutputPanel, AssistantPanel
lib/
  languages.ts          language metadata
  examples.ts           starter snippets per (example, language)
  runners/              sandbox + per-language runners (ts/python/php/go/csharp/java/rust) + dispatcher
  ai/assistant.ts       endpoint config + system prompt
scripts/setup-runtimes.sh
```
