// @ts-nocheck
import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const ex = new ccxt.pro.okx ({
        // if private endpoints are needed, input the api-keys
        'apiKey': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'secret': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'password': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    });
    await ex.loadMarkets ();
    await ex.authenticate ();
    // set custom hander, so when a balance is changed, it will trigger the event handler
    ex.options['customWsHandlers']['balance_and_position'] = myHandler;
    ex.my_watch_balance_and_position = my_watch_balance_and_position;
    await ex.my_watch_balance_and_position (ex);
}

async function my_watch_balance_and_position (exchange, params = {}) {
    const channel = 'balance_and_position';
    const symbol = undefined;
    // different exchanges have different arguments/signature for 'subscribe' method, so check the desired exchange's 'subscribe' method signature to know which/how many arguments to pass
    return await exchange.subscribe ('private', channel, channel, symbol, params);
}

function myHandler (wsClient, message) {
    console.log ('myHandler', message);
    return message;
}

await example ();
