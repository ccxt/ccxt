- [Margin Loan Borrow Buy Sell Repay](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
// Note, this is just an example and might not yet work on other exchanges, which are being still unified.
async function example() {
    // ########## user inputs ##########
    const exchange = new ccxt['binance']({ 'apiKey': 'xxx', 'secret': 'xxx' });
    const symbol = 'BUSD/USDT'; // set target symbol
    const marginMode = 'isolated'; // margin mode (cross or isolated)
    const collateral_coin = 'USDT'; // which asset you want to use for margin-borrow collateral
    const borrow_coin = 'BUSD'; // which coin to borrow
    const order_side = 'sell'; // which side to trade
    const amount_to_trade = 14; // how many coins to sell
    const order_type = 'limit'; // order type (can be market, limit or etc)
    const limit_price = 0.99; // price to sell at (set undefined/null/None if market-order)
    const margin_magnitude = 5; // target margin (aka 'leverage'). This might also be obtainable using other unified methods, but for example purposes, we set here manually
    // ########## end of user-inputs ##########
    //
    // for example purposes, let's also check available balance at first
    const balance_margin = await exchange.fetchBalance({ 'defaultType': 'margin', 'marginMode': marginMode }); // use `defaultType` because of temporary bug, otherwise, after several days, you can use `type` too.
    // if we don't have enought coins, then we have to borrow at first
    let needed_amount_to_borrow = undefined; // will be auto-set below
    if (amount_to_trade > balance_margin[symbol][borrow_coin]['free']) {
        needed_amount_to_borrow = amount_to_trade - balance_margin[symbol][borrow_coin]['free'];
        console.log('hmm, I have only ', balance_margin[symbol][borrow_coin]['free'], ' ', borrow_coin, ' in margin balance, and still need additional ', needed_amount_to_borrow, ' to make an order. Lets borrow it.');
        // To initate a borrow, at first, check if we have enough collateral (for this example, as we make a sell-short, we need '-1' to keep for collateral currency)
        const needed_collateral_amount = needed_amount_to_borrow / (margin_magnitude - 1);
        // Check if we have any collateral to get permission for borrow
        if (balance_margin[symbol][collateral_coin]['free'] < needed_collateral_amount) {
            // If we don't have enough collateral, then let's try to transfer collateral-asset from spot-balance to margin-balance
            console.log('hmm, I have only ', balance_margin[symbol][collateral_coin]['free'], ' in balance, but ', needed_collateral_amount, ' collateral is needed. I should transfer ', needed_collateral_amount, ' from spot');
            // let's check if we have spot balance at all
            const balance_spot = await exchange.fetchBalance({ 'type': 'spot' });
            if (exchange.parseNumber(balance_spot[collateral_coin]['free']) < needed_collateral_amount) {
                console.log('hmm, I neither do have enough balance on spot - only ', balance_spot[collateral_coin]['free'], '. Script can not continue...');
                return;
            }
            else {
                console.log('Transferring  ', needed_collateral_amount, ' to margin account');
                await exchange.transfer(collateral_coin, needed_collateral_amount, 'spot', marginMode, { 'symbol': symbol });
            }
        }
        // now, as we have enough margin collateral, initiate borrow
        console.log('Initiating margin borrow of ', needed_amount_to_borrow, ' ', borrow_coin);
        const borrowResult = await exchange.borrowMargin(borrow_coin, needed_amount_to_borrow, symbol, { 'marginMode': marginMode });
    }
    console.log('Submitting order.');
    const order = await exchange.createOrder(symbol, order_type, order_side, amount_to_trade, limit_price, { 'marginMode': marginMode });
    console.log('Order was submitted !', order['id']);
    //
    //
    // ...
    // ...
    // some time later, if you want to repay the loan back (like 'close the position')...
    // ...
    // ...
    //
    //
    // set the "repay-back" amount (for this example snippet, this will be same amount that we borrowed above)
    if (needed_amount_to_borrow !== undefined) {
        const amount_to_repay_back = needed_amount_to_borrow;
        // At first, you need to get back the borrowed coin, by making an opposide trade
        console.log('Making purchase back of ', amount_to_repay_back, ' ', borrow_coin, ' to repay it back.');
        const purchase_back_price = 1.01;
        const order_back = await exchange.createOrder(symbol, order_type, (order_side === 'buy' ? 'sell' : 'buy'), amount_to_repay_back, purchase_back_price, { 'marginMode': marginMode });
        console.log('Now, repaying the loan.');
        const repayResult = await exchange.repayMargin(borrow_coin, amount_to_repay_back, symbol, { 'marginMode': marginMode });
        console.log('finished.');
    }
}
await example();
 
```