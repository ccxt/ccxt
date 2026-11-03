# Record and Replay

Record the HTTP interactions of a CCXT session to a file and replay them later, offline, through the real CCXT parsers and error handlers. The feature exists for testing and debugging: reproducing a bug report from a sanitized recording, running integration tests without API keys, or checking that a newer CCXT version still parses the responses an older one saw.

It is **not** paper trading, a backtester or a matching engine. Replaying an order response does not simulate how a different order would have traded.

## Status

| Capability | Status |
| --- | --- |
| HTTP recording and strict replay (JavaScript / TypeScript, Node.js) | available |
| Fault injection on replay (`replaceHttpResponse`, `transportError`, `delayResponse`) | available |
| CLI `inspect` / `validate` / `export` | planned |
| WebSocket recording and replay | planned (replay blocks WebSocket connections) |
| Scripted partial-fill scenarios | planned |
| Python, PHP, C#, Go, Rust, Java | planned, same file format |

The feature is opt-in. Exchanges that are not attached to a `Recorder` or a `Replay` behave exactly as before: no file I/O, no extra dependencies, no behavioural change.

## Record

```javascript
import ccxt from 'ccxt';

const recorder = await ccxt.Recorder.open ({ file: './session.jsonl' });
const exchange = new ccxt.binance ({ apiKey, secret });
recorder.attach (exchange, { instanceId: 'binance-spot-1' });
try {
    await exchange.loadMarkets ();
    await exchange.fetchOrderBook ('BTC/USDT', 5);
    await exchange.fetchBalance ();
} finally {
    await recorder.close ();
    await exchange.close ();
}
```

> **Record mode is not paper trading.** Every request still reaches the exchange. A `createOrder` call places a real order while it is being recorded.

Attach every instance **before** the first request, including `loadMarkets`, so the replay follows the same initialization path. `instanceId` is a logical name for the instance inside the recording. It is not an API key or an account name.

### Recorder options

| Option | Default | Meaning |
| --- | --- | --- |
| `file` | required | Output path, written as JSON Lines |
| `privacy` | `'local'` | `'local'` records every route. `'shareable'` records only public routes and writes a non-replayable placeholder for private ones |
| `sessionId` | generated | Identifier stored in the session header |
| `maxEvents` | 100000 | Stop recording when exceeded |
| `maxBodyBytes` | 64 MiB | Largest response body accepted (a full binance `exchangeInfo` is about 18 MB) |
| `maxQueueBytes` | 256 MiB | Largest amount of unflushed output tolerated |
| `onError` | none | Called once when recording stops because of a limit or a disk error |

Exceeding a limit or hitting a disk error stops the capture, marks the session incomplete and calls `onError`. It never changes the result of the exchange call that was in flight. `recorder.status` reports `complete`, `failed`, `eventCount`, `sanitizedEvents` and `redactedRequests`.

### What is written

Requests are captured **before** signing: method, API namespace, endpoint path and the parameters the exchange method built, plus the URL without its query string. Each request is also attributed to the unified method the application called (`unifiedMethod`, e.g. `fetchOrderBook`) and the chain of unified methods that led to it (`unifiedCalls`, e.g. `["loadMarkets", "fetchMarkets"]`). Request headers, signatures, nonces and credentials are never written. Responses are captured after the HTTP transport completes and before CCXT parses them: status, headers (lowercased) and the exact body text, including non-2xx responses. A transport failure such as a timeout is written as an `http.error` event instead. Each retry CCXT performs inside `fetch2` is its own request.

Every line is scanned for the live values of the instance's credential fields (`apiKey`, `secret`, `password`, `uid`, `token`, `privateKey`, `walletAddress`, `login`, `twofa`) before it is written. A match is replaced with `[REDACTED]` and the event is marked `sanitized`. This protects against an exchange echoing a key in a response. It does not remove balances, order ids or addresses: a `local` recording can still be financially sensitive. The `shareable` profile drops every non-public request body and response, and the resulting file cannot be replayed past the first private request.

## Replay

```javascript
const replay = await ccxt.Replay.open ({ file: './session.jsonl' });
const exchange = new ccxt.binance (); // no credentials
replay.attach (exchange, { instanceId: 'binance-spot-1' });
try {
    await exchange.loadMarkets ();
    const book = await exchange.fetchOrderBook ('BTC/USDT', 5);
    await replay.assertConsumed ();
    console.log (replay.report ());
} finally {
    await replay.close ();
    await exchange.close ();
}
```

The order book comes from the recorded raw body passed through the installed CCXT version's `handleRestResponse`, `handleErrors` and parser. Recorded error responses throw the same CCXT exception class and message they produced live. Private methods replay without credentials: `sign` is bypassed, so `checkRequiredCredentials` never runs.

Replay fails closed. The attached instance's `fetch` is replaced, its `fetchImplementation` throws, and `client()` throws `ReplayUnsupported` so no WebSocket can open. Nothing reaches the network.

### Replay options

| Option | Default | Meaning |
| --- | --- | --- |
| `file` | required | Session to replay |
| `matching` | `'strict'` | Only strict mode exists |
| `clock` | `'virtual'` | `'virtual'` never waits. `'realtime'` sleeps the recorded gaps, divided by `speed` |
| `speed` | 1 | Speed factor for the realtime clock |
| `deadlockTimeoutMs` | 5000 | Real-time watchdog before a stalled replay fails with `ReplayDeadlock` |
| `allowIncomplete` | `false` | Replay the validated prefix of a truncated, unfinished or partly redacted session |
| `ignoreParams` | `[]` | Parameter names excluded from matching, for all instances |
| `faults` | `[]` | Fault rules applied on top of the recording, see below |

`attach (exchange, { instanceId, ignoreParams })` accepts a per-instance `ignoreParams` as well.

### Strict matching

Every outgoing request must match the **next unconsumed recorded request** on instance id, HTTP method, API namespace, path and parameters. Parameters are compared with sorted object keys, ordered arrays and unchanged decimal strings. Nothing is normalized through floating point. Each recorded request is consumed exactly once.

- A second call for which only one interaction was recorded throws `ReplayExhausted` with the matched and received counts.
- A call whose parameters differ throws `ReplayMismatch`. The error carries `expected`, `actual` and `field`, the first differing path such as `params.limit`, and its message names the unified methods on both sides.
- Requests may be concurrent. Responses are delivered in recorded order, only after their requests have matched. Two identical outstanding requests bind first in, first out.
- If the next recorded event is a request the application never issues, the watchdog throws `ReplayDeadlock` naming the awaited request and the pending operations.
- `assertConsumed ()` throws when recorded requests remain unused.

Parameters that CCXT generates randomly, such as a client order id you did not pass, will not match on replay. Either pass the id explicitly or declare the field with `ignoreParams: ['newClientOrderId']`. The declaration is explicit so that ids are never silently dropped from matching.

### Clock

In `virtual` mode the attached instance's `sleep` advances an internal clock instead of waiting, so CCXT's `maxRetriesOnFailureDelay` retry pauses cost no real time. The rate limiter still uses real time: disable it with `enableRateLimit: false` for replay tests. Application code that uses `Date.now` or `setTimeout` directly is not virtualized.

### Fault injection

Fault rules change what a replayed request returns without modifying the recording, so the same session can exercise the error handling of user code: rate limits, exchange errors, timeouts, slow responses.

```javascript
const replay = await ccxt.Replay.open ({
    file: './session.jsonl',
    faults: [
        {
            id: 'rate-limit-second-book',
            select: { unifiedMethod: 'fetchOrderBook', occurrence: 2 },
            action: { kind: 'replaceHttpResponse', status: 429, headers: { 'content-type': 'application/json' }, bodyText: '{"code":-1003,"msg":"Too many requests."}' },
        },
        { id: 'ticker-timeout', select: { unifiedMethod: 'fetchTicker' }, action: { kind: 'transportError', errorKind: 'timeout' } },
        {
            id: 'balance-fails-twice',
            select: { unifiedMethod: 'fetchBalance' },
            actions: [
                { kind: 'transportError', errorKind: 'network' },
                { kind: 'replaceHttpResponse', status: 503, bodyText: '{"code":-1001,"msg":"Internal error."}' },
            ],
            consume: false,
        },
        { id: 'slow-balance', select: { unifiedMethod: 'fetchBalance' }, action: { kind: 'delayResponse', delayMs: 1500 } },
    ],
});
replay.inject ({ id: 'late-rule', select: { requestId: 'binance-spot-r4' }, action: { kind: 'transportError', errorKind: 'network' } });
```

Each rule has a stable `id`, a `select` block, an `action` or a list of `actions`, an optional `times` and an optional `consume` (default `true`, see below). A rule is applied to the matched recorded requests that satisfy every selector field, starting at the `occurrence`-th match (default 1) and at most `times` times. Select by the unified method your code calls; the lower-level HTTP fields exist for the rare case where one call issues several requests and only one of them should fail.

| Selector | Matches |
| --- | --- |
| `unifiedMethod` | the unified method the application called, e.g. `fetchOrderBook`. Every request issued on behalf of that call counts, including an implicit `loadMarkets`. With this selector `occurrence` counts calls, not requests. A direct implicit API call such as `publicGetDepth` has no unified method |
| `instanceId` | the attached instance id |
| `method` | the HTTP method, case-insensitive |
| `api` | the API namespace as recorded, e.g. `public` |
| `path` | the endpoint path as recorded, e.g. `depth`, or a suffix of the recorded URL such as `/api/v3/depth` |
| `requestId` | one recorded request, e.g. `binance-spot-r3` |
| `occurrence` | the n-th call (with `unifiedMethod`) or request (otherwise) matching the other fields |

| Action | Effect |
| --- | --- |
| `replaceHttpResponse` | `status`, optional `statusText` and `headers`, `bodyText`. Goes through the exchange's real `handleErrors` and parser, so a 429 throws the exception that exchange maps it to |
| `transportError` | throws `RequestTimeout` (`errorKind: 'timeout'`) or `NetworkError` (`errorKind: 'network'`) with an optional `message` |
| `delayResponse` | adds `delayMs` on the replay clock before the outcome is delivered. Virtual clock: no real wait. Realtime clock: sleeps `delayMs / speed` |

The request still has to match the recording: a fault never creates an interaction. By default the matched recorded request is consumed, as a real failed request would be, so a retry performed by CCXT or by user code needs another recorded attempt. To make the first call fail and the retry succeed, set `consume: false` on the rule: the fault is served instead of the recording and the recorded interaction stays available for the next matching call. The request is still matched strictly before the fault is served, and `delayResponse` rules cannot be non-consuming because they deliver the recorded outcome.

To simulate different outcomes on successive calls to the same method, give the rule `actions` instead of `action`: the first matching call gets the first action, the next call the second, and so on. `times` defaults to the number of actions and the list repeats when `times` is larger. With `consume: false` this models a rate limit, then a timeout, then the recorded success, and the report shows the sequence as `kind: 'replaceHttpResponse > transportError'`. Two rules with the same selector and different `occurrence` values express the same thing when the outcomes need different `consume` settings. At most one `replaceHttpResponse` or `transportError` rule may apply to a request; two such rules on the same request throw `ReplayError`. A `delayResponse` composes with either and runs first. Rules are validated when registered: an unknown `kind`, a duplicate `id` or a malformed selector fails `Replay.open` or `inject`.

### Report

`replay.report ()` returns consumed and remaining request counts, the recorded mismatches, the virtual elapsed time in microseconds, the recorded and installed CCXT versions with a `versionMismatch` flag, `networkBlocked: true`, the registered fault rules with how often and on which requests each was applied (`faults`), and the validation warnings. A version difference is a warning, not an error, because comparing parser versions is one of the intended uses.

### Inspect and validate

```javascript
await ccxt.Replay.inspect ('./session.jsonl');   // counts, instances, duration, redactions, replayability
await ccxt.Replay.validate ('./session.jsonl');  // { valid, replayable, errors, warnings }
```

`Replay.open` rejects a session that is truncated, lacks its `session.end` footer, reports itself incomplete or contains redacted requests, with `ReplayIncomplete`, unless `allowIncomplete` is set.

## File format

JSON Lines, UTF-8, one event per line. A `session.start` header, ordered events, then a `session.end` footer written on a clean close. Schema version `1.0`; an unknown major version is rejected.

```jsonl
{"type":"session.start","schemaVersion":"1.0","sessionId":"demo","startedAt":"2026-10-30T10:00:00.000Z","producer":{"name":"ccxt-recorder","version":"0.1.0"},"runtime":{"language":"javascript","ccxtVersion":"4.5.91"},"instances":[{"instanceId":"binance-spot","exchangeId":"binance","environment":"live"}],"matchingProfile":"ccxt-http-v1","privacyProfile":"local-v1","replayability":"complete","clockUnit":"microseconds"}
{"type":"http.request","seq":1,"atUs":0,"instanceId":"binance-spot","requestId":"binance-spot-r1","request":{"method":"GET","api":"public","path":"depth","params":{"limit":5,"symbol":"BTCUSDT"},"url":"https://api.binance.com/api/v3/depth","unifiedMethod":"fetchOrderBook","unifiedCalls":["fetchOrderBook"]}}
{"type":"http.response","seq":2,"atUs":85000,"instanceId":"binance-spot","requestId":"binance-spot-r1","status":200,"statusText":"OK","headers":{"content-type":"application/json"},"bodyText":"{\"lastUpdateId\":10001,\"bids\":[[\"65000.00\",\"1.250\"]],\"asks\":[[\"65001.00\",\"0.800\"]]}"}
{"type":"session.end","seq":3,"atUs":86000,"eventCount":2,"complete":true,"sanitizedEvents":0,"redactedRequests":0}
```

| Field | Contract |
| --- | --- |
| `seq` | Strictly increasing observation order, the authoritative tie-breaker |
| `atUs` | Elapsed microseconds since the session started, nondecreasing |
| `instanceId` | Logical exchange instance declared in the header |
| `requestId` | Links a request to its single terminal `http.response` or `http.error` |
| `http.request.request` | `method`, `api`, `path`, canonical `params`, `url` without query, optional `unifiedMethod` and `unifiedCalls` |
| `http.response` | `status`, `statusText`, lowercased `headers`, exact `bodyText` |
| `http.error` | `kind` (`timeout`, `network`, `other`) and the sanitized message |
| `http.redacted` | Placeholder for a request dropped by the `shareable` profile |
| `sanitized` | Set when a credential value was replaced in the event |

A complete example lives at `ts/src/test/base/fixtures/replay/binance-orderbook.jsonl`, and a runnable end-to-end script at `examples/ts/record-replay.ts`.

## Limitations

- JavaScript and TypeScript on Node.js only. Browsers get `ReplayUnsupported`.
- HTTP only. Attaching a `ccxt.pro` instance blocks its WebSocket connections instead of replaying them.
- Replay bypasses the exchange's `sign` method, so logic that runs inside `sign` is not exercised.
- Binary response bodies (zip) are recorded as unsupported and cannot be replayed.
- Strict matching is the only mode. Reordering independent requests between recording and replay fails.
- The rate limiter and application-level timers run on real time.
- Fault injection is HTTP only and deterministic: no probabilistic faults, no WebSocket disconnects.
- No pseudonymisation of ids, CLI or other language ports yet.
