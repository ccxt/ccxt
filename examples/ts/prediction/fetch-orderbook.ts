import ccxt from '../../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.prediction.polymarket ();
    const kalshi = new ccxt.prediction.kalshi ();
    const limitless = new ccxt.prediction.limitless ();
    const myriad = new ccxt.prediction.myriad ();
    const [ polyEvents, kalshiEvents, limitlessEvents, myriadEvents ] = await Promise.all ([
        exchange.fetchEvents ({ 'queries': [ 'Trump' ] }),
        kalshi.fetchEvents ({ 'queries': [ 'Trump' ] }),
        limitless.fetchEvents ({ 'queries': [ 'Trump' ] }),
        myriad.fetchEvents ({ 'queries': [ 'Trump' ] }),
    ]);


    const first = polyEvents[0];
    const second = kalshiEvents[0];
    const third = limitlessEvents[0];
    const fourth = myriadEvents[0];


    //     console.log (first);
    //     console.log (second);
    //     console.log (third);
    //     console.log (fourth);


    const firstOutcome = first.markets[0].outcomes[0].outcomeId;
    const secondOutcome = second.markets[0].outcomes[0].outcomeId;
    const thirdOutcome = third.markets[0].outcomes[0].outcomeId;
    const fourthOutcome = fourth.markets[0].outcomes[0].outcomeId;

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
