# CCXT MCP Server — plugin

Installs the official [CCXT MCP server](https://github.com/ccxt/ccxt/tree/master/mcp) and its usage skill in one step, so the agent gets the tools **and** the knowledge of how to use them. This one directory is the plugin for Claude Code, OpenAI Codex / the ChatGPT desktop app, and xAI Grok.

It registers a stdio MCP server named `ccxt` and loads two skills: `ccxt-mcp` (how to use the tools) and `ccxt-get-started` (a guided first run). The server is pinned: the plugin runs `npx -y ccxt-mcp@<plugin version>` (requires Node.js ≥ 18), so updating the plugin updates the server.

## Get started

After installing (below), no technical knowledge is needed:

1. Say **"Get started"** — in the ChatGPT desktop app it is the first starter prompt ("Get started: connect my exchange account"); in Claude Code and Grok, type it.
2. The assistant asks which exchange you use and explains how to create an API key there. It recommends the exchange's **testnet** (practice money) first.
3. A setup page opens **in your own web browser, on your own computer**. You type the key there and press "Save account". Never paste a key into the chat: the assistant does not need it and cannot see what you type in the page. The page stays yours while you type: if the assistant asks for it again, the open page is kept, not replaced.
4. Back in the chat, say you are done. The assistant shows your balance, and offers a chart, your open orders, or a small test order on the testnet. (On Binance the testnet is spot only; to practise futures, choose **Demo trading** in the page, with keys from Binance's Demo Trading.)

Placing orders is off until you switch it on in that page. For a real (live) account the page asks for a maximum order size in USD and a confirmation, and every order is then shown to you before it is sent. Withdrawals cannot be switched on from the page or from the chat.

Per host:

| Host | How the guided setup starts | Notes |
|---|---|---|
| ChatGPT desktop app / Codex | the manifest names `ccxt-get-started` as the plugin's onboarding skill (`extensions["com.openai"].onboardingSkill`) and its first starter prompt opens it | Codex CLI 0.171.0 resolves the onboarding skill from the manifest (`plugin/read`). How and when the ChatGPT desktop app presents an onboarding skill is not something we could test. |
| Claude Code | say "get started"; the skill is loaded from the plugin's `skills/` directory | If you filled in the install prompt (exchange, API key, secret) you already have an account called `default` — the assistant sees it and skips the form. |
| xAI Grok | say "get started" | Grok loads the plugin through its Claude Code compatibility; untested. |

The setup page needs a desktop browser on the machine that runs the MCP server. On a remote or headless machine the assistant is told the page could not be opened and points you to the config file instead. The page guards against other web pages, other users of the computer and the assistant itself reading your keys; it is not a guard against software running under your own account, which can read the config file anyway. The setup tool and the account views ship in `ccxt-mcp` releases after 0.1.3; the plugin pins its server version, and with a server that lacks them the skill falls back to the config-file route.

## Install

The commands below install the plugin: the server pinned to the plugin's version, plus the two skills. For one-click links (Claude Desktop, the Claude Code VS Code extension, Cursor, VS Code, Kiro, Goose, Codex) see the [one-click install table](https://docs.ccxt.com/docs/mcp#one-click-install) in the MCP server docs; the links there that add only the MCP server install the latest `ccxt-mcp` without these skills.

### Claude Code

```
/plugin marketplace add ccxt/ccxt
/plugin install ccxt-mcp@ccxt
```

Or from a shell:

```bash
claude plugin marketplace add ccxt/ccxt --sparse .claude-plugin mcp/plugin
claude plugin install ccxt-mcp@ccxt
```

`--sparse` checks out only the marketplace and plugin directories (about 5 MB) instead of the whole CCXT repository (about 600 MB), so prefer the shell form: the `/plugin marketplace add` usage text shows only a path or URL, and whether it accepts `--sparse` is not documented.

On install Claude Code can prompt for optional settings: an exchange id, its API key / secret / passphrase, sandbox mode, sandbox-only order placement, and a config file path. Leave everything blank for public market data only. The values are stored by Claude Code — sensitive ones in secure storage — and reach the server as environment variables; the model never sees them. Per the Claude Code docs the `claude plugin install` shell command does not prompt; pass `--config KEY=VALUE` there, or use the config file.

The config-file route always works, with or without the prompt: create `config.json` at the server's default path, or set the plugin's **Config file** option (`/plugin configure ccxt-mcp@ccxt`, or `--config config_file=<path>` on `claude plugin install`), as described in the [MCP server docs](https://docs.ccxt.com/docs/mcp). A `CCXT_MCP_CONFIG` exported in your shell has no effect here: the plugin sets that variable itself from the Config file option. The config file is also the only way to enable withdrawals; several exchanges, wallet-based venues and live trading can be set up either there or, one account at a time, in the setup page ("Get started").

Tools appear namespaced as `mcp__plugin_ccxt-mcp_ccxt__<tool>`.

### OpenAI Codex / ChatGPT desktop app

```bash
codex plugin marketplace add ccxt/ccxt
codex plugin add ccxt-mcp@ccxt
```

The first command registers the marketplace (the repository's `.agents/plugins/marketplace.json`), the second installs the plugin (verified with Codex CLI 0.171.0; `codex mcp list` then shows the `ccxt` server). In the ChatGPT desktop app, add the marketplace the same way and install **CCXT** from the Plugins directory instead (per OpenAI's docs; untested here). OpenAI calls plugins with a local stdio MCP server, like this one, ["desktop-only"](https://developers.openai.com/plugins/deploy/desktop-only). Then say "Get started" to connect an account through the setup page, or use the config file (see the [MCP server docs](https://docs.ccxt.com/docs/mcp)).

### xAI Grok

Grok documents that it reads Claude Code marketplaces, plugins, skills and MCPs with zero configuration, so it uses the same marketplace and plugin as Claude Code. Either:

- if the `ccxt/ccxt` marketplace is already added in Claude Code (see above), open `/plugins` → **Marketplace** tab, which Grok documents as installing plugins from configured sources, and install `ccxt-mcp` from there. Grok's own sources come from `[[marketplace.sources]]` in `~/.grok/config.toml` and `~/.grok/plugins/known_marketplaces.json`; its docs publish neither a command nor the entry format for adding one, and this route is untested; or
- load this directory from a checkout: `grok --plugin-dir <path to mcp/plugin>` (the documented way to load a plugin directly).

## What you get

- **Market data on every exchange with no keys**: tickers, order books, OHLCV, trades, market search, prediction-market events.
- **Interactive views** in hosts that support MCP Apps: `show_chart` (candlesticks + volume), `show_orderbook` (depth chart + ladder), `show_tickers` (24h price board). Terminal hosts have no surface to draw a view and show a text summary instead. These tools ship in the `ccxt-mcp` release after 0.1.3. The plugin pins the server version, so a plugin that still pins 0.1.3 installs a server without them: if `show_*` are not in the tool list, `get_ohlcv` / `get_orderbook` / `get_tickers` return the same data as rows.
- **Guided account setup**: `setup_account` opens a form in your browser, served from your own machine, where you type the API key — see [Get started](#get-started).
- **Private data + trading once you add an account**: balances, orders and positions — as rows (`get_balance`, `get_orders`, `get_positions`) or as views (`show_balance`, `show_orders`, `show_positions`, and your open orders on `show_chart`) — plus opt-in order placement, all gated behind capability tiers you control. API keys stay on your machine and are never visible to the model.

See the [MCP server docs](https://docs.ccxt.com/docs/mcp) for configuration, the capability tiers, and the safety model.

The per-language CCXT coding skills (`ccxt-typescript`, `ccxt-python`, …) are distributed separately via `npx skills add ccxt/ccxt` — see the [AI Skills docs](https://docs.ccxt.com/#/ai-skills).

## Layout

| Path | Read by |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code (and Grok, through its Claude Code compatibility) — manifest, MCP server, install-time settings |
| `.codex-plugin/plugin.json`, `mcp.json` | OpenAI Codex / ChatGPT desktop app — manifest and MCP server declaration |
| `plugin.json` | host-neutral manifest |
| `skills/ccxt-mcp/` | the bundled usage skill (a copy of `.claude/skills/ccxt-mcp`) |
| `skills/ccxt-get-started/` | the guided first-run skill (plugin-native: this is its only copy); the OpenAI onboarding skill |
| `assets/` | icons and logo |

The marketplaces that point here live at the repository root: `.claude-plugin/marketplace.json` (Claude Code, Grok) and `.agents/plugins/marketplace.json` (Codex).

`skills/ccxt-mcp` is a real copy of the repo's canonical skill, `.claude/skills/ccxt-mcp` — not a symlink. Edit the canonical skill, then run `npm run sync-plugin` in `mcp/` to copy it here; CI fails when the two differ. `skills/ccxt-get-started` is edited here directly: it is about the plugin's first run, so it has no canonical copy and is not offered by `npx skills add ccxt/ccxt`. Both kinds are declared in `scripts/sync-plugin.mjs` and `test/schema/plugin.test.ts`; an undeclared directory under `skills/` fails the check.

## Publishing

Notes for maintainers.

- **Self-hosted marketplaces** (the install commands above) are live as soon as the files are on the default branch — there is nothing to submit. The plugin pins the npm version in `mcp/package.json`, so a change that adds server features (new tools the skill references, for example) must be followed immediately by an **MCP Release** workflow dispatch, which publishes the new version and commits the new pin; until then installs get the previously published server. Do not hand-edit the pin: an unpublished version makes `npx` fail.
- **Anthropic's directory** takes submissions at https://claude.ai/directory/manage (a paid plan is required). Its policy on money-moving connectors applies — see `../DESIGN.md`: the trading and funds tiers are not directory-listable, a read-only listing remains possible.
- **OpenAI's public Plugins Directory** is submitted as a ZIP at platform.openai.com/plugins — `npm run plugin:zip` (in `mcp/`) builds it. Submission requires a verified developer identity and privacy-policy / terms-of-service URLs in the manifest. The manifests do not yet include `privacyPolicyURL` / `termsOfServiceURL`; add them before submitting. Because this plugin's MCP server is local stdio, it is "desktop-only", and public listing of desktop-only plugins is limited to allow-listed partners (see [Submit desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)); a standard public listing would need a remote HTTPS MCP endpoint.
