// ----------------------------------------------------------------------------
import assert from 'assert';
import log from 'ololog';
import ccxt from '../../../ccxt.js';
// test statically (without API requests) that the ccxt id
// is available inside the order request object
// for now only in Ts/JS to avoid overloading the Rate-limiter
// we also have to find a way of testing the headers sent to the exchange
// because some exchanges require the id to be sent in the headers
async function main () {
    const promises = [
        // testBinance (),
        // testCryptocom (),
        // testOkx (),
        testKucoin ()
    ];
    await Promise.all (promises);
    log.bright.green ('Static Ids test passed');
}

async function testBinance () {
    const binance = new ccxt.binance ();
    await binance.loadMarkets ();
    // spot test
    const spotId = 'x-R4BD3S82';
    const spotOrderRequest = binance.createOrderRequest ('BTC/USDT', 'limit', 'buy', 1, 20000);
    const clientOrderId = spotOrderRequest['newClientOrderId'];
    assert (clientOrderId.startsWith (spotId), 'spot clientOrderId does not start with spotId');

    // swap test
    const swapId = 'x-xcKtGhcu';
    const swapOrderRequest = binance.createOrderRequest ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
    const swapInverseOrderRequest = binance.createOrderRequest ('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
    const clientOrderIdSpot = swapOrderRequest['newClientOrderId'];
    assert (clientOrderIdSpot.startsWith (swapId), 'swap clientOrderId does not start with swapId');
    const clientOrderIdInverse = swapInverseOrderRequest['newClientOrderId'];
    assert (clientOrderIdInverse.startsWith (swapId), 'swap clientOrderIdInverse does not start with swapId');
    await binance.close ();
}

async function testOkx () {
    const okx = new ccxt.okx ();
    const id = 'e847386590ce4dBC';
    await okx.loadMarkets ();
    // spot test
    const spotOrderRequest = okx.createOrderRequest ('BTC/USDT', 'limit', 'buy', 1, 20000);
    const clientOrderId = spotOrderRequest['clOrdId'];
    assert (clientOrderId.startsWith (id), 'spot clientOrderId does not start with id');
    assert (spotOrderRequest['tag'] === id, 'id different from spot tag');


    // swap test
    const swapOrderRequest = okx.createOrderRequest ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
    const clientOrderIdSpot = swapOrderRequest['clOrdId'];
    assert (clientOrderIdSpot.startsWith (id), 'swap clientOrderId does not start with id');
    assert (swapOrderRequest['tag'] === id, 'id different from swap tag');
    await okx.close ();
}

async function testCryptocom () {
    const cryptocom = new ccxt.cryptocom ();
    const id = 'CCXT';
    await cryptocom.loadMarkets ();
    // spot test
    const spotOrderRequest = cryptocom.createOrderRequest ('BTC/USDT', 'limit', 'buy', 1, 20000);
    assert (spotOrderRequest['broker_id'] === id, 'id different from  broker_id');

    // swap test
    const swapOrderRequest = cryptocom.createOrderRequest ('BTC/USD:USD', 'limit', 'buy', 1, 20000);
    assert (swapOrderRequest['broker_id'] === id, 'id different from  broker_id');

    await cryptocom.close ();
}

async function testKucoin () {
    let reqHeaders = undefined;
    const kucoin = new ccxt.kucoin ();
    await kucoin.loadMarkets ();
    try {
        kucoin.apiKey = 'api';
        kucoin.secret = 'secret';
        kucoin.password = 'password';
        await kucoin.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000, reqHeaders);
    } catch (e) {
        // we expect an error here, we're only interested in the headers
        reqHeaders = kucoin.last_request_headers;
    }
    const id = 'ccxt';
    assert (reqHeaders['KC-API-PARTNER'] === id, 'id not in headers');
}

await main ();
