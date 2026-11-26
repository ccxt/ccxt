# Policy risks for directory listings

The written rules in the Anthropic and OpenAI directories that affect a crypto market-data connector (phase 1) and the account and trading features planned for phase 2. Quotes are verbatim, read on 2026-11-25. Each section ends with the recommended next step.

**Summary.**

- Phase 1 (read-only public data) is not clearly allowed by either directory. Anthropic needs written permission. At OpenAI the main risk is the "unofficial connector" rule.
- Phase-2 **trading** is excluded by both directories as written.
- Phase-2 **server-stored exchange keys**, even for read-only account data, conflict with OpenAI's restricted-data rule.
- Nothing here limits the custom-connector route: anyone can add `https://docs.ccxt.com/mcp` by URL today, with no review (wiki/MCP.md documents it).

## Anthropic

Sources: [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy) ("Policy"), [review criteria](https://claude.com/docs/connectors/building/review-criteria), [submission](https://claude.com/docs/connectors/building/submission), [directory vs custom](https://claude.com/docs/connectors/building/directory-vs-custom).

### Crypto as a category (phase 1 and 2)

Policy §4, "Unsupported Use Cases":

> Unless otherwise expressly permitted by us in writing, we do not allow Software with certain capabilities into our Directories. We may revisit these restrictions as our Directories and Anthropic Services evolve.
>
> A. Software that transfers money or other financial assets, or executes financial transactions autonomously on behalf of users, without human-in-the-loop safeguards. We do not generally allow cryptocurrency software in our directory.

- The first sentence of A describes trading, which phase 1 does not do.
- The second sentence covers the whole category. A read-only market-data connector is "cryptocurrency software" on any plain reading.
- The section opens with "Unless otherwise expressly permitted by us in writing", so there is a documented way through.

### Trading (phase 2)

Review criteria:

> Connectors that do the following aren't accepted:
>
> * Transfer money, cryptocurrency, or other financial assets

The portal's compliance step (submission, step 9) includes a required acknowledgment on "financial transactions". Trading tools on the listed URL would make that acknowledgment false.

### Third-party APIs (phase 1 and 2)

Review criteria:

> Your server must call your own first-party APIs, or APIs you legitimately proxy. The MCP server domain should match your service.

Policy §3.F:

> Developers must verify that they own or control any API endpoint, domain, or user interface their Software connects to, as well as any external resources it retrieves or renders. Plugins are an exception, and may connect to any Connector approved in the Software Directory.

The portal's data-handling step (submission, step 7) asks "Whether the underlying API is your own, proxied from a partner with permission, or a third party's you don't control". For most exchanges the honest answer is the third option.

### Finance as a high-risk use case

Policy §1:

> A. Software must not violate or facilitate violation of our Usage Policy, including high-risk use cases around legal, healthcare, insurance, finance and other areas. All Software must comply with our Universal Usage Standards and High-Risk Use Case requirements and with our policy on the countries and regions Anthropic currently supports.
>
> B. When Software is providing a high-risk use case, Developers must comply with the human-in-the-loop measures and provide direct disclosure to consumers (as detailed in our AUP) to be included in our directory.

Phase 1 gives data, not advice. The plugin skill tells the model not to give investment advice, and the draft terms state it. Whether that is enough "direct disclosure" is Anthropic's call.

### The documented way to keep trading out of the listing

Directory vs custom:

> A supported pattern is to list a connector in the directory with safe, broadly applicable defaults, and provide enterprise customers a separate URL to add as a custom connector with elevated permissions or tenant-specific configuration.

Trading, if it is ever hosted, would live on a separate URL added as a custom connector, never on the listed `https://docs.ccxt.com/mcp`. Today trading exists only in the local server.

### Recommended next step (Anthropic)

**Ask for written permission before building anything else for the listing.** Email `mcp-review@anthropic.com`, the contact the docs give for MCP connector submissions ([submission status](https://claude.com/docs/directory/submission-status)). Include:

1. What it is: an anonymous, read-only connector to public market data (prices, order books, candles, trades) from a short allowlist of major exchanges. Name the exact tool list, and state that it has no write tools, no account access and accepts no credentials.
2. The answer to the third-party API question: which exchanges, that only their public endpoints are used, and any written permission CCXT holds from them (see the OpenAI section; the same evidence serves both).
3. That trading exists only in the open-source local server (stdio, keys on the user's machine), and would never be on the listed URL.
4. The question: does the §4.A exception ("expressly permitted by us in writing") cover this connector? If yes, under what conditions (for example disclosures)?

Submit only with that permission in writing. Without it, keep the custom-connector route (documented in `wiki/MCP.md`), which needs no review.

## OpenAI

Source: [Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines) (section numbers below are theirs) and [app review](https://developers.openai.com/plugins/deploy/app-review).

### Unofficial connectors and third-party APIs (phase 1 and 2): the main risk

> **3.5. Third-party content and integrations**
>
> - a. **Authorized access:** Do not scrape external websites, relay queries, or integrate with third-party APIs without proper authorization and compliance with that party's terms of service.
> - b. **Unofficial connectors:** We cannot approve plugins that primarily function as unofficial connectors to third-party services, including pass-through intermediary software layers.
> - c. **Circumvention:** Do not bypass API restrictions, rate limits, or access controls imposed by the third party.

A unified layer over many exchanges' APIs is close to the plain meaning of "pass-through intermediary software layers". §3.5.c is already met by design: one throttler per exchange, response caching, a circuit breaker, and no automatic retry of rate-limit errors (`mcp/hosted/DESIGN.md`).

### Crypto speculation and trades

> **5.2. Prohibited goods and services**
>
> In addition, plugins may not be used to sell, promote, facilitate, or meaningfully enable the following goods or services: […]
>
> - b. Prohibited fraudulent, deceptive, or high-risk services […]
>   5. Crypto or NFT offerings involving speculation, consumer deception, or financial abuse
>   6. Execution of money transfers, crypto transfers, or investment trades

- Item 6 excludes phase-2 trading outright.
- Item 5 is a judgment call for phase 1: CCXT offers no crypto asset, but charts and prices could be read as "meaningfully enabling" speculation. Keep the listing text, starter prompts and review cases neutral (data, comparison, market lookup). None of them should invite a trade. The current drafts follow this.

### Credentials (phase 2)

> **4.2. Data collection** […]
>
> - b. **Restricted data:** Do not collect, solicit, or process the following categories of Restricted Data: […]
>   - Access credentials and authentication secrets (such as API keys, MFA/OTP codes, or passwords).

- The phase-2 design takes keys on a CCXT web page, never in the chat (`mcp/hosted/DESIGN.md`). That satisfies "do not collect in the chat".
- But a listed plugin whose server **stores and uses** users' exchange API keys arguably "processes" them, wherever they were entered. Even read-only account access with server-held keys may not pass OpenAI review.
- Phase-2 account features in an OpenAI listing need this question answered first.

### Metadata and context collection (phase 1): fixable on our side

> **4.3. Transparency and user control**
>
> **Data practices:** Do not engage in surveillance, tracking, or behavioral profiling—including metadata collection such as timestamps, IP addresses, or query patterns—unless explicitly disclosed, narrowly scoped, subject to meaningful user control, and aligned with OpenAI's usage policies.

> **6.4. Minimal and purpose-driven data handling** […]
>
> Do not request or reconstruct full conversation histories or collect broad context "just in case." Use only chat context explicitly supplied by the client or model.

- With telemetry on, the analytics SDK adds a `context` argument to **every** tool, asking the model for its reason for the call (default on: `POSTHOG_CONTEXT=1`, see `mcp/hosted/src/telemetry/README.md`). A reviewer can read that as collecting context the tool does not need.
- The per-request analytics (tool, arguments, a daily-rotating `client_hash`) are disclosed in the draft privacy policy. But the only "user control" today is removing the connector or using the local server.

**Recommended:** run the OpenAI review with `POSTHOG_CONTEXT=0` (tools then have no extra argument), or keep it on only if legal review is content that the privacy policy discloses it. The same question applies to Anthropic's "conversation data collection" acknowledgment (submission, step 9).

### Other OpenAI rules the drafts already follow

- §1.3: "Do not append "MCP," "MCP Server," or "Plugin" to a company or product name." The display name is `CCXT`, pinned by `mcp/test/schema/hosted-plugin.test.ts`.
- §6.2.b: "Do not use discovery, operation selection, or schema fetching with a generic executor to enable operations not individually exposed for review." The hosted profile drops `call_read_method`, `call_implicit_get` and `describe_method`.
- §6.3: explicit `readOnlyHint`, `destructiveHint` and `openWorldHint` on every tool. Pinned by `mcp/hosted/test/protocol.test.ts`.
- §5.4: no advertising.
- App review: "For now, projects with EU data residency cannot submit plugins with MCP servers for review." This concerns the OpenAI Platform project used to submit, not where analytics are stored.

### Recommended next step (OpenAI)

OpenAI documents no pre-review channel for policy questions. The realistic approach:

1. **Gather the authorization evidence first.** For each exchange on the production allowlist, find out whether CCXT has a written agreement or partnership with it, or whether its public API terms allow redistributing public market data through a third-party service. Keep only exchanges with a clear answer on the allowlist submitted for review.
2. **Frame the submission around CCXT's own product.** CCXT is the publisher of a widely used open-source library, and the plugin is its official hosted interface. It is not a relay that someone else built on a service it does not own. Say so in the long description and the review notes, and name the exchanges and the authorization for each.
3. **Submit phase 1 only:** read-only, no credentials, `POSTHOG_CONTEXT=0`, no account tools beyond the `ACCOUNT_REQUIRED` stubs. **[Decide: also consider dropping the four account stubs from the OpenAI build, so a reviewer sees no account surface at all. The tool list is shared across hosts, so this would need a second endpoint.]**
4. If it is rejected under §3.5.b, appeal by replying to the rejection email with the evidence from step 1 ("To appeal, reply to that email", [submission](https://developers.openai.com/plugins/deploy/submission)). Otherwise distribute without a listing:
   - the custom MCP server route in ChatGPT;
   - the repo marketplace `.agents/plugins/marketplace.json` for Codex and the ChatGPT desktop app.
5. **Never submit trading** (§5.2.b.6). Phase-2 account features in OpenAI need the §4.2.b question answered first.

## Pointing trade requests to the local server (both directories)

When a user asks the hosted connector to trade ("buy 100 USDT of BTC"), the server instructions, the account tools' `ACCOUNT_REQUIRED` hint and the plugin skill tell the assistant to say the connector is read-only and to offer the local CCXT MCP server, which can trade from the user's own computer. The hosted connector itself executes nothing.

A reviewer may still read that redirect as facilitating trades: Anthropic excludes connectors that "transfer money, cryptocurrency, or other financial assets", and OpenAI §5.2.b.6 prohibits "execution of money transfers, crypto transfers, or investment trades". Include it in the policy questions above: ask whether naming the local server for trade requests is acceptable, or whether the listing must only say "this connector cannot trade". If it must, shorten the instructions' trading paragraph (`HOSTED_INSTRUCTIONS` in `src/profile.ts`) and the skill; the custom-connector and plugin installs outside the directories can keep the redirect.

## What stays possible without any listing

- Claude: custom connector by URL, including the documented prefill link (all plans; one custom connector on Free).
- Claude Code: `claude mcp add --transport http`, or this repo's plugin marketplace.
- ChatGPT web: "Add custom MCP server" (labelled "Elevated risk"; workspace permissions apply).
- ChatGPT desktop app, Codex CLI and IDE extension: MCP server settings, or the repo marketplace.
- Cursor, VS Code, Gemini CLI and other MCP hosts: by URL.
