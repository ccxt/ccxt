---
name: query-address-info
description: |
  Snapshot of a single wallet's token holdings on a specific chain — list of every token currently held with
  name, symbol, current price, 24h price change, and holding quantity.
  Use when the user provides an explicit wallet address (or says "my wallet") and wants the current portfolio:
  "what does 0x... hold", "wallet balance breakdown", "list positions for this address",
  "what tokens are in this wallet", "show me the holdings of <address>".
metadata:
  author: binance-web3-team
  version: "2.0"
---

# Query Address Info Skill

## Overview

This skill queries any on-chain wallet address for token holdings, supporting:

List of all tokens held by a wallet address
Current price of each token
24-hour price change percentage
Holding quantity

## When to Use This Skill

| User intent | Command |
|-------------|---------|
| List a wallet's token holdings with price and 24h change | `positions` |

## Supported Chains

| Chain | chainId |
|-------|---------|
| BSC | `56` |
| Solana | `CT_501` |
| Base | `8453` |
| Ethereum | `1` |

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs positions '{"address":"0x...","chainId":"56","offset":0}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `positions` | List wallet token holdings (price + 24h change + quantity) | `address`, `chainId`, `offset` | `node <skill-dir>/scripts/cli.mjs positions '{"address":"0x...","chainId":"56","offset":0}'` |

## Rules

- **`offset` is required on every call — including the first page.** Pass `0` to fetch the first page; increment for subsequent pages. Omitting it causes an upstream validation error.
- **Pagination**: repeat with increasing `offset` until `data.list` is empty or shorter than the page size.
- **Icon URL prefix**: `icon` is a relative path (e.g., `/images/web3-data/public/token/logos/xxxx.png`). Prepend `https://bin.bnbstatic.com` to render.
- **Numbers as strings**: `price`, `percentChange24h`, `remainQty` are strings — convert to numbers before arithmetic.

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, parameter tables, return-field tables, and real response samples.
