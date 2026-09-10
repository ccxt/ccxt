// @NO_AUTO_TRANSPILE
// OrderRouter — execute a plan you built yourself.
//
// OrderRouter is two things. The other example (order-router.ts) uses the first:
// a client that asks the router service for the cheapest way to convert one
// asset into another. This example uses the second, which needs no router
// service and no apiKey at all:
//
//   execute() takes a PLAN, not a route, and never asks where the plan came
//   from. Your own strategy can supply its own list of trades and still get the
//   per-trade notional cap, halt-and-reconcile between hops, resting-order
//   cleanup, and an unwind plan for a run that stops half way.
//
// A step is one order on one venue. Required: exchangeId, symbol, side, amount,
// base, quote. Everything else carries predictions and may be omitted.
//
// Steps sharing a hopIndex are one hop: that is what parallel_within_hop runs
// concurrently, and what reconciliation chains together.
//
// This example is a DRY RUN. It places nothing. Read the comment on `live`
// below before changing that, and read the hard safety rules in CLAUDE.md §5.5
// before pointing it at real money.
//
// Usage:
//   npm run tsBuild && node js/examples/ts/order-router-custom-plan.js
import ccxt from '../../js/ccxt.js';
async function main() {
    //  no apiKey: nothing here talks to the router service
    const router = new ccxt.OrderRouter({});
    const binance = new ccxt.binance({});
    const kraken = new ccxt.kraken({});
    const venues = { 'binance': binance, 'kraken': kraken };
    await Promise.all([binance.loadMarkets(), kraken.loadMarkets()]);
    //  Identity. A live run REFUSES without one, because it is what makes a
    //  re-run safe: the identity is remembered in-process, so the same plan
    //  sent twice is refused before any venue is contacted.
    //
    //  Stable and tied to the INTENT — a strategy name plus the signal that
    //  triggered it. Date.now() here would be a fresh identity on every call,
    //  which turns the protection off while looking like it is on.
    const signalTime = '2026-09-06T12:00:00Z';
    const idempotencyKey = 'rebalance-' + signalTime;
    const plan = {
        'requestId': idempotencyKey,
        //  when these prices were true; execute reports planAgeMs against it
        'calculatedAt': binance.milliseconds(),
        'steps': [
            {
                'exchangeId': 'binance',
                'symbol': 'BTC/USDT',
                'side': 'buy',
                'amount': 0.0002,
                'base': 'BTC',
                'quote': 'USDT',
                'hopIndex': 0,
                'legIndex': 0,
                'expectedPrice': 64000,
            },
            {
                'exchangeId': 'kraken',
                'symbol': 'ETH/USDT',
                'side': 'buy',
                'amount': 0.004,
                'base': 'ETH',
                'quote': 'USDT',
                'hopIndex': 0,
                'legIndex': 1,
                'expectedPrice': 3200,
            },
        ],
    };
    //  Worth running on a hand-written plan: it checks every step against that
    //  venue's real market rules — minimum amount, minimum cost, precision —
    //  which is where a hand-picked amount usually goes wrong.
    const markets = { 'binance': binance.markets, 'kraken': kraken.markets };
    const violations = router.checkExecutionPlanSafety(plan, markets, {
        'maxNotionalUsd': 25,
        'usdRates': { 'USDT': 1 },
    });
    //  Only a BLOCKING violation should stop you. The advisory ones are worth
    //  reading and worth shipping past: a hand-built plan that does not set
    //  `fullyFillable` always draws a non-blocking `partial_fill`, so a guard
    //  on `violations.length` alone would refuse every plan on this page.
    let blocking = 0;
    for (let i = 0; i < violations.length; i++) {
        const label = violations[i]['blocking'] ? 'BLOCKING' : 'advisory';
        console.log('  ', label, violations[i]['code'], violations[i]);
        if (violations[i]['blocking']) {
            blocking = blocking + 1;
        }
    }
    if (blocking > 0) {
        console.log('plan rejected before any venue was contacted');
        return;
    }
    const report = await router.execute(plan, venues, {
        'strategy': 'parallel_within_hop',
        //  THE default. Anything short of an explicit true is a rehearsal, and
        //  a call that looks live but forgot this flag places nothing.
        'live': false,
        'usdRates': { 'USDT': 1 },
        'maxNotionalUsd': 25,
        //  alternative to plan.requestId; either satisfies the identity rule
        'idempotencyKey': idempotencyKey,
    });
    console.log('strategy    ', report['strategy'], '(requested', report['requestedStrategy'] + ')');
    console.log('planId      ', report['planId']);
    console.log('planAgeMs   ', report['planAgeMs'], '  // -1 means unknown, not fresh');
    console.log('wouldPlace  ', report['wouldPlaceOrders']);
    //  On a live run that halted, this is the reverse plan that sells each
    //  stranded residual back toward the asset you started in.
    //  const unwind = router.buildUnwindPlan (report);
    await Promise.all([binance.close(), kraken.close()]);
}
main();
