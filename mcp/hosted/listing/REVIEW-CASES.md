# Review cases and example prompts

Test cases for the directory reviewers, written against the real hosted tool list (`HOSTED_TOOLS` in `mcp/hosted/src/profile.ts`): `list_exchanges`, `describe_exchange`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades`, `show_chart`, `show_orderbook`, `show_tickers`, and the account stubs `get_balance`, `get_orders`, `get_positions`, `get_my_trades`, which return `ACCOUNT_REQUIRED`.

- Every market used below was checked on 2026-11-25 against the exchanges' public APIs (ccxt 4.5.94, `loadMarkets`): Kraken BTC/USDT, BTC/USD, ETH/USD, SOL/USD, ETH/USDT; Coinbase ETH/USDT; OKX ETH/USDT, SOL/USDT, BTC/USDT:USDT. Kraken and OKX offer the `4h` timeframe; Coinbase does not.
- The cases avoid Binance and Bybit. Both block some datacenter regions, and either may leave the production allowlist after the reachability check.
- Re-run every case against the deployed server before submitting, and record the answers. OpenAI: "Review all test cases carefully and rerun each one. Ensure that outputs match the expected results" ([app review](https://developers.openai.com/plugins/deploy/app-review)).

## OpenAI: exactly five positive and three negative cases

"Initial MCP app review requires exactly five positive and three negative cases" ([submission](https://developers.openai.com/plugins/deploy/submission)). The authoritative copy is `extensions["com.openai"].review.test_cases` in `mcp/hosted/plugin/plugin.json`, which the ZIP import reads; `mcp/test/schema/hosted-plugin.test.ts` checks the counts and that every `tools_triggered` name is a hosted tool. This table mirrors it: change both together.

### Positive

| # | Description | Prompt | Tools triggered | Expected behaviour |
|---|---|---|---|---|
| 1 | Candlestick chart for one market | Show the BTC/USDT 4h chart on Kraken. | `show_chart` | Renders an interactive candlestick and volume chart of BTC/USDT 4h candles from Kraken, and states the range, the latest close and the change over the period. |
| 2 | Latest price on several exchanges | What is ETH/USDT trading at on Coinbase, OKX and Kraken right now? | `get_tickers` | Calls `get_tickers` once per exchange and reports the last price, bid and ask for ETH/USDT on each, naming the exchange next to every figure. |
| 3 | Order book depth | Show the order book for SOL/USDT on OKX. | `show_orderbook` | Renders an order-book depth chart and bid/ask ladder for SOL/USDT on OKX, and states the best bid, best ask and spread. |
| 4 | Find a perpetual swap market | Which BTC perpetual swaps settled in USDT does OKX list? | `search_markets` | Searches OKX swap markets with base BTC and settle USDT, and lists the unified symbols it returns (such as BTC/USDT:USDT) without inventing markets. |
| 5 | Price board for several coins | Show a price board for BTC/USD, ETH/USD and SOL/USD on Kraken. | `show_tickers` | Renders a sortable price board of the three Kraken markets with last price, 24h change, high, low and volume, and names any symbol that returned no data. |

### Negative

Requests the plugin must not fulfil. In each, the assistant should say that the connector is read-only public market data and, for account requests, point to the local CCXT MCP server.

| # | Description | Prompt | What should happen |
|---|---|---|---|
| 1 | Placing an order is not supported | Buy 0.01 BTC on Kraken at market. | No order tool exists. The assistant says it cannot trade through this connector and offers the local CCXT MCP server for trading (https://docs.ccxt.com/docs/mcp#local-server, `npx -y ccxt-mcp`, keys stay on the user's computer). It may show the current price. It never says the order was placed. |
| 2 | Moving funds is not supported | Withdraw 100 USDT from my OKX account to this address: 0x0000000000000000000000000000000000000000. | No funds tool exists. The assistant declines and does not ask for keys. |
| 3 | Account data is not available on the hosted server | Show my Coinbase balance. | The assistant may call `get_balance`, which returns `ACCOUNT_REQUIRED` without reaching the exchange. It explains that account data needs the local server and links https://docs.ccxt.com/docs/mcp. It never asks for an API key. |

The "What should happen" column is for our own testing. The negative-case schema has only `description` and `prompt`.

## Anthropic: at least three example prompts

Policy §3.E: "Developers must provide at least three working examples of prompts or use cases that demonstrate core functionality" ([Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)). The carousel screenshots in SCREENSHOTS.md use the first three.

1. **Show the BTC/USDT 4h chart on Kraken.** → `show_chart`: an interactive candlestick chart in the chat.
2. **Show the order book for SOL/USDT on OKX.** → `show_orderbook`: depth chart and ladder.
3. **Show a price board for BTC/USD, ETH/USD and SOL/USD on Kraken.** → `show_tickers`: a sortable price board.
4. **Compare the ETH/USDT price on Coinbase, OKX and Kraken.** → `get_tickers` per exchange: a text comparison.
5. **Which BTC perpetual swaps settled in USDT does OKX list?** → `search_markets`.

The OpenAI `defaultPrompt` starters in `plugin.json` are a subset of these (at most three, at most 128 characters each).

## Things a reviewer may try that the cases do not cover

- **An exchange outside the allowlist** (for example "price of BTC on MEXC"): the tools return `UNKNOWN_EXCHANGE`, with the closest served id when one is near; `list_exchanges` names the served exchanges. Check the assistant relays it rather than inventing a price.
- **A symbol that does not exist** (for example "NOTAREALCOIN/USDT on Kraken"): `BAD_SYMBOL`; the assistant should suggest `search_markets`.
- **Rapid repeated requests:** `RATE_LIMITED` with `retryAfterSeconds`; the assistant should wait or stop, not loop.
- **"Should I buy SOL now?":** the assistant may show data but must not give investment advice. The plugin skill says so; the server instructions do not, and the tools cannot enforce it.
