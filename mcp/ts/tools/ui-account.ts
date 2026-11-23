import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerContext } from '../types.js';
import { project } from '../format.js';
import { redact } from '../redact.js';
import { run, accountParam, paramsParam, sinceParam, environmentMeta } from './common.js';
import { loadBalance, loadOrderList, loadOpenPositions } from './read.js';
import { finite, compactMeta, uiResponder, viewToolMeta } from './ui.js';

// Account render tools: the read-tier counterparts of ./ui.ts. Each pairs one of the private
// fetches behind get_balance / get_orders / get_positions (the same functions, see ./read.ts)
// with a ui:// view. The view payload is the user's own account data and goes to the user's
// own host UI — which is the point — while the model reads totals and a few rows only. As
// with every show_* tool the payload is attached only for a host that renders it, passes the
// same redaction as text results, and never contains a raw exchange payload (`info`).

// preference order for the one currency a balance is valued in
const VALUATION_QUOTES = [ 'USDT', 'USD', 'USDC' ];
// one fetchTickers call prices the holdings; a long symbol list overflows the URL on some venues
const VALUATION_MAX_SYMBOLS = 40;
const SUMMARY_ROWS = 10;
const POSITION_SUMMARY_ROWS = 20;

const ORDER_SUMMARY_FIELDS = [ 'id', 'symbol', 'side', 'type', 'price', 'amount', 'filled', 'status' ];
const POSITION_SUMMARY_FIELDS = [ 'symbol', 'side', 'contracts', 'notional', 'entryPrice', 'markPrice', 'unrealizedPnl', 'leverage' ];

export interface BalanceRow {
    code: string;
    free?: number;
    used?: number;
    total?: number;
    price?: number;
    value?: number;
}

export interface Valuation {
    quote?: string; // absent when nothing was valued
    totalValue?: number;
    notice?: string;
}

// the amount a row is valued and ranked by: its total, or free + used when a venue omits it
function heldAmount (row: BalanceRow): number | undefined {
    if (finite (row.total)) {
        return row.total;
    }
    if (finite (row.free) || finite (row.used)) {
        return (finite (row.free) ? row.free : 0) + (finite (row.used) ? row.used : 0);
    }
    return undefined;
}

function tickerPrice (ticker: any): number | undefined {
    if (ticker === undefined || ticker === null) {
        return undefined;
    }
    if (finite (ticker.last)) {
        return ticker.last;
    }
    if (finite (ticker.close)) {
        return ticker.close;
    }
    return (finite (ticker.bid) && finite (ticker.ask)) ? (ticker.bid + ticker.ask) / 2 : undefined;
}

function descending (a: number | undefined, b: number | undefined): number {
    if (a === b) {
        return 0;
    }
    if (a === undefined) {
        return 1;
    }
    if (b === undefined) {
        return -1;
    }
    return b - a;
}

// largest holding first; rows that could not be valued follow, largest amount first — the
// code breaks ties so the order is the same on every call
export function sortBalanceRows (rows: BalanceRow[]): BalanceRow[] {
    return rows.sort ((a, b) => descending (a.value, b.value) || descending (heldAmount (a), heldAmount (b)) || ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0)));
}

// Best-effort valuation of the rows, in place, in ONE quote currency: the first of USDT / USD
// / USDC the exchange lists a market against for something held (or, failing that, one that
// is itself held). The quote is worth 1 of itself and everything else is priced by a single
// fetchTickers call. An exchange without fetchTickers is not valued at all — a ticker request
// per holding would turn one balance call into dozens. Nothing here may fail the tool: a
// balance without values is still the balance.
export async function valueBalances (exchange: any, rows: BalanceRow[]): Promise<Valuation> {
    if (rows.length === 0) {
        return {};
    }
    if (!exchange.has?.['fetchTickers']) {
        return { 'notice': 'holdings are not valued: ' + exchange.id + ' has no fetchTickers' };
    }
    const markets = exchange.markets ?? {};
    const priced = (quote: string) => rows.filter ((row) => row.code !== quote && markets[row.code + '/' + quote] !== undefined && markets[row.code + '/' + quote].active !== false);
    const quote = VALUATION_QUOTES.find ((candidate) => priced (candidate).length > 0) ?? VALUATION_QUOTES.find ((candidate) => rows.some ((row) => row.code === candidate));
    if (quote === undefined) {
        return { 'notice': 'holdings are not valued: ' + exchange.id + ' lists no ' + VALUATION_QUOTES.join ('/') + ' market for them' };
    }
    // the largest amounts are not necessarily the largest values, but the amounts are all
    // that is known before pricing — and 40 covers every ordinary account
    const candidates = priced (quote).sort ((a, b) => descending (heldAmount (a), heldAmount (b)));
    const chosen = candidates.slice (0, VALUATION_MAX_SYMBOLS);
    let tickers: Record<string, any> = {};
    if (chosen.length > 0) {
        try {
            tickers = (await exchange.fetchTickers (chosen.map ((row) => row.code + '/' + quote))) ?? {};
        } catch (e: any) {
            return { 'notice': 'holdings are not valued: fetching prices failed (' + redact (String (e?.message ?? e)).slice (0, 200) + ')' };
        }
    }
    let totalValue = 0;
    let unvalued = 0;
    for (const row of rows) {
        const amount = heldAmount (row);
        const price = (row.code === quote) ? 1 : tickerPrice (tickers[row.code + '/' + quote]);
        if (amount === undefined || price === undefined) {
            unvalued += 1;
            continue;
        }
        row.price = price;
        row.value = Number ((amount * price).toPrecision (12));
        totalValue += row.value;
    }
    return {
        quote,
        'totalValue': Number (totalValue.toPrecision (12)),
        'notice': (unvalued > 0) ? unvalued + ' of ' + rows.length + ' currencies could not be priced in ' + quote + ' and are not part of totalValue' : undefined,
    };
}

// newest first; orders without a timestamp keep their relative order at the end
export function sortOrdersNewestFirst (orders: any[]): any[] {
    return orders.map ((order, index) => ({ order, index }))
        .sort ((a, b) => descending (finite (a.order.timestamp) ? a.order.timestamp : undefined, finite (b.order.timestamp) ? b.order.timestamp : undefined) || (a.index - b.index))
        .map ((entry) => entry.order);
}

function countBy (rows: any[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const row of rows) {
        const key = row[field];
        if (typeof key === 'string' && key.length > 0) {
            counts[key] = (counts[key] ?? 0) + 1;
        }
    }
    return counts;
}

export function registerAccountUiTools (server: McpServer, ctx: ServerContext): void {
    const respond = uiResponder (server);

    server.registerTool ('show_balance', {
        'title': 'Show account balance',
        'description': 'Render an account\'s holdings as an interactive view: each currency with its free / in-orders / total amounts and, where the exchange allows it, an estimated value in one quote currency. Use this when the user asks to see their balance, portfolio or holdings. The tool result is a compact summary (total estimated value and the ten largest holdings) — use get_balance when you need every row.',
        'inputSchema': {
            'account': accountParam,
            'nonzeroOnly': z.boolean ().optional ().describe ('default true; false also shows currencies with a zero balance'),
            'marketType': z.string ().optional ().describe ('wallet/market type to query when the exchange has several (e.g. "spot", "swap", "future", "funding") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': viewToolMeta ('balance'),
    }, async ({ account: accountName, nonzeroOnly, marketType, params }) => run ({ 'tool': 'show_balance', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const { balance, currencies, hidden } = await loadBalance (exchange, { nonzeroOnly, marketType, params });
        const rows: BalanceRow[] = Object.entries (currencies).map (([ code, entry ]) => ({ code, 'free': entry.free, 'used': entry.used, 'total': entry.total }));
        let valuation: Valuation;
        try {
            valuation = await valueBalances (exchange, rows);
        } catch (e: any) {
            // valueBalances already contains its fetch; this is the guard for anything else
            // (an unexpected market or ticker shape) — the balance is still shown
            for (const row of rows) {
                delete row.price;
                delete row.value;
            }
            valuation = { 'notice': 'holdings are not valued: ' + redact (String (e?.message ?? e)).slice (0, 200) };
        }
        sortBalanceRows (rows);
        const env = environmentMeta (account);
        const top = rows.slice (0, SUMMARY_ROWS).map ((row) => project (row, [ 'code', 'free', 'used', 'total', 'value' ]));
        return respond ('get_balance', compactMeta ({
            'quote': valuation.quote,
            'totalValue': valuation.totalValue,
            'currencies': rows.length,
            'largest': top,
        }), {
            ...env,
            'timestamp': balance.timestamp ?? undefined,
            'datetime': balance.datetime ?? undefined,
            'hiddenZeroBalances': hidden,
            'omitted': (rows.length > top.length) ? rows.length - top.length : undefined,
        }, [ valuation.notice ], {
            'view': 'balance',
            'account': env['account'],
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            'environment': env['environment'],
            'timestamp': balance.timestamp ?? undefined,
            'datetime': balance.datetime ?? undefined,
            'balances': rows,
            'quote': valuation.quote,
            'totalValue': valuation.totalValue,
            'hiddenZeroBalances': hidden,
        });
    }));

    server.registerTool ('show_orders', {
        'title': 'Show orders',
        'description': 'Render an account\'s orders as an interactive list, filtered by status ("open" default, "closed", "canceled", "all"). Use this when the user asks to see their orders. Many exchanges require a symbol for order lists. The tool result is a compact summary (counts by side and status plus up to ten rows) — use get_orders when you need every order or a single order by id.',
        'inputSchema': {
            'account': accountParam,
            'symbol': z.string ().optional ().describe ('unified symbol (required by many exchanges for list queries)'),
            'status': z.string ().optional ().describe ('"open" (default), "closed", "canceled" or "all"'),
            'since': sinceParam,
            'limit': z.number ().int ().optional ().describe ('max orders (default 50, max 200)'),
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': viewToolMeta ('orders'),
    }, async ({ account: accountName, symbol, status, since, limit }) => run ({ 'tool': 'show_orders', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const list = await loadOrderList (exchange, { symbol, status, since, limit });
        if ('error' in list) {
            return list.error;
        }
        const orders = sortOrdersNewestFirst (list.orders);
        const env = environmentMeta (account);
        const top = orders.slice (0, SUMMARY_ROWS).map ((order) => project (order, ORDER_SUMMARY_FIELDS));
        return respond ('get_orders', {
            'count': orders.length,
            'bySide': countBy (orders, 'side'),
            'byStatus': countBy (orders, 'status'),
            'orders': top,
        }, {
            ...env,
            'status': list.status,
            symbol,
            'hasMore': list.hasMore,
            'omitted': (orders.length > top.length) ? orders.length - top.length : undefined,
        }, [], {
            'view': 'orders',
            'account': env['account'],
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            'environment': env['environment'],
            'status': list.status,
            symbol,
            orders,
            'hasMore': list.hasMore,
        });
    }));

    server.registerTool ('show_positions', {
        'title': 'Show open positions',
        'description': 'Render an account\'s open derivatives positions as an interactive view (size, entry and mark price, PnL, leverage, liquidation price). Use this when the user asks to see their positions. The tool result is a compact summary (count, total unrealized PnL when every position reports it, and the main fields per position) — use get_positions when you need every field.',
        'inputSchema': {
            'account': accountParam,
            'symbols': z.array (z.string ()).optional ().describe ('restrict to these unified symbols'),
            'marketType': z.string ().optional ().describe ('derivatives type to query when the exchange has several (e.g. "swap", "future") — overrides the account default'),
            'params': paramsParam,
        },
        'annotations': { 'readOnlyHint': true, 'openWorldHint': true },
        '_meta': viewToolMeta ('positions'),
    }, async ({ account: accountName, symbols, marketType, params }) => run ({ 'tool': 'show_positions', 'account': accountName, 'exchange': ctx.config.accounts[accountName]?.exchange }, async () => {
        const { exchange, account } = await ctx.pools.getAuthenticated (accountName);
        const list = await loadOpenPositions (exchange, { symbols, marketType, params });
        if ('error' in list) {
            return list.error;
        }
        const positions = list.positions;
        const env = environmentMeta (account);
        // a partial sum would read as the account's PnL while leaving positions out of it
        const pnlKnown = positions.length > 0 && positions.every ((position) => finite (position.unrealizedPnl));
        const top = positions.slice (0, POSITION_SUMMARY_ROWS).map ((position) => project (position, POSITION_SUMMARY_FIELDS));
        return respond ('get_positions', compactMeta ({
            'count': positions.length,
            'unrealizedPnl': pnlKnown ? Number (positions.reduce ((sum, position) => sum + position.unrealizedPnl, 0).toPrecision (12)) : undefined,
            'positions': top,
        }), {
            ...env,
            'omitted': (positions.length > top.length) ? positions.length - top.length : undefined,
        }, [], {
            'view': 'positions',
            'account': env['account'],
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            'environment': env['environment'],
            positions,
        });
    }));
}
