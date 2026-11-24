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

// The cash currencies a balance may be valued in, in order of preference when two of them
// value an account equally well: the dollar currencies first, then the other currencies ccxt
// venues quote their spot markets in (a KRW- or JPY-only venue lists no dollar market at all).
// Deliberately not "any quote currency": a portfolio valued in BTC is not what anyone asks for.
const VALUATION_QUOTES = [ 'USDT', 'USD', 'USDC', 'EUR', 'GBP', 'JPY', 'KRW', 'BRL', 'TRY', 'AUD', 'CAD', 'MXN', 'IDR', 'ZAR', 'INR', 'THB', 'PLN' ];
// The US dollar and the tokens issued to be redeemable for one. A venue does not always list
// a market between two of them, and leaving an account's cash out of its total is the larger
// error — so a holding of one is counted 1:1 in another, but ONLY when the venue lists no
// market between them in either direction (a listed one is always used: pegs do break), and
// never silently: the codes are named in the notice, in meta and in the view payload.
const DOLLAR_PAR = [ 'USD', 'USDT', 'USDC', 'FDUSD', 'DAI', 'TUSD', 'USDP', 'PYUSD' ];
// a longer symbol list overflows the request URL on some venues (binance sends it as a JSON
// array in the query string): past this many markets the whole ticker board is requested
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
    par?: boolean; // the price is the assumed 1:1 of DOLLAR_PAR, not a market price
}

export interface Valuation {
    quote?: string; // absent when nothing was valued
    totalValue?: number;
    unpriced?: number; // holdings that are not part of totalValue — it is a partial total then
    atPar?: string[]; // codes counted 1:1 with the quote without a market price (see DOLLAR_PAR)
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

// A price of zero (venues report last = 0 for a pair that has not traded), a negative or a
// non-finite one is not a valuation: the next source is tried and the holding is otherwise
// reported as unpriced, instead of being counted into the total at nothing.
function tickerPrice (ticker: any): number | undefined {
    if (ticker === undefined || ticker === null) {
        return undefined;
    }
    const positive = (value: any): value is number => finite (value) && value > 0;
    if (positive (ticker.last)) {
        return ticker.last;
    }
    if (positive (ticker.close)) {
        return ticker.close;
    }
    return (positive (ticker.bid) && positive (ticker.ask)) ? (ticker.bid + ticker.ask) / 2 : undefined;
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

// where the price of one holding comes from, for a given valuation currency
type PriceSource = { kind: 'quote' } | { kind: 'par' } | { kind: 'market'; symbol: string; inverse: boolean };

// Best-effort valuation of the rows, in place, in ONE cash currency.
//
// Which one is decided per account from what it holds and what the venue lists: the candidate
// that values the most holdings wins (a holding counts when it is the currency itself, has an
// active spot market against it in either direction — kraken lists USDT/USD, not USD/USDT —
// or is a dollar currency counted at par, see DOLLAR_PAR). Between equals the one the account
// actually holds wins, then the order of VALUATION_QUOTES. "The first one with any market"
// would value a USD account on a USD venue in USDT and drop its cash and every USD-only asset.
//
// Prices come from ONE fetchTickers call: by symbol list while that is short, the whole board
// past VALUATION_MAX_SYMBOLS — truncating the list would have to rank holdings before their
// prices are known, and ranking by unit amount drops exactly the valuable ones (0.5 BTC sorts
// below any dust position of more than half a unit). Nearly every ccxt venue returns the whole
// board for a call without symbols, and most fetch it even when symbols are given. An exchange
// without fetchTickers is not valued at all — a ticker request per holding would turn one
// balance call into dozens. Nothing here may fail the tool: a balance without values is still
// the balance.
export async function valueBalances (exchange: any, rows: BalanceRow[]): Promise<Valuation> {
    // a zero balance has nothing to value and must not steer the choice of currency (with
    // nonzeroOnly: false a venue lists hundreds of them); an unknown amount cannot be valued
    const held = rows.filter ((row) => heldAmount (row) !== 0);
    if (held.length === 0) {
        return {};
    }
    if (!exchange.has?.['fetchTickers']) {
        return { 'notice': 'holdings are not valued: ' + exchange.id + ' has no fetchTickers' };
    }
    const markets = exchange.markets ?? {};
    const listed = (symbol: string) => markets[symbol] !== undefined && markets[symbol] !== null && markets[symbol].active !== false;
    const sourceOf = (code: string, quote: string): PriceSource | undefined => {
        if (code === quote) {
            return { 'kind': 'quote' };
        }
        if (listed (code + '/' + quote)) {
            return { 'kind': 'market', 'symbol': code + '/' + quote, 'inverse': false };
        }
        if (listed (quote + '/' + code)) {
            return { 'kind': 'market', 'symbol': quote + '/' + code, 'inverse': true };
        }
        return (DOLLAR_PAR.includes (code) && DOLLAR_PAR.includes (quote)) ? { 'kind': 'par' } : undefined;
    };
    let quote: string | undefined = undefined;
    let best = 0;
    let bestHeld = false;
    for (const candidate of VALUATION_QUOTES) {
        const covered = held.filter ((row) => sourceOf (row.code, candidate) !== undefined).length;
        const isHeld = held.some ((row) => row.code === candidate);
        if (covered > best || (covered === best && covered > 0 && isHeld && !bestHeld)) {
            quote = candidate;
            best = covered;
            bestHeld = isHeld;
        }
    }
    if (quote === undefined) {
        return { 'notice': 'holdings are not valued: ' + exchange.id + ' lists no market for them against a currency they could be valued in (' + VALUATION_QUOTES.slice (0, 4).join (', ') + ', …)' };
    }
    const chosen = quote;
    const symbols: string[] = [];
    for (const row of held) {
        const source = sourceOf (row.code, chosen);
        if (source !== undefined && source.kind === 'market' && !symbols.includes (source.symbol)) {
            symbols.push (source.symbol);
        }
    }
    let tickers: Record<string, any> = {};
    if (symbols.length > 0) {
        try {
            if (symbols.length <= VALUATION_MAX_SYMBOLS) {
                tickers = (await exchange.fetchTickers (symbols)) ?? {};
            } else {
                // without symbols a venue with several market types answers for its default
                // one, and every market here is a spot market — say so when the instance
                // defaults elsewhere (params.type is how ccxt overrides defaultType per call)
                const defaultType = exchange.options?.['defaultType'];
                tickers = (await exchange.fetchTickers (undefined, (typeof defaultType === 'string' && defaultType !== 'spot') ? { 'type': 'spot' } : {})) ?? {};
            }
        } catch (e: any) {
            return { 'notice': 'holdings are not valued: fetching prices failed (' + redact (String (e?.message ?? e)).slice (0, 200) + ')' };
        }
    }
    let totalValue = 0;
    let unpriced = 0;
    const atPar: string[] = [];
    for (const row of held) {
        const amount = heldAmount (row);
        const source = sourceOf (row.code, chosen);
        let price: number | undefined = undefined;
        if (source !== undefined && source.kind === 'market') {
            const quoted = tickerPrice (tickers[source.symbol]);
            price = (quoted === undefined || !source.inverse) ? quoted : 1 / quoted;
        } else if (source !== undefined) {
            price = 1;
        }
        if (amount === undefined || price === undefined || !finite (price)) {
            unpriced += 1;
            continue;
        }
        row.price = (source!.kind === 'market') ? Number (price.toPrecision (12)) : price;
        row.value = Number ((amount * price).toPrecision (12));
        if (source!.kind === 'par') {
            row.par = true;
            atPar.push (row.code);
        }
        totalValue += row.value;
    }
    const notices = [
        (unpriced > 0) ? unpriced + ' of ' + held.length + ' currencies could not be priced in ' + chosen + ' and are not part of totalValue, which is therefore a partial total' : undefined,
        (atPar.length > 0) ? atPar.join (', ') + ' ' + ((atPar.length === 1) ? 'is' : 'are') + ' counted 1:1 with ' + chosen + ': ' + exchange.id + ' lists no market between them, and both are US-dollar currencies — an assumption, not a market price' : undefined,
    ].filter ((entry) => entry !== undefined);
    return compactMeta ({
        'quote': chosen,
        'totalValue': Number (totalValue.toPrecision (12)),
        'unpriced': (unpriced > 0) ? unpriced : undefined,
        'atPar': (atPar.length > 0) ? atPar : undefined,
        'notice': (notices.length > 0) ? notices.join ('; ') : undefined,
    });
}

// The currency a position's PnL is denominated in: the market's settle currency, or its quote
// where it names none (a spot-margin position). A position on a market this instance did not
// load is read from the unified symbol itself, BASE/QUOTE:SETTLE[-EXPIRY].
export function pnlCurrency (exchange: any, symbol: any): string | undefined {
    const market = (typeof symbol === 'string') ? exchange?.markets?.[symbol] : undefined;
    for (const code of [ market?.settle, market?.quote ]) {
        if (typeof code === 'string' && code.length > 0) {
            return code;
        }
    }
    const codes = /^[^\/:\s]+\/([^\/:\s]+)(?::([^\-:\s]+))?/.exec (String (symbol ?? '')) ?? [];
    return codes[2] ?? codes[1];
}

export interface PnlTotal {
    currency?: string; // absent for positions whose currency could not be told
    positions: number;
    unrealizedPnl?: number; // absent when a position of this currency reports none
}

// Unrealized PnL adds up only within one currency: 150 USDT and -0.02 BTC are not 149.98 of
// anything. One entry per currency, in order of first appearance; a currency in which some
// position reports no PnL gets no figure — a partial sum would read as the total.
export function pnlTotals (exchange: any, positions: any[]): PnlTotal[] {
    const groups = new Map<string, { total: PnlTotal; sum: number; known: boolean }> ();
    for (const position of positions) {
        const currency = pnlCurrency (exchange, position?.symbol);
        const key = currency ?? '';
        let group = groups.get (key);
        if (group === undefined) {
            group = { 'total': (currency === undefined) ? { 'positions': 0 } : { currency, 'positions': 0 }, 'sum': 0, 'known': currency !== undefined };
            groups.set (key, group);
        }
        group.total.positions += 1;
        if (finite (position?.unrealizedPnl)) {
            group.sum += position.unrealizedPnl;
        } else {
            group.known = false;
        }
    }
    return [ ...groups.values () ].map ((group) => (group.known ? { ...group.total, 'unrealizedPnl': Number (group.sum.toPrecision (12)) } : group.total));
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
        'description': 'Render an account\'s holdings as an interactive view: free / in-orders / total per currency and, where the exchange allows, an estimated value in one cash currency (the one that prices the most holdings). Use when the user asks to see their balance, portfolio or holdings. The result is a compact summary (total estimated value, ten largest holdings) — get_balance returns every row. totalValue is an estimate: meta.totalValuePartial / meta.unpricedCurrencies flag holdings missing from it, meta.valuedAtPar those counted 1:1.',
        'inputSchema': {
            'account': accountParam,
            'nonzeroOnly': z.boolean ().optional ().describe ('default true; false also shows currencies with a zero balance'),
            'marketType': z.string ().optional ().describe ('wallet/market type when the exchange has several ("spot", "swap", "future", "funding") — overrides the account default'),
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
                delete row.par;
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
            // totalValue leaves holdings out: the model must not report it as the account's worth
            'totalValuePartial': (valuation.unpriced !== undefined) ? true : undefined,
            'unpricedCurrencies': valuation.unpriced,
            'valuedAtPar': valuation.atPar,
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
            'unpricedCurrencies': valuation.unpriced,
            'valuedAtPar': valuation.atPar,
            'hiddenZeroBalances': hidden,
        });
    }));

    server.registerTool ('show_orders', {
        'title': 'Show orders',
        'description': 'Render an account\'s orders as an interactive list, by status. Use when the user asks to see their orders. Many exchanges require a symbol. The result is a compact summary (counts by side and status, up to ten rows) — get_orders returns every order, or one by id.',
        'inputSchema': {
            'account': accountParam,
            'symbol': z.string ().optional ().describe ('unified symbol (many exchanges require it for lists)'),
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
        'description': 'Render an account\'s open derivatives positions as an interactive view (size, entry and mark price, PnL, leverage, liquidation price). Use when the user asks to see their positions. The result is a compact summary (count, main fields per position, unrealized PnL per settle currency — never added across currencies) — get_positions returns every field.',
        'inputSchema': {
            'account': accountParam,
            'symbols': z.array (z.string ()).optional ().describe ('restrict to these unified symbols'),
            'marketType': z.string ().optional ().describe ('derivatives type when the exchange has several ("swap", "future") — overrides the account default'),
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
        // PnL is totalled per settle currency (see pnlTotals): one figure with its currency
        // when the account has a single one, a map when it has several, and nothing for a
        // currency in which a position reports no PnL
        const totals = pnlTotals (exchange, positions);
        const complete = totals.filter ((total) => total.currency !== undefined && total.unrealizedPnl !== undefined);
        const single = (totals.length === 1 && complete.length === 1) ? complete[0] : undefined;
        const missing = totals.filter ((total) => total.unrealizedPnl === undefined);
        const pnlNotices = [
            (totals.length > 1) ? 'positions settle in ' + totals.length + ' currencies (' + totals.map ((total) => total.currency ?? 'unknown').join (', ') + '): unrealized PnL is totalled per currency in unrealizedPnlByCurrency and must not be added across them' : undefined,
            (missing.length > 0) ? 'no unrealized PnL total for ' + missing.map ((total) => total.currency ?? 'positions of unknown currency').join (', ') + ': not every position reports it' : undefined,
        ];
        const top = positions.slice (0, POSITION_SUMMARY_ROWS).map ((position) => project (position, POSITION_SUMMARY_FIELDS));
        return respond ('get_positions', compactMeta ({
            'count': positions.length,
            'unrealizedPnl': single?.unrealizedPnl,
            'unrealizedPnlCurrency': single?.currency,
            'unrealizedPnlByCurrency': (totals.length > 1 && complete.length > 0) ? Object.fromEntries (complete.map ((total) => [ total.currency, total.unrealizedPnl ])) : undefined,
            'positions': top,
        }), {
            ...env,
            'omitted': (positions.length > top.length) ? positions.length - top.length : undefined,
        }, pnlNotices, {
            'view': 'positions',
            'account': env['account'],
            'exchange': exchange.id,
            'exchangeName': exchange.name ?? exchange.id,
            'environment': env['environment'],
            positions,
            'pnlTotals': totals,
        });
    }));
}
