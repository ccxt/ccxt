---
name: meme-rush
description: |
  Live launchpad feed + AI hot topics for meme tokens.
  (1) meme-rush: real-time lifecycle feed on launchpads (Pump.fun, Four.meme) — brand-new launches,
  currently-finalizing / bonding-curve tokens, and just-migrated-to-DEX tokens; filter by dev behavior, age, market cap.
  (2) topic-rush: AI-detected hot market narratives with the associated tokens ranked by inflow.
  Use for: "new pump.fun launches", "what just migrated", "currently bonding", "hot narratives", "what topic is pumping right now",
  "live launchpad feed", "AI hot topics".
metadata:
  author: binance-web3-team
  version: "2.0"
---

# Meme Rush Skill

## Overview

Two rank feeds fronted by one CLI: `meme-rush` (launchpad lifecycle tracking) and `topic-rush` (AI hot-topic discovery with associated tokens). The CLI owns URL, method, JSON encoding, timeout, and upstream error mapping — the agent only picks the subcommand and fills the filter JSON.

## When to Use This Skill

| User intent | Command |
|-------------|---------|
| New / finalizing / migrated meme tokens on a launchpad | `meme-rush` |
| AI-generated market hot topics and their associated tokens | `topic-rush` |

## Supported Chains

| Chain | chainId | Supported on |
|-------|---------|--------------|
| BSC | `56` | `meme-rush`, `topic-rush` |
| Solana | `CT_501` | `meme-rush`, `topic-rush` |
| Base | `8453` | `meme-rush` |

## How to Call APIs

```bash
node <skill-dir>/scripts/cli.mjs meme-rush '{"chainId":"CT_501","rankType":10,"limit":20}'
node <skill-dir>/scripts/cli.mjs topic-rush '{"chainId":"CT_501","rankType":10,"sort":10,"asc":false}'
```

## Commands

| Command | Purpose | Required args | Example |
|---------|---------|---------------|---------|
| `meme-rush` | Launchpad token lifecycle ranking (new / finalizing / migrated) | `chainId`, `rankType` | `node <skill-dir>/scripts/cli.mjs meme-rush '{"chainId":"CT_501","rankType":10,"limit":20}'` |
| `topic-rush` | AI-generated hot topics with associated tokens | `chainId`, `rankType`, `sort` | `node <skill-dir>/scripts/cli.mjs topic-rush '{"chainId":"CT_501","rankType":10,"sort":10}'` |

Optional filters for `meme-rush` (all min/max pairs): `progress`, `tokenAge`, `holders`, `liquidity`, `volume`, `marketCap`, `count{,Buy,Sell}`, `holders{Top10,Dev,Sniper,Insider}Percent`, `bundlerHoldingPercent`, `newWalletHoldingPercent`, `bnHoldingPercent`, `{bn,kol,pro}Holders`, `devMigrateCount`, `globalFee`; plus `keywords`, `excludes`, `limit` (max 200), `protocol[]`, `devPosition`, `devBurnedToken`, `excludeDevWashTrading`, `excludeInsiderWashTrading`, `exclusive`, `paidOnDexScreener`, `pumpfunLiving`, `cmcBoost`, `pairAnchorAddress[]`, `tokenSocials.atLeastOne`, `tokenSocials.socials[]`. See `references/cli.md` for type and semantics of each field.

Optional filters for `topic-rush`: `asc` (boolean), `keywords`, `topicType`, `tokenSizeMin/Max`, `netInflowMin/Max`.

## Rules

- **`meme-rush` `rankType`** enum — stage of the token's launchpad lifecycle:
  - `10` = **New** (freshly created, still on bonding curve)
  - `20` = **Finalizing** (bonding curve nearly complete, about to migrate)
  - `30` = **Migrated** (just migrated to DEX)
- **`topic-rush` `rankType`** enum — topic freshness:
  - `10` = **Latest** (newest hot topics)
  - `20` = **Rising** (rising topics, all-time-high inflow between $1k–$20k)
- **`topic-rush` `sort`** enum: `10` = create time, `20` = net inflow. **Default to `sort=10`** when the user does not specify a sort preference.
- **Only `chainId` and `rankType` are required** for `meme-rush`; all other parameters are optional filters. `topic-rush` additionally requires `sort`.
- **Percentage fields are pre-formatted** — `progress`, holder %, `devSellPercent`, `taxRate`, `priceChange`, `priceChange24h` are already strings like `"42.5"`, so **append `%` directly** when displaying; do NOT multiply by 100.
- **Icon URL prefix**: `icon` is a relative path returned by upstream; prepend `https://bin.bnbstatic.com` before rendering. `tokenList[].icon` in `topic-rush` responses follows the same rule.
- **`taxRate` visibility**: for `protocol=2001` (Four.meme) `taxRate` only appears on the **Migrated** list; for `protocol=2002` (Flap) it appears on all lists.
- **Protocol codes** (`1001`–`2002`) map to specific launchpads (Pump.fun, Moonit, Pump AMM, Raydium V4/CPMM/CLMM, BONK, Dynamic BC, Moonshot, Jup Studio, Bags, Believer, Meteora DAMM V2 / Pools, Orca, Four.meme, Flap). See `references/cli.md` for the full table.

## Full CLI Reference

See [`references/cli.md`](references/cli.md) for per-subcommand invocations, full parameter tables (all filter fields, holder-distribution filters, dev & launch filters), return-field tables (core, trade counts, holder distribution, dev & migration, tags & flags, social links, AI narrative, topic + tokenList), and real response samples.
