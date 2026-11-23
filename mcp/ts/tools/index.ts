import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { registerMarketTools } from './market.js';
import { registerReadTools } from './read.js';
import { registerTradeTools } from './trade.js';
import { registerFundsTools, registerImplicitWriteTool } from './funds.js';
import { registerWatchTools } from './watch.js';
import { registerRouteTools, registerRouteExecuteTool } from './route.js';
import { registerUiTools } from './ui.js';
import { registerAccountUiTools } from './ui-account.js';
import { registerSetupTools } from './setup.js';
import { log } from '../logging.js';

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
    // always listed: it is how a user with no account yet gets one without editing a file
    registerSetupTools (server, ctx);
    if (!hideDisabled || accounts.length > 0) {
        registerReadTools (server, ctx);
        registerAccountUiTools (server, ctx);
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
    log ('info', 'tools registered — accounts: ' + accounts.length
        + ', hideDisabledTools: ' + hideDisabled
        + ', enabled tiers — trading: ' + tradingEnabled
        + ', funds: ' + fundsEnabled
        + ', implicitWrites: ' + implicitWritesEnabled);
}

export const SERVER_INSTRUCTIONS = `ccxt-mcp: unified access to 100+ cryptocurrency exchanges (and prediction markets) through the ccxt library. Full manual: https://docs.ccxt.com/

Conventions:
- Exchange ids are plain strings validated server-side — discover them with list_exchanges.
- Symbols are unified ccxt symbols ("BTC/USDT" spot, "BTC/USDT:USDT" swap) — resolve them with search_markets, never guess (to list many symbols cheaply pass fields: ["symbol"] — up to 1000 compact rows per call instead of 100 full ones). On prediction exchanges (polymarket, kalshi, limitless, myriad, hyperliquid with prediction=true) the symbol position takes an outcome handle from search_events.
- Every exchange-touching tool accepts "params": extra exchange-specific parameters passed to ccxt unchanged. Discover supported keys and per-exchange behavior with describe_method.
- "since" accepts ms timestamps or ISO8601 strings; results carry both timestamp (ms) and datetime (ISO8601).
- List results are capped: search tools report meta.returned/offset/hasMore (or available); fetch tools report meta.count plus meta.hasMore when the count hit the limit — page with since/offset rather than assuming completeness. Host-oversized results are tail-trimmed and flagged meta.truncated.
- To SHOW data to the user, prefer the render tools: show_chart (candlestick chart), show_orderbook (depth chart + ladder), show_tickers (price board). You always get back only a compact summary, never the full dataset, and meta.ui says what happened to the view: "displayed" — the host shows the user an interactive view, so comment on the summary instead of repeating data; "unsupported" (the host did not advertise MCP Apps) or "off" (views disabled by the operator) — nothing was shown, so present the summary in text. Call the matching get_* tool when you need the raw rows yourself.
- To find the best price or execution route for converting an asset at a given size across exchanges, use fetch_route rather than comparing order books yourself — it is a quote, not an order. Read fillRatio before effectiveRate. To act on it, pass its routeId to execute_route (trading tier; every order still goes through the account's caps and confirmation).
- The long tail of read methods (funding rates, ledger, open interest, settlements, …) is available via call_read_method; raw exchange-specific GET endpoints via call_implicit_get.
- For LIVE data over WebSocket, use watch_subscribe (e.g. watchOHLCV/watchTicker/watchOrderBook/watchTrades, or watchOrders/watchMyTrades with an account) to open a background stream, then poll watch_read for new updates and watch_unsubscribe to stop. One-shot fetch* tools are simpler when you just need a current snapshot.
- Private tools (balances, orders, positions, create_order, withdraw, …) take an "account" name (list_accounts). API credentials live only on the user's machine — they are never tool parameters and never appear in results. NEVER ask the user to paste an API key, secret or passphrase into the chat, and if they do, tell them to revoke that key.
- To connect an exchange account (first run, "get started", or any error saying an account is not configured), call setup_account: it opens a setup form in the user's own browser, served from their machine, where they type the key themselves. You only learn that the form was opened — call it once, wait for the user to say they saved it, then call list_accounts; the account works immediately, no restart. While a form is open a repeat call opens nothing new (restart: true discards the open form and what was typed — only if the user lost it). The form offers testnet/demo/live and an "allow placing orders" switch (live needs a per-order USD cap) — to turn order placement on for an existing account the user saves it again from the form under the same name; the funds and implicitWrites tiers can only be enabled by the user editing the config file, never from the conversation or the form. A few exchanges (e.g. dydx, polymarket prediction markets) take credentials the form cannot collect; it says so and points the user to the config file.
- Every tool is listed by default, but a private one whose account or tier is not configured returns a clear error: relay its "hint" to the user — setup_account first; editing the config file (the hint has its path + an example) and restarting the server is the alternative. Call get_safety_status for the configured accounts and enabled tiers. (A deployment may set hideDisabledTools to hide unconfigured tiers instead; the read and trading tools are then added to the tool list when the setup form saves an account that enables them, while a tier enabled by editing the config file is listed after a restart.)
- Write tools may return a preview with a confirmToken instead of executing — show the preview to the user, then repeat the identical call with "confirm" set to execute. get_safety_status shows what is currently enabled.`;
