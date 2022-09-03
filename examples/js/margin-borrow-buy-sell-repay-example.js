'use strict';
const ccxt = require ('../../ccxt.js');

// AUTO-TRANSPILE //

// Note: Ensure your API key have the required permissions to execute the code below. Also, examples might be imperfect and are subject to possible changes. Please subscribe to CCXT-announcements telegram/discord channel to be informed of related & important updates.

async function example () {
    const exchange = new ccxt['binance']({"apiKey":"rM4VAJBGlW8oZV3TSDt1zUXbuYgMKuFZX0CDOTjE2NxzO5Qyd9ep0tX8AYAuIfkN",
	  "secret":"rPgUGBVEFmfqLWtE8qQAirStlQJ1IJi7cGM1HQU7ZtwAwRLZOb11mIGfsdxc2qzG"});
    // set target symbol
    const symbol = 'BUSD/USDT';
    // which asset you want to use for margin-borrow collateral
    const collateral_coin = 'USDT'; 
    // which coin to borrow
    const borrow_coin = 'BUSD'; 
    // how many coins to sell
    const amount_to_trade = 20;
    // at what limit-price you want to sell (set undefined/null/None if market-order)
    const limit_price = 0.99;
    // what is the target margin. This might be obtainable from exchange automatically, using available endpoints, but for example purposes, we set here manually
    const margin_leverage = 10; 
    // for example purposes, let's also check available balance at first
    const balance_margin = await exchange.fetchBalance ({'defaultType': 'margin', 'marginMode': 'isolated'}); // 'isolated' or 'cross'.
    let need_to_borrow = undefined; // will be filled later
    // if we don't have enought coins, then we have to borrow at first
    if (balance_margin[symbol][borrow_coin]['free'] < amount_to_trade) {
        console.log ('hmm, I dont have enough margin balance (' + balance_margin[symbol][borrow_coin]['free'] + borrow_coin + ') to make a trade (' + amount_to_trade + '). I should borrow at first.');
        // To initate a borrow, at first, check if we have enough collateral
        const needed_collateral_amount = amount_to_trade/ (margin_leverage - 1); // as we sell-short, we need '-1' to keep one portion for collateral currency
        // check if we don't have enough collateral to initiate borrow, then try to transfer from spot
        if (balance_margin[symbol][collateral_coin]['free'] < needed_collateral_amount) {
            console.log ('hmm, I neither have enough collateral to initiate a borrow (available ' + balance_margin[symbol][collateral_coin]['free'] +'; needed ' + needed_collateral_amount +'), so at first, make a transfer from spot to margin account');
            // calculate, how much you need to add from spot to margin account
            const amount_needed_to_transfer = needed_collateral_amount - balance_margin[symbol][collateral_coin]['free'];
            // now check if we have spot balance at all
            const balance_spot = await exchange.fetchBalance ({'type': 'spot'});
            if (balance_spot[collateral_coin]['free'] < amount_needed_to_transfer) {
                console.log ('hmm, I neither do have enough balance on spot (available ' + balance_spot[collateral_coin]['free'] + '; needed ' + amount_needed_to_transfer + ')');
                return;
            }  else {
                await exchange.transfer (collateral_coin, amount_needed_to_transfer.toFixed(3), 'spot', 'isolated', {'symbol': symbol});
            }
        }
        // now, as we have enough margin collateral, initiate borrow
        need_to_borrow = amount_to_trade - balance_margin[symbol][borrow_coin]['free'];
        console.log ('Initiating margin borrow of '+ need_to_borrow + ' ' + borrow_coin);
        const borrowResult = await exchange.borrowMargin ('BUSD', need_to_borrow, 'BUSD/USDT', {'marginMode': 'isolated'});
    }
    console.log ('Submitting order.');
    const entry_order = await exchange.createOrder (symbol, 'limit', 'sell', amount_to_trade, limit_price, {'type': 'margin', 'marginMode': 'isolated'});
    // ...
    // ...
    // ...
    // later, if you want to close position
    await exchange.sleep (3000);
    const close_limitprice = 1.1;
    const close_amount = entry_order['amount'];
    // some exchanges might require to close the position at first
    console.log ('Closing the position of ' + symbol);
    const close_order = await exchange.createOrder (symbol, 'limit', 'buy', close_amount, close_limitprice, {'type': 'margin', 'marginMode': 'isolated'});
    // ...
    // ...
    // Now, repay the borrowed amount back to the exchange
    if (need_to_borrow !== undefined) {
        const repay_amount = need_to_borrow;
        console.log ('Repaying the borrowed amount of ' + repay_amount + ' ' + borrow_coin);
        const repayResult = await exchange.repayMargin (borrow_coin, repay_amount, symbol, {'marginMode': 'isolated'});
        console.log ('Repayed! Now you can transfer back your balances back to spot account');
    }
}

example();