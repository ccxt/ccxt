# CCXT MCP Server — plugin

Installs the official [CCXT MCP server](https://github.com/ccxt/ccxt/tree/master/mcp) and its usage skill in one step, so the agent gets the tools **and** the knowledge of how to use them. This one directory is the plugin for Claude Code, OpenAI Codex / the ChatGPT desktop app, and xAI Grok.

It registers a stdio MCP server named `ccxt` and loads the `ccxt-mcp` skill. The server is pinned: the plugin runs `npx -y ccxt-mcp@<plugin version>` (requires Node.js ≥ 18), so updating the plugin updates the server.

## Install

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

The config-file route always works, with or without the prompt: create `config.json` at the server's default path, or set the plugin's **Config file** option (`/plugin configure ccxt-mcp@ccxt`, or `--config config_file=<path>` on `claude plugin install`), as described in the [MCP server docs](https://docs.ccxt.com/docs/mcp). A `CCXT_MCP_CONFIG` exported in your shell has no effect here: the plugin sets that variable itself from the Config file option. It is also the only way to configure several exchanges, wallet-based venues, live trading or withdrawals.

Tools appear namespaced as `mcp__plugin_ccxt-mcp_ccxt__<tool>`.

### OpenAI Codex / ChatGPT desktop app

```bash
codex plugin marketplace add ccxt/ccxt
codex plugin add ccxt-mcp@ccxt
```

The first command registers the marketplace (the repository's `.agents/plugins/marketplace.json`), the second installs the plugin (verified with Codex CLI 0.171.0; `codex mcp list` then shows the `ccxt` server). In the ChatGPT desktop app, add the marketplace the same way and install **CCXT** from the Plugins directory instead (per OpenAI's docs; untested here). OpenAI calls plugins with a local stdio MCP server, like this one, ["desktop-only"](https://developers.openai.com/plugins/deploy/desktop-only). Configure accounts through the config file (see the [MCP server docs](https://docs.ccxt.com/docs/mcp)).

### xAI Grok

Grok documents that it reads Claude Code marketplaces, plugins, skills and MCPs with zero configuration, so it uses the same marketplace and plugin as Claude Code. Either:

- if the `ccxt/ccxt` marketplace is already added in Claude Code (see above), open `/plugins` → **Marketplace** tab, which Grok documents as installing plugins from configured sources, and install `ccxt-mcp` from there. Grok's own sources come from `[[marketplace.sources]]` in `~/.grok/config.toml` and `~/.grok/plugins/known_marketplaces.json`; its docs publish neither a command nor the entry format for adding one, and this route is untested; or
- load this directory from a checkout: `grok --plugin-dir <path to mcp/plugin>` (the documented way to load a plugin directly).

## What you get

- **Market data on every exchange with no keys**: tickers, order books, OHLCV, trades, market search, prediction-market events.
- **Interactive views** in hosts that support MCP Apps: `show_chart` (candlesticks + volume), `show_orderbook` (depth chart + ladder), `show_tickers` (24h price board). Terminal hosts have no surface to draw a view and show a text summary instead. These tools ship in the `ccxt-mcp` release after 0.1.3. The plugin pins the server version, so a plugin that still pins 0.1.3 installs a server without them: if `show_*` are not in the tool list, `get_ohlcv` / `get_orderbook` / `get_tickers` return the same data as rows.
- **Private data + trading once you configure an account**: balances, orders, positions, and opt-in order placement — all gated behind capability tiers in a local config file. API keys stay on your machine and are never visible to the model.

See the [MCP server docs](https://docs.ccxt.com/docs/mcp) for configuration, the capability tiers, and the safety model.

The per-language CCXT coding skills (`ccxt-typescript`, `ccxt-python`, …) are distributed separately via `npx skills add ccxt/ccxt` — see the [AI Skills docs](https://docs.ccxt.com/#/ai-skills).

## Layout

| Path | Read by |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code (and Grok, through its Claude Code compatibility) — manifest, MCP server, install-time settings |
| `.codex-plugin/plugin.json`, `mcp.json` | OpenAI Codex / ChatGPT desktop app — manifest and MCP server declaration |
| `plugin.json` | host-neutral manifest |
| `skills/ccxt-mcp/` | the bundled usage skill |
| `assets/` | icons and logo |

The marketplaces that point here live at the repository root: `.claude-plugin/marketplace.json` (Claude Code, Grok) and `.agents/plugins/marketplace.json` (Codex).

`skills/ccxt-mcp` is a real copy of the repo's canonical skill, `.claude/skills/ccxt-mcp` — not a symlink. Edit the canonical skill, then run `npm run sync-plugin` in `mcp/` to copy it here; CI fails when the two differ.

## Publishing

Notes for maintainers.

- **Self-hosted marketplaces** (the install commands above) are live as soon as the files are on the default branch — there is nothing to submit. The plugin pins the npm version in `mcp/package.json`, so a change that adds server features (new tools the skill references, for example) must be followed immediately by an **MCP Release** workflow dispatch, which publishes the new version and commits the new pin; until then installs get the previously published server. Do not hand-edit the pin: an unpublished version makes `npx` fail.
- **Anthropic's directory** takes submissions at https://claude.ai/directory/manage (a paid plan is required). Its policy on money-moving connectors applies — see `../DESIGN.md`: the trading and funds tiers are not directory-listable, a read-only listing remains possible.
- **OpenAI's public Plugins Directory** is submitted as a ZIP at platform.openai.com/plugins — `npm run plugin:zip` (in `mcp/`) builds it. Submission requires a verified developer identity and privacy-policy / terms-of-service URLs in the manifest. The manifests do not yet include `privacyPolicyURL` / `termsOfServiceURL`; add them before submitting. Because this plugin's MCP server is local stdio, it is "desktop-only", and public listing of desktop-only plugins is limited to allow-listed partners (see [Submit desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)); a standard public listing would need a remote HTTPS MCP endpoint.
