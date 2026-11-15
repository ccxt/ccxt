// Paper broker for the CCXT MCP arena.
//
// A small MCP server (Streamable HTTP) that gives an agent a trading account with
// fake money but real prices: market orders walk the venue's live order book via
// CCXT, limit and trigger orders are checked against live tickers, perps pay real
// funding and get liquidated. Market data for research comes from the real
// ccxt-mcp server; this process only holds the account.
//
//   node paper-broker.mjs --port 7801 --dir runs/<run>/<agent> --start <ms> --minutes 60

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import ccxt from 'ccxt';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// ---------------------------------------------------------------- config

const args = Object.fromEntries (process.argv.slice (2).reduce ((acc, a, i, all) => {
    if (a.startsWith ('--')) {
        acc.push ([ a.slice (2), all[i + 1] ]);
    }
    return acc;
}, []));

const PORT = Number (args.port ?? 7801);
const DIR = args.dir ?? 'runs/dev';
const START = Number (args.start ?? Date.now ());
const MINUTES = Number (args.minutes ?? 60);
const END = START + MINUTES * 60_000;
const START_VENUE = args.venue ?? 'okx';
const START_CASH = Number (args.cash ?? 100);

const VENUES = [ 'okx', 'bitget', 'gate', 'kucoin', 'hyperliquid' ];
const CASH = [ 'USDT', 'USDC' ]; // treated as one cash balance ("USD") per venue
const TRANSFER_FEE = 1; // USD
const TRANSFER_MINUTES = 5;
const MAINTENANCE = 0.005; // 0.5% of notional
const MAX_LEVERAGE = 50;

fs.mkdirSync (DIR, { recursive: true });
const STATE_FILE = path.join (DIR, 'state.json');
const EVENTS_FILE = path.join (DIR, 'events.jsonl');
const EQUITY_FILE = path.join (DIR, 'equity.csv');

// ---------------------------------------------------------------- state

const fresh = () => ({
    'start': START,
    'end': END,
    'cash': Object.fromEntries (VENUES.map ((v) => [ v, v === START_VENUE ? START_CASH : 0 ])),
    'spot': Object.fromEntries (VENUES.map ((v) => [ v, {} ])), // venue -> base -> amount
    'positions': [], // { venue, symbol, size (signed, base units), entry, leverage, nextFunding }
    'orders': [], // open limit/trigger orders
    'transfers': [], // pending
    'fills': [],
    'seq': 0,
    'stats': { 'orders': 0, 'fees': 0, 'funding': 0, 'liquidations': 0, 'transfers': 0 },
});

let state = fs.existsSync (STATE_FILE) ? JSON.parse (fs.readFileSync (STATE_FILE, 'utf8')) : fresh ();

const save = () => fs.writeFileSync (STATE_FILE, JSON.stringify (state, null, 1));
const log = (type, data) => fs.appendFileSync (EVENTS_FILE, JSON.stringify ({ ...data, 't': Date.now (), type }) + '\n');
const r = (x, d = 4) => (x === undefined || x === null) ? x : Number (Number (x).toFixed (d));
const minutesLeft = () => Math.max (0, r ((END - Date.now ()) / 60_000, 1));
const isOver = () => Date.now () >= END;

// ---------------------------------------------------------------- exchanges

const exchanges = {};
const getExchange = async (venue) => {
    if (VENUES.indexOf (venue) === -1) {
        throw new Error ('venue ' + venue + ' is not available to this account; use one of ' + VENUES.join (', '));
    }
    if (!exchanges[venue]) {
        const ex = new ccxt[venue] ({ 'enableRateLimit': true });
        exchanges[venue] = ex;
        ex._loading = ex.loadMarkets ();
    }
    await exchanges[venue]._loading;
    return exchanges[venue];
};

const getMarket = async (venue, symbol) => {
    const ex = await getExchange (venue);
    const m = ex.markets[symbol];
    if (!m) {
        throw new Error ('unknown symbol ' + symbol + ' on ' + venue + ' (use unified CCXT symbols, e.g. BTC/USDT or BTC/USDT:USDT; search with the ccxt search_markets tool)');
    }
    if (!m.active && m.active !== undefined) {
        throw new Error (symbol + ' is not active on ' + venue);
    }
    if (m.spot) {
        if (CASH.indexOf (m.quote) === -1) {
            throw new Error ('only USDT/USDC-quoted spot markets are supported');
        }
        if (CASH.indexOf (m.base) !== -1) {
            throw new Error ('stablecoin-to-stablecoin pairs are not supported');
        }
    } else if (m.swap && m.linear) {
        if (CASH.indexOf (m.settle) === -1) {
            throw new Error ('only USDT/USDC-settled perpetuals are supported');
        }
    } else {
        throw new Error ('only spot and linear perpetual (swap) markets are supported');
    }
    return { ex, m };
};

const tickerCache = {};
const getTicker = async (venue, symbol) => {
    const key = venue + ' ' + symbol;
    const hit = tickerCache[key];
    if (hit && Date.now () - hit.t < 3000) {
        return hit.v;
    }
    const ex = await getExchange (venue);
    const t = await ex.fetchTicker (symbol);
    let bid = t.bid;
    let ask = t.ask;
    if (!bid || !ask) {
        const ob = await ex.fetchOrderBook (symbol, 5);
        bid = ob.bids[0]?.[0];
        ask = ob.asks[0]?.[0];
    }
    const v = { bid, ask, last: t.last ?? (bid + ask) / 2, mid: (bid + ask) / 2 };
    tickerCache[key] = { 't': Date.now (), v };
    return v;
};

// walk the live book; returns { filled (base), cost (quote), avg }
const walkBook = async (venue, m, side, amount, cost, limitPrice) => {
    const ex = await getExchange (venue);
    const ob = await ex.fetchOrderBook (m.symbol, 100);
    const levels = side === 'buy' ? ob.asks : ob.bids;
    const cs = m.contract ? (m.contractSize ?? 1) : 1;
    let filled = 0;
    let spent = 0;
    for (const [ price, qty ] of levels) {
        if (limitPrice !== undefined && ((side === 'buy' && price > limitPrice) || (side === 'sell' && price < limitPrice))) {
            break;
        }
        let take = qty * cs;
        if (amount !== undefined) {
            take = Math.min (take, amount - filled);
        } else {
            take = Math.min (take, (cost - spent) / price);
        }
        if (take <= 0) {
            break;
        }
        filled += take;
        spent += take * price;
        if ((amount !== undefined && filled >= amount - 1e-12) || (cost !== undefined && spent >= cost - 1e-9)) {
            break;
        }
    }
    return { filled, 'cost': spent, 'avg': filled > 0 ? spent / filled : undefined };
};

const roundAmount = (ex, m, base) => {
    const cs = m.contract ? (m.contractSize ?? 1) : 1;
    try {
        const units = Number (ex.amountToPrecision (m.symbol, base / cs));
        return units * cs;
    } catch (e) {
        return 0;
    }
};

// ---------------------------------------------------------------- accounting

const position = (venue, symbol) => state.positions.find ((p) => p.venue === venue && p.symbol === symbol);

const venueMargin = async (venue) => {
    let used = 0;
    let upnl = 0;
    let notional = 0;
    for (const p of state.positions.filter ((x) => x.venue === venue)) {
        const t = await getTicker (venue, p.symbol);
        used += Math.abs (p.size) * p.entry / p.leverage;
        upnl += p.size * (t.mid - p.entry);
        notional += Math.abs (p.size) * t.mid;
    }
    let reserved = 0;
    for (const o of state.orders.filter ((x) => x.venue === venue && !x.reduceOnly)) {
        const px = o.price ?? o.triggerPrice;
        if (o.market === 'spot') {
            if (o.side === 'buy') {
                reserved += o.amount * px;
            }
        } else {
            reserved += o.amount * px / o.leverage;
        }
    }
    const cash = state.cash[venue];
    return { cash, used, upnl, notional, reserved, 'available': cash + Math.min (0, upnl) - used - reserved };
};

const snapshot = async () => {
    const venues = {};
    let equity = 0;
    for (const v of VENUES) {
        const mg = await venueMargin (v);
        let spotValue = 0;
        const spot = [];
        for (const [ base, amt ] of Object.entries (state.spot[v])) {
            if (amt <= 1e-12) {
                continue;
            }
            const ex = await getExchange (v);
            const sym = ex.markets[base + '/USDT'] ? base + '/USDT' : base + '/USDC';
            const t = await getTicker (v, sym);
            spotValue += amt * t.bid;
            spot.push ({ 'asset': base, 'amount': r (amt, 8), 'valueUsd': r (amt * t.bid, 2) });
        }
        const venueEquity = mg.cash + mg.upnl + spotValue;
        equity += venueEquity;
        const inbound = state.transfers.filter ((t) => t.to === v).reduce ((a, t) => a + t.amount, 0);
        equity += inbound;
        if (venueEquity > 1e-9 || state.positions.some ((p) => p.venue === v) || inbound > 0) {
            venues[v] = {
                'cashUsd': r (mg.cash, 2),
                'availableUsd': r (mg.available, 2),
                'spot': spot,
                'perpMarginUsedUsd': r (mg.used, 2),
                'unrealizedPnlUsd': r (mg.upnl, 2),
                'equityUsd': r (venueEquity, 2),
                'incomingTransferUsd': inbound || undefined,
            };
        }
    }
    const positions = [];
    for (const p of state.positions) {
        const t = await getTicker (p.venue, p.symbol);
        positions.push ({
            'venue': p.venue, 'symbol': p.symbol, 'side': p.size > 0 ? 'long' : 'short',
            'size': r (Math.abs (p.size), 8), 'entry': r (p.entry, 6), 'mark': r (t.mid, 6), 'leverage': p.leverage,
            'notionalUsd': r (Math.abs (p.size) * t.mid, 2), 'unrealizedPnlUsd': r (p.size * (t.mid - p.entry), 2),
        });
    }
    return {
        'equityUsd': r (equity, 2),
        'pnlUsd': r (equity - START_CASH, 2),
        'minutesLeft': minutesLeft (),
        venues,
        positions,
        'openOrders': state.orders.map ((o) => ({ ...o, 'triggerFrom': undefined })),
        'pendingTransfers': state.transfers.map ((t) => ({ ...t, 'arrivesInMinutes': r ((t.arrives - Date.now ()) / 60_000, 1) })),
    };
};

// apply a fill to balances / positions
const applyFill = (o, m, filled, avg, feeRate, reason) => {
    const notional = filled * avg;
    const fee = notional * feeRate;
    const venue = o.venue;
    state.stats.fees += fee;
    let realized = 0;
    if (m.spot) {
        if (o.side === 'buy') {
            state.cash[venue] -= notional + fee;
            state.spot[venue][m.base] = (state.spot[venue][m.base] ?? 0) + filled;
        } else {
            state.cash[venue] += notional - fee;
            state.spot[venue][m.base] = (state.spot[venue][m.base] ?? 0) - filled;
        }
    } else {
        state.cash[venue] -= fee;
        const signed = o.side === 'buy' ? filled : -filled;
        let p = position (venue, m.symbol);
        if (!p) {
            p = { venue, 'symbol': m.symbol, 'size': 0, 'entry': avg, 'leverage': o.leverage, 'nextFunding': undefined };
            state.positions.push (p);
        }
        if (o.leverage) {
            p.leverage = o.leverage;
        }
        if (p.size === 0 || Math.sign (p.size) === Math.sign (signed)) {
            p.entry = (Math.abs (p.size) * p.entry + filled * avg) / (Math.abs (p.size) + filled);
            p.size += signed;
        } else {
            const closing = Math.min (Math.abs (p.size), filled);
            realized = closing * (avg - p.entry) * Math.sign (p.size);
            state.cash[venue] += realized;
            const rest = filled - closing;
            p.size += signed;
            if (Math.abs (p.size) < 1e-12) {
                p.size = 0;
            } else if (rest > 1e-12) {
                p.entry = avg; // flipped
            }
        }
        state.positions = state.positions.filter ((x) => Math.abs (x.size) > 1e-12);
    }
    const fill = {
        'id': o.id, 'venue': venue, 'symbol': m.symbol, 'side': o.side, 'amount': r (filled, 8), 'price': r (avg, 8),
        'feeUsd': r (fee, 4), 'realizedPnlUsd': m.spot ? undefined : r (realized, 4), reason, 't': new Date ().toISOString (),
    };
    state.fills.push (fill);
    log ('fill', fill);
    return fill;
};

// ---------------------------------------------------------------- order logic

const validateAndSize = async (o) => {
    const { ex, m } = await getMarket (o.venue, o.symbol);
    o.market = m.spot ? 'spot' : 'swap';
    if (m.spot) {
        if (o.leverage && o.leverage !== 1) {
            throw new Error ('leverage is only available on perpetual (swap) markets, e.g. BTC/USDT:USDT');
        }
        o.leverage = 1;
        if (o.reduceOnly) {
            throw new Error ('reduceOnly only applies to perpetuals');
        }
    } else {
        const maxLev = Math.min (MAX_LEVERAGE, m.limits?.leverage?.max ?? MAX_LEVERAGE);
        const p = position (o.venue, o.symbol);
        o.leverage = o.leverage ?? p?.leverage ?? 1;
        if (o.leverage < 1 || o.leverage > maxLev) {
            throw new Error ('leverage must be between 1 and ' + maxLev + ' for ' + o.symbol + ' on ' + o.venue);
        }
    }
    return { ex, m };
};

const execMarket = async (o, m, reason) => {
    const venue = o.venue;
    // size checks against what the account actually has
    let amount = o.amount;
    let cost = o.cost;
    if (m.spot && o.side === 'sell') {
        const have = state.spot[venue][m.base] ?? 0;
        if (amount > have + 1e-9) {
            throw new Error ('insufficient ' + m.base + ' on ' + venue + ': have ' + r (have, 8));
        }
        amount = Math.min (amount, have);
    }
    if (o.reduceOnly) {
        const p = position (venue, m.symbol);
        if (!p || (o.side === 'buy' && p.size > 0) || (o.side === 'sell' && p.size < 0)) {
            throw new Error ('reduceOnly order would not reduce a position');
        }
        amount = Math.min (amount ?? Infinity, Math.abs (p.size));
        cost = undefined;
    }
    const res = await walkBook (venue, m, o.side, amount, cost, o.price);
    if (cost !== undefined && res.filled > 0) {
        // a cost-based order still has to be a valid order size on the exchange
        const ex = await getExchange (venue);
        const rounded = roundAmount (ex, m, res.filled);
        res.cost = res.cost * rounded / res.filled;
        res.filled = rounded;
    }
    if (res.filled <= 0) {
        throw new Error ('nothing fillable: order too small for the market lot size, or no liquidity at that price');
    }
    // margin / cash check
    const mg = await venueMargin (venue);
    const feeRate = m.taker ?? 0.001;
    let need = 0;
    if (m.spot && o.side === 'buy') {
        need = res.cost * (1 + feeRate);
    } else if (!m.spot && !o.reduceOnly) {
        const p = position (venue, m.symbol);
        const signed = o.side === 'buy' ? res.filled : -res.filled;
        const after = Math.abs ((p?.size ?? 0) + signed);
        const before = Math.abs (p?.size ?? 0);
        if (after > before) {
            need = (after - before) * res.avg / o.leverage + res.cost * feeRate;
        }
    }
    if (need > 0 && need > mg.available + 1e-6) {
        throw new Error ('insufficient funds on ' + venue + ': need ~' + r (need, 2) + ' USD, available ' + r (mg.available, 2) + ' USD');
    }
    return applyFill ({ ...o, 'amount': res.filled }, m, res.filled, res.avg, feeRate, reason);
};

// background: limit + trigger orders, transfers, funding, liquidations, equity curve
let ticking = false;
const tick = async () => {
    if (ticking) {
        return;
    }
    ticking = true;
    try {
        const now = Date.now ();
        // transfers
        for (const t of state.transfers.filter ((x) => x.arrives <= now)) {
            state.cash[t.to] += t.amount;
            log ('transfer_arrived', t);
        }
        state.transfers = state.transfers.filter ((x) => x.arrives > now);
        // orders
        for (const o of [ ...state.orders ]) {
            try {
                const { m } = await getMarket (o.venue, o.symbol);
                const t = await getTicker (o.venue, o.symbol);
                if (o.triggerPrice !== undefined && !o.triggered) {
                    const crossed = o.triggerFrom === 'below' ? t.last >= o.triggerPrice : t.last <= o.triggerPrice;
                    if (!crossed) {
                        continue;
                    }
                    o.triggered = true;
                    log ('triggered', { 'id': o.id, 'last': t.last });
                    if (o.price === undefined) {
                        state.orders = state.orders.filter ((x) => x.id !== o.id);
                        try {
                            await execMarket (o, m, 'trigger');
                        } catch (e) {
                            log ('trigger_failed', { 'id': o.id, 'error': e.message });
                        }
                        continue;
                    }
                }
                // resting limit
                const touch = o.side === 'buy' ? t.ask <= o.price : t.bid >= o.price;
                if (touch) {
                    state.orders = state.orders.filter ((x) => x.id !== o.id);
                    try {
                        if (o.reduceOnly) {
                            const p = position (o.venue, o.symbol);
                            if (!p) {
                                throw new Error ('position already closed');
                            }
                            o.amount = Math.min (o.amount, Math.abs (p.size));
                        }
                        if (m.spot && o.side === 'sell') {
                            o.amount = Math.min (o.amount, state.spot[o.venue][m.base] ?? 0);
                            if (o.amount <= 0) {
                                throw new Error ('no balance left to sell');
                            }
                        }
                        applyFill (o, m, o.amount, o.price, m.maker ?? 0.001, 'limit');
                    } catch (e) {
                        log ('limit_failed', { 'id': o.id, 'error': e.message });
                    }
                }
            } catch (e) {
                log ('tick_error', { 'id': o.id, 'error': e.message });
            }
        }
        // funding + liquidation
        for (const v of VENUES) {
            const ps = state.positions.filter ((p) => p.venue === v);
            if (ps.length === 0) {
                continue;
            }
            const ex = await getExchange (v);
            for (const p of ps) {
                try {
                    if (!p.nextFunding || now >= p.nextFunding) {
                        const fr = await ex.fetchFundingRate (p.symbol);
                        if (p.nextFunding && now >= p.nextFunding && fr.fundingRate !== undefined) {
                            const t = await getTicker (v, p.symbol);
                            const pay = -p.size * t.mid * (p.lastRate ?? fr.fundingRate);
                            state.cash[v] += pay;
                            state.stats.funding += pay;
                            log ('funding', { 'venue': v, 'symbol': p.symbol, 'rate': p.lastRate ?? fr.fundingRate, 'paymentUsd': r (pay, 4) });
                        }
                        p.lastRate = fr.fundingRate;
                        p.nextFunding = fr.fundingTimestamp ?? (fr.nextFundingTimestamp) ?? (now + 3_600_000);
                        if (p.nextFunding <= now) {
                            p.nextFunding = now + 3_600_000;
                        }
                    }
                } catch (e) {
                    log ('funding_error', { 'symbol': p.symbol, 'error': e.message });
                    p.nextFunding = now + 600_000;
                }
            }
            const mg = await venueMargin (v);
            if (mg.cash + mg.upnl <= mg.notional * MAINTENANCE) {
                for (const p of state.positions.filter ((x) => x.venue === v)) {
                    const { m } = await getMarket (v, p.symbol);
                    const res = await walkBook (v, m, p.size > 0 ? 'sell' : 'buy', Math.abs (p.size));
                    applyFill ({ 'id': 'liq-' + (++state.seq), 'venue': v, 'side': p.size > 0 ? 'sell' : 'buy', 'leverage': p.leverage }, m, res.filled, res.avg, (m.taker ?? 0.001) + 0.005, 'liquidation');
                }
                state.stats.liquidations += 1;
                state.orders = state.orders.filter ((o) => o.venue !== v || o.market === 'spot');
                log ('liquidation', { 'venue': v });
            }
        }
        save ();
    } catch (e) {
        log ('tick_error', { 'error': e.message });
    } finally {
        ticking = false;
    }
};

let lastEquityMinute = -1;
const equityLoop = async () => {
    const minute = Math.floor ((Date.now () - START) / 60_000);
    if (minute === lastEquityMinute || Date.now () > END + 60_000) {
        return;
    }
    try {
        const s = await snapshot ();
        if (!fs.existsSync (EQUITY_FILE)) {
            fs.writeFileSync (EQUITY_FILE, 'minute,timestamp,equity\n');
        }
        fs.appendFileSync (EQUITY_FILE, minute + ',' + new Date ().toISOString () + ',' + s.equityUsd + '\n');
        lastEquityMinute = minute;
    } catch (e) {
        log ('equity_error', { 'error': e.message });
    }
};

setInterval (() => {
    if (!isOver ()) {
        tick ();
    }
}, 5000);
setInterval (equityLoop, 10_000);

// ---------------------------------------------------------------- MCP tools

const ok = (data) => ({ 'content': [ { 'type': 'text', 'text': JSON.stringify ({ 'ok': true, ...data, 'minutesLeft': minutesLeft () }) } ] });
const fail = (e) => ({ 'content': [ { 'type': 'text', 'text': JSON.stringify ({ 'ok': false, 'error': e.message ?? String (e), 'minutesLeft': minutesLeft () }) } ], 'isError': true });
const guard = (name, fn) => async (input) => {
    log ('call', { 'tool': name, input });
    try {
        return ok (await fn (input));
    } catch (e) {
        log ('error', { 'tool': name, 'error': e.message });
        return fail (e);
    }
};

const venueEnum = z.enum (VENUES);

const buildServer = () => {
    const server = new McpServer ({ 'name': 'account', 'version': '1.0.0' });

    server.registerTool ('get_account', {
        'description': 'Your trading account: total equity in USD, per-exchange cash, spot holdings, perpetual positions, open orders, pending transfers and minutes left.',
        'inputSchema': {},
    }, guard ('get_account', async () => await snapshot ()));

    server.registerTool ('place_order', {
        'description': [
            'Place an order on one of the exchanges this account can trade on (' + VENUES.join (', ') + ').',
            'Markets: USDT/USDC-quoted spot (e.g. ETH/USDT) and linear perpetuals (e.g. ETH/USDT:USDT; on hyperliquid ETH/USDC:USDC). Use unified CCXT symbols.',
            'Market orders fill immediately against the exchange\'s live order book at taker fees. Limit orders that are not marketable rest and fill when the live price reaches them (maker fees).',
            'triggerPrice turns the order into a stop/take-profit: it activates when the last price crosses triggerPrice, then executes as market (or as a limit if price is set).',
            'amount is always in base currency (e.g. ETH), also for perpetuals. For market buys you may pass cost (order value in USD) instead of amount; on perpetuals that is notional, not margin.',
            'Perpetuals: leverage 1-' + MAX_LEVERAGE + ' (capped by the market), cross margin per exchange, funding is charged, positions are liquidated when equity on that exchange drops below maintenance margin. Close with an opposite order (reduceOnly recommended). Spot cannot be shorted.',
            'Cash only moves between exchanges with the transfer tool.',
        ].join (' '),
        'inputSchema': {
            'exchange': venueEnum,
            'symbol': z.string (),
            'side': z.enum ([ 'buy', 'sell' ]),
            'type': z.enum ([ 'market', 'limit' ]),
            'amount': z.number ().positive ().optional ().describe ('base currency amount'),
            'cost': z.number ().positive ().optional ().describe ('order value in USD, market buys only, instead of amount. On perpetuals this is the position notional; the margin used is cost / leverage'),
            'price': z.number ().positive ().optional ().describe ('limit price (required for limit orders)'),
            'triggerPrice': z.number ().positive ().optional (),
            'leverage': z.number ().optional ().describe ('perpetuals only, default 1 or the current position leverage'),
            'reduceOnly': z.boolean ().optional (),
        },
    }, guard ('place_order', async (i) => {
        if (isOver ()) {
            throw new Error ('time is up, trading is closed');
        }
        if (i.amount === undefined && i.cost === undefined) {
            throw new Error ('pass amount (base currency) or, for market buys, cost (USD)');
        }
        if (i.cost !== undefined && (i.type !== 'market' || i.side !== 'buy' || i.triggerPrice !== undefined)) {
            throw new Error ('cost is only supported on immediate market buys');
        }
        if (i.type === 'limit' && i.price === undefined) {
            throw new Error ('limit orders need a price');
        }
        const o = {
            'id': 'o' + (++state.seq), 'venue': i.exchange, 'symbol': i.symbol, 'side': i.side, 'type': i.type,
            'amount': i.amount, 'cost': i.cost, 'price': i.type === 'limit' ? i.price : undefined, 'triggerPrice': i.triggerPrice,
            'leverage': i.leverage, 'reduceOnly': i.reduceOnly ?? false, 'created': new Date ().toISOString (),
        };
        const { ex, m } = await validateAndSize (o);
        const existing = position (o.venue, o.symbol);
        const closesAll = o.reduceOnly && existing && o.amount !== undefined && o.amount >= Math.abs (existing.size) - 1e-9;
        if (closesAll) {
            o.amount = Math.abs (existing.size);
        } else if (o.amount !== undefined) {
            o.amount = roundAmount (ex, m, o.amount);
            const cs = m.contract ? (m.contractSize ?? 1) : 1;
            const minBase = (m.limits?.amount?.min ?? 0) * cs;
            if (o.amount <= 0 || o.amount < minBase - 1e-12) {
                throw new Error ('amount below the market minimum (' + minBase + ' ' + m.base + ')');
            }
        }
        state.stats.orders += 1;
        const t = await getTicker (o.venue, o.symbol);
        const minCost = m.limits?.cost?.min;
        const estCost = o.cost ?? (o.amount * (o.price ?? t.mid));
        if (minCost && estCost < minCost) {
            throw new Error ('order value below the market minimum of ' + minCost + ' USD');
        }
        // immediate execution?
        const marketable = o.type === 'market' || (o.side === 'buy' ? t.ask <= o.price : t.bid >= o.price);
        if (o.triggerPrice === undefined && marketable) {
            const fill = await execMarket (o, m, o.type === 'market' ? 'market' : 'marketable-limit');
            save ();
            return { 'status': 'filled', fill, 'account': await snapshot () };
        }
        // resting order: check funds now
        if (m.spot && o.side === 'sell' && (state.spot[o.venue][m.base] ?? 0) < o.amount - 1e-9) {
            throw new Error ('insufficient ' + m.base + ' on ' + o.venue);
        }
        const reduces = !m.spot && existing && ((o.side === 'buy') === (existing.size < 0)) && o.amount <= Math.abs (existing.size) + 1e-9;
        if (!o.reduceOnly && !reduces && !(m.spot && o.side === 'sell')) {
            const mg = await venueMargin (o.venue);
            const px = o.price ?? o.triggerPrice;
            const need = m.spot ? o.amount * px : o.amount * px / o.leverage;
            if (need > mg.available + 1e-6) {
                throw new Error ('insufficient funds on ' + o.venue + ': need ~' + r (need, 2) + ' USD, available ' + r (mg.available, 2));
            }
        }
        if (o.triggerPrice !== undefined) {
            o.triggerFrom = t.last < o.triggerPrice ? 'below' : 'above';
            o.triggersWhen = 'last price ' + (o.triggerFrom === 'below' ? '>=' : '<=') + ' ' + o.triggerPrice;
        }
        o.market = m.spot ? 'spot' : 'swap';
        state.orders.push (o);
        log ('order_open', { 'order': o });
        save ();
        return { 'status': 'open', 'order': { ...o, 'triggerFrom': undefined }, 'lastPrice': t.last };
    }));

    server.registerTool ('cancel_order', {
        'description': 'Cancel an open order by id, or all open orders if id is "all".',
        'inputSchema': { 'id': z.string () },
    }, guard ('cancel_order', async ({ id }) => {
        const before = state.orders.length;
        state.orders = id === 'all' ? [] : state.orders.filter ((o) => o.id !== id);
        save ();
        return { 'canceled': before - state.orders.length };
    }));

    server.registerTool ('transfer', {
        'description': 'Move USD cash between exchanges. Costs ' + TRANSFER_FEE + ' USD and arrives after ' + TRANSFER_MINUTES + ' minutes (like an on-chain stablecoin withdrawal).',
        'inputSchema': { 'from': venueEnum, 'to': venueEnum, 'amount': z.number ().positive () },
    }, guard ('transfer', async (i) => {
        if (isOver ()) {
            throw new Error ('time is up');
        }
        if (i.from === i.to) {
            throw new Error ('from and to are the same exchange');
        }
        const mg = await venueMargin (i.from);
        if (i.amount > mg.available + 1e-6) {
            throw new Error ('only ' + r (mg.available, 2) + ' USD available on ' + i.from);
        }
        if (i.amount <= TRANSFER_FEE) {
            throw new Error ('amount must exceed the ' + TRANSFER_FEE + ' USD fee');
        }
        state.cash[i.from] -= i.amount;
        const t = { 'from': i.from, 'to': i.to, 'amount': i.amount - TRANSFER_FEE, 'arrives': Date.now () + TRANSFER_MINUTES * 60_000 };
        state.transfers.push (t);
        state.stats.transfers += 1;
        state.stats.fees += TRANSFER_FEE;
        save ();
        return { 'transfer': t };
    }));

    server.registerTool ('wait', {
        'description': 'Do nothing for a number of minutes (0.5-4) while orders, stops and positions keep running, then get the account snapshot and any fills that happened meanwhile.',
        'inputSchema': { 'minutes': z.number ().min (0.5).max (4) },
    }, guard ('wait', async ({ minutes }) => {
        const fillsBefore = state.fills.length;
        const until = Math.min (Date.now () + minutes * 60_000, END);
        while (Date.now () < until) {
            await new Promise ((res) => setTimeout (res, Math.min (5000, until - Date.now ())));
        }
        return { 'fillsWhileWaiting': state.fills.slice (fillsBefore), 'account': await snapshot () };
    }));

    return server;
};

// ---------------------------------------------------------------- HTTP

const readBody = (req) => new Promise ((resolve) => {
    let data = '';
    req.on ('data', (c) => data += c);
    req.on ('end', () => resolve (data ? JSON.parse (data) : undefined));
});

http.createServer (async (req, res) => {
    if (req.url === '/snapshot') {
        // harness-only endpoint, not an MCP tool
        try {
            const s = await snapshot ();
            res.writeHead (200, { 'content-type': 'application/json' });
            res.end (JSON.stringify ({ ...s, 'stats': state.stats, 'fills': state.fills }));
        } catch (e) {
            res.writeHead (500);
            res.end (e.message);
        }
        return;
    }
    if (!req.url.startsWith ('/mcp')) {
        res.writeHead (404);
        res.end ();
        return;
    }
    if (req.method !== 'POST') {
        res.writeHead (405);
        res.end ();
        return;
    }
    // stateless: one server + transport per request, shared account state
    const body = await readBody (req);
    const server = buildServer ();
    const transport = new StreamableHTTPServerTransport ({ 'sessionIdGenerator': undefined, 'enableJsonResponse': true });
    res.on ('close', () => {
        transport.close ();
        server.close ();
    });
    await server.connect (transport);
    await transport.handleRequest (req, res, body);
}).setTimeout (0).listen (PORT, '127.0.0.1', () => {
    if (!fs.existsSync (STATE_FILE)) {
        save ();
    }
    log ('start', { 'port': PORT, 'start': START, 'end': END });
    console.error ('paper broker on :' + PORT + ' -> ' + DIR);
});
