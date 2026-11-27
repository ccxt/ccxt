# Directory submission checklist — hosted CCXT MCP server

Everything the Anthropic and OpenAI directories ask for, for the hosted server at `https://mcp.ccxt.com/mcp` and its plugin in `mcp/hosted/plugin/`. Each row names its source; quotes were read on 2026-11-25 and rechecked on 2026-11-26. Re-read the sources before submitting: both directories change their forms often.

**Do not submit to either directory before the policy questions in [POLICY-RISKS.md](POLICY-RISKS.md) are answered.** Both directories have written rules that a crypto market-data connector may not pass.

**Legal pages come with the directory submission, not with the server launch.** The privacy policy and terms are drafts in [PRIVACY-POLICY.draft.md](PRIVACY-POLICY.draft.md) and [TERMS.draft.md](TERMS.draft.md). Once legal review approves them, the submission pull request moves them to `wiki/MCP-Privacy.md` and `wiki/MCP-Terms.md`, adds their `mcp-privacy` and `mcp-terms` routes to `build/wiki-to-fumadocs.ts`, and links them from `wiki/MCP.md`. Until then `https://docs.ccxt.com/docs/mcp-privacy` and `/docs/mcp-terms`, which both plugin manifests already name, answer 404, so do not submit to either directory before that pull request is merged.

## Launch steps

1. DONE (2026-11-26): `"remotes": [{ "type": "streamable-http", "url": "https://mcp.ccxt.com/mcp" }]` is back in `mcp/server.json`. The next ccxt-mcp release publishes it to the MCP Registry.
2. DONE (2026-11-26): the "not deployed yet" status lines are gone from `wiki/MCP.md`, `mcp/README.md`, `.claude/skills/ccxt-mcp/SKILL.md` and `mcp/hosted/plugin/README.md`.
3. Legal review approves the two legal pages; the directory-submission pull request publishes them (see above).
4. Put the OpenAI domain-verification token in `OPENAI_APPS_CHALLENGE` in the VM's `.env` and run `docker compose up -d` (README, Deploy).

Status values:

- **DONE**: in the repo and checked (the evidence is named).
- **TODO**: work that has not been done.
- **DECIDE**: needs a decision by a person, not work.
- **BLOCKED**: waits on something outside this repo (a policy answer, a deployment, an account).
- **N/A**: does not apply to this server.

## Shared prerequisites

| Requirement | Status | Notes |
|---|---|---|
| Server deployed at `https://mcp.ccxt.com/mcp` | DONE | Deployed 2026-11-25 on the docs.ccxt.com machine (container on `127.0.0.1:8099`, `HOST_PORT`). `node scripts/smoke.mjs --url https://mcp.ccxt.com/mcp --live` passed in both protocol eras on 2026-11-26; `live_update` served from the shared stream. `DEPLOYMENT_ENV` is still `staging`: set `production` at launch. |
| The URL is final | DECIDE | It is Claude's `_meta.ui.domain` hash input, the phase-2 OAuth audience and the registry `remotes[].url`. OpenAI: "To change an existing MCP server's URL, contact support" ([submission](https://developers.openai.com/plugins/deploy/submission)). Pinned by `mcp/test/schema/hosted-plugin.test.ts`. |
| Privacy policy published at `https://docs.ccxt.com/docs/mcp-privacy` | TODO (legal) | Text: [PRIVACY-POLICY.draft.md](PRIVACY-POLICY.draft.md); published by the submission PR (wiki page + `mcp-privacy` route); reviewer notes in [PRIVACY-POLICY.notes.md](PRIVACY-POLICY.notes.md). Awaiting legal review (the **[bracketed]** items, then the draft banner comes off). The URL is in both manifests but not live (404). Publishing it needs a `wiki/` page plus a route in `PAGE_TO_ROUTE` of `build/wiki-to-fumadocs.ts`. Do not point the manifests at `https://ccxt.com/privacy`: that page is the CCXT Terminal privacy policy, a different product. |
| Terms of service published at `https://docs.ccxt.com/docs/mcp-terms` | TODO (legal) | Text: [TERMS.draft.md](TERMS.draft.md); published by the submission PR (wiki page + `mcp-terms` route); notes in [TERMS.notes.md](TERMS.notes.md). Same notes as the privacy policy (`https://ccxt.com/terms` is the CCXT Terminal terms). |
| Public documentation | DONE once the docs deploy | `wiki/MCP.md`, section "Hosted server (no install)", served at `https://docs.ccxt.com/docs/mcp`. |
| Support contact | DONE | `https://github.com/ccxt/ccxt/issues` in both manifests. A support email may be expected by the Claude form ("support contact"). DECIDE whether to add one. |
| Icon and logo | DONE | `mcp/hosted/plugin/assets/`: `logo.png` 1024×1024 (the website logo, re-rendered from `docs/website/src/app/icon.svg` geometry), `icon.svg` / `icon-dark.svg` (the favicon mark with fixed colours). Checked by `hosted-plugin.test.ts` and `claude plugin validate --strict`. |
| Review prompts and cases | DONE (draft) | [REVIEW-CASES.md](REVIEW-CASES.md); OpenAI's cases are also in `plugin.json`. The markets they use were checked live on 2026-11-25. |
| Screenshots and demo video | TODO | [SCREENSHOTS.md](SCREENSHOTS.md). The server is deployed; record in Claude and ChatGPT (desktop and mobile). |
| Exchange reachability from the production machine | DONE | All 10 allowlisted exchanges reachable from the VM on 2026-11-25 (`docker compose run --rm hosted node /app/check-exchanges.mjs`). An exchange that cannot be reached comes off the allowlist; the review cases avoid Binance and Bybit for that reason. |

## Anthropic — Connectors Directory (remote MCP connector)

Sources: [submission](https://claude.com/docs/connectors/building/submission), [review criteria](https://claude.com/docs/connectors/building/review-criteria), [Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy), [publish](https://claude.com/docs/directory/publish).

| Requirement | Source | Status | Notes |
|---|---|---|---|
| Written permission for crypto software | Policy §4.A | BLOCKED (policy) | "We do not generally allow cryptocurrency software in our directory." See POLICY-RISKS.md. |
| Public `https://` URL, Streamable HTTP | building/index | DONE | The server speaks stateless Streamable HTTP (hosted runtime). |
| Public IPv4 `A` record ("Connectors are IPv4-only") | building/troubleshooting | DONE, recheck | `docs.ccxt.com` resolved to an A record from this sandbox on 2026-11-25. Recheck from outside after deploy. |
| No WAF or CDN block on Anthropic egress (`160.79.104.0/21`); no strict `Origin` check | building/authentication; [IP addresses](https://platform.claude.com/docs/en/api/ip-addresses) | DONE (config), verify with Claude | No CDN in front of docs.ccxt.com; nginx exempts the Anthropic and OpenAI ranges from its per-address limits (`deploy/nginx/ccxt-mcp-http.conf`) and the app gives them a host budget. Confirm by adding the connector in Claude. |
| Every tool has a `title` and `readOnlyHint` / `destructiveHint` | review criteria; Policy §5.E | DONE | Pinned for the hosted tool list by `mcp/hosted/test/protocol.test.ts` (15/15 passed on 2026-11-25). |
| Tool names ≤ 64 characters; no tool mixes safe and unsafe methods | review criteria | DONE | 15 tools (live_update is app-only), longest `describe_exchange`. |
| Results ≤ ~150,000 characters; ≤ 240 s per call | building/index | DONE | Results are capped by the shared tools; per-call deadline 20 s (`REQUEST_DEADLINE_MS`). |
| Authless allowed | building/authentication: "`none` — No authentication (authless server) — Supported by default" | DONE | Phase 1 is anonymous. |
| Listing: name ≤ 100, one-liner ≤ 200, description ≤ 2,000, 1–5 categories, documentation URL, privacy policy URL, support contact, icon, permanent slug | submission, step 3 | TODO | Drafts in "Listing copy" below. The slug is permanent: DECIDE (`ccxt` proposed). |
| ≥ 3 working example prompts | Policy §3.E | DONE (draft) | REVIEW-CASES.md. |
| Use cases, prerequisites, read/write | submission, step 4 | TODO | Answer: market data and charts; no account or plan needed; reads only. |
| Company name, website, primary contact | submission, step 5 | TODO | |
| Data handling: "your own, proxied from a partner with permission, or a third party's you don't control" | submission, step 7 | BLOCKED (policy) | Honest answer: third parties' public APIs. Conflicts with "Your server must call your own first-party APIs, or APIs you legitimately proxy" (review criteria) and Policy §3.F. See POLICY-RISKS.md. |
| Every tool run by the submitter (MCP Inspector or a custom connector) | submission, step 8 | TODO | The server is deployed: add it as a custom connector and run every tool once. |
| Seven compliance acknowledgments (incl. "first-party API usage", "financial transactions", "conversation data collection") | submission, step 9 | BLOCKED (policy) | |
| MCP Apps carousel: PNG, ≥ 1000 px wide, 3–5 images, cropped to the app response, prompts supplied separately, no video or GIF | submission | TODO | SCREENSHOTS.md. |
| Allowed link URIs | submission | N/A | The views do not call `ui/open-link`. |
| `_meta.ui.domain` = first 32 hex of sha256(connector URL) + `.claudemcpcontent.com` | mcp-apps/getting-started | N/A for now | Only needed if a view runs its own OAuth or needs a stable origin; the views are self-contained. |
| Submitter on a paid plan (Pro, Max, Ultra, Team or Enterprise Owner) | directory/publish: "Free accounts can't submit" | TODO | |
| Review outcome | submission-status | — | Listed as "Community" by default. "embedded websites and entry points are available only under a Verified listing"; inline views work on Community listings. |
| Contact for a connector submission | [submission-status](https://claude.com/docs/directory/submission-status): "MCP connector: email `mcp-review@anthropic.com`" | — | Use the same address for the permission question. |

## Anthropic — plugin bundle (paired with the connector)

Sources: [pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist), [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference), [publish](https://claude.com/docs/directory/publish).

| Requirement | Status | Notes |
|---|---|---|
| Submit the remote server as a connector too: "If you have a remote MCP server, always submit it as an MCP connector, even when a plugin you're submitting already references it" | TODO | The connector section above. |
| Public GitHub repo; the submitter can push | DONE | `ccxt/ccxt`, folder `mcp/hosted/plugin`. |
| README ≥ 40 words; `LICENSE` file or `license` field | DONE | Both; checked by `hosted-plugin.test.ts`. |
| No symlinks, submodules or LFS; non-image files < 256 KiB; ≤ 512 files | DONE | Checked by `hosted-plugin.test.ts`. The skill is a real file, not a symlink. |
| Remote server entry: `type` `http`, absolute `https://` URL; no `${user_config.*}` in the URL | DONE | `.mcp.json`. |
| Name not a reserved word | DONE | `ccxt`. `claude plugin validate --strict mcp/hosted/plugin` passed on 2026-11-25. |
| Icon: square PNG or JPEG, 512–2048 px, under 2 MB, taken only on the first save in the portal | DONE | `assets/logo.png`, 1024 px. |
| `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl` | TODO | Set in `.claude-plugin/plugin.json`; the privacy and terms pages are not live. |
| Same policy questions as the connector | BLOCKED (policy) | |
| Contact and limits | — | Plugin questions: `directory@anthropic.com` ("replies can be delayed") or Get help in the portal. At most 10 submissions per organization per 24 hours ([submit](https://claude.com/docs/plugins/submit)). |

## OpenAI — Plugins Directory (ChatGPT and Codex)

Sources: [submission](https://developers.openai.com/plugins/deploy/submission), [app review](https://developers.openai.com/plugins/deploy/app-review), [plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines), [ChatGPT UI](https://developers.openai.com/plugins/build/chatgpt-ui).

| Requirement | Status | Notes |
|---|---|---|
| Policy questions: §3.5.b unofficial connectors, §5.2.b.5 crypto speculation, §4.3 metadata collection | BLOCKED (policy) | POLICY-RISKS.md. |
| Verified individual or business identity; org owner or "Apps Management Write"; the OpenAI project is not on EU data residency ("For now, projects with EU data residency cannot submit plugins with MCP servers for review") | TODO | Applies to the OpenAI Platform organisation, not to where PostHog stores data. |
| ZIP with root `plugin.json` (Agent Plugins schema) and root `mcp.json`, exactly one remote server, no lifecycle hooks, no `apps` / `.app.json` | DONE | Valid against `https://agent-plugins.org/schemas/1.0.0/{plugin,mcp}.schema.json` with ajv on 2026-11-25. Zip the folder contents; the `.claude-plugin/` and `.mcp.json` files are Claude's. Whether the portal accepts those extra files is UNVERIFIED. |
| "public submission rejects nonempty server headers" | DONE | No headers. |
| No auth declaration in `mcp.json` | DONE, recheck at upload | [Build plugins](https://developers.openai.com/plugins/build/plugins) says "Declare authentication under each server's `extensions["com.openai"].auth` object" (`auth.type: "none"`), but the published `mcp.schema.json` (rechecked 2026-11-26) has `additionalProperties: false` on Streamable HTTP servers, so that block fails validation. It is omitted, and "No authentication" is chosen in the portal. If the portal's validator asks for it, add `"extensions": { "com.openai": { "auth": { "type": "none" } } }` to the server entry. |
| Domain verification: the exact token, plain text, at `https://docs.ccxt.com/.well-known/openai-apps-challenge` | TODO (token) | nginx proxies the path and the app serves `OPENAI_APPS_CHALLENGE` (`mcp/hosted/src/app.ts`); it answers 404 until the token from the portal is in the VM's `.env` (launch step 4). |
| Every tool: explicit `readOnlyHint`, `destructiveHint`, `openWorldHint` booleans | DONE | `mcp/hosted/test/protocol.test.ts`. |
| A justification for each annotation value on every tool | DONE | [ANNOTATIONS.md](ANNOTATIONS.md), ready to paste. [Submission errors](https://developers.openai.com/plugins/deploy/submission-errors) require it (`justification_required`); plugin guidelines §6.3 say "Annotation justifications are no longer required". The account stubs are `openWorldHint: false` on the hosted server (they contact nothing). Pinned against `tools/list` by `test/directory.test.ts`. |
| The ZIP contains at least one valid skill (`plugin_runtime_surface_missing`) | DONE | `skills/ccxt/SKILL.md`, an immediate child of `skills/`, with `name` and `description` front matter and a non-empty body. |
| `outputSchema` on every tool that returns `structuredContent` | DONE (hosted runtime) | Declared by the shared tools. |
| Per-tool `securitySchemes` (`noauth`) | DONE | `_meta.securitySchemes: [{"type": "noauth"}]` on every hosted tool (`src/profile.ts`; the SDK lists only `_meta` of the extra keys, which the [reference](https://developers.openai.com/plugins/reference) calls the mirror clients read). Pinned by `test/directory.test.ts`. |
| `_meta.ui.domain` for UI resources: "required when submitting a plugin with UI; must be unique per plugin" | DONE | `https://docs.ccxt.com` (the server's own registrable domain, `UI_DOMAIN_OPENAI`), in the `resources/read` contents `_meta.ui`, sent only to requests from OpenAI's egress ranges: Claude derives its own value from a hash of the connector URL. Pinned by `test/directory.test.ts`. |
| `interface.displayName` ≤ 30 (`CCXT`), `shortDescription` ≤ 30, `longDescription` ≤ 4,000, `developerName` ≤ 80, `category` | DONE | Checked by `hosted-plugin.test.ts`. "Finance" is one of the categories listed in [submission errors](https://developers.openai.com/plugins/deploy/submission-errors) (`plugin_category_unknown`). |
| `websiteURL`, `supportURL`, `privacyPolicyURL`, `termsOfServiceURL`: "all four listing URLs are required"; "Public URLs must be accessible and identify the same publisher" | TODO | Privacy and terms not live. |
| Privacy policy covers data categories, purposes, recipients, retention and user controls (§4.1) | TODO | The draft leaves retention and controls open: legal review. |
| `logo` (square, ≥ 48 px) and `composerIcon` | DONE | |
| Exactly five positive and three negative review cases | DONE (draft) | In `plugin.json` and REVIEW-CASES.md. |
| `review.demo_recording_url` (required for review) | TODO | Deliberately absent from `plugin.json` until the video exists ("omission or null preserves saved values"). |
| Name rule §1.3: no "MCP", "MCP Server" or "Plugin" appended | DONE | Display name `CCXT`; pinned by the test. |
| §1.2.c "must function reliably in ChatGPT on both desktop and mobile, including any UI components" | TODO | Test the views in ChatGPT web, desktop and mobile after deploy. |
| Server `instructions`: "Keep the first 512 characters self-contained" | DONE (hosted runtime) | Pinned by the hosted tests. |
| After approval: tool changes are scanned daily; "New tools remain unavailable until approved" | — | Keep the hosted tool list stable; renaming a tool is a breaking change. |

## MCP Registry

Source: [registry remote servers](https://modelcontextprotocol.io/registry/remote-servers) (schema `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`).

| Requirement | Status | Notes |
|---|---|---|
| `remotes: [{ "type": "streamable-http", "url": "https://mcp.ccxt.com/mcp" }]` in `mcp/server.json` | DONE (launch step 1) | Valid against the schema with ajv on 2026-11-25. Removed again until launch: `mcp-release.yml` publishes `server.json` on every ccxt-mcp release, which would list a remote that answers 404. `server-json.test.ts` accepts it once added. |
| "A remote server MUST be publicly accessible at its specified URL" | DONE | Publish the registry entry (`mcp-publisher publish`) only after the endpoint is live. The registry does not check URL ownership. |
| Listing in the registry does not make the server discoverable in Claude | — | "Only a directory listing makes your connector discoverable inside Claude" ([directory vs custom](https://claude.com/docs/connectors/building/directory-vs-custom)). |

## Listing copy (drafts)

Within the limits above. Reuse the same text in both directories.

- **Name:** CCXT
- **One-liner (Claude ≤ 200):** Live public crypto market data from major exchanges: prices, order books, candles and trades, with interactive charts. Read-only; no account or API key.
- **Subtitle (OpenAI ≤ 30):** Live crypto market data
- **Description:** the `longDescription` in `mcp/hosted/plugin/plugin.json` (about 1,000 characters, so it also fits Claude's 2,000).
- **Categories:** Finance (both); Claude allows up to five, so also consider "Data" or "Research" if offered.
