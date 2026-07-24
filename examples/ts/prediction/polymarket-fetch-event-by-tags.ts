import ccxt from '../../../js/ccxt.js';


// fetch polymarket events by tag — human-readable labels ("Fed Rates") or
// slugs ("fed-rates") both work; multiple tags match ANY of them

async function example () {
    const exchange = new ccxt.prediction.polymarket ();
    const events = await exchange.fetchEvents ({ 'tags': [ 'Fed Rates' ], 'limit': 5 });
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log (event['title'], '| tags:', event['tags']);
        const markets = event['markets'];
        for (let j = 0; j < markets.length; j++) {
            const market = markets[j];
            const outcomes = market['outcomes'];
            for (let k = 0; k < outcomes.length; k++) {
                console.log ('   ', outcomes[k]['outcome'], '->', outcomes[k]['price']);
            }
        }
    }
    await exchange.close ();
}

await example ();
