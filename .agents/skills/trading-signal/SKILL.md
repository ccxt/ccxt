---
name: trading-signal
description: |
  Per-trade smart-money signals — each result is a discrete buy or sell event from a tracked smart-money wallet,
  with trigger price, current price, max gain since trigger, and exit rate. BSC and Solana only.
  Use for: "smart money buy signal on $X", "any whale just bought $Y", "alpha signals in the last hour",
  "copy-trade-worthy signals", "trigger price and max gain on these trades", "on-chain trading signals from smart money".
metadata:
  author: binance-web3-team
  version: "2.0"
---

# Trading Signal Skill

## Overview

This skill retrieves on-chain Smart Money trading signals to help users track professional investors:

Get smart money buy/sell signals
Compare signal trigger price with current price
Analyze max gain and exit rate of signals
Get token tags (e.g., Pumpfun, DEX Paid)


## When to Use This Skill

| User intent | Command |
|-------------|---------|
| Get on-chain smart-money buy/sell signals with gain + exit-rate data | `smart-money` |

## Supported Chains

| Chain | chainId |
|-------|---------|
| BSC | `56` |
| Solana | `CT_501` |

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs smart-money '{"chainId":"CT_501","page":1,"pageSize":50}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `smart-money` | Smart-money buy/sell signals with trigger price, max gain, exit rate | `chainId` | `node <skill-dir>/scripts/cli.mjs smart-money '{"chainId":"56","page":1,"pageSize":50}'` |

Optional args: `page` (default 1), `pageSize` (**max 100**), `smartSignalType` (filter; empty string = all).

## Rules

- **`pageSize` cap is 100** — larger values are silently clamped upstream.
- **`status` enum** (map to user-friendly language when summarizing):
  - `active` — signal still valid
  - `timeout` — exceeded observation window (may still be informative, but stale)
  - `completed` — reached target / stop loss
  Prefer `active` signals when surfacing actionable opportunities.
- **Quality indicators**: higher `smartMoneyCount` (more distinct smart-money addresses) implies higher signal reliability; high `exitRate` (%) suggests smart money has already exited, so the opportunity may have passed.
- **`direction`** is `buy` or `sell` — always include this when summarizing a signal.
- **Icon URL prefix**: `logoUrl` is a relative path; prepend `https://bin.bnbstatic.com`. `chainLogoUrl` is already a full URL. Timestamps are ms; `maxGain` is a % string — convert before arithmetic.

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, parameter tables, signal / tag / performance field tables, and real response samples.
