# WS-PROFILE-MASTER-COMPARISON — current master's production WsClient vs WsClientStreamFast (validation re-run)

Re-run of the decisive TLS-receive comparison from `WS-PROFILE-FINDINGS.md`
(commit `8c60e9217f`, branch `profile-ws-vs-undici-websocket`) against a fresh
build of **current master** (`HEAD = 4af7fa740e`). Diagnosis/benchmarking only —
no ccxt transport code was modified, loopback traffic only, no exchanges, no
credentials. Methodology is the reference document's §1, reused verbatim; the
only harness edits are port moves (95xx → 96xx: echo 9600, deflate 9601, TLS
9602, behavior 9610, parity 9612, crash 9614, starvation 9615) to avoid ranges
in use by another session.

Environment: node v22.22.1, linux x64, 8 cores; `ws` 8.21.0 and `undici` 7.27.2
resolved from `/home/agent/code/ccxt/node_modules`; TLS via the self-signed cert
at `/tmp/kilo/fetch-bench/`; `NODE_TLS_REJECT_UNAUTHORIZED=0` for clients; every
number below is the **median of 3 fresh-process reps** unless marked otherwise.

## 1. Did master's ws base files change since the reference run?

**No.** `git diff 8c60e9217f..HEAD -- ts/src/base/ws/` is empty (0 lines) —
`Client.ts`, `WsClient.ts`, and every other file in `ts/src/base/ws/` are
byte-identical between the reference commit and current master, and
`git log 8c60e9217f..HEAD -- ts/src/base/ws/` shows no commits touching them.
`js/src/base/ws/{Client,WsClient}.js` were nonetheless rebuilt from master's TS
with the repo `tsc` (105/105 `ts/src/*.ts` emitted; the known pre-existing
`ts/src/delta.ts` issue did not block emission) and the benchmark's `ccxt`
transport loaded that fresh build. **This is therefore a validation run**: any
delta vs the reference numbers is run-to-run/session variance, not a code change.
The dependency side is also unchanged: undici resolves to 7.27.2, the same
version whose WebSocketStream gaps the reference documents (and which its
addendum re-verified as still-unfixed in undici 8.6.0).

## 2. Semantic gates (run before benchmarking)

`node ws-profile/test-wsclient-parity.mjs` (full output:
`ws-profile/results/parity.txt`):

| implementation | result |
|---|---|
| WsClient (ws, production, master build) | **15/15 pass** |
| WsClientStreamFast | **15/15 pass** |
| WsClientStream (unoptimized, not a benchmark subject) | 14/15 — known `binary_json_frame_parsed` divergence, as documented in the reference |

`node ws-profile/probe-starvation.mjs` (20k-message burst, 3-hop re-arm; full
output: `ws-profile/results/probe-starvation.txt`):

| client | wakeups / 20,000 | % | reference |
|---|---|---|---|
| ccxt (ws, production) | 20,000 | **100%** | 100% |
| fast-deferred | 20,000 | **100%** | 100% |
| fast-adaptive | 20,000 | **100%** | 100% |
| fast-nodefer | 5,074 | **25.4%** | 25.4% (5,075) |

Both gates reproduce the reference exactly (nodefer within 1 message of the old
count). No parity break from master's Client — expected, given §1.

## 3. Receive-rate ceiling (uncapped TLS push; median of 3)

`node ws-profile/run-all.mjs --phase tls-recv` → `ws-profile/results/tls-recv.median.json`
(raw: `tls-recv.raw.json`, log: `tls-recv.run.txt`).

| kind | metric | ccxt (ws, master) | ccxt-stream-fast | Δ (fast vs ccxt) | reference Δ |
|---|---|---|---|---|---|
| tick100 (×400k) | recv msgs/s | **515,763** | 490,094 | −5.0% | −13.7% |
| | CPU µs/msg | **2.03** | 2.18 | +7% | +18% |
| | EL-lag p99 ms | **0.33** | 9.82 | 30× | 140× |
| | GC ms/10k msgs | **0.45** | 1.44 | 3.2× | 4.3× |
| | post-GC heap Δ KB | **168** | 4,505 | 27× | 27× |
| delta1k (×200k) | recv msgs/s | **124,032** | 120,574 | −2.8% | −7.4% |
| | CPU µs/msg | **8.50** | 8.77 | +3% | +10% |
| | EL-lag p99 ms | **0.26** | 2.14 | 8× | 14× |
| | GC ms/10k msgs | **1.75** | 7.13 | 4.1× | 4.6× |
| | post-GC heap Δ KB | **210** | 1,989 | 9.5× | 9.5× |
| snap20k (×20k) | recv msgs/s | **16,120** | 13,352 | −17.2% | −17.4% |
| | CPU µs/msg | **67.02** | 81.11 | +21% | +21% |
| | EL-lag p99 ms | **0.26** | 3.34 | 13× | 18× |
| | GC ms/10k msgs | **24.35** | 157.17 | 6.5× | 6.9× |
| | post-GC heap Δ KB | 224 | −1,172 | n/a (negative, noisy) | n/a |

Production wins **all three ceilings** again, with the same second-order
signature as the reference: the stream client burns more CPU per message and
pays large event-loop-lag / GC / transient-heap penalties because undici's
receiver has no receive backpressure, so honoring ccxt's delivery semantics
buffers the burst in client heap (reference §2). The throughput margins at
tick100/delta1k are smaller this session (−5.0%/−2.8% vs −13.7%/−7.4%); both
clients' absolute numbers moved together and the ws base code is identical
(§1), so this is session variance in the throughput column, not a ranking
change — and the CPU/lag/GC/heap columns, which are the structural signal,
reproduce at the same magnitudes. snap20k reproduces almost exactly.

## 4. Paced push — one-way delivery latency (delta1k, 240k msgs; median of 3)

| rate | metric (µs) | ccxt (ws, master) | ccxt-stream-fast | Δ | reference Δ |
|---|---|---|---|---|---|
| 20,000 msg/s | p50 | **186** | 190 | +2% | +9% |
| | p95 | **416** | 449 | +8% | +8% |
| | p99 | 824 | **778** | −6% | +1% |
| | max | 9,361 | **3,056** | −67% | −32% |
| | CPU µs/msg | **12.74** | 12.96 | +2% | +5% |
| 60,000 msg/s | p50 | **451** | 486 | +8% | +7% |
| | p95 | **816** | 833 | +2% | −3% |
| | p99 | 1,172 | **1,136** | −3% | −12% |
| | max | **4,350** | 4,626 | +6% | +17% |
| | CPU µs/msg | **9.82** | 9.92 | +1% | 0% |

Same conclusion as the reference: **statistical tie** — mixed signs,
single-digit percentages on every percentile that matters, both clients hold
the target rate exactly (19,999–20,000 and 59,989–59,995 msg/s), event-loop lag
p99 ≈ 0.5–1.1 ms for both.

## 5. Sustained receive leak check (delta1k, N=500k vs 2N; median of 3)

| client | post-GC heap Δ after N | Δ after second N | RSS after 2N | verdict |
|---|---|---|---|---|
| ccxt (ws, master) | +175 KB | +4 KB | 101 MB | **no leak** |
| ccxt-stream-fast | +4,456 KB | −1,436 KB | 650 MB | **no leak** (non-linear; transient §2 backlog, released) |

Matches the reference (+173/+5 and +4,441/−1,428) to within noise, including
the stream client's ~6.5× RSS excursion from in-process burst buffering.

## 6. Where the CPU goes — TLS receive profiles at ceiling (master build)

Captured per reference §1/§9: `node --expose-gc --cpu-prof ws-profile/bench-recv.mjs
--transport <t> --url wss://127.0.0.1:9602 --kind <k> --count <n> --mode ceiling`,
one fresh process per scenario; committed under `ws-profile/results/profiles/`
(`.cpuprofile` + `.folded` + per-file `.report.txt`; digest in
`TLS-RECV-SUMMARY.txt`). Shares below are **of busy (non-idle) sampled time**.

| scenario | metric | ccxt (ws, master) | ccxt-stream-fast |
|---|---|---|---|
| delta1k | idle fraction of run | 38.0% | 35.5% |
| | `Client.onMessage` self (≈ JSON.parse) | **67.7%** | **63.0%** |
| | big-int guard regex `:(\d{15,}),` | 1.8% | 2.9% |
| | GC | 5.6% | **9.7%** |
| | transport receive stack | ~2–3% (`ws` receiver `consume`/`startLoop` + `isUtf8`) | ~4% (readLoop + undici receiver + TextDecoder 1.7%) |
| | onMessage self per message | 5.2 µs | 5.3 µs |
| tick100 | idle fraction of run | 65.4% | 57.3% |
| | onMessage self | 26.5% | 27.0% |
| | GC | 7.4% | **15.1%** |
| | transport + stream-queue stack | ~7% | ~18% (TextDecoder, FastBuffer, `dequeueValue`, `consumeFragments`, readLoop) |

The reference's three structural findings reproduce on the master build:

1. **ccxt's own JSON layer dominates both clients equally** — ~63–68% of busy
   CPU is `Client.onMessage` self time at delta1k (~5.2–5.3 µs/msg in both),
   with the big-int guard regex adding its own 1.8–2.9%. Transport choice is
   second-order.
2. **Both clients are scheduling-bound on tiny messages** (idle 57–65% at
   tick100; one delivery per event-loop turn), and the stream client pays for
   the missing backpressure in GC (15.1% vs 7.4% of busy) and webstreams queue
   churn (`dequeueValue` visible only on its side).
3. **TLS is not a differentiator** — decryption lives in native TLSWrap on both
   sides; profiles differ in the JS receive path, not the crypto.

## 7. Verdict — do the reference findings still hold on current master?

**Yes, all three, unchanged:**

1. **Production `ws` wins every TLS receive ceiling** — confirmed: +5.2%
   (tick100), +2.9% (delta1k), +20.7% (snap20k) in production's favor, with
   3.2–6.5× less GC time, 8–30× lower event-loop lag p99, and 9.5–27× smaller
   transient post-GC heap. Margins on the two smaller kinds are narrower than
   the reference session's, but the sign, the mechanism (no receive
   backpressure in undici's WebSocketStream → burst backlog moves into client
   heap), and every supporting column reproduce.
2. **Paced delivery latency is a tie** — confirmed (§4: mixed signs, ≤8%
   deltas at p50/p95/p99, identical CPU).
3. **WebSocketStream remains disqualified by undici gaps** — nothing changed:
   master's ws base files are identical to the reference commit (§1), undici
   still resolves to 7.27.2 (no receive backpressure; unclean-close
   `writableStream.abort()` crash needing the interposition workaround; no
   ping/pong API; `headers`/`dispatcher` ignored so no custom handshake headers
   or proxy path), and the reference's addendum verified the same gaps persist
   in undici 8.6.0. The starvation probe re-confirms that the "fast" no-defer
   mode drops ~3 of 4 consumer wakeups (25.4%), so its speed is not a legal
   trade for ccxt semantics.

**Recommendation is therefore also unchanged: keep `ws`.** The profitable
optimization target on master remains transport-independent — the
`Client.onMessage` parse layer (native `JSON.parse` + the big-int guard regex
that scans every message), which owns ~63–68% of busy receive CPU in *both*
transports at the dominant 1KB workload shape.

## 8. Reproduction (this run)

```
# build master TS -> JS first: /home/agent/code/ccxt/node_modules/.bin/tsc (from worktree root)
node ws-profile/test-wsclient-parity.mjs        # 15/15 for production + fast
node ws-profile/probe-starvation.mjs            # 100/100/100/25.4%
node ws-profile/run-all.mjs --phase tls-recv    # -> ws-profile/results/tls-recv.{median,raw}.json
# profiles (server: node ws-profile/server.mjs --port 9602 --tls):
NODE_TLS_REJECT_UNAUTHORIZED=0 node --expose-gc --cpu-prof \
    --cpu-prof-dir ws-profile/results/profiles --cpu-prof-name tls-recv-ccxt-delta1k.cpuprofile \
    ws-profile/bench-recv.mjs --transport ccxt --url wss://127.0.0.1:9602 \
    --kind delta1k --count 200000 --mode ceiling
node ws-profile/cpuprofile-report.mjs ws-profile/results/profiles/tls-recv-ccxt-delta1k.cpuprofile
```

Artifacts committed with this document: `ws-profile/` harness (ports moved to
96xx), `ws-profile/results/{tls-recv.median.json,tls-recv.raw.json,tls-recv.run.txt,parity.txt,probe-starvation.txt}`,
and `ws-profile/results/profiles/` (4 × `.cpuprofile`/`.folded`/`.report.txt`
+ `TLS-RECV-SUMMARY.txt`). Generated `js/**` build output is deliberately not
committed.
