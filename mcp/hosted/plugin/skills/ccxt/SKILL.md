---
name: ccxt
description: Use the hosted CCXT connector for live public crypto market data - prices, order books, candles, recent trades and market search on major exchanges - and to show charts, order books and price boards in the chat. Use when the user asks about a crypto price, a market or symbol on an exchange, an order book, a chart, or how prices compare across exchanges.
---

# CCXT market data

The CCXT connector reads **public** market data from a curated set of major exchanges. It is read-only. It cannot place orders, move funds or read anyone's exchange account.

## Find the market first

- `list_exchanges` names the exchanges this server serves. Use an exchange from that list.
- Symbols are unified CCXT symbols: `BTC/USDT` (spot), `BTC/USDT:USDT` (USDT-settled perpetual swap), `BTC/USD:BTC` (inverse). Some exchanges quote in USD rather than USDT.
- If you are not sure of the exact symbol, call `search_markets` (filter by `base`, `quote`, `settle` or `type`, e.g. `type: "swap"` for perpetuals) and use the symbol it returns. Do not guess.

## Show, or fetch

- When the user wants to **see** something, prefer the views:
  - `show_chart` for a price chart (candles + volume);
  - `show_orderbook` for the order book, depth or liquidity;
  - `show_tickers` for a price board of several symbols on one exchange.
- Views render only in hosts that support MCP Apps (for example Claude and ChatGPT on the web, desktop and mobile). Terminal hosts show the text summary instead. The result's `meta.ui` says what happened:
  - `displayed`: the user sees the view, so comment on it rather than repeating every number;
  - `attached`: a view was sent but the host did not say whether it renders views, so also state the key figures;
  - `unsupported`, `unknown` or `off`: nothing was shown, so present the summary as text.
- When you need numbers to reason with, use `get_tickers`, `get_orderbook`, `get_ohlcv` or `get_trades`.
- To compare exchanges, call the tool once per exchange.
- `describe_exchange` lists an exchange's timeframes and capabilities.

## Report data honestly

- Name the exchange next to every price, and say when the data is from (results carry `timestamp` / `datetime`).
- Never state a price a tool did not return. If a tool fails, say so.
- The server is shared by everyone who uses it, and data is cached for a second or two. An error with code `RATE_LIMITED` or `EXCHANGE_UNAVAILABLE` carries `retryAfterSeconds`: wait that long before retrying, or use another exchange. Do not retry in a loop.
- Do not give investment advice.

## Accounts and trading

`get_balance`, `get_orders`, `get_positions` and `get_my_trades` exist but return `ACCOUNT_REQUIRED`: this hosted server has no accounts. When the user asks for balances, orders, positions, their trades, or to trade or withdraw:

1. Say that this connector serves public market data only.
2. Point them to the local CCXT MCP server, which runs on their own computer and keeps their API keys there: https://docs.ccxt.com/docs/mcp
3. Never ask the user for API keys or secrets in the chat.
