# CCXT — hosted market-data plugin

This plugin connects your assistant to the **hosted CCXT MCP server** at `https://docs.ccxt.com/mcp` and adds a skill that teaches the assistant how to use it. Nothing runs on your computer, and no exchange account or API key is needed.

Ask for prices, order books, OHLCV candles, recent trades and market listings on a curated set of major cryptocurrency exchanges. In hosts that render [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps), the assistant can also show an interactive candlestick chart, an order-book depth view or a price board in the chat.

The server is **read-only and public**. It does not place orders, move funds or read exchange accounts. For balances, orders, positions and opt-in trading, use the local CCXT MCP server (`ccxt-mcp` on npm), which keeps your API keys on your own machine: see the [CCXT MCP docs](https://docs.ccxt.com/docs/mcp).

## Install

The published copy of this plugin lives in [ccxt/ccxt-plugins](https://github.com/ccxt/ccxt-plugins), a small repository, so installing it does not clone all of ccxt.

- **Claude Code:** `claude plugin install ccxt --marketplace ccxt/ccxt-plugins` (Claude Code 2.1.292 or later; on older versions, `claude plugin marketplace add ccxt/ccxt-plugins` then `claude plugin install ccxt@ccxt`). Or add the server alone, without the skill: `claude mcp add --transport http ccxt https://docs.ccxt.com/mcp`.
- **Claude (web, desktop; paid plans):** Customize > Plugins > Add > Add marketplace, `ccxt/ccxt-plugins`, add **CCXT**, then connect it on the plugin's Connectors tab. On any plan, you can instead add `https://docs.ccxt.com/mcp` as a custom connector.
- **ChatGPT desktop app and Codex:** `codex plugin marketplace add ccxt/ccxt-plugins`, then `codex plugin add ccxt@ccxt`.
- **ChatGPT web and other hosts:** see [Hosted server (no install)](https://docs.ccxt.com/docs/mcp#hosted-server-no-install) in the docs.

### Skip the approval prompts

Every tool here is read-only, but Claude decides when to ask, from your settings:

- **Claude (web, desktop, mobile):** Customize > Connectors > CCXT > **Tool permissions** > **Always allow**.
- **Claude Code:** add `"mcp__plugin_ccxt_ccxt__*"` to `permissions.allow` in `~/.claude/settings.json`, or run `/permissions`. A plugin cannot pre-approve its own tools.

## What is in this folder

| File | Read by |
|---|---|
| `.claude-plugin/plugin.json`, `.mcp.json` | Claude (`"type": "http"`) |
| `plugin.json`, `mcp.json` | OpenAI plugins: ChatGPT and Codex (Agent Plugins format, `"type": "streamable-http"`) |
| `skills/ccxt/SKILL.md` | both |
| `assets/` | directory listings (icon and logo) |

Every manifest points at the same URL. `mcp/test/schema/hosted-plugin.test.ts` checks that, and the other invariants, in CI.

## Privacy

The server receives the tool calls your assistant makes: the tool name and arguments such as exchange ids, symbols and timeframes. It does not receive your conversation, and it accepts no credentials. It records anonymous usage analytics and request logs, without IP addresses and without the data it returns. With analytics on, each tool call can also carry a one-line reason written by the assistant, which may paraphrase your request. [Privacy](https://docs.ccxt.com/docs/mcp#privacy) in the docs describes what is recorded.

## Support

https://github.com/ccxt/ccxt/issues

## License

MIT. See `LICENSE`.
