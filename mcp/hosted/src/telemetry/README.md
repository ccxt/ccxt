# Telemetry: what the hosted server collects

This file is the authoritative list of what the hosted CCXT MCP server (`https://docs.ccxt.com/mcp`) records about its use. The code is in this directory, and the tests in `mcp/hosted/test/telemetry/` check every rule below. If this file and the code disagree, the code is wrong.

The local stdio server (`ccxt-mcp` on npm) collects nothing. Nothing in this directory runs there.

## Where data goes

- **PostHog Cloud, EU region** (`https://eu.i.posthog.com`), in one project. The project token comes from the environment and is never committed. Two products are used:
  - MCP analytics (events).
  - Logs, over OTLP/HTTP.
- **Standard output.** Every log record is also written there as one JSON line, so `docker logs` works with PostHog off.
- **No token, no data.** Without `POSTHOG_PROJECT_TOKEN`:
  - no network request is made;
  - tool schemas are left unchanged;
  - logs go to standard output only.

## Who is counted

Phase 1 is anonymous.

- **No person profiles.** Every event is sent with `process_person_profile: false`.
- **One session per HTTP request.** The stateless server has no protocol session. Each request's `$session_id` and `distinct_id` are derived from its `request_id` (`ses_<hash>`), so they identify the request, not a person.
- **`client_hash`** groups requests from one client within one UTC day, for abuse and uniqueness analysis.
  - It is 16 hex characters of HMAC-SHA256 with a server secret (`CLIENT_HASH_SECRET`). The HMAC input is the UTC date and the client key.
  - The client key is the ChatGPT subject id when ChatGPT sends one, otherwise the client IP address from the trusted proxy header.
  - The key itself is never sent or logged, so neither is the IP address.
  - The date in the input changes the hash every day, so a client cannot be followed across days.
- **`auth_state`** is always `anonymous` in phase 1.

## Analytics events

The events come from [`@posthog/mcp`](https://posthog.com/docs/mcp-analytics), pinned to exactly 1.7.0 because the product is in beta. A filter (`beforeSend` in `analytics.ts`) runs on every event after the SDK's own sanitizer.

| Event | When |
|---|---|
| `$mcp_initialize` | A 2025-era client's `initialize` handshake. |
| `$mcp_tools_list` | A `tools/list` request. Set `POSTHOG_TOOLS_LIST_EVENT=0` to stop it. |
| `$mcp_tool_call` | Every tool call, successful or not. |
| `$exception` | An *unexpected* tool failure only, for PostHog Error Tracking. See "Errors" below. |

### Properties on every event

| Property | Content |
|---|---|
| `request_id` | The server's id for the HTTP request. It also appears in the logs and the `x-request-id` header. |
| `client_hash` | See "Who is counted". |
| `auth_state` | `anonymous` |
| `deployment` | `DEPLOYMENT_ENV` (e.g. `production`) |
| `sample_rate` | The success sampling rate in force (`POSTHOG_SAMPLE_RATE`, or `LIVE_TELEMETRY_SAMPLE_RATE` for `live_update`), on every event, errors included. |
| `effective_sample_rate` | The rate THIS event was kept at: `sample_rate` for a success, `1` for an error (errors are never sampled). Scale counts by `1 / effective_sample_rate`, never by `1 / sample_rate`, which overcounts errors. |
| `$mcp_server_name`, `$mcp_server_version`, `$mcp_server_build` | This server. The version carries the build id (`BUILD_ID`, the git commit, in the compose deployment). The build is `SERVER_BUILD` / `GIT_SHA` when set; the compose file passes `SERVER_BUILD` from `BUILD_ID`. |
| `$mcp_protocol_version` | The protocol revision the request used. |
| `$mcp_client_name`, `$mcp_client_version` | The client's self-declared name, e.g. `claude-ai`. Present on 2026-07-28 requests and on `initialize`. 2025-era stateless tool calls do not carry it. |
| `$mcp_client_user_agent` | The client's HTTP `User-Agent`. |
| `$mcp_session_source`, `$mcp_duration_ms`, `$mcp_source`, `$mcp_interface`, `$lib`, `$lib_version`, `$is_server`, `$geoip_disable` | SDK bookkeeping. GeoIP is disabled. |
| `$mcp_parameters` | The JSON-RPC request, after the cleanup below. |

### Extra properties on `$mcp_tool_call`

| Property | Content |
|---|---|
| `$mcp_tool_name`, `$mcp_resource_name`, `$mcp_tool_description` | The tool called. |
| `$mcp_input_keys` | Argument *names*. The SDK records names the tool's schema declares; any other name becomes `[redacted]`. |
| `exchange` | The `exchange` argument, only when it is a ccxt id: lower case, at most 32 characters. |
| `$mcp_parameters` of an account tool | `get_balance`, `get_orders`, `get_positions`, `get_my_trades`: argument **names** only (each value is `[redacted]`, except a ccxt-shaped `exchange`). These stubs never use their arguments, and they are where a user who has just pasted a key ends up. |
| `cache` | `hit`, `miss` or `coalesced`, when the response cache answered. |
| `response_bytes` | The size of the tool result. The result itself is not sent on success. |
| `$mcp_is_error`, and on failure `$mcp_error_type`, `$mcp_error_message`, `error_code` | `error_code` is the code of the tool's error envelope (`BAD_SYMBOL`, `RATE_LIMITED`, `ACCOUNT_REQUIRED`, ...), or `VALIDATION` when the SDK rejected the arguments. |
| `$mcp_response` | **Errors only:** a preview of the error result, at most 1 KB. |
| `$mcp_intent`, `$mcp_intent_source` | The model's one-line reason for the call. See "Options". This is free text written by the model and may paraphrase what the user asked. It is capped at 1,024 characters, and every part shaped like a credential (rule 3 below) is replaced by `[redacted]`. It is **not recorded at all** for the account tools. |

`$mcp_tools_list` also carries `$mcp_listed_tool_names`.

### How arguments are cleaned before they leave

`$mcp_parameters` is the whole JSON-RPC request, so the arguments sit nested inside it. The filter walks all of it:

1. **The request's `_meta` is removed.** It can carry host-assigned per-user identifiers such as `openai/subject`.
2. **Credential-like key names are redacted anywhere, at any depth, inside arrays too.** Matching is case- and separator-insensitive. The names covered:
   - every ccxt `requiredCredentials` name: `apiKey`, `secret`, `uid`, `login`, `password`, `twofa`, `privateKey`, `walletAddress`, `token`;
   - `passphrase`, `accessToken`, `authorization`, `cookie`, `signature`, `mnemonic`, `otp`, `key` and similar.
3. **Secret-shaped values are redacted whatever their key**, as a best effort by shape (no pattern can recognise every secret):
   - PostHog and `sk-` keys, PEM headers, `Bearer` values, JWTs;
   - a credential word followed by a value (`my api key is ...`, `password: ...`, `apiKey=...`);
   - tokens of 32 or more characters mixing upper case, lower case and digits, base64 or url-safe (Binance keys, Kraken, Bitstamp and Coinbase secrets); a checksummed EVM wallet address is public and stays;
   - 32 or more hex characters (OKX secrets, HMAC keys, EVM private keys);
   - UUIDs (OKX and KuCoin API keys).

   Only the matching part of a string is replaced. The same rule applies to `$mcp_intent`, `$mcp_error_message` (a tool error echoes its arguments, e.g. the symbol in `BAD_SYMBOL`), the error `$mcp_response` preview, every `$exception_list` value, and log values.
4. **Sizes are capped:**
   - strings at 256 characters;
   - arrays at 20 items;
   - objects at 50 keys;
   - nesting at 6 levels;
   - the whole value at 2 KB. Past that, only its size and a 2 KB prefix of the already-cleaned JSON are sent.

The hosted server also rejects unknown arguments, so a credential sent as an argument fails validation and is never used. It is still redacted from the analytics of that failed call.

### Errors

- **Expected errors produce no `$exception`.** They stay visible on `$mcp_tool_call` through `$mcp_is_error` and `error_code`. These are tool results where the server worked as designed:
  - `VALIDATION`, `ACCOUNT_REQUIRED`, `RATE_LIMITED`;
  - `BAD_SYMBOL`, `BAD_TIMEFRAME`, `BAD_REQUEST`, `NOT_SUPPORTED`;
  - `UNKNOWN_EXCHANGE`, `UNKNOWN_ACCOUNT`, `UNKNOWN_METHOD`;
  - `TIER_DISABLED`, `USE_GET_TOOL`, `USE_WATCH_TOOLS`;
  - `EXCHANGE_UNAVAILABLE`, `TIMEOUT`, `RESULT_TOO_LARGE`;
  - any extra codes in `POSTHOG_EXPECTED_ERROR_CODES`.
- **Everything else also produces `$exception`:** a thrown error, `INTERNAL_ERROR`, `EXCHANGE_ERROR`, `UNKNOWN_OUTCOME`, and any code not on the list. A new failure mode is therefore visible by default.
- **Stack frames never carry absolute paths.**
  - A path inside `node_modules` keeps only the part from `node_modules/` on.
  - A path inside the app directory becomes relative to it.
  - Any other path keeps only its file name.
  - The same rule applies to paths inside error messages and previews. URLs are left alone.

### Sampling

`POSTHOG_SAMPLE_RATE` (0 to 1, default 1) keeps that fraction of **successful** events.

- Errors and their `$exception` events are always kept.
- The decision hashes the session id. Today that id is one per request, so a request's events are kept or dropped together, and the same id always gets the same answer.
- **`live_update`** (the views' refresh poll, every few seconds per open view) uses `LIVE_TELEMETRY_SAMPLE_RATE` (default `0.01`) for its successes instead. Its errors are always kept. `sample_rate` on each event is the success rate in force, also on errors, which were not sampled: to scale counts back up, weight each event by `1 / effective_sample_rate` (1 for errors). Both rates must be numbers from 0 to 1; anything else (`1%`, `0,05`, `5`) fails at start-up.

## Logs

Each log record is one JSON line on standard output. When a token is set, the same record is sent to PostHog Logs.

- **Endpoint:** `{POSTHOG_HOST}/i/v1/logs`, OTLP/HTTP JSON, gzip.
- **Authentication:** the token goes in the `Authorization: Bearer` header, never in the URL.

### Resource attributes

| Attribute | Value |
|---|---|
| `service.name` | `SERVICE_NAME` (default `ccxt-mcp-hosted`) |
| `service.version` | The server's version. |
| `deployment.environment.name`, `deployment.environment` | `DEPLOYMENT_ENV` |
| `os.name`, `os.version`, `telemetry.sdk.name`, `telemetry.sdk.version` | Added by `posthog-node`. |

### Record attributes

| Attribute | Content |
|---|---|
| `request_id`, `client_hash`, `auth_state` | On every record written inside a request. |
| `posthogDistinctId`, `sessionId` | The same values as that request's events, so PostHog links a log line to its events. |
| One wide line per request (`msg: "request"`) | `http_status`, `duration_ms`, `mcp_method`, `tool_name`, `exchange`, `ok`, `error_code`, `cache`, `protocol_era`, `client_name`. `limited_by` (`client`, `host`, `busy`, `draining`) when this server's own budget answered before the tools ran. For `live_update` the line is at `debug` when the poll succeeded or was refused by this server's own budget (`limited_by` set): the polls are summarised by the hub's stats line instead. Any other failure of a poll — an exchange throttling this server (`RATE_LIMITED` from upstream), a full queue, an outage — stays at `warn`. |
| `live hub stats` (every `LIVE_STATS_INTERVAL_MS` while views are live) | `streams`, `streams_by_exchange`, `abandoned`, `instances`, `polls_stream`, `polls_cache`, `polls_rest`, `polls_failed`, `polls_failed_by_code`, `refused`, `refused_by_reason`, `fallbacks`, `opened`, `closed_idle`, `recycled`, `unrenewed`, `stream_errors`, `disabled_exchanges`: totals since the process started (a rate needs the difference between two lines), plus `polls_stream_delta`, `polls_cache_delta`, `polls_rest_delta`, `polls_failed_delta` and `refused_delta` since the previous line. Counts only: no symbol, no client. |
| Other lines | Server life-cycle events (listening, draining, circuit breaker), and errors as `name: message` of at most 300 characters (never a stack). |

### What is never logged

- Tool arguments and tool results. The request line's `mcp_method`, `tool_name` and `exchange` keep only known values: a method name of MCP's shape, a hosted tool name (anything else is `unknown`), and an allowlisted exchange id.
- HTTP headers, including `User-Agent`.
- IP addresses.
- Tokens.

Attribute names that would carry these are dropped by the logger whatever a call site passes:

- `arguments`, `args`, `params`, `input`, `result`, `response`, `body`, `content`;
- `headers`, `ip`, `x-forwarded-for`, `clientKey`, `subject`;
- every credential-like key.

Other values are capped at 1,024 characters, their secret-shaped parts are redacted (rule 3) and absolute paths are reduced to file names. `LOG_LEVEL` (`debug`, `info`, `warn`, `error`; default `info`) filters standard output and PostHog alike.

## What is never collected

- Exchange API keys or any other credential, as far as they can be recognised. The hosted server accepts none. Any that are sent anyway are redacted by name and by shape as described above; that is a best effort, and a secret in a format none of the rules recognises can still be recorded.
- Successful tool results: no market data or other content.
- IP addresses. GeoIP is disabled, and only the `client_hash` derived from the IP is sent. (The nginx snippet in `deploy/` logs MCP requests in its own format without client addresses; see the deploy README.)
- Person profiles, and email addresses or names.
- Anything from the local stdio server.

## Configuration

| Variable | Default | Why this default |
|---|---|---|
| `POSTHOG_PROJECT_TOKEN` | unset (off) | Off unless deliberately configured. A personal API key (`phx_`) is refused and never sent. |
| `POSTHOG_HOST` | `https://eu.i.posthog.com` | The project is in the EU region. The wrong region answers 401 at the start-up check. |
| `POSTHOG_SAMPLE_RATE` | `1` | Keep everything until volume nears the free tier (about 1M events/month), then use 0.1 to 0.25. |
| `POSTHOG_CONTEXT` | on | Intent (`$mcp_intent`) is the one signal about what users try to do. Cost: see "Schema cost". |
| `POSTHOG_CAPTURE_MODEL` | off | The `llm_model` argument is self-reported and unverified, and costs schema bytes on every tool. |
| `POSTHOG_CONVERSATION_ID` | off | It appends a `{"conversation_id":…}` content block to every result, which breaks clients that parse `content[0]` or count blocks. It is also the SDK's only cross-request grouping on 2026-07-28. Turning it on also switches session ids from per-request to the SDK's conversation handle. |
| `POSTHOG_TOOLS_LIST_EVENT` | on | Discovery volume is useful while it stays small. Turn it off if it dominates. |
| `POSTHOG_INITIALIZE_EVENT` | on | PostHog's default dashboard uses it for its users and sessions tiles. |
| `POSTHOG_EXCEPTIONS` | on | Unexpected failures should open Error Tracking issues. Expected ones are filtered out. |
| `POSTHOG_EXPECTED_ERROR_CODES` | (none) | Extra error codes, comma-separated, to treat as expected. |
| `CLIENT_HASH_SECRET` | random per process | Must be set, and the same on every instance, for `client_hash` to agree across instances and restarts. |
| `SERVICE_NAME`, `DEPLOYMENT_ENV`, `LOG_LEVEL`, `SERVER_BUILD` / `GIT_SHA` | `ccxt-mcp-hosted`, `development`, `info`, unset | Resource and event labels. |

### Schema cost of the analytics options

Each option adds an argument to every tool's input schema, so it costs model context on every `tools/list`. Measured on the 14 hosted tools as the bytes of the `tools/list` result:

| Option | Bytes | Increase |
|---|---|---|
| None | 20,369 | baseline |
| `context` (the default) | 24,204 | +3,835 (+19%) |
| `captureModel` alone | 23,491 | +3,122 |
| `conversationId` alone | 23,785 | +3,416 |
| All three (the SDK's own default) | 30,742 | +10,373 (+51%) |

With all three on, the hosted list nears the roughly 33,000-character cap one host was observed to apply (see `mcp/ts/tools/profile.ts`).

## Health and shutdown

- **Start-up token check.** At start-up one `POST {POSTHOG_HOST}/flags?v=2` checks the token and its region. An HTTP 200 from a capture endpoint is not proof: PostHog answers 200 to a bogus token. The check runs in the background, and `/readyz` reports its outcome as `telemetry`:
  - `analytics`: `off`, `unverified`, `ok` or `error`;
  - `logs`: `off`, `ok` or `error`.
- **Never blocking.** Capturing an event or a log line only queues it. A slow or unreachable PostHog never delays a tool call or start-up.
- **Shutdown.** Both queues are flushed with a hard deadline. Whatever is still in flight at the deadline is abandoned, so a hung PostHog cannot hold a draining process open.

## Phase 2 (accounts)

When sign-in exists:

- `identify` returns the user's opaque internal id: never an email address, exchange key or exchange uid.
- `auth_state` becomes `authenticated`.
- Account tools keep the same rule: no tool result is sent on success.
- Before account tools are listed, argument recording should move from this denylist to a per-tool allowlist of argument names.
