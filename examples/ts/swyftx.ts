// @ts-nocheck
import ccxt from '../../js/ccxt.js';
import path from 'path';
import fs from 'fs';
import { Agent } from 'https'

// AUTO-TRANSPILE //

console.log ('CCXT Version:', ccxt.version);

// ------------------------------------------------------------------------------

const httpsAgent = new Agent ({
    ecdhCurve: 'auto',
    keepAlive: true,
})

async function example () {
    const keysLocal = path.resolve ('keys.local.json')

    const keysFile = fs.existsSync (keysLocal) ? keysLocal : null
    // @ts-ignore
    const settingsFile  = fs.readFileSync(keysFile, 'utf-8');
    let allSettings = JSON.parse(settingsFile.toString())
    const swyftxSettings = allSettings.swyftx || {};


    const timeout = 30000

    // @ts-ignore
    const exchange = new ccxt.swyftx ()

    const symbol = 'BTC/AUD';
    let side = 'buy';
    const order_type = 'market';
    const amount = 0.01;

    await exchange.loadMarkets ();
    await exchange.loadAssetMapping ();

    const market = exchange.market (symbol);

    let price = undefined;

    const ticker = await exchange.fetchTicker (symbol);
    const last_price = ticker['last'];
    const ask_price = ticker['ask'];
    const bid_price = ticker['bid'];
    // if (order_type === 'limit') {
    //     price = (side === 'buy') ? bid_price * 0.95 : ask_price * 1.05; // i.e. 5% from current price
    // }

    // log
    console.log ('Going to open a position', 'for', amount, 'worth', amount, market['base'], '~', market['settle'], 'using', side, order_type, 'order (', (order_type === 'limit' ? exchange.priceToPrecision (symbol, price) : ''), '), using the following params:');
    console.log (params);
    console.log ('-----------------------------------------------------------------------');

    exchange.verbose = true; // uncomment for debugging purposes if necessary

    try {
    //     const created_order = await exchange.createOrder (symbol, order_type, side, amount, price, params);
    //     console.log ("Created an order", created_order);

    //     // Fetch all your closed orders for this symbol (because we used market order)
    //     // - use 'fetchClosedOrders' or 'fetchOrders' and filter with 'closed' status
    //     const all_closed_orders = await exchange.fetchClosedOrders (symbol);
    //     console.log ("Fetched all your closed orders for this symbol", all_closed_orders);

    //     const all_open_positions = await exchange.fetchPositions (symbol);
    //     console.log ("Fetched all your positions for this symbol", all_open_positions);

    //     // To close a position:
    //     // - long position (buy), you can create a sell order: exchange.createOrder (symbol, order_type, 'sell', amount, price, params);
    //     // - short position (sell), you can create a buy order: exchange.createOrder (symbol, order_type, 'buy', amount, price, params);
    } catch (e) {
        console.log (e.toString ());
    }
}


await example ();
