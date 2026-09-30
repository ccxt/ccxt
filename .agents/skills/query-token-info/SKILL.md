---
name: query-token-info
description: |
  Per-token details for a specific token identified by keyword, symbol, or contract address:
  (1) search — find tokens by keyword/symbol/contract;
  (2) meta — static info: name, symbol, logo, social links, creator, official website;
  (3) dynamic — real-time market data: price, 24h change, volume, holder count, liquidity;
  (4) kline — OHLCV candlestick data for technical analysis.
  Use for: "price of $X", "search for token Y", "kline chart for $Z", "who created $W",
  "social links for $V", "holder count of $U", "candlestick data", "find the contract address of <token>".
metadata:
  author: binance-web3-team
  version: "2.0"
---

# Query Token Info Skill

## Overview

Four read-only token endpoints fronted by one CLI. The agent picks a subcommand and passes
a JSON blob; with this skill user can:

Search Tokens: Find tokens by name, symbol, or contract address across chains.
Token Research: Get token metadata, social links, and creator info.
Market Analysis: Real-time price, volume, holder distribution, and liquidity data.
Chart Analysis: K-Line candlestick data for technical analysis.

## When to Use This Skill

| User intent | Command |
|-------------|---------|
| Search a token by keyword, symbol, or contract address | `search` |
| Get static metadata (name, symbol, logo, social links, creator) | `meta` |
| Get real-time market data (price, volume, holders, liquidity) | `dynamic` |
| Get candlestick chart / OHLCV data | `kline` |

## Supported Chains

| Chain | `chainId` |
|-------|-----------|
| Ethereum | `1` |
| BSC | `56` |
| Base | `8453` |
| Solana | `CT_501` |

All four commands (`search`, `meta`, `dynamic`, `kline`) use the same `chainId` values.

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs <command> '<json_params>'
```

Example:

```bash
node <skill-dir>/scripts/cli.mjs search '{"keyword":"<keyword>","chainIds":"56"}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `search` | Search tokens by keyword | `keyword` (optional: `chainIds`, `orderBy`) | `node <skill-dir>/scripts/cli.mjs search '{"keyword":"<keyword>","chainIds":"1,56,8453,CT_501"}'` |
| `meta` | Static token metadata | `chainId`, `contractAddress` | `node <skill-dir>/scripts/cli.mjs meta '{"chainId":"56","contractAddress":"0x..."}'` |
| `dynamic` | Real-time market data | `chainId`, `contractAddress` | `node <skill-dir>/scripts/cli.mjs dynamic '{"chainId":"56","contractAddress":"0x..."}'` |
| `kline` | Candlestick data | `chainId`, `contractAddress`, `interval` (optional: `limit`, `from`, `to`, `pm`) | `node <skill-dir>/scripts/cli.mjs kline '{"chainId":"56","contractAddress":"0x...","interval":"1min","limit":500}'` |

## Rules

- **Icon URL**: `icon` fields are relative paths. Prepend `https://bin.bnbstatic.com` for a usable URL.
- **Numbers as strings**: All numeric market fields (`price`, `volume24h`, `marketCap`, etc.) are
  returned as strings. Convert before arithmetic.
- **Kline is a 2D array**, not JSON objects. Each candle: `[open, high, low, close, volume, timestamp_ms, count]`.
- **Kline time window**: `limit` takes priority over `from` when both are provided. Use `to`
  with `limit` to fetch the N most recent candles ending at `to`. `pm` selects price (`p`,
  default) or market-cap (`m`) series.
- **Intervals** supported by `kline`: `1s`, `1min`, `3min`, `5min`, `15min`, `30min`, `1h`, `2h`,
  `4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1m`.

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, parameter tables, return-field tables, and real response samples.
