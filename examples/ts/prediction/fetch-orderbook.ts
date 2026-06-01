import ccxt from '../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.polymarket ();
    const kalshi = new ccxt.kalshi ();
    const limitless = new ccxt.limitless ();
    const myriad = new ccxt.myriad ();
    const [ polyEvents, kalshiEvents, limitlessEvents, myriadEvents ] = await Promise.all ([
        exchange.fetchEvents ([ 'Trump' ]),
        kalshi.fetchEvents ([ 'Trump' ]),
        limitless.fetchEvents ([ 'Trump' ]),
        myriad.fetchEvents ([ 'Trump' ]),
    ]);


    const first = polyEvents[0];
    const second = kalshiEvents[0];
    const third = limitlessEvents[0];
    const fourth = myriadEvents[0];


    //     console.log (first);
    //     console.log (second);
    //     console.log (third);
    //     console.log (fourth);


    const firstOutcome = first.markets[0].outcomes[0].id;
    const secondOutcome = second.markets[0].outcomes[0].id;
    const thirdOutcome = third.markets[0].outcomes[0].id;
    const fourthOutcome = fourth.markets[0].outcomes[0].id;

    console.log (firstOutcome, secondOutcome, thirdOutcome, fourthOutcome);


    const [ firstOrderBook, secondOrderBook, thirdOrderBook, fourthOrderBook ] = await Promise.all ([
        exchange.fetchOrderBook (firstOutcome),
        kalshi.fetchOrderBook (secondOutcome),
        limitless.fetchOrderBook (thirdOutcome),
        myriad.fetchOrderBook (fourthOutcome),
    ]);
    console.log (firstOrderBook, secondOrderBook, thirdOrderBook, fourthOrderBook);
}
await example ();
