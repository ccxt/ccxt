import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { registerMarketTools } from './market.js';
import { registerReadTools } from './read.js';
import { registerTradeTools } from './trade.js';
import { registerFundsTools, registerImplicitWriteTool } from './funds.js';
import { registerWatchTools } from './watch.js';
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
    registerWatchTools (server, ctx);
    if (!hideDisabled || accounts.length > 0) {
        registerReadTools (server, ctx);
    }
    if (!hideDisabled || tradingEnabled) {
        registerTradeTools (server, ctx);
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
- Symbols are unified ccxt symbols ("BTC/USDT" spot, "BTC/USDT:USDT" swap) — resolve them with search_markets, never guess. On prediction exchanges (polymarket, kalshi, limitless, myriad, hyperliquid with prediction=true) the symbol position takes an outcome handle from search_events.
- Every exchange-touching tool accepts "params": extra exchange-specific parameters passed to ccxt unchanged. Discover supported keys and per-exchange behavior with describe_method.
- "since" accepts ms timestamps or ISO8601 strings; results carry both timestamp (ms) and datetime (ISO8601).
- List results are capped: search tools report meta.returned/offset/hasMore (or available); fetch tools report meta.count plus meta.hasMore when the count hit the limit — page with since/offset rather than assuming completeness. Host-oversized results are tail-trimmed and flagged meta.truncated.
- The long tail of read methods (funding rates, ledger, open interest, settlements, …) is available via call_read_method; raw exchange-specific GET endpoints via call_implicit_get.
- For LIVE data over WebSocket, use watch_subscribe (e.g. watchOHLCV/watchTicker/watchOrderBook/watchTrades, or watchOrders/watchMyTrades with an account) to open a background stream, then poll watch_read for new updates and watch_unsubscribe to stop. One-shot fetch* tools are simpler when you just need a current snapshot.
- Private tools (balances, orders, positions, create_order, withdraw, …) take an "account" name (list_accounts). API credentials live only in the local config — they are never tool parameters and never appear in results; capability tiers (trading, funds, implicitWrites) can only be enabled by the user editing the config file, never from the conversation.
- Every tool is listed by default, but a private one whose account or tier is not configured returns a clear error: relay its "hint" to the user (it has the config-file path + an example) so they can set it up — keys go only in that file, never in chat — then they restart the server. Call get_safety_status for the config path, configured accounts and enabled tiers. (A deployment may set hideDisabledTools to hide unconfigured tiers instead.)
- Write tools may return a preview with a confirmToken instead of executing — show the preview to the user, then repeat the identical call with "confirm" set to execute. get_safety_status shows what is currently enabled.`;
