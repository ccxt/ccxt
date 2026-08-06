# CCXT MCP Server — Claude Code plugin

Installs the official [CCXT MCP server](https://github.com/ccxt/ccxt/tree/master/mcp) and its usage skill into Claude Code in one step, so the agent gets the tools **and** the knowledge of how to use them.

## Install

```
/plugin marketplace add ccxt/ccxt
/plugin install ccxt-mcp@ccxt
```

This registers a stdio MCP server named `ccxt` (run via `npx -y ccxt-mcp`; requires Node.js ≥ 18) and loads the `ccxt-mcp` skill. Tools appear namespaced as `mcp__ccxt__<tool>`.

## What you get

- **Market data on every exchange with no keys**: tickers, order books, OHLCV, trades, market search, prediction-market events.
- **Private data + trading once you configure an account**: balances, orders, positions, and opt-in order placement — all gated behind capability tiers in a local config file. API keys stay on your machine and are never visible to the model.

See the [MCP server docs](https://docs.ccxt.com/#/mcp) for configuration, the capability tiers, and the safety model. The bundled `ccxt-mcp` skill (`skills/ccxt-mcp`) is a symlink to the repo's canonical skill so it never drifts.

The per-language CCXT coding skills (`ccxt-typescript`, `ccxt-python`, …) are distributed separately via `npx skills add ccxt/ccxt` — see the [AI Skills docs](https://docs.ccxt.com/#/ai-skills).
