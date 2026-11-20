// @ts-nocheck
import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version);

// ------------------------------------------------------------------------------
// eToro credentials: the public api key goes to `apiKey` (sent as x-api-key) and
// the user key goes to `secret` (sent as x-user-key). A key works for one account
// only: create a "Demo" key for setSandboxMode (true), a "Real" key otherwise.
//
// eToro trades positions: a buy opens a new position, a sell deducts units from
// one position (params.positionId) and closePosition () sells all its units.
// ------------------------------------------------------------------------------

async function example () {
    const exchange = new ccxt.etoro ({
        'apiKey': process.env.ETORO_APIKEY,
        'secret': process.env.ETORO_SECRET,
    });
    exchange.setSandboxMode (true); // trade the demo (virtual) account
    const symbol = 'BTC/USD';
    await exchange.loadMarkets ();
    const ticker = await exchange.fetchTicker (symbol);
    console.log (symbol, 'bid', ticker['bid'], 'ask', ticker['ask']);
    const balance = await exchange.fetchBalance ();
    console.log ('free USD', balance['USD']['free'], 'BTC', balance['total']['BTC']);
    // buy 12 USD worth of BTC, a 200 response means accepted, not executed
    const buy = await exchange.createMarketBuyOrderWithCost (symbol, 12);
    let order = await exchange.fetchOrder (buy['id']);
    for (let i = 0; i < 10 && order['status'] === 'open'; i++) {
        await exchange.sleep (1000);
        order = await exchange.fetchOrder (buy['id']);
    }
    console.log ('bought', order['filled'], 'BTC at', order['average'], 'status', order['status']);
    // close the position the buy opened
    const positionId = order['info']['positionExecutions'][0]['positionId'];
    const close = await exchange.closePosition (symbol, undefined, { 'positionId': positionId.toString () });
    console.log ('close order', close['id'], 'placed');
    const closed = await exchange.fetchOrder (close['id'], symbol, { 'closeOrder': true });
    console.log ('close order status', closed['status']);
}

await example ();
