# DRAFT — for legal review, not published

> This is a working draft of the privacy policy for the hosted CCXT MCP server. It is **not** a published policy and makes no commitment until legal review approves it and it is published at `https://docs.ccxt.com/docs/mcp-privacy` (the URL both plugin manifests already point to).
>
> It describes only what the code in this repository does, as listed in [`mcp/hosted/src/telemetry/README.md`](../src/telemetry/README.md). If the two disagree, the telemetry README and the code win, and this draft must be corrected. Items in **[brackets]** are open questions for legal review; nothing in brackets is decided.
>
> Coverage of OpenAI's minimum (§4.1 of the [plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines): "the categories of personal data collected, the purposes of use, the categories of recipients, data retention timelines, and any controls offered to your users"): categories, purposes and recipients are drafted below; retention and user controls are open.

---

# Privacy policy — hosted CCXT MCP server

Last updated: **[date of publication]**

This policy covers the hosted CCXT MCP server at `https://docs.ccxt.com/mcp` (the "Service"): the connector or plugin you add to an AI assistant such as Claude or ChatGPT to read public cryptocurrency market data. It does not cover the CCXT library, the local CCXT MCP server (`ccxt-mcp` on npm, which runs on your own computer and sends us nothing), the ccxt.com website, or CCXT Terminal.

**Who we are:** **[legal entity name, address and contact email for privacy requests]**.

## What the Service is

The Service answers tool calls from your AI assistant with public market data (prices, order books, candles, trades and market lists) that it reads from cryptocurrency exchanges' public APIs. It has no user accounts, no sign-in and no API keys. It cannot read exchange accounts, place orders or move funds.

## What we receive

Your AI assistant, not you, connects to the Service. We receive what the assistant sends with each tool call:

- the tool name and its arguments, such as an exchange id, a market symbol, a timeframe or a number of results;
- technical metadata: the assistant's self-declared client name and version (for example `claude-ai`), its HTTP User-Agent, the protocol version, and your network address (IP address) as seen by our server;
- for ChatGPT, an anonymised user identifier that ChatGPT attaches for rate limiting (`openai/subject`).

We do **not** receive your conversation with the assistant. We do not receive or accept exchange API keys, passwords or other credentials. If credential-like values are sent anyway, they are rejected and removed from what we record.

## What we record, and why

We record two kinds of data about the use of the Service: **usage analytics** and **request logs**.

| Data | Purpose |
|---|---|
| Which tool was called, its cleaned arguments (credential-like fields removed, values shortened), how long it took, and whether it failed (with the error code and a short error message) | Operating and improving the Service; finding errors |
| A one-line reason for each tool call, written by the AI assistant (the `context` argument). It can paraphrase what you asked. It is shortened to 1,024 characters and dropped if it looks like a credential. **[Legal review: this is the field most likely to contain personal data. It can be switched off (`POSTHOG_CONTEXT=0`). Decide whether to keep it.]** | Understanding what people try to do with the Service |
| The assistant's client name and version, and its HTTP User-Agent (analytics events only; never in logs) | Compatibility with different assistants |
| A `client_hash`: a 16-character code derived with a secret key from your IP address (or, for ChatGPT, its anonymised user identifier) and the current date. It changes every day. The IP address and the ChatGPT identifier themselves are not recorded. | Detecting abuse and counting distinct clients per day without identifying anyone |
| One log line per request: status, duration, tool, exchange, error code, cache use, client name | Operating, securing and debugging the Service |

We do not record: the market data we return to the assistant (only its size), IP addresses (they are used in memory for rate limiting and are not written to our analytics or logs **[legal review: confirm the web server in front of the Service, nginx on docs.ccxt.com, does not keep IP addresses in its own access logs, or describe how long it does]**), names, email addresses, credentials, or person profiles. We do not use the data for advertising and do not sell it.

## Who receives data

- **PostHog** (PostHog Inc.), our analytics and logging provider, as our processor. Data is sent to PostHog's EU Cloud (`eu.i.posthog.com`). **[Legal review: data processing agreement with PostHog; transfer basis, if any data leaves the EU.]**
- **Our hosting provider**, which runs the server. **[Name the provider and region once chosen; the design plans a Hetzner machine.]**
- **Cryptocurrency exchanges.** To answer a tool call, the Service requests public data from the exchange the assistant named. The exchange sees the Service's request (for example the market symbol) coming from our server's address, not from yours. Nothing that identifies you is sent to an exchange.
- **The AI assistant's provider** (for example Anthropic or OpenAI) receives our tool results inside your conversation. How they handle your conversation is governed by their own privacy policies, not this one.

## How long we keep data

**[Legal review: retention periods are not set yet. Facts to work from: PostHog Logs keep data 14 days by default, and a custom retention can be configured; PostHog's retention for analytics events depends on the plan. State a period for each, and how data is deleted after it.]**

## Your choices

- The Service needs no account and identifies no one, so there is nothing to sign up for or close.
- You can remove the connector or plugin from your assistant at any time; we then receive nothing more from you.
- The local CCXT MCP server (`ccxt-mcp`) gives the same market data and runs on your own computer, and sends us nothing.

**[Legal review: requests for access or deletion. The data has no name or account attached, and `client_hash` changes daily, so we generally cannot find a person's records. Decide what we offer and how a request is made.]**

## Children

The Service is a general-audience tool for reading public market data. It is not directed at children under 13. **[Legal review: confirm wording against the directories' age rules; OpenAI requires plugins to be suitable for users aged 13–17.]**

## Security

The Service accepts no credentials, so it holds no secrets of yours. Data sent to PostHog travels over HTTPS. **[Legal review: anything further to state.]**

## Changes

We will publish any change to this policy at this address and update the date above. **[Legal review: notice period, if any.]**

## Contact

**[Privacy contact email or form.]** For anything else about the Service: https://github.com/ccxt/ccxt/issues.
