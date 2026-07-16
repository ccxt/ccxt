// @NO_AUTO_TRANSPILE
// World Cup Final — one unified API, every prediction venue.
//
// This is the companion script for the "Trade the World Cup Final with CCXT" article.
// It shows the one advantage no single prediction venue can give you: the SAME code,
// pointed at Polymarket, Kalshi, Limitless and Myriad, comparing their prices and
// hunting for a risk-free "dutch book" — where the YES leg on one venue plus the NO leg
// on another cost less than 1.00 USDC, so one share of each pays a guaranteed 1.00 at
// settlement.
//
// The whole thing is READ-ONLY by default (public order books, no keys needed). It only
// places an order if you opt in with --trade AND supply that venue's credentials, and even
// then it rests a tiny buy far below the book so it cannot fill, respecting the 25 USD cap.
//
// Usage:
//   npx tsx examples/ts/prediction/prediction-world-cup-final.ts
//   npx tsx examples/ts/prediction/prediction-world-cup-final.ts "Argentina"
//
// Prices in prediction markets are probabilities: a YES share at 0.63 means the market
// prices that outcome at ~63%, and pays exactly 1.00 USDC if it comes true, 0 if it doesn't.

import ccxt from '../../../js/ccxt.js';

const SEARCH = process.argv[2] || 'World Cup';   // team or event to search for
const TEAM = process.argv[3];                    // optional: a specific team market to isolate
const MAX_NOTIONAL_USD = 25;                      // hard per-trade cap
const ORDER_SIZE_SHARES = 5;
const PLACE_ORDER = process.argv.indexOf ('--trade') !== -1;

// the four CLOB prediction venues that quote a public YES/NO order book without keys
const VENUES = [ 'polymarket', 'kalshi', 'limitless', 'myriad' ];

interface Quote {
    venue: string;
    outcome: string;
    market: string;
    label: string;
    yesAsk: number | undefined;   // cheapest price to BUY a YES share (0..1)
    yesBid: number | undefined;   // best price to SELL a YES share
}

// pull the best YES ask/bid for a matching market on one venue — the implied probability
async function quoteVenue (venueId: string): Promise<Quote[]> {
    const exchange = new (ccxt.prediction as any)[venueId] ();
    const quotes: Quote[] = [];
    try {
        const events = await exchange.fetchEvents ({ 'query': SEARCH, 'limit': 10, 'sort': 'volume' });
        for (const ev of events) {
            for (const market of (ev.markets || [])) {
                const label = (market.title || market.market || '').toString ();
                if (TEAM && label.toLowerCase ().indexOf (TEAM.toLowerCase ()) === -1) {
                    continue;
                }
                // the YES outcome's price is the market-implied probability of that result
                let yes: any = undefined;
                for (const oc of (market.outcomes || [])) {
                    if ((oc.label || '').toString ().toUpperCase () === 'YES') {
                        yes = oc;
                        break;
                    }
                }
                if (yes === undefined) {
                    continue;
                }
                try {
                    const ob = await exchange.fetchOrderBook (yes.outcome);
                    quotes.push ({
                        'venue': venueId,
                        'outcome': yes.outcome,
                        'market': label,
                        'label': 'YES',
                        'yesAsk': ob.asks.length ? ob.asks[0][0] : undefined,
                        'yesBid': ob.bids.length ? ob.bids[0][0] : undefined,
                    });
                } catch (e) {
                    // no two-sided book right now — skip this market on this venue
                }
            }
        }
    } catch (e) {
        console.log ('  ' + venueId + ': unavailable (' + (e as Error).constructor.name + ')');
    } finally {
        await exchange.close ();
    }
    return quotes;
}

async function main () {
    console.log ('Searching every venue for "' + SEARCH + '"' + (TEAM ? (' / team "' + TEAM + '"') : '') + '\n');

    // 1) the killer feature: the SAME three lines, run against four different exchanges ------
    const perVenue = await Promise.all (VENUES.map ((v) => quoteVenue (v)));
    const allQuotes: Quote[] = [];
    for (const list of perVenue) {
        for (const q of list) {
            allQuotes.push (q);
        }
    }
    if (allQuotes.length === 0) {
        console.log ('No matching markets found. Try a different search, e.g. "World Cup Winner".');
        return;
    }

    // 2) one board, every venue's odds side by side ----------------------------------------
    console.log ('--- the odds board (YES ask = implied probability) ---');
    for (const q of allQuotes) {
        const pct = (q.yesAsk !== undefined) ? ((q.yesAsk * 100).toFixed (1) + '%') : 'n/a';
        console.log ('  ' + q.venue.padEnd (11) + ' ' + q.market.slice (0, 34).padEnd (35) + ' YES ' + pct);
    }

    // 3) hunt for a cross-venue "dutch book" -----------------------------------------------
    //    Buy YES on the cheapest venue and NO on another (NO ask = 1 - YES bid). If the two
    //    legs together cost < 1.00, one share of each locks in a guaranteed 1.00 at settlement.
    console.log ('\n--- arbitrage scan ---');
    let bestEdge = 0;
    let bestPair: any = undefined;
    for (const a of allQuotes) {
        for (const b of allQuotes) {
            if ((a.venue === b.venue) || (a.yesAsk === undefined) || (b.yesBid === undefined)) {
                continue;
            }
            // buy YES on A, and the NO leg on B (a NO share = 1 minus the YES bid on B)
            const noAskB = 1 - b.yesBid;
            const cost = a.yesAsk + noAskB;
            const edge = 1 - cost;
            if (edge > bestEdge) {
                bestEdge = edge;
                bestPair = { a, b, cost, edge };
            }
        }
    }
    if (bestPair && bestPair.edge > 0) {
        console.log ('  FOUND: buy YES @ ' + bestPair.a.yesAsk.toFixed (2) + ' on ' + bestPair.a.venue +
            ' + NO @ ' + (1 - bestPair.b.yesBid).toFixed (2) + ' on ' + bestPair.b.venue);
        console.log ('  cost ' + bestPair.cost.toFixed (3) + ' USDC -> pays 1.000 at settlement => +' +
            (bestPair.edge * 100).toFixed (1) + '% risk-free (before fees/slippage)');
    } else {
        console.log ('  no cross-venue edge right now — the market makers are doing their job.');
    }

    // 4) optional: rest a tiny non-filling order to prove the write path (opt-in) -----------
    if (!PLACE_ORDER) {
        console.log ('\n(read-only. add --trade plus a venue\'s credentials to place a resting test order.)');
        return;
    }
    const target = allQuotes.find ((q) => q.yesBid !== undefined);
    if (target === undefined) {
        console.log ('\nNo book to rest an order against.');
        return;
    }
    const creds: any = { 'privateKey': process.env['POLYMARKET_PRIVATEKEY'], 'walletAddress': process.env['POLYMARKET_WALLETADDRESS'] };
    if (!creds.privateKey) {
        console.log ('\n--trade needs credentials, e.g. POLYMARKET_PRIVATEKEY / POLYMARKET_WALLETADDRESS.');
        return;
    }
    const exchange = new (ccxt.prediction as any)['polymarket'] (creds);
    let orderId: any = undefined;
    try {
        const price = Math.max (0.01, Number ((target.yesBid! * 0.5).toFixed (2)));  // half the bid — cannot fill
        const notional = ORDER_SIZE_SHARES * price;
        console.log ('\n--- resting test order ---');
        console.log ('limit BUY ' + ORDER_SIZE_SHARES + ' @ ' + price + ' (notional ' + notional.toFixed (2) + ' USD)');
        if (notional >= MAX_NOTIONAL_USD) {
            console.log ('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD cap.');
            return;
        }
        const order = await exchange.createOrder (target.outcome, 'limit', 'buy', ORDER_SIZE_SHARES, price);
        orderId = order.id;
        console.log ('placed: id ' + orderId + ' | status ' + order.status);
    } finally {
        if (orderId !== undefined) {
            const canceled = await exchange.cancelOrder (orderId, target.outcome);
            console.log ('canceled: id ' + canceled.id + ' | status ' + canceled.status);
        }
        await exchange.close ();
    }
}

main ();
