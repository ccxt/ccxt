// @NO_AUTO_TRANSPILE
// "Front-running the S-1": trade the "Will Anthropic or OpenAI IPO first?" market with CCXT.
//
// The story:
//   1. darioSignal()  — read the CEO's latest tweet and guess who files first (the fun part).
//   2. read the odds  — the same binary market is listed on several prediction venues; each has
//                       its own YES price (= the crowd's probability that Anthropic IPOs first).
//   3. cross-venue arb — because venues disagree, you can sometimes buy YES cheap on one venue and
//                       NO cheap on another for a combined cost < 1.00, locking in a risk-free edge.
//   4. (optional) place a resting, non-filling test order on the side the signal leans.
//
// Honesty note: CCXT does NOT read Twitter/X. darioSignal() is a "bring your own feed" stub — you
// pipe in tweet text from wherever you get it. Everything that touches money is real CCXT
// (fetchEvents / fetchOrderBook / createOrder), stays under a 25 USD per-trade cap, and rests far
// from the book so it cannot fill.
//
// Usage (read-only, no keys needed):
//   npx tsx examples/ts/prediction/prediction-anthropic-ipo.ts
//   DARIO_TWEET="we just filed our S-1, roadshow next week" npx tsx examples/ts/prediction/prediction-anthropic-ipo.ts
//
// Usage (also place one resting test order on Polymarket):
//   POLYMARKET_PRIVATEKEY=0x... POLYMARKET_WALLETADDRESS=0x... \
//   npx tsx examples/ts/prediction/prediction-anthropic-ipo.ts --trade
import { pathToFileURL } from 'url';
import ccxt from '../../../js/ccxt.js';
const MAX_NOTIONAL_USD = 25; // hard cap per trade
const ORDER_SIZE_SHARES = 5; // typical prediction-venue minimum order size
// venues that list the Anthropic-vs-OpenAI IPO market as a public CLOB book
const VENUES = ['polymarket', 'limitless', 'myriad'];
// search scopes to locate the binary "who IPOs first" event on each venue
const QUERIES = ['Anthropic OpenAI IPO first', 'Anthropic IPO', 'IPO first'];
// words that suggest Anthropic is moving toward a listing (=> YES, Anthropic first)
const BULLISH_ANTHROPIC = ['s-1', 's1', 'roadshow', 'filing', 'filed', 'prospectus', 'listing', 'nasdaq', 'ticker', 'going public', 'ipo'];
// words that suggest a delay, or that OpenAI is ahead (=> NO, OpenAI first)
const BEARISH_ANTHROPIC = ['not ready', 'no plans', 'staying private', 'delay', 'next year', 'openai first'];
function darioSignal(tweet) {
    const text = (tweet || '').toLowerCase();
    const hits = [];
    let score = 0;
    for (let i = 0; i < BULLISH_ANTHROPIC.length; i++) {
        const kw = BULLISH_ANTHROPIC[i];
        if (text.indexOf(kw) !== -1) {
            score += 1;
            hits.push('+' + kw);
        }
    }
    for (let i = 0; i < BEARISH_ANTHROPIC.length; i++) {
        const kw = BEARISH_ANTHROPIC[i];
        if (text.indexOf(kw) !== -1) {
            score -= 1;
            hits.push('-' + kw);
        }
    }
    let lean = 'neutral';
    if (score > 0) {
        lean = 'yes';
    }
    else if (score < 0) {
        lean = 'no';
    }
    return { 'lean': lean, 'score': score, 'hits': hits };
}
function findCrossVenueArb(board) {
    const arbs = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            const a = board[i];
            const b = board[j];
            if (a.venue === b.venue) {
                continue;
            }
            if (!(a.yesAsk > 0) || !(b.yesBid > 0)) {
                continue;
            }
            const noAsk = 1 - b.yesBid; // buy NO on venue B = sell YES on venue B
            const cost = a.yesAsk + noAsk; // one YES leg + one NO leg
            const edge = 1 - cost; // guaranteed payout is exactly 1.00
            if (edge > 0) {
                arbs.push({ 'yesVenue': a.venue, 'noVenue': b.venue, 'yesAsk': a.yesAsk, 'noAsk': noAsk, 'cost': cost, 'edge': edge });
            }
        }
    }
    // best edge first
    arbs.sort((x, y) => y.edge - x.edge);
    return arbs;
}
// -----------------------------------------------------------------------------------------------
// 3) THE NETWORK PART — locate the binary market on one venue and read its YES book. Returns the
//    outcome handle too, so an optional order can be placed on it later.
// -----------------------------------------------------------------------------------------------
function pickYesOutcome(market) {
    for (const oc of (market.outcomes || [])) {
        if (oc.label === 'Yes') {
            return oc;
        }
    }
    // single-outcome markets: fall back to the first outcome
    return (market.outcomes && market.outcomes.length) ? market.outcomes[0] : undefined;
}
function looksLikeIpoFirst(text) {
    const t = (text || '').toLowerCase();
    return (t.indexOf('anthropic') !== -1) && (t.indexOf('ipo') !== -1 || t.indexOf('public') !== -1);
}
async function readVenue(venueId) {
    const exchange = new ccxt.prediction[venueId]();
    try {
        for (const query of QUERIES) {
            let events = undefined;
            try {
                events = await exchange.fetchEvents({ 'query': query, 'sort': 'volume', 'limit': 10 });
            }
            catch (e) {
                continue; // this venue may not support this scope — try the next query
            }
            for (const ev of (events || [])) {
                for (const market of (ev.markets || [])) {
                    const marketAny = market;
                    const title = marketAny.title || marketAny.symbol || ev.title || '';
                    if (!looksLikeIpoFirst(title)) {
                        continue;
                    }
                    const yesOutcome = pickYesOutcome(market);
                    if (yesOutcome === undefined) {
                        continue;
                    }
                    const symbol = yesOutcome.outcome;
                    let ob = undefined;
                    try {
                        ob = await exchange.fetchOrderBook(symbol);
                    }
                    catch (e) {
                        continue;
                    }
                    const yesBid = (ob.bids && ob.bids.length) ? ob.bids[0][0] : 0;
                    const yesAsk = (ob.asks && ob.asks.length) ? ob.asks[0][0] : 0;
                    if (yesBid > 0 || yesAsk > 0) {
                        return { 'venue': venueId, 'yesBid': yesBid, 'yesAsk': yesAsk, 'event': ev.title, 'symbol': symbol, 'precision': yesOutcome.precision };
                    }
                }
            }
        }
    }
    finally {
        await exchange.close();
    }
    return undefined;
}
// -----------------------------------------------------------------------------------------------
// 4) ORCHESTRATION
// -----------------------------------------------------------------------------------------------
async function main() {
    // --- the fun part: what is Dario hinting at? ---
    const tweet = process.env['DARIO_TWEET'] || 'excited to share we confidentially filed our S-1 — roadshow soon';
    const signal = darioSignal(tweet);
    console.log('--- darioSignal (bring your own tweet feed) ---');
    console.log('tweet:', JSON.stringify(tweet));
    console.log('hits: ', signal.hits.length ? signal.hits.join(' ') : '(none)');
    const leanText = (signal.lean === 'yes') ? 'Anthropic IPOs FIRST (buy YES)' : ((signal.lean === 'no') ? 'OpenAI IPOs first (buy NO)' : 'no lean');
    console.log('lean: ', leanText, '| score', signal.score);
    // --- read the odds across venues ---
    console.log('\n--- odds board: "Will Anthropic or OpenAI IPO first?" (YES = Anthropic first) ---');
    const board = [];
    let best = undefined; // a venue row we could actually trade on
    for (const venueId of VENUES) {
        let row = undefined;
        try {
            row = await readVenue(venueId);
        }
        catch (e) {
            console.log(venueId.padEnd(12), 'error:', e.constructor.name);
            continue;
        }
        if (row === undefined) {
            console.log(venueId.padEnd(12), 'no live market found');
            continue;
        }
        board.push({ 'venue': row.venue, 'yesBid': row.yesBid, 'yesAsk': row.yesAsk });
        const pct = (row.yesAsk > 0) ? (row.yesAsk * 100).toFixed(1) + '%' : 'n/a';
        console.log(venueId.padEnd(12), 'YES bid/ask', row.yesBid, '/', row.yesAsk, '  implied', pct);
        if (best === undefined && row.yesBid > 0 && row.yesAsk > 0) {
            best = row;
        }
    }
    if (board.length === 0) {
        console.log('\nNo venue had a live book for this market right now — try again later.');
        return;
    }
    // --- the risk-free cross-venue dutch book ---
    console.log('\n--- cross-venue arbitrage (buy YES on one venue + NO on another for < 1.00) ---');
    const arbs = findCrossVenueArb(board);
    if (arbs.length === 0) {
        console.log('no risk-free edge across venues right now (efficient market — this is the normal case)');
    }
    else {
        for (const arb of arbs) {
            console.log('BUY YES @', arb.yesVenue, '(' + arb.yesAsk.toFixed(3) + ')  +  BUY NO @', arb.noVenue, '(' + arb.noAsk.toFixed(3) + ')  =>  cost', arb.cost.toFixed(3), '| locked edge +' + (arb.edge * 100).toFixed(1) + '%');
        }
    }
    // --- optional: place ONE resting, non-filling test order on the leaned side ---
    const wantTrade = process.argv.indexOf('--trade') !== -1;
    if (!wantTrade) {
        console.log('\n(read-only. pass --trade with POLYMARKET_PRIVATEKEY/POLYMARKET_WALLETADDRESS to place one resting test order.)');
        return;
    }
    const privateKey = process.env['POLYMARKET_PRIVATEKEY'];
    const walletAddress = process.env['POLYMARKET_WALLETADDRESS'];
    if (!privateKey || !walletAddress) {
        console.log('\n--trade needs POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS — skipping the order.');
        return;
    }
    if (best === undefined || best.venue !== 'polymarket') {
        console.log('\n--trade path only wired for Polymarket, and no live Polymarket book was found — skipping.');
        return;
    }
    const exchange = new ccxt.prediction.polymarket({ 'privateKey': privateKey, 'walletAddress': walletAddress });
    let order = undefined;
    try {
        const tick = (best.precision && best.precision.price) ? best.precision.price : 0.01;
        // half the best bid, floored to the tick — far below the ask, so it cannot fill
        let price = Math.floor((best.yesBid * 0.5) / tick) * tick;
        price = Math.max(tick, Number(price.toFixed(4)));
        const notional = ORDER_SIZE_SHARES * price;
        console.log('\n--- test order (resting, non-filling) ---');
        console.log('placing limit BUY', ORDER_SIZE_SHARES, 'YES @', price, '(notional', notional.toFixed(2), 'USD) on', best.symbol);
        if (notional >= MAX_NOTIONAL_USD) {
            console.log('ABORT: notional >= ' + MAX_NOTIONAL_USD + ' USD safety cap.');
            return;
        }
        order = await exchange.createOrder(best.symbol, 'limit', 'buy', ORDER_SIZE_SHARES, price);
        console.log('placed:  id', order.id, '| status', order.status);
        const fetched = await exchange.fetchOrder(order.id, best.symbol);
        console.log('fetched: id', fetched.id, '| status', fetched.status, '| remaining', fetched.remaining);
    }
    finally {
        if (order && order.id) {
            const canceled = await exchange.cancelOrder(order.id, best.symbol);
            console.log('canceled: id', canceled.id, '| status', canceled.status);
        }
        await exchange.close();
    }
}
// run main() only when invoked directly, so the pure helpers above can be imported and unit-tested
const invokedDirectly = (process.argv[1] !== undefined) && (import.meta.url === pathToFileURL(process.argv[1]).href);
if (invokedDirectly) {
    main();
}
export { darioSignal, findCrossVenueArb };
