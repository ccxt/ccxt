import ccxt from '../../js/ccxt.js';

// Fetches every builder trade on Extended through the raw private endpoint
// (GET /api/v1/builder/trades) and follows the response cursor until the last
// page. Credentials are read from the environment:
//
//     EXTENDED_APIKEY=...     EXTENDED_PRIVATEKEY=...   npx tsx examples/ts/extended-builder.ts
//
// Extended pages its private listings with an opaque cursor: each page carries
// `pagination.cursor`, and the next request passes it back as the `cursor`
// query parameter. No cursor (or a repeated one) means the listing is exhausted.

const PAGE_SIZE = 100;

async function example () {
    const apiKey = process.env.EXTENDED_APIKEY;
    const privateKey = process.env.EXTENDED_PRIVATEKEY;
    if (!apiKey || !privateKey) {
        throw new Error ('set EXTENDED_APIKEY and EXTENDED_PRIVATEKEY in the environment');
    }
    const exchange = new ccxt.extended ({
        'apiKey': apiKey,
        'privateKey': privateKey,
    });
    const trades: any[] = [];
    let cursor: string | undefined = undefined;
    let page = 0;
    while (true) {
        page += 1;
        const request: Record<string, any> = { 'limit': PAGE_SIZE };
        if (cursor !== undefined) {
            request['cursor'] = cursor;
        }
        const response = await exchange.v1PrivateGetBuilderTrades (request);
        //
        //     {
        //         "status": "OK",
        //         "data": [ { "id": ..., "market": "BTC-USD", "side": "BUY", "price": "...", "qty": "...", "value": "...", "fee": "...", "createdTime": ... } ],
        //         "pagination": { "cursor": 1784963886257016832, "count": 100 }
        //     }
        //
        const data = exchange.safeList (response, 'data', []);
        const pagination = exchange.safeDict (response, 'pagination', {});
        const nextCursor = exchange.safeString (pagination, 'cursor');
        console.log ('page', page, ': fetched', data.length, 'trades', (nextCursor !== undefined) ? ('(next cursor ' + nextCursor + ')') : '(last page)');
        for (const trade of data) {
            trades.push (trade);
        }
        // stop on the last page: no cursor, an empty page, or a cursor that did not advance
        if ((nextCursor === undefined) || (data.length === 0) || (nextCursor === cursor)) {
            break;
        }
        cursor = nextCursor;
    }
    let volume = 0;
    let fees = 0;
    for (const trade of trades) {
        const value = exchange.safeNumber (trade, 'value');
        if (value !== undefined) {
            volume += value;
        } else {
            const price = exchange.safeNumber (trade, 'price', 0);
            const amount = exchange.safeNumber2 (trade, 'qty', 'amount', 0);
            volume += price * amount;
        }
        fees += exchange.safeNumber (trade, 'fee', 0);
    }
    console.log ('total builder trades:', trades.length);
    console.log ('total volume:', volume);
    console.log ('total fees:', fees);
}

await example ();
