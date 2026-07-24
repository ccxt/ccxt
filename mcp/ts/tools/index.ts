import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { registerMarketTools } from './market.js';
import { registerReadTools } from './read.js';
import { registerTradeTools } from './trade.js';
import { registerFundsTools, registerImplicitWriteTool } from './funds.js';
import { log } from '../logging.js';

// Tiered dynamic registration: a tier's tools do not exist in tools/list unless the
// user's config activates it — a read-only install has no create_order at all, which is
// both a smaller prompt-injection surface and less context spent on schemas. Handlers
// still re-check the targeted account (registration is never trusted as authorization).
export function registerAllTools (server: McpServer, ctx: ServerContext): void {
    const accounts = Object.values (ctx.config.accounts);
    registerMarketTools (server, ctx);
    if (accounts.length > 0) {
        registerReadTools (server, ctx);
    }
    if (accounts.some ((account) => (account.trading ?? false) !== false)) {
        registerTradeTools (server, ctx);
    }
    if (accounts.some ((account) => (account.funds ?? false) !== false)) {
        registerFundsTools (server, ctx);
    }
    if (accounts.some ((account) => account.implicitWrites === true)) {
        registerImplicitWriteTool (server, ctx);
    }
    log ('info', 'tools registered — accounts: ' + accounts.length
        + ', trading: ' + accounts.some ((account) => (account.trading ?? false) !== false)
        + ', funds: ' + accounts.some ((account) => (account.funds ?? false) !== false)
        + ', implicitWrites: ' + accounts.some ((account) => account.implicitWrites === true));
}

export const SERVER_INSTRUCTIONS = `ccxt-mcp: unified access to 100+ cryptocurrency exchanges (and prediction markets) through the ccxt library. Full manual: https://docs.ccxt.com/

Conventions:
- Exchange ids are plain strings validated server-side — discover them with list_exchanges.
- Symbols are unified ccxt symbols ("BTC/USDT" spot, "BTC/USDT:USDT" swap) — resolve them with search_markets, never guess. On prediction exchanges (polymarket, kalshi, limitless, myriad, hyperliquid with prediction=true) the symbol position takes an outcome handle from search_events.
- Every exchange-touching tool accepts "params": extra exchange-specific parameters passed to ccxt unchanged. Discover supported keys and per-exchange behavior with describe_method.
- "since" accepts ms timestamps or ISO8601 strings; results carry both timestamp (ms) and datetime (ISO8601).
- List results are capped: search tools report meta.returned/offset/hasMore (or available); fetch tools report meta.count plus meta.hasMore when the count hit the limit — page with since/offset rather than assuming completeness. Host-oversized results are tail-trimmed and flagged meta.truncated.
- The long tail of read methods (funding rates, ledger, open interest, settlements, …) is available via call_read_method; raw exchange-specific GET endpoints via call_implicit_get.
- Private tools take an "account" name (list_accounts). API credentials live only in the local config — they are never tool parameters and never appear in results; capability tiers (trading, funds, implicitWrites) can only be enabled by the user editing the config file, never from the conversation.
- Which tools exist depends on configuration: with no account only market-data tools are present; read/trading/funds tools appear as their tiers are enabled. Call get_safety_status to see the configured accounts and enabled tiers before assuming a private tool exists.
- Write tools may return a preview with a confirmToken instead of executing — show the preview to the user, then repeat the identical call with "confirm" set to execute. get_safety_status shows what is currently enabled.`;
