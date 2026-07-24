# CCXT Playground

An online IDE that runs [CCXT](https://github.com/ccxt/ccxt) against **live public
exchange endpoints** in multiple languages, with an AI assistant that writes the
code for you.

- **Languages:** JavaScript, TypeScript, Python, PHP, **Go** and **C#** all run
  in the playground. **Java** appears as a tab marked **local** — its dependency
  tree (guava/jackson/web3j/netty) can't be resolved in the sandbox without a
  build tool, so it shows a one-line install + sample instead. The AI assistant
  writes code for all seven.
  - TypeScript runs via Node's native type-stripping (no tsc) — types are erased, not checked.
  - Go (~2–3s/run) and C# (~3–4s/run) compile each run, but only the user's file
    recompiles against a pre-warmed ccxt build, so they stay fast.
- **Editor:** Monaco (the VS Code editor) with syntax highlighting per language,
  and **CCXT IntelliSense for JS/TS** — `exchange.` autocompletes every unified
  method with signatures and JSDoc. This uses Monaco's built-in TypeScript
  service (no language server): `/api/ccxt-types` serves CCXT's base `.d.ts`
  files plus a synthetic module entry typing each exchange as `Exchange`, which
  the editor loads via `addExtraLib` (`components/Editor.tsx`). Semantic
  autocomplete for Python/PHP/Go/C#/Java would require a real LSP per language.
- **Execution:** a backend executor spawns the real interpreter for each language
  using a pinned CCXT install, so you get real responses from real exchanges.
- **AI assistant:** streams free models via [OpenRouter](https://openrouter.ai);
  generated code can be inserted straight into the editor.

## Quick start

```bash
cd docs/playground
npm install
npm run setup-runtimes        # optional but recommended (see below)
cp .env.example .env.local    # add your OPENROUTER_API_KEY for the AI panel
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
OPENROUTER_API_KEY=sk-or-... docker compose up --build
# → http://localhost:3000
```

The image bundles every runtime (Node, Python, PHP, Go, .NET) with CCXT
pre-installed and the Go/C# build caches **warmed at build time**, so first runs
are fast. Pass `--build-arg PLAYGROUND_DISABLED=go` (and/or `csharp`) to keep a
compiled language **install-only** — useful on a small host where compiling
ccxt-go (~5 GB) would OOM. Pass `--build-arg NEXT_BASE_PATH=/playground` to serve
under a sub-path. `docker-compose.yml` enforces the host protections:

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
- the **OpenRouter key is injected as env**, never baked into the image or on a
  file in the image (`.env.local` is `.dockerignore`d), and run children get a
  scrubbed env (the AI feature's egress to OpenRouter is the one non-exchange host
  on the allowlist);
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
also means a run can read the server process's env (e.g. the OpenRouter key) via
`/proc` inside the container. If you need the key shielded from runs too, run the
executor as a separate uid from the Next server, or front the key with a sidecar
so it never lives in the app process env.

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
`docs/playground/**` (or manual dispatch) it: builds the arm64 image on a native
runner → pushes to `ghcr.io/ccxt/ccxt-playground` → SSHes to the docs box →
runs a **canary** on a temp port → smoke-tests (homepage + a real `6*7→42` JS
run) → promotes to the live container only if green (else leaves the old one up).

It's served behind the existing nginx as `location /playground` → the app's
**static IP on the internal network** (`http://172.31.0.10:3000`), alongside the
Fumadocs `/v2` and Docsify `/`. (Publishing a host port doesn't work on a Docker
`internal` network, but the host can route *into* it — so nginx targets the
container's fixed internal IP, and the container still has no route *out* except
via the egress proxy.)

**Go is install-only in production** (`PLAYGROUND_DISABLED=go`) because compiling
ccxt-go needs ~5 GB — unsafe on the shared 7.5 GB box. JS/TS/Python/PHP/C# run.
Drop that build-arg on a larger dedicated box to enable Go.

One-time box setup (already done on the current box):

- `/root/ccxt-playground.env` (root-only) holding `OPENROUTER_API_KEY=...`
- the nginx `location /playground` + rate-limited `location /playground/api` block
- GitHub repo secrets reused from the Fumadocs deploy: `DOCS_DEPLOY_SSH_KEY`,
  `DOCS_DEPLOY_KNOWN_HOSTS`, `DOCS_DEPLOY_HOST`, `DOCS_DEPLOY_USER`.

The deploy puts the app on the internal network behind the egress proxy and
installs the nightly-restart cron automatically.

> **Defense in depth on the box (optional):** the neighbor services on this host
> (grafana `:3001`, prometheus `:9090`, benchmark `:3000/:3003`) are bound to
> `0.0.0.0`. The egress proxy already denies the playground any route to them, but
> rebinding those services to `127.0.0.1` (as the docs container already is) closes
> the path for anything else on the box too. That change lives in those projects'
> compose files, not here.

## Runtimes

`npm run setup-runtimes` provisions isolated, pinned CCXT installs:

- **JavaScript / TypeScript** use the playground's own `node_modules/ccxt` (TS via Node type-stripping — nothing extra).
- **Python** → `runtime/python/.venv` (`pip install ccxt`)
- **PHP** → `runtime/php/vendor` (`composer require ccxt/ccxt`)
- **Go** → `runtime/go` module (`go get github.com/ccxt/ccxt/go/v4`) with its build
  cache **pre-warmed** (cold build of ccxt is ~45s; warm runs ~2s). Needs Go 1.24+.
- **C#** → `runtime/csharp/app` project (`dotnet add package ccxt`) restored and
  build-warmed. Needs the .NET SDK.

Python and PHP fall back to the surrounding monorepo's CCXT (`../../python` via
`PYTHONPATH`, `../../ccxt.php`) if not provisioned. Go and C# show a "run
setup-runtimes" message until provisioned (no fallback — they need the warm
cache/restore to be fast).

## Sandboxing & safety

User code runs in `lib/runners/sandbox.ts` with:

- **scrubbed env** — the child process only sees `PATH`/`HOME`/`LANG`, never the
  server's secrets (e.g. `OPENROUTER_API_KEY`);
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

## Why Java is install-only

Go and C# are runnable (`lib/runners/{go,csharp}.ts`). Java isn't, for one
concrete reason: the sandbox has no Maven/Gradle/coursier to resolve ccxt-java's
dependency tree (guava, jackson-databind, web3j-crypto, netty…). Java 21's
single-file launch (`java Main.java`) works, but only with the full classpath
assembled. To make Java runnable: add a build tool to the environment, resolve
the deps into `runtime/java/libs/`, then add a `java.ts` runner that calls
`java -cp "runtime/java/libs/*" Main.java`, flip `available: true`, and add `java`
to `RunnableLanguageId`.

## Layout

```
app/
  page.tsx              playground shell (state lives here)
  api/run/route.ts      POST {language, code} -> execution result
  api/ai/route.ts       POST {messages, model} -> streamed OpenRouter completion
components/             Toolbar, Editor (Monaco), OutputPanel, AssistantPanel
lib/
  languages.ts          language metadata
  examples.ts           starter snippets per (example, language)
  runners/              sandbox + js/python/php runners + dispatcher
  ai/openrouter.ts      free-model list + system prompt
scripts/setup-runtimes.sh
```
