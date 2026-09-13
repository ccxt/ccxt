// @NO_AUTO_TRANSPILE

// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// This example PLACES NOTHING. It asks for a recommendation, prints it, then
// walks the rest of the pipeline — plan, safety check, execute — with execute
// in its default dry_run, which makes not one call against a venue, not even a
// read. See the comment on the execute() call for what turning it live costs.
//
// Usage:
//   ORDER_ROUTER_API_KEY=or_live_... npm run tsBuild && node js/examples/ts/order-router.js
//
// Get a key from https://docs.ccxt.com/router

import ccxt from '../../js/ccxt.js';
import type { Dict } from '../../js/src/base/types.js';

async function main () {
    const apiKey = process.env.ORDER_ROUTER_API_KEY;
    if (apiKey === undefined || apiKey === '') {
        console.log ('set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)');
        return;
    }

    const router = new ccxt.OrderRouter ({
        'apiKey': apiKey,
        // 'baseUrl': 'https://docs.ccxt.com/router/api',  // the default
    });

    // Exactly one of amountIn or amountOut — never both, and never neither.
    // They are different book traversals, not a unit conversion: amountIn walks
    // until the money runs out, amountOut walks until the size is reached.
    const route = await router.fetchRoute ('USDT', 'BTC', {
        'amountIn': 20,
        'strategy': 'split_optimal',
    });

    // An unroutable pair comes back as a result with a reason, NOT an exception.
    // Refusing to quote is a deliberate outcome, not an error.
    if (route['unroutableReason'] !== undefined && route['unroutableReason'] !== null) {
        console.log ('unroutable:', route['unroutableReason']);
        return;
    }

    console.log (route['amountIn'], route['from'], '->', route['amountOut'], route['to']);
    console.log ('effective rate  ', route['effectiveRate']);
    console.log ('price impact    ', route['impactBps'], 'bps');  // positive is worse
    console.log ('fill ratio      ', route['fillRatio']);

    // One hop is a direct conversion; more than one means it was bridged
    // (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
    const hops = route['hops'];
    for (let i = 0; i < hops.length; i++) {
        const hop = hops[i];
        console.log ('hop', i + 1, hop['pair'], hop['side'], '-', hop['legs'].length, 'venue(s)');
        const legs = hop['legs'];
        for (let j = 0; j < legs.length; j++) {
            const leg = legs[j];
            console.log ('   ', leg['exchangeId'], leg['amount'], '@', leg['effectivePrice']);
        }
    }

    // ---- from a route to orders -------------------------------------------
    // Routing and executing are separate steps on purpose. Everything between
    // them is PURE — no I/O, same input same output in all six languages — so a
    // plan can be inspected, logged and diffed before anything is placed.

    // Flattens the hops and legs above into an ordered list of concrete orders.
    // The plan carries the route's requestId, which is what a live run uses as
    // its idempotency identity; see the execute() call below.
    const plan = router.buildExecutionPlan (route, {});
    console.log ('plan            ', plan['steps'].length, 'order(s), requestId', plan['requestId']);

    // execute() needs the exchange instances themselves, keyed by the id the
    // plan names. Only the venues this plan actually uses are constructed.
    const venues: Dict = {};
    const markets: Dict = {};
    const steps = plan['steps'];
    for (let i = 0; i < steps.length; i++) {
        const exchangeId = steps[i]['exchangeId'];
        if (venues[exchangeId] === undefined) {
            const venue = new (ccxt as Dict)[exchangeId] ({});
            // The one network cost added here: the safety check below is only
            // as good as the market rules it reads. dry_run itself needs none.
            await venue.loadMarkets ();
            venues[exchangeId] = venue;
            markets[exchangeId] = venue.markets;
        }
    }

    // Checks every step against that venue's REAL market rules — minimum
    // amount, minimum cost, precision — plus the per-trade notional cap. This
    // is where a size that looked fine in the route turns out to be untradeable.
    // The cap is opt-in and honoured exactly as passed; omit it and none runs.
    const violations = router.checkExecutionPlanSafety (plan, markets, {
        'maxNotionalUsd': 25,
        'usdRates': { 'USDT': 1 },
    });
    if (violations.length > 0) {
        console.log ('plan rejected before any venue was contacted:');
        for (let i = 0; i < violations.length; i++) {
            console.log ('   ', violations[i]);
        }
        await closeAll (venues);
        return;
    }

    // THE default, and the reason this example is safe to run: anything short
    // of an explicit `live: true` is a rehearsal, so a call that looks live but
    // forgot the flag places nothing. Going live means real orders with real
    // money — read the strategy table in wiki/Manual.md first, keep the
    // notional cap on, and know that a live run also requires an identity so a
    // re-run cannot re-place a filled order.
    const report = await router.execute (plan, venues, {
        'strategy': 'sequential',
        //  Called after each step completes and reconciles, never mid-order. Return 'halt' to
        //  stop the route; anything else continues. It can only stop a route, never resume one
        //  the reconciliation already halted. Do no network I/O here: it sits between orders.
        'onStep': (event: Dict) => {
            console.log ('  step', event['stepIndex'], event['status'], '->', event['outAmount'], event['outAsset']);
            return '';
        },
        'live': false,
        'usdRates': { 'USDT': 1 },
        'maxNotionalUsd': 25,
    });

    console.log ('strategy        ', report['strategy'], '(requested', report['requestedStrategy'] + ')');
    console.log ('would place     ', report['wouldPlaceOrders'], 'order(s)');
    // -1 means the route carried no calculatedAt: unknown, not fresh.
    console.log ('plan age        ', report['planAgeMs'], 'ms');

    await closeAll (venues);
}

// Every ccxt instance holds a keep-alive socket pool; without this the process
// hangs after main() returns instead of exiting.
async function closeAll (venues: Dict) {
    const ids = Object.keys (venues);
    for (let i = 0; i < ids.length; i++) {
        await venues[ids[i]].close ();
    }
}

await main ();
