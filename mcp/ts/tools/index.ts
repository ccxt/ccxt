import type { McpServer } from '@modelcontextprotocol/server';
import type { ServerContext, ResolvedConfig } from '../types.js';
import { registerMarketTools } from './market.js';
import { registerReadTools } from './read.js';
import { registerTradeTools } from './trade.js';
import { registerFundsTools, registerImplicitWriteTool } from './funds.js';
import { registerWatchTools } from './watch.js';
import { registerRouteTools, registerRouteExecuteTool } from './route.js';
import { registerUiTools } from './ui.js';

// By default every tier's tools are listed so the model can discover them and, when a
// private one is unusable, get a clear "configure an account" error it can relay to the
// user (rather than the tool silently not existing). Execution is always gated at the
// handler (account + tier re-checked; registration is never trusted as authorization), so
// exposing a tool that will error is safe. Set settings.hideDisabledTools to fall back to
// tiered registration — a leaner, deliberately read-only/monitoring deployment.
export function registerAllTools (server: McpServer, ctx: ServerContext): void {
    const accounts = Object.values (ctx.config.accounts);
    const hideDisabled = ctx.config.settings.hideDisabledTools === true;
    const tradingEnabled = accounts.some ((account) => (account.trading ?? false) !== false);
    const fundsEnabled = accounts.some ((account) => (account.funds ?? false) !== false);
    const implicitWritesEnabled = accounts.some ((account) => account.implicitWrites === true);
    registerMarketTools (server, ctx);
    registerUiTools (server, ctx);
    registerWatchTools (server, ctx);
    registerRouteTools (server, ctx);
    if (!hideDisabled || accounts.length > 0) {
        registerReadTools (server, ctx);
    }
    if (!hideDisabled || tradingEnabled) {
        registerTradeTools (server, ctx);
        registerRouteExecuteTool (server, ctx);
    }
    if (!hideDisabled || fundsEnabled) {
        registerFundsTools (server, ctx);
    }
    if (!hideDisabled || implicitWritesEnabled) {
        registerImplicitWriteTool (server, ctx);
    }
}

// one startup log line describing what the config enables; logged by the entry point, not
// by registerAllTools, because a hosted server registers tools on every request
export function tierSummary (config: ResolvedConfig): string {
    const accounts = Object.values (config.accounts);
    return 'accounts: ' + accounts.length
        + ', tool profile: ' + (config.settings.tools ?? 'all')
        + ', hideDisabledTools: ' + (config.settings.hideDisabledTools === true)
        + ', enabled tiers — trading: ' + accounts.some ((account) => (account.trading ?? false) !== false)
        + ', funds: ' + accounts.some ((account) => (account.funds ?? false) !== false)
        + ', implicitWrites: ' + accounts.some ((account) => account.implicitWrites === true);
}

// The opening paragraph is kept under 512 characters and readable on its own: some hosts
// (ChatGPT, Codex) weight or truncate the start of the instructions, so it alone has to say
// what the server is for and how to begin (test/schema/tools.test.ts pins this).
export const SERVER_INSTRUCTIONS = `ccxt-mcp: market data and trading on 100+ cryptocurrency exchanges and prediction markets, via the ccxt library. Resolve exchange ids with list_exchanges and symbols with search_markets (never guess), then read with get_tickers, get_orderbook, get_ohlcv or get_trades. To SHOW prices to the user, call show_chart, show_orderbook or show_tickers: they render an interactive view and return a compact summary. Account and trading tools need an account the user configured locally. Manual: https://docs.ccxt.com/

Conventions:
- Exchange ids are plain strings validated server-side — discover them with list_exchanges.
- Symbols are unified ccxt symbols ("BTC/USDT" spot, "BTC/USDT:USDT" swap) — resolve them with search_markets, never guess (to list many symbols cheaply pass fields: ["symbol"] — up to 1000 compact rows per call instead of 100 full ones). On prediction exchanges (polymarket, kalshi, limitless, myriad, hyperliquid with prediction=true) the symbol position takes an outcome handle from search_events.
- Every exchange-touching tool accepts "params": extra exchange-specific parameters passed to ccxt unchanged (credential-like keys such as apiKey or secret are rejected). Discover supported keys and per-exchange behavior with describe_method.
- "since" accepts ms timestamps or ISO8601 strings; results carry timestamp (ms) and datetime (ISO8601) when the exchange provides them. Ticker fields vary by exchange (some lack timestamp, bid/ask or 24h stats; some count change from the day's open, not a rolling 24h): report what is there, never fill gaps. meta.notice says when the exchange did not return data from "since".
- List results are capped: search tools report meta.returned/offset/hasMore (or available); fetch tools report meta.count plus meta.hasMore when the count hit the limit — page with since/offset rather than assuming completeness. A limit above a tool's max is clamped and reported in meta.limitClamped. Host-oversized results are tail-trimmed and flagged meta.truncated.
- To SHOW data to the user, prefer the render tools: show_chart (candlestick chart), show_orderbook (depth chart + ladder), show_tickers (price board). You get back a compact summary, never the full dataset, and meta.ui says what happened to the view: "displayed" — the user sees an interactive view, so comment on the summary instead of repeating data; "attached" — a view was sent but the host did not say whether it renders views, so also state the key figures; "unsupported", "unknown" or "off" — nothing was shown, so present the summary in text. Call the matching get_* tool when you need the raw rows yourself.
- To find the best price or execution route for converting an asset at a given size across exchanges, use fetch_route rather than comparing order books yourself — it is a quote, not an order. Read fillRatio before effectiveRate. To act on it, pass its routeId to execute_route (trading tier; every order still goes through the account's caps and confirmation).
- The long tail of read methods (funding rates, ledger, open interest, settlements, …) is available via call_read_method; raw exchange-specific GET endpoints via call_implicit_get.
- For LIVE data over WebSocket, use watch_subscribe (e.g. watchOHLCV/watchTicker/watchOrderBook/watchTrades, or watchOrders/watchMyTrades with an account) to open a background stream, then poll watch_read for new updates and watch_unsubscribe to stop. One-shot fetch* tools are simpler when you just need a current snapshot.
- Private tools (balances, orders, positions, create_order, withdraw, …) take an "account" name (list_accounts). API credentials live only in the local config — they are never tool parameters and never appear in results; capability tiers (trading, funds, implicitWrites) can only be enabled by the user editing the config file, never from the conversation.
- Every tool is listed by default, but a private one whose account or tier is not configured returns a clear error: relay its "hint" to the user (it has the config-file path + an example) so they can set it up — keys go only in that file, never in chat — then they restart the server. Call get_safety_status for the config path, configured accounts and enabled tiers. (A deployment may set hideDisabledTools to hide unconfigured tiers instead.)
- Write tools may return a preview with a confirmToken instead of executing — show the preview to the user, then repeat the identical call with "confirm" set to execute. get_safety_status shows what is currently enabled.`;
