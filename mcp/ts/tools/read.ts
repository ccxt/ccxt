import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { accountSummary } from '../types.js';
import { ok, project, ORDER_FIELDS, TRADE_FIELDS, POSITION_FIELDS } from '../format.js';
import { run, clampLimit, parseSince, accountParam, paramsParam, sinceParam, environmentMeta } from './common.js';

export function registerReadTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('list_accounts', {
        'title': 'List configured accounts',
        'description': 'Locally configured named exchange accounts. Returns aliases and capability flags only — credential values are never exposed by any tool.',
        'inputSchema': {},
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async () => run ({ 'tool': 'list_accounts' }, async () => {
        const accounts = Object.values (ctx.config.accounts).map ((account) => accountSummary (account as any));
        return ok (accounts, {
            'count': accounts.length,
            'notice': (accounts.length === 0) ? 'no accounts configured — add one to the ccxt-mcp config file (see get_safety_status for the path)' : undefined,
        });
    }));

    server.registerTool ('get_balance', {
        'title': 'Get account balance',
        'description': 'Balances for a named account. Returns non-zero balances by default (exchanges report every listed currency — hundreds of zero rows).',
        'inputSchema': {
            'account': accountParam,
            'nonzeroOnly': z.boolean ().optional ().describe ('default true; false returns every currency'),
            'marketType': z.string ().optional ().describe ('wallet/market type to query when the exchange has several (e.g. "spot", "swap", "future", "funding") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, nonzeroOnly, marketType, params }) => run ({ 'tool': 'get_balance', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const requestParams = { ...(params ?? {}) };
        if (marketType !== undefined) {
            requestParams['type'] = marketType;
        }
        const balance = await exchange.fetchBalance (requestParams);
        const skipKeys = new Set ([ 'info', 'free', 'used', 'total', 'timestamp', 'datetime', 'debt' ]);
        const currencies: Record<string, any> = {};
        let hidden = 0;
        for (const [ code, entry ] of Object.entries (balance)) {
            if (skipKeys.has (code) || entry === null || typeof entry !== 'object') {
                continue;
            }
            const row = entry as any;
            const isZero = !row.total && !row.free && !row.used;
            if (isZero && nonzeroOnly !== false) {
                hidden += 1;
                continue;
            }
            currencies[code] = { 'free': row.free, 'used': row.used, 'total': row.total };
        }
        return ok (currencies, {
            ...environmentMeta (account),
            'timestamp': balance.timestamp,
            'datetime': balance.datetime,
            'hiddenZeroBalances': hidden,
        });
    }));

    server.registerTool ('get_orders', {
        'title': 'Get orders',
        'description': 'Orders for a named account: one order by id, or a list filtered by status ("open" default, "closed", "canceled", "all"). Many exchanges require a symbol for list queries.',
        'inputSchema': {
            'account': accountParam,
            'id': z.string ().optional ().describe ('order id — fetches that single order'),
            'symbol': z.string ().optional ().describe ('unified symbol (required by many exchanges for list queries)'),
            'status': z.string ().optional ().describe ('"open" (default), "closed", "canceled" or "all"'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('max orders (default 50, max 200)'),
            'includeInfo': z.boolean ().optional ().describe ('include the raw exchange payload (single order only)'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, id, symbol, status, since, limit, includeInfo, params }) => run ({ 'tool': 'get_orders', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        if (id !== undefined) {
            const order = await exchange.fetchOrder (id, symbol, params ?? {});
            return ok (includeInfo === true ? order : project (order, ORDER_FIELDS), environmentMeta (account));
        }
        const statusValue = status ?? 'open';
        const methodByStatus: Record<string, string[]> = {
            'open': [ 'fetchOpenOrders' ],
            'closed': [ 'fetchClosedOrders', 'fetchCanceledAndClosedOrders' ],
            'canceled': [ 'fetchCanceledOrders', 'fetchCanceledAndClosedOrders' ],
            'all': [ 'fetchOrders' ],
        };
        const candidates = methodByStatus[statusValue];
        if (candidates === undefined) {
            return { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'unknown status ' + JSON.stringify (statusValue), 'retryable': false, 'hint': 'status must be one of: open, closed, canceled, all' } };
        }
        const method = candidates.find ((name) => exchange.has?.[name]);
        if (method === undefined) {
            const supported = Object.keys (methodByStatus).filter ((key) => methodByStatus[key].some ((name) => exchange.has?.[name]));
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' has no method for status "' + statusValue + '" order lists', 'retryable': false, 'hint': 'statuses this exchange supports: ' + supported.join (', ') } };
        }
        const orderLimit = clampLimit (limit, 50, 200);
        const orders = await exchange[method] (symbol, parseSince (exchange, since), orderLimit, params ?? {});
        // the combined fallback returns both statuses — filter so the payload matches
        // the status the caller asked for
        const filtered = (method === 'fetchCanceledAndClosedOrders' && statusValue !== 'all')
            ? orders.filter ((order: any) => order.status === statusValue)
            : orders;
        return ok (filtered.map ((order: any) => project (order, ORDER_FIELDS)), {
            ...environmentMeta (account),
            'status': statusValue,
            'count': filtered.length,
            'hasMore': orders.length >= orderLimit,
        });
    }));

    server.registerTool ('get_my_trades', {
        'title': 'Get account trade history',
        'description': "The account's own executed trades (fills). Many exchanges require a symbol.",
        'inputSchema': {
            'account': accountParam,
            'symbol': z.string ().optional ().describe ('unified symbol'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('max trades (default 50, max 200)'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, symbol, since, limit, params }) => run ({ 'tool': 'get_my_trades', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const tradeLimit = clampLimit (limit, 50, 200);
        const trades = await exchange.fetchMyTrades (symbol, parseSince (exchange, since), tradeLimit, params ?? {});
        return ok (trades.map ((trade: any) => project (trade, TRADE_FIELDS)), {
            ...environmentMeta (account),
            'count': trades.length,
            'hasMore': trades.length >= tradeLimit,
        });
    }));

    server.registerTool ('get_positions', {
        'title': 'Get open positions',
        'description': 'Open derivatives positions for a named account (prediction-market positions on prediction exchanges).',
        'inputSchema': {
            'account': accountParam,
            'symbols': z.array (z.string ()).optional ().describe ('restrict to these unified symbols'),
            'marketType': z.string ().optional ().describe ('derivatives type to query when the exchange has several (e.g. "swap", "future") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, symbols, marketType, params }) => run ({ 'tool': 'get_positions', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        if (!exchange.has?.['fetchPositions']) {
            return { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' has no fetchPositions (spot-only exchange?)', 'retryable': false, 'hint': 'use get_balance for spot holdings' } };
        }
        const requestParams = { ...(params ?? {}) };
        if (marketType !== undefined) {
            requestParams['type'] = marketType;
        }
        const positions = await exchange.fetchPositions (symbols, requestParams);
        const open = positions.filter ((position: any) => position !== undefined && position !== null);
        return ok (open.map ((position: any) => project (position, POSITION_FIELDS)), { ...environmentMeta (account), 'count': open.length });
    }));
}
