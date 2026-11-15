---
name: crypto-market-rank
description: |
  Crypto market leaderboards — ranked aggregate feeds across the whole market:
  social-hype/sentiment rank, trending / top-search / Binance Alpha / tokenized-stocks rank,
  smart-money net-inflow rank (which tokens received the most inflow), top meme tokens by breakout score on Pulse launchpad,
  top trader PnL leaderboard (ALL / KOL).
  Use whenever the user wants a ranked list of tokens or addresses by some metric — phrases like
  "trending tokens", "top N by hype", "leaderboard", "rank by X", "biggest inflows", "top traders this week".
metadata:
  author: binance-web3-team
  version: "3.0"
---

# Crypto Market Rank Skill
## Overview

Five leaderboard / rank endpoints fronted by one CLI. The agent issues a subcommand with a JSON blob; the CLI owns URL paths, method selection , query-string building, and upstream error mapping. 

## When to Use This Skill

| User intent | Command |
|-------------|---------|
| Social Hype Leaderboard, Tokens with highest social buzz + sentiment summary | `social-hype` |
| Unified Token Rank, Trending / Top Search / Alpha / Stock token lists (filtered) | `token-rank` |
| Smart Money Inflow Rank, Tokens currently receiving the most smart-money net inflow | `smart-money-inflow` |
| Meme Token Rank,Top meme tokens from Pulse launchpad (breakout score) | `meme-rank` |
| Address Pnl Rank, Top trader PnL leaderboard (ALL / KOL) | `address-pnl-rank` |

## Supported Chains

| Chain | chainId | Supported on |
|-------|---------|--------------|
| BSC | `56` | `social-hype`, `token-rank`, `smart-money-inflow`, `meme-rank`, `address-pnl-rank` |
| Solana | `CT_501` | `social-hype`, `token-rank`, `smart-money-inflow`, `address-pnl-rank` |
| Base | `8453` | `social-hype`, `token-rank`, `smart-money-inflow`, `address-pnl-rank` |
| Ethereum | `1` | `token-rank`, `address-pnl-rank` |

> `meme-rank` only supports BSC (`56`). The CLI rejects unsupported chainIds with an error before calling the API.

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs token-rank \
  '{"rankType":10,"chainId":"56","period":50,"sortBy":70,"orderAsc":false,"page":1,"size":20}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `social-hype` | Social buzz leaderboard with sentiment + summaries | `chainId`, `targetLanguage`, `timeRange` | `node <skill-dir>/scripts/cli.mjs social-hype '{"chainId":"56","targetLanguage":"en","timeRange":1}'` |
| `token-rank` | Unified rank (Trending / TopSearch / Alpha / Stock) with filters | `rankType`, `chainId` | `node <skill-dir>/scripts/cli.mjs token-rank '{"rankType":10,"chainId":"56","page":1,"size":20}'` |
| `smart-money-inflow` | Token rank by smart money net inflow | `chainId` (CLI defaults `tagType` to `2`) | `node <skill-dir>/scripts/cli.mjs smart-money-inflow '{"chainId":"56","period":"24h"}'` |
| `meme-rank` | Top 100 Pulse launchpad meme tokens scored for breakout | `chainId` | `node <skill-dir>/scripts/cli.mjs meme-rank '{"chainId":"56"}'` |
| `address-pnl-rank` | Top trader PnL leaderboard | `chainId`, `period`, `tag` | `node <skill-dir>/scripts/cli.mjs address-pnl-rank '{"chainId":"CT_501","period":"30d","tag":"ALL","pageNo":1,"pageSize":25}'` |

## Use Flow

> **Before calling any API, you MUST read its reference file for the full command, parameters, example, and response fields.**

1. **Select command** — match user intent to the "When to use" column above
   - For token-rank, also decide `rankType`: `10`=Trending, `11`=TopSearch, `20`=Alpha, `40`=Stock, see rules below
2. **Set chain** — pick `chainId` from Supported Chains; omit for all chains (token-rank only)
3. **Set time window** (if applicable)
   - social-hype: `timeRange=1` (24h)
   - token-rank `period`: `10`=1m, `20`=5m, `30`=1h, `40`=4h, `50`=24h (default `50`)
   - smart-money-inflow `period`: `5m` / `1h` / `4h` / `24h` (default `24h`)
   - address-pnl-rank `period`: `7d` / `30d` / `90d` (default `30d`)
4. **Set filters** — if user mentions specific conditions (market cap, volume, holders, PnL, win rate, etc.), read the reference for filter params
5. **Read reference** — open the corresponding reference file for command, full params, example, and response fields
6. **Call cli** — run the cli.mjs in scripts folder


## Rules

- **`rankType` enum for `token-rank`**: `10`=Trending, `11`=TopSearch, `20`=Alpha, `40`=Stock.
  - **Trending (`10`) is the default.** Use it for any generic "hot / trending / popular / 热门 / 趋势 / 火" request — this is the board users mean 99% of the time.
  - **TopSearch (`11`) requires an explicit signal.** Only pick it when the user says "热搜", "top search", "most searched", "搜索榜", or otherwise makes clear they want the search-count-driven list (not price/volume-driven). Search-count sort (`sortBy: 2`) only makes sense with TopSearch.
  - When ambiguous, go Trending. Do not silently switch to TopSearch.
- **`tagType` default for `smart-money-inflow`**: the CLI auto-fills `tagType: 2` (upstream requires it and `2` is the only supported value today). Callers do not need to pass it; if passed, the caller's value wins.
- **`period` values differ by command**: `social-hype.timeRange` is numeric (`1`=24h); `token-rank.period` is a code (`10`=1m, `20`=5m, `30`=1h, `40`=4h, `50`=24h); `smart-money-inflow.period` is a string (`5m`/`1h`/`4h`/`24h`); `address-pnl-rank.period` is a string (`7d`/`30d`/`90d`). See `references/cli.md` for details.
- **`token-rank` supports rich filters** (min/max pairs: `marketCap`, `volume`, `liquidity`, `holders`, `percentChange`, etc.). Pass them as flat top-level fields on the JSON body — the CLI forwards the body verbatim.
- **Icon / logo URL prefix**: most `icon` / `logo` / `metaInfo.logo` / `tokenIconUrl` fields are relative paths. Prepend `https://bin.bnbstatic.com` to render. `chainLogoUrl` is already a full URL.
- **Numeric fields arrive as strings** (`price`, `marketCap`, `percentChange*`, etc.) — convert before arithmetic.
- **`address-pnl-rank.pageSize` cap is 25** — larger values are silently clamped.
- **All timestamps are milliseconds.**

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, parameter tables, return-field tables, sort-option and filter tables, and real response samples.
