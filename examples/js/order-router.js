// @NO_AUTO_TRANSPILE
// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// THE WHOLE PIPELINE IS TWO CALLS: fetchRoute, then execute. execute takes the
// route directly, and does the rest itself — building the plan, loading each
// venue's markets, and checking every order against that venue's real rules
// before anything is sent. The pieces are all public (buildExecutionPlan,
// checkExecutionPlanSafety) for when you want to inspect or change what happens
// in between; see order-router-custom-plan.ts. You just don't have to.
//
// This example PLACES NOTHING: execute defaults to dry_run, and anything short
// of an explicit `live: true` stays a rehearsal, so a call that looks live but
// forgot the flag places nothing.
//
// Usage:
//   npm run tsBuild && node js/examples/ts/order-router.js
//
// The router service is public: no API key, no signup.
import ccxt from '../../js/ccxt.js';
async function main() {
    const router = new ccxt.OrderRouter();
    // ---- 1. what is the cheapest way to do this? ---------------------------
    // Exactly one of amountIn or amountOut — never both, and never neither.
    // They are different book traversals, not a unit conversion: amountIn walks
    // until the money runs out, amountOut walks until the size is reached.
    const route = await router.fetchRoute('USDT', 'BTC', {
        'amountIn': 20,
        'strategy': 'split_optimal',
    });
    // An unroutable pair comes back as a result with a reason, NOT an exception.
    // Refusing to quote is a deliberate outcome, not an error.
    if (route['unroutableReason'] !== undefined && route['unroutableReason'] !== null) {
        console.log('unroutable:', route['unroutableReason']);
        return;
    }
    console.log(route['amountIn'], route['from'], '->', route['amountOut'], route['to']);
    console.log('effective rate  ', route['effectiveRate']);
    console.log('price impact    ', route['impactBps'], 'bps'); // positive is worse
    console.log('fill ratio      ', route['fillRatio']);
    // One hop is a direct conversion; more than one means it was bridged
    // (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
    const hops = route['hops'];
    for (let i = 0; i < hops.length; i++) {
        const hop = hops[i];
        console.log('hop', i + 1, hop['pair'], hop['side'], '-', hop['legs'].length, 'venue(s)');
        const legs = hop['legs'];
        for (let j = 0; j < legs.length; j++) {
            const leg = legs[j];
            console.log('   ', leg['exchangeId'], leg['amount'], '@', leg['effectivePrice']);
        }
    }
    // ---- 2. do it ----------------------------------------------------------
    // execute needs the exchange instances themselves, keyed by the id the route
    // names — that part is yours, because these are the objects that will carry
    // your API credentials. Everything else it derives.
    const venues = {};
    for (let i = 0; i < hops.length; i++) {
        const legs = hops[i]['legs'];
        for (let j = 0; j < legs.length; j++) {
            const exchangeId = legs[j]['exchangeId'];
            if (venues[exchangeId] === undefined) {
                venues[exchangeId] = new ccxt[exchangeId]({});
            }
        }
    }
    // Going live means real orders with real money: set `live: true`, read the
    // strategy table in wiki/Manual.md first, and keep maxNotionalUsd on. The
    // cap is opt-in and honoured exactly as passed; usdRates is what lets it be
    // evaluated at all. A live run also needs an identity, which the route's
    // requestId supplies, so a re-run cannot re-place a filled order.
    const report = await router.execute(route, venues, {
        'strategy': 'sequential',
        'live': false,
        'usdRates': { 'USDT': 1 },
        'maxNotionalUsd': 25,
        //  Called after each step completes and reconciles, never mid-order. Return 'halt' to
        //  stop the route; anything else continues. It can only stop a route, never resume one
        //  the reconciliation already halted. Do no network I/O here: it sits between orders.
        'onStep': (event) => {
            console.log('  step', event['stepIndex'], event['status'], '->', event['outAmount'], event['outAsset']);
            return '';
        },
    });
    console.log('strategy        ', report['strategy'], '(requested', report['requestedStrategy'] + ')');
    console.log('would place     ', report['wouldPlaceOrders'], 'order(s)');
    // -1 means the route carried no calculatedAt: unknown, not fresh.
    console.log('plan age        ', report['planAgeMs'], 'ms');
    await closeAll(venues);
}
// Every ccxt instance holds a keep-alive socket pool; without this the process
// hangs after main() returns instead of exiting.
async function closeAll(venues) {
    const ids = Object.keys(venues);
    for (let i = 0; i < ids.length; i++) {
        await venues[ids[i]].close();
    }
}
await main();
