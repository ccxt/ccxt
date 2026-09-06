import ccxt from '../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.grvt ({});
    exchange.privateKey = process.env.GRVT_PRIVATE_KEY || '';
    let volume = 0;
    let fee = 0;
    await exchange.signIn ();

    const daysToCheck = 30;
    // paginate through entries paginate day by day using since and until
    const now = exchange.milliseconds ();
    const day = 24 * 60 * 60 * 1000;
    for (let i = 0; i < daysToCheck; i++) {
        const since = now - (i + 1) * day;
        const until = now - i * day;
        const sinceIso = exchange.iso8601 (since);
        const untilIso = exchange.iso8601 (until);
        console.log ('Fetching rebates for day ', i + 1, ': from ', sinceIso, ' to ', untilIso);
        const rebates = await exchange.privateTradingPostFullV1BuilderFillHistory ({ 'start_time': (since * 1000000).toString (), 'end_time': (until * 1000000).toString (), 'limit': 1000 });
        console.log ('Fetched ', rebates.result.length, ' rebates for day ', i + 1);
        let volumeForDay = 0;
        for (const rebate of rebates.result) {
            const currentVolume = rebate.size * rebate.price;
            volumeForDay += currentVolume;
            fee += rebate.fee / 1000000;
        }
        console.log ('Volume for day ', i + 1, ': ', volumeForDay);
        volume += volumeForDay;
    }
    console.log ('Total volume for last ', daysToCheck, ' days: ', volume);
    console.log ('Total fee for last ', daysToCheck, ' days: ', fee);
}
await example ();