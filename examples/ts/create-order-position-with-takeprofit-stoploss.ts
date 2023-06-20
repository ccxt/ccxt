import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

console.log ('CCXT Version:', ccxt.version);

// ------------------------------------------------------------------------------

async function example () {
    // at this moment, only OKX support embedded stop-loss & take-profit orders in unified manner. other exchanges are being added actively and will be available soon.
    const exchange = new ccxt.okx ({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_API_SECRET",
        "password": "YOUR_API_PASSWORD", // comment out if not needed for chosen exchange
    });

    const symbol = 'ETH/USDT:USDT';
    const side = 'buy'; // set it to 'buy' for a long position, 'sell' for a short position
    const order_type = 'limit'; // set it to 'market' or 'limit'
    const amount = 1; // how many contracts

    await exchange.loadMarkets ();
    const market = exchange.market (symbol);

    const ticker = exchange.fetchTicker (symbol);

    const last_price = ticker['last'];
    const ask_price = ticker['ask'];
    const bid_price = ticker['bid'];

    // None for market orders or a limit price for a limit order
    const price = (order_type === 'market') ? undefined : (side === 'buy' ? bid_price * 0.999 : ask_price * 1.001);

    // set trigger-price for stop-loss/take-profit to 2% from current price
    const stop_loss_trigger_price = (order_type === 'market' ? last_price : price) * (side === 'buy' ? 0.98 : 1.02);
    const take_profit_trigger_price = (order_type === 'market' ? last_price : price) * (side === 'buy' ? 1.02 : 0.98);

    // when symbol's price reaches your predefined "trigger price", stop-loss order would be activated as a "market order". but if you want it to be activated as a "limit order", then set a 'price' parameter for it
    const params = {
        'stopLoss': {
            'triggerPrice': stop_loss_trigger_price,
            // set a 'price' to act as limit order or leave commented for a market order
            // 'price': stop_loss_trigger_price * 0.98,
        },
        'takeProfit': {
            'triggerPrice': take_profit_trigger_price,
            // set a 'price' to act as limit order or leave commented for a market order
            // 'price': take_profit_limit_price * 0.98,
        },
    };

    const position_amount = market['contractSize'] * amount;
    const position_value = position_amount * last_price;
    // log
    console.log ('Going to open a position', 'for', amount, 'contracts worth', position_amount, market['base'], '~', position_value * last_price, market['settle'], 'using', side, order_type, 'order',  (order_type === 'limit' ? 'at price' + exchange.priceToPrecision (symbol, price) : ''), ', using the following params:');
    console.log (params);
    console.log ('-----------------------------------------------------------------------');

    // exchange.verbose = True  // uncomment for debugging purposes if necessary

    try {
        const created_order = exchange.createOrder (symbol, order_type, side, amount, price, params);
        console.log (created_order);
        // uncomment the following lines to cancel a limit order
        // if order_type == 'limit':
        //     canceled_order = exchange.cancel_order(created_order['id'], symbol)
        //     pconsole.log(canceled_order)
    } catch (e) {
        console.log (e.toString ());
    }
}


await example ();

// NOTES:
// - Sometimes you might experience, when their stop-loss/take-profit order might not become activated, even though on chart the price had crossed that "trigger-price"       order was not executed . That happens because some exchange might be using mark-price (instead of last-price) as a reference-price, so that mark-price might reach your trigger-price and it would activate your SL/TP order (even though on your symbol's chart you are viewing the "last-price" by default, which could have different movements than the mark-price).
