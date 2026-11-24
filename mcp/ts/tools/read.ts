import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { accountSummary } from '../types.js';
import { ok, project, ORDER_FIELDS, TRADE_FIELDS, POSITION_FIELDS, type Envelope } from '../format.js';
import { run, clampLimit, parseSince, accountParam, paramsParam, sinceParam, environmentMeta } from './common.js';

// The fetch-and-shape halves of get_balance / get_orders / get_positions. The show_* render
// tools (./ui-account.ts) call the same functions, so a data tool and the view that draws the
// same account can never disagree about which rows exist or how they are projected.

export interface BalanceQuery {
    nonzeroOnly?: boolean;
    marketType?: string;
    params?: Record<string, any>;
}

export interface BalanceRows {
    balance: any; // the raw ccxt balance — only its timestamp/datetime are used by callers
    currencies: Record<string, { free: any, used: any, total: any }>;
    hidden: number; // zero rows left out because nonzeroOnly was not false
}

export async function loadBalance (exchange: any, query: BalanceQuery): Promise<BalanceRows> {
    const requestParams = { ...(query.params ?? {}) };
    if (query.marketType !== undefined) {
        requestParams['type'] = query.marketType;
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
        if (isZero && query.nonzeroOnly !== false) {
            hidden += 1;
            continue;
        }
        currencies[code] = { 'free': row.free, 'used': row.used, 'total': row.total };
    }
    return { balance, currencies, hidden };
}

export interface OrderListQuery {
    symbol?: string;
    status?: string;
    since?: number | string;
    limit?: number;
    params?: Record<string, any>;
}

export type OrderList = { status: string, orders: any[], hasMore: boolean } | { error: Envelope };

export async function loadOrderList (exchange: any, query: OrderListQuery): Promise<OrderList> {
    const statusValue = query.status ?? 'open';
    const methodByStatus: Record<string, string[]> = {
        'open': [ 'fetchOpenOrders' ],
        'closed': [ 'fetchClosedOrders', 'fetchCanceledAndClosedOrders' ],
        'canceled': [ 'fetchCanceledOrders', 'fetchCanceledAndClosedOrders' ],
        'all': [ 'fetchOrders' ],
    };
    const candidates = methodByStatus[statusValue];
    if (candidates === undefined) {
        return { 'error': { 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': 'unknown status ' + JSON.stringify (statusValue), 'retryable': false, 'hint': 'status must be one of: open, closed, canceled, all' } } };
    }
    const method = candidates.find ((name) => exchange.has?.[name]);
    if (method === undefined) {
        const supported = Object.keys (methodByStatus).filter ((key) => methodByStatus[key].some ((name) => exchange.has?.[name]));
        return { 'error': { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' has no method for status "' + statusValue + '" order lists', 'retryable': false, 'hint': 'statuses this exchange supports: ' + supported.join (', ') } } };
    }
    const orderLimit = clampLimit (query.limit, 50, 200);
    const orders = await exchange[method] (query.symbol, parseSince (exchange, query.since), orderLimit, query.params ?? {});
    // the combined fallback returns both statuses — filter so the payload matches
    // the status the caller asked for
    const filtered = (method === 'fetchCanceledAndClosedOrders' && statusValue !== 'all')
        ? orders.filter ((order: any) => order.status === statusValue)
        : orders;
    return {
        'status': statusValue,
        'orders': filtered.map ((order: any) => project (order, ORDER_FIELDS)),
        'hasMore': orders.length >= orderLimit,
    };
}

export interface PositionQuery {
    symbols?: string[];
    marketType?: string;
    params?: Record<string, any>;
}

export type PositionList = { positions: any[] } | { error: Envelope };

export async function loadOpenPositions (exchange: any, query: PositionQuery): Promise<PositionList> {
    if (!exchange.has?.['fetchPositions']) {
        return { 'error': { 'ok': false, 'error': { 'code': 'NOT_SUPPORTED', 'message': exchange.id + ' has no fetchPositions (spot-only exchange?)', 'retryable': false, 'hint': 'use get_balance for spot holdings' } } };
    }
    const requestParams = { ...(query.params ?? {}) };
    if (query.marketType !== undefined) {
        requestParams['type'] = query.marketType;
    }
    const positions = await exchange.fetchPositions (query.symbols, requestParams);
    const open = positions.filter ((position: any) => {
        if (position === undefined || position === null) {
            return false;
        }
        const contracts = position.contracts;
        if (contracts !== undefined && contracts !== null) {
            return Number (contracts) !== 0;
        }
        const notional = position.notional;
        if (notional !== undefined && notional !== null) {
            return Number (notional) !== 0;
        }
        // some exchanges omit "contracts"/"notional" for open positions; keep them rather than guessing
        return true;
    });
    return { 'positions': open.map ((position: any) => project (position, POSITION_FIELDS)) };
}

export function registerReadTools (server: McpServer, ctx: ServerContext): void {
    server.registerTool ('list_accounts', {
        'title': 'List configured accounts',
        'description': 'Configured exchange accounts: names and capability flags only — credential values are never exposed by any tool.',
        'inputSchema': {},
        'annotations': { 'readOnlyHint': true, 'idempotentHint': true, 'openWorldHint': false },
    }, async () => run ({ 'tool': 'list_accounts' }, async () => {
        const accounts = Object.values (ctx.config.accounts).map ((account) => accountSummary (account as any));
        return ok (accounts, {
            'count': accounts.length,
            'notice': (accounts.length === 0) ? 'no accounts configured — call setup_account to open the local setup form where the user adds one (alternative: the user adds it to the ccxt-mcp config file and restarts the server; get_safety_status shows the path)' : undefined,
        });
    }));

    server.registerTool ('get_balance', {
        'title': 'Get account balance',
        'description': 'Balances of an account — non-zero ones by default (exchanges report hundreds of zero rows).',
        'inputSchema': {
            'account': accountParam,
            'nonzeroOnly': z.boolean ().optional ().describe ('default true; false returns every currency'),
            'marketType': z.string ().optional ().describe ('wallet/market type when the exchange has several ("spot", "swap", "future", "funding") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, nonzeroOnly, marketType, params }) => run ({ 'tool': 'get_balance', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const { balance, currencies, hidden } = await loadBalance (exchange, { nonzeroOnly, marketType, params });
        return ok (currencies, {
            ...environmentMeta (account),
            'timestamp': balance.timestamp,
            'datetime': balance.datetime,
            'hiddenZeroBalances': hidden,
        });
    }));

    server.registerTool ('get_orders', {
        'title': 'Get orders',
        'description': 'An account\'s orders: one by id, or a list by status. Many exchanges require a symbol for lists.',
        'inputSchema': {
            'account': accountParam,
            'id': z.string ().optional ().describe ('order id — fetches that one order'),
            'symbol': z.string ().optional ().describe ('unified symbol (many exchanges require it for lists)'),
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
        const list = await loadOrderList (exchange, { symbol, status, since, limit, params });
        if ('error' in list) {
            return list.error;
        }
        return ok (list.orders, {
            ...environmentMeta (account),
            'status': list.status,
            'count': list.orders.length,
            'hasMore': list.hasMore,
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
            'marketType': z.string ().optional ().describe ('derivatives type when the exchange has several ("swap", "future") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
    }, async ({ account: accountName, symbols, marketType, params }) => run ({ 'tool': 'get_positions', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const list = await loadOpenPositions (exchange, { symbols, marketType, params });
        if ('error' in list) {
            return list.error;
        }
        return ok (list.positions, { ...environmentMeta (account), 'count': list.positions.length });
    }));
}
