# Tool annotations and their justifications

OpenAI's final submission asks for "a justification for each value on every MCP tool" (submission errors, `justification_required`); its plugin guidelines (§6.3) say justifications "are no longer required". Paste these into the portal if it asks. Anthropic's review checks the same three hints.

Values are what `tools/list` on `https://docs.ccxt.com/mcp` returns. `test/directory.test.ts` fails when this table and the server disagree, so a changed annotation updates this file in the same commit.

Hints: **RO** `readOnlyHint`, **D** `destructiveHint`, **OW** `openWorldHint`.

| Tool | RO | D | OW | Justification |
|---|---|---|---|---|
| `list_exchanges` | true | false | false | Returns the server's fixed exchange allowlist from memory. Changes nothing, deletes nothing, and makes no outside request. |
| `describe_exchange` | true | false | false | Returns one exchange's capabilities from the ccxt library's built-in metadata and the markets already loaded on the server. Changes nothing and makes no request at call time. |
| `search_markets` | true | false | true | Searches an exchange's public market list. Changes nothing. Open-world because the list comes from the exchange's public API (loaded and refreshed by the server), so results reflect a third party's data. |
| `get_tickers` | true | false | true | Reads public 24h price tickers from a public exchange API. Never places, edits or cancels anything. Open-world: it queries a third-party exchange. |
| `get_orderbook` | true | false | true | Reads a public order book (bids and asks) from a public exchange API. No writes. Open-world: third-party exchange data. |
| `get_ohlcv` | true | false | true | Reads public candlestick history from a public exchange API. No writes. Open-world: third-party exchange data. |
| `get_trades` | true | false | true | Reads the public list of recent market trades (not the user's trades) from a public exchange API. No writes. Open-world: third-party exchange data. |
| `show_chart` | true | false | true | Same public candle read as `get_ohlcv`, plus an interactive chart view. The view only displays data and can only call read-only tools. Open-world: third-party exchange data. |
| `show_orderbook` | true | false | true | Same public order-book read as `get_orderbook`, shown as a depth chart and ladder. Display only. Open-world: third-party exchange data. |
| `show_tickers` | true | false | true | Same public ticker read as `get_tickers`, shown as a sortable price board. Display only. Open-world: third-party exchange data. |
| `live_update` | true | false | true | App-only (hidden from the model): the three views call it every few seconds to refresh what they display. Returns public market data from the server's shared stream or cache. No writes. Open-world: the data comes from third-party exchanges. |
| `get_balance` | true | false | false | Account data is not available on the hosted server: this tool always answers ACCOUNT_REQUIRED with a pointer to the local CCXT MCP server. It reads nothing, changes nothing and contacts no one. |
| `get_orders` | true | false | false | As `get_balance`: always answers ACCOUNT_REQUIRED; reads, changes and contacts nothing. |
| `get_my_trades` | true | false | false | As `get_balance`: always answers ACCOUNT_REQUIRED; reads, changes and contacts nothing. |
| `get_positions` | true | false | false | As `get_balance`: always answers ACCOUNT_REQUIRED; reads, changes and contacts nothing. |

No hosted tool writes: there are no order, transfer, withdraw or account-changing tools on this server. Every tool also declares `securitySchemes: [{"type": "noauth"}]` in its `_meta` (phase 1 is anonymous).
