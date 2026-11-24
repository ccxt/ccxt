# CCXT MCP Server — plugin

Installs the official [CCXT MCP server](https://github.com/ccxt/ccxt/tree/master/mcp) and its usage skill in one step, so the agent gets the tools **and** the knowledge of how to use them. This one directory is the plugin for Claude Code, OpenAI Codex / the ChatGPT desktop app, and xAI Grok.

It registers a stdio MCP server named `ccxt` and loads two skills: `ccxt-mcp` (how to use the tools) and `ccxt-get-started` (a guided first run). The server is pinned to the plugin's version, so updating the plugin updates the server; how it is started depends on the host — see [Runtime](#runtime).

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

## Runtime

The server is a Node.js program (Node 18 or newer). Whether you have to install Node.js yourself depends on the host:

| Host | What starts the server | Node.js install needed |
|---|---|---|
| ChatGPT desktop app / Codex | `mcp.json` runs `./scripts/launch ./scripts/bootstrap.mjs` from the plugin directory | **No**, once the pinned server release carries the single-file server (releases after 0.1.3). The app ships its own Node runtime and the plugin uses it. |
| Claude Code, Grok | `.claude-plugin/plugin.json` runs `npx -y ccxt-mcp@<plugin version>` | Yes (Node.js 18+, which includes `npx`) |

How the launcher route works:

1. `scripts/launch` (`scripts/launch.cmd` on Windows) finds a Node 18+ binary: the app's own runtime first (the `CODEX_*` runtime variables, `~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`, the Node inside `ChatGPT.app`), then a Node on `PATH`, then the usual install locations (Homebrew, `/usr/local`, Volta, fnm, nvm). The list, with which entries were seen on a real machine and which are inferred, is in the script. The launcher changes into the plugin directory first, so `./scripts/bootstrap.mjs` always means the plugin's own file, whatever directory the host starts it from.
2. `scripts/bootstrap.mjs` gets the server as one file. On first start it downloads the pinned `ccxt-mcp` tarball from the npm registry (about 3 MB, once per version), checks its SHA-512 against `server.lock.json`, takes the single-file server out of it, checks that file's SHA-512 too, and saves it in the plugin's data directory (`PLUGIN_DATA` when the host sets it — Codex does — otherwise the `ccxt-mcp` cache directory). Later starts re-check the saved file and use no network. Anything that does not match the lock is not saved under the server's name and not run. If the data directory cannot be written (read-only, full disk), the `ccxt-mcp` cache directory is used instead, and if that fails too the verified server runs this once from a private temporary directory and stderr says why it will be downloaded again.
3. If the pinned release has no single-file server, or the download is not possible, it falls back to `npx -y ccxt-mcp@<version>` when `npx` exists — on `PATH`, beside the running Node, or in the install locations the launcher probes (Homebrew, `/usr/local`, `/usr/bin`, Volta, fnm, nvm) — and otherwise stops with one line saying what to do.

**Until the next server release**, the pinned version is 0.1.3, which was published before the single-file server existed: `server.lock.json` has no checksums, so the launcher route still ends in `npx` and still needs Node.js installed. The release job fills in the checksums (`scripts/lock-server.mjs`) from the exact tarball it publishes.

**Offline.** A first start needs the npm registry once. After that the saved server starts without network (exchange requests need it, of course). Offline with nothing saved, the server cannot start and the host shows the bootstrap's message.

**Slow connections.** Hosts wait a fixed time for a server to answer — Codex CLI 0.171.0 gives up after 30 seconds and kills it, showing its own "timed out handshaking" message instead of the bootstrap's. The download is written to a `.part` file as it arrives and the next start asks the registry only for the rest (`Range`), so a first start that is too slow for one attempt completes over the following ones: restart the app, or retry the server, until it connects. The finished file still has to match the pinned checksum.

**Proxies.** The download does not read `HTTPS_PROXY`; Codex does not pass that variable to plugin servers anyway. Behind a proxy that blocks direct access to `registry.npmjs.org`, install Node.js: the bootstrap then falls back to `npx`, which uses npm's proxy settings.

**Testing a local build.** Set `CCXT_MCP_SERVER` to the absolute path of a server entry and the bootstrap runs that file instead of the lock, the cache and the network — for example the single-file server built from a checkout:

```bash
cd mcp && npm ci && npm run build        # writes js/bundle/ccxt-mcp.mjs
CCXT_MCP_SERVER="$PWD/js/bundle/ccxt-mcp.mjs" ./plugin/scripts/launch ./plugin/scripts/bootstrap.mjs
```

Codex forwards only a fixed set of variables (`HOME`, `PATH`, `SHELL`, `USER`, `LOGNAME`, `LANG`, `TERM`, `TMPDIR`, plus `PLUGIN_ROOT` / `PLUGIN_DATA`; seen with Codex CLI 0.171.0) to a plugin's MCP server, so `CCXT_MCP_SERVER` exported in your shell does not reach it there: run the launcher by hand as above, or register the local server directly (`codex mcp add ccxt-dev -- node /abs/path/js/bundle/ccxt-mcp.mjs`).

What was and was not tested: the launcher, bootstrap and single-file server are covered by `mcp/test` on Linux, and the whole chain (launcher → app-style runtime with no Node on `PATH` → download → verified server) was run on Linux, including started by Codex CLI 0.171.0. The runtime locations were read from a macOS install of the ChatGPT desktop app. `launch.cmd` and the Windows locations are untested.

## What you get

- **Market data on every exchange with no keys**: tickers, order books, OHLCV, trades, market search, prediction-market events.
- **Interactive views** in hosts that support MCP Apps: `show_chart` (candlesticks + volume), `show_orderbook` (depth chart + ladder), `show_tickers` (24h price board). Terminal hosts have no surface to draw a view and show a text summary instead. These tools ship in the `ccxt-mcp` release after 0.1.3. The plugin pins the server version, so a plugin that still pins 0.1.3 installs a server without them: if `show_*` are not in the tool list, `get_ohlcv` / `get_orderbook` / `get_tickers` return the same data as rows.
- **Guided account setup**: `setup_account` opens a step-by-step form in your browser, served from your own machine, where you type the API key — see [Get started](#get-started). `manage_accounts` opens a "Your accounts" page the same way, to remove an account, replace its key or switch order placement on or off; it shows only the last four characters of each API key.
- **Private data + trading once you add an account**: balances, orders and positions — as rows (`get_balance`, `get_orders`, `get_positions`) or as views (`show_balance`, `show_orders`, `show_positions`, and your open orders on `show_chart`) — plus opt-in order placement, all gated behind capability tiers you control. API keys stay on your machine and are never visible to the model.

See the [MCP server docs](https://docs.ccxt.com/docs/mcp) for configuration, the capability tiers, and the safety model.

The per-language CCXT coding skills (`ccxt-typescript`, `ccxt-python`, …) are distributed separately via `npx skills add ccxt/ccxt` — see the [AI Skills docs](https://docs.ccxt.com/#/ai-skills).

## Layout

| Path | Read by |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code (and Grok, through its Claude Code compatibility) — manifest, MCP server, install-time settings |
| `.codex-plugin/plugin.json`, `mcp.json` | OpenAI Codex / ChatGPT desktop app — manifest and MCP server declaration |
| `scripts/launch`, `scripts/launch.cmd`, `scripts/bootstrap.mjs`, `server.lock.json` | the launcher route `mcp.json` uses — see [Runtime](#runtime). `launch` must keep its executable bit (git mode `100755`) and `launch.cmd` its CRLF line endings (`.gitattributes`). |
| `plugin.json` | host-neutral manifest |
| `skills/ccxt-mcp/` | the bundled usage skill (a copy of `.claude/skills/ccxt-mcp`) |
| `skills/ccxt-get-started/` | the guided first-run skill (plugin-native: this is its only copy); the OpenAI onboarding skill |
| `assets/` | icons and logo |

The marketplaces that point here live at the repository root: `.claude-plugin/marketplace.json` (Claude Code, Grok) and `.agents/plugins/marketplace.json` (Codex).

`skills/ccxt-mcp` is a real copy of the repo's canonical skill, `.claude/skills/ccxt-mcp` — not a symlink. Edit the canonical skill, then run `npm run sync-plugin` in `mcp/` to copy it here; CI fails when the two differ. `skills/ccxt-get-started` is edited here directly: it is about the plugin's first run, so it has no canonical copy and is not offered by `npx skills add ccxt/ccxt`. Both kinds are declared in `scripts/sync-plugin.mjs` and `test/schema/plugin.test.ts`; an undeclared directory under `skills/` fails the check.

## Publishing

Notes for maintainers.

- **Self-hosted marketplaces** (the install commands above) are live as soon as the files are on the default branch — there is nothing to submit. The plugin pins the npm version in `mcp/package.json`, so a change that adds server features (new tools the skill references, for example) must be followed immediately by an **MCP Release** workflow dispatch, which publishes the new version and commits the new pin; until then installs get the previously published server. Do not hand-edit the pin: an unpublished version makes `npx` fail. The same dispatch writes the two checksums in `server.lock.json` (`scripts/lock-server.mjs`, from the tarball it then publishes); `npm run sync-versions` clears them whenever the version changes, and a lock without checksums simply means the launcher route uses `npx`.
- **Anthropic's directory** takes submissions at https://claude.ai/directory/manage (a paid plan is required). Its policy on money-moving connectors applies — see `../DESIGN.md`: the trading and funds tiers are not directory-listable, a read-only listing remains possible.
- **OpenAI's public Plugins Directory** is submitted as a ZIP at platform.openai.com/plugins — `npm run plugin:zip` (in `mcp/`) builds it, and checks that `scripts/launch` is stored executable. Submission requires a verified developer identity and privacy-policy / terms-of-service URLs in the manifest. The manifests do not yet include `privacyPolicyURL` / `termsOfServiceURL`; add them before submitting. Because this plugin's MCP server is local stdio, it is "desktop-only", and public listing of desktop-only plugins is limited to allow-listed partners (see [Submit desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)); a standard public listing would need a remote HTTPS MCP endpoint.
