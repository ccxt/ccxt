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

## Addendum (2026-07-04): WsClientStreamFast rebased onto `ws` duplex, `readableObjectMode: true`

`WsClientStreamFast.mjs` no longer sits on undici's `WebSocketStream` (no
receive backpressure — `probe-backpressure.mjs`, tracked upstream as
nodejs/undici#5503). It now wraps the production `ws` socket with
`createWebSocketStream (sock, { readableObjectMode: true })` and consumes it
with `for await`. Mode comparison (`probe-duplex-modes.mjs` ->
`results/duplex-modes.txt`, 200k x 224 B JSON, loopback, node v22.22.1,
ws 8.21.0):

| consumption mode | throughput | framing under buffering | receive backpressure |
|---|---|---|---|
| raw `ws` "message" events | 558k msg/s | 1 event = 1 message | never (`paused=false`) |
| duplex byte-mode, flowing | 538k msg/s | intact while consumer keeps up | engages |
| duplex byte-mode, 150 ms stall | n/a | frames fuse: 19133/19153 chunks unparseable, max chunk 86240 B (payload 224 B) | engages |
| duplex `readableObjectMode`, 150 ms stall | 593k msg/s | intact: 200000/200000 parsed | engages: `ws.pause ()` at ~25 buffered msgs |

`readableObjectMode` survives because ws spreads caller options *before*
forcing `objectMode`/`writableObjectMode` (ws@8.21.0 `lib/stream.js`). Receive
side only: sends still go through `sock.send ()` (a byte-mode writable would
coerce strings to binary frames). The rebase deletes the undici crash
workaround (persistent writer + `abort` interposition) and the eager-pull O(1)
queue — while the deferral loop waits, the backlog now throttles the server
via TCP instead of growing in-process — and protocol ping()/pong is real
again. Parity suite: all rows pass; fast's `binary_json_frame_parsed` and
abrupt-destroy signature now match production `ws` exactly
(`results/parity.txt` refreshed). Stream-fast numbers ABOVE this addendum
describe the earlier undici-based revision (see git history).

### Re-profile: HEAD vs origin/master (2026-07-04, after the ws-duplex rebase)

Baseline validity: HEAD is 8 commits behind origin/master (fetched at
58f2be3437, merge-base 4af7fa740e) with ZERO diff in `ts/src/base/ws`,
`js/src/base/ws` and `package.json` — the `ccxt` transport benched here is
byte-identical to origin/master's production WsClient, so this same-day
re-run IS the HEAD-vs-master comparison. Absolute numbers differ from the
tables above (different day/machine state); compare only within a run.
Artifacts: `results/tls-recv-head.{median,raw}.json`,
`results/probe-starvation-head.txt`,
`results/profiles/head-tls-recv-*-delta1k.{cpuprofile,folded,report.txt}`;
the committed pre-rebase result files are untouched.

Receive ceilings (TLS loopback, medians of 3):

| kind | ccxt (= origin/master) | ccxt-stream-fast (HEAD) | Δ ceiling |
|---|---|---|---|
| tick100 | 570,833 msg/s, 1.86 µs cpu/msg, el-lag p99 0.17 ms | 519,063 msg/s, 2.01 µs, 0.22 ms | -9.1% |
| delta1k | 134,512 msg/s, 7.73 µs, 0.18 ms | 131,488 msg/s, 8.03 µs, 0.09 ms | -2.2% |
| snap20k | 17,630 msg/s, 60.94 µs, 0.18 ms | 16,683 msg/s, 63.59 µs, 0.09 ms | -5.4% |

Paced delivery latency (delta1k, 240k msgs, µs p50/p95/p99/max):

| rate | ccxt | ccxt-stream-fast |
|---|---|---|
| 20k/s | 170 / 408 / 599 / 3061 | 178 / 456 / 639 / 2596 |
| 60k/s | 425 / 725 / 928 / 3979 | 466 / 1462 / 3080 / 6063 |

Sustained receive leak (500k, then 2N): both clean
(`linear_growth_leak=false`, heap plateaus: ccxt +173/-6 KB, fast +160/-2 KB);
fast's RSS after 2N is 116 MB vs 101 MB — bounded duplex buffering headroom.

CPU profiles (delta1k ceiling, 200k msgs, `--cpu-prof`): both transports are
JSON.parse-bound — `onMessage` self time 36.4% (ccxt) vs 38.6% (fast). The
duplex plumbing is second-order: ws `stream.js` message handler 0.8% +
`Readable.read` 0.6% + `readableAddChunkPushByteMode` 0.4% + async-iterator
0.3% + `deliverLoop` 1.1% + `setImmediate`/`processImmediate` ≈0.7% — ≈4% of
samples, consistent with the +0.30 µs/msg median cpu delta at the delta1k
ceiling. The fixed per-message plumbing costs most in relative terms on small
frames (tick100: -9.1%).

Starvation probe re-run: guarantees unchanged — ccxt 100%, fast-deferred
100%, fast-adaptive 100% consumer wakeups; the no-deferral control moves
25.4% -> 50.2% (the async iterator yields a microtask boundary per chunk, so
even undeferred delivery starves less than the undici revision did).

Interpretation: HEAD's fast client trades 2-9% of raw ceiling and paced tail
latency at high rate (p99 3.08 ms vs 0.93 ms at 60k/s — pause/resume cycling
around the duplex's HWM of 16 messages once real backpressure engages;
tunable via `readableHighWaterMark`, deliberately not tuned here) for bounded
memory, real TCP backpressure, and lower event-loop lag at the ceiling (p99
0.09 ms vs 0.18 ms). Production stays ahead on pure throughput: with the
undici pathologies gone, the remaining gap is plain streams dispatch, not a
fixable defect.

### Deferral-mode pricing — adaptive deferral is now the default (2026-07-04)

The per-message deferral both clients used (production via ws
`allowSynchronousEvents:false`, fast via one `setImmediate` per delivery) pays
one event-loop turn per message whether or not anyone was woken. Pricing the
modes separately (`results/deferral-modes.txt`, TLS ceilings, medians of 3):

| mode | tick100 | vs ccxt | delta1k | vs ccxt | wakeups (starvation probe) |
|---|---|---|---|---|---|
| ccxt production (per-message deferral) | 535,013 msg/s | — | 134,691 | — | 100% |
| fast **adaptive (new default)** | 871,967 | **+63.0%** | 142,487 | **+5.8%** | **100%** |
| fast strict per-message deferral | 487,031 | −9.0% | 129,462 | −3.9% | 100% |
| fast no deferral | 914,293 | +70.9% | 157,810 | +17.2% | **50.2%** |

Adaptive deferral yields an event-loop turn only after a delivery that
actually resolved an awaited future (`resolve()` found the messageHash armed
— the only case where the consumer must re-arm before the next resolve), plus
a fairness yield every 64 messages to bound loop lag (p99 0.40–1.64 ms vs
nodefer's 7.37 ms). Messages nobody awaits — cache updates, unsubscribed
topics, deliveries while the consumer is mid-re-arm — flow at full speed and
land in ccxt's caches; nothing is dropped, the consumer's next wakeup sees the
merged state. Result: nodefer's throughput (95–97% of it) with production's
semantics (100% of achievable consumer wakeups; parity suite still passes).
`WsClientStreamFast` now defaults to adaptive; strict per-message semantics
via `{ options: { adaptiveDeferral: false } }`, no deferral via
`{ options: { allowSynchronousEvents: true } }` (halves wakeups — measured,
not recommended). Note this optimization is transport-independent: production
`WsClient` could apply the same trick over raw `ws` events (set
`allowSynchronousEvents: true`, defer in `Client.onMessage` only when a
future was resolved) for the same +63%/+5.8% ceiling gain.

### WsClientFast — adaptive deferral on the production transport wins (2026-07-04)

The transport-independence claim above was then implemented and measured:
`ws-profile/WsClientFast.mjs` extends the production `WsClient` (same raw
`ws` socket, same event wiring, cookies, ping/pong/upgrade) and changes only
the delivery policy — `allowSynchronousEvents: true` on the socket, incoming
messages enqueued and dispatched by a synchronous drain loop that yields one
event-loop turn only after a dispatch that resolved an awaited future (or
every 64 messages for fairness), with `connection.pause ()` above 1024 queued
messages and `resume ()` on drain (TCP backpressure under overload).
Head-to-head (`results/ws-fast-vs-stream.txt`, TLS loopback, medians of 3):

| metric | ccxt production | WsClientFast (ws events) | WsClientStreamFast (duplex) |
|---|---|---|---|
| tick100 ceiling | 527,191 msg/s | **930,086 (+76.4%)** | 906,909 (+72.0%) |
| delta1k ceiling | 136,957 | **156,420 (+14.2%)** | 147,811 (+7.9%) |
| paced 60k/s p50/p95/p99 µs | 430 / 876 / 2,903 | **359 / 609 / 805** | 382 / 624 / 1,236 |
| parity | 14/14 | **14/14** (abrupt-destroy signature identical to production) | 14/14 |
| starvation wakeups | 100% | **100%** | 100% |

WsClientFast beats the stream client on every throughput and latency column
(no duplex/streams dispatch layer — that was the measured ≈4%/msg plumbing
tax) and even fixes the paced-60k tail where per-message deferral hurt
production this session. Costs: event-loop lag p99 at the uncapped firehose
rises to 1.6–3.4 ms (drain bursts of 64; tunable via `fairnessBatch`), and
backpressure engages at a coarser bound than the duplex HWM (1024 queued
messages vs 16). Verdict revised accordingly: **the adaptive-deferral
delivery policy on the production `ws` transport is the winning combination**
— streams added safety but their dispatch tax is now the only thing they buy.
PR 29084 ships `WsClientFast.mjs`; the stream client remains on this branch
for reference.

### Final pick: the queueless duplex client, HWM 1024 (2026-07-04)

Decision revised once more, by explicit choice of implementation shape over
peak throughput: the shipped client is **`WsClientStreamFast` — no internal
queue**. The duplex readable is the only buffer (Node's stream queue instead
of a hand-rolled array); it is what converts ws's chunk-synchronous emission
into per-message delivery, so the adaptive deferral keeps its 100%-wakeup
guarantee without any queue code of our own. Its one measured flaw — pause/
resume flapping at the stream-default `readableHighWaterMark` of 16 (pause
threshold and read-triggered resume sit one message apart, so the socket
chattered under sustained paced load: delivery p99 1.24–3.08 ms at 60k/s) —
is fixed by raising the bound to **1024 messages** (`recvHighWaterMark`
option), turning backpressure into the same memory circuit breaker the queue
variant used. Same-run head-to-head (`results/queueless-hwm1024.txt`):

| metric | production | WsClientFast (queue) | **WsClientStreamFast (queueless, HWM 1024)** |
|---|---|---|---|
| tick100 ceiling | 537,468 msg/s | 941,619 (+75.2%) | **853,190 (+58.7%)** |
| delta1k ceiling | 135,152 | 154,381 (+14.2%) | **144,465 (+6.9%)** |
| paced 60k/s p50/p95/p99 µs | 414/710/967 | 353/598/794 | **396/650/864** (was p99 1,236–3,080 at HWM 16) |
| el-lag p99 at tick100 ceiling | 0.53 ms | 5.19 ms | **1.03 ms** |
| parity / starvation | 14/14 / 100% | 14/14 / 100% | **14/14 / 100%** |

The streams dispatch tax (~6–9% vs the queue variant) buys: no bespoke
buffer/drain code (backpressure, pause/resume, and buffering are Node
streams machinery), smoother event-loop lag at the firehose (1.03 vs
5.19 ms — the queue's 64-message drain bursts are the queue's own flaw), and
a single delivery path (`for await`). Still +58.7%/+6.9% over production
with a clean paced tail. PR 29084 ships `WsClientStreamFast.mjs`;
`WsClientFast.mjs` (the queue variant) stays on this branch as the
measured-faster alternative if peak ceiling ever outranks implementation
simplicity.

### Simplification: all delivery options removed, bare `for await` (2026-07-04)

By explicit product decision — per-message wakeup guarantees are not required
("resolve most of them") — `WsClientStreamFast` dropped `adaptiveDeferral`,
`allowSynchronousEvents`, `fairnessBatch`, `recvHighWaterMark`, and the
resolve/reject wakeup hooks. The delivery loop is now literally:

```js
for await (const message of this.duplex) { this.onMessage ({ data: message }); }
```

(One message per async-iterator step — a microtask boundary between every
two deliveries; HWM stays hardcoded at 1024 as the memory circuit breaker.)
Same-run head-to-head (`results/plain-loop.txt`):

| metric | production | WsClientFast (queue, adaptive) | **WsClientStreamFast (plain loop)** |
|---|---|---|---|
| tick100 ceiling | 568,302 msg/s | 979,522 (+72.4%) | **956,413 (+68.3%)** |
| delta1k ceiling | 136,415 | 157,846 (+15.7%) | **147,760 (+8.3%)** |
| paced 60k/s p50/p95/p99 µs | 422/749/982 | 381/645/771 | **375/626/824** |
| el-lag p99 at tick100 firehose | 0.16 ms | 12.30 ms | **4.47 ms** |
| parity | pass | pass | **pass** |
| starvation-burst wakeups | 100% | 100% | **50.2%** |

Removing the yields buys back most of the adaptive gap (956k vs the adaptive
revision's 853k at tick100) at the documented price: under a saturating
burst, a `while (true) { await watchX () }` consumer wakes for ~half the
messages (per-message microtask boundary loses the multi-hop future re-arm
race about half the time). Nothing is dropped — every message runs through
`onMessage` and lands in the caches; the consumer's next wakeup sees the
merged state. At paced (realistic) rates each message arrives in its own
event-loop turn and wakeups are ~100% for all clients. Event-loop lag at the
uncapped firehose is bounded by the HWM (microtask delivery monopolizes a
turn until the duplex pauses the socket at 1024 unread messages). PR 29084
ships this version; the adaptive variants (stream: git history; queue:
`WsClientFast.mjs`) remain available if the 100% burst-wakeup guarantee is
ever needed again.
