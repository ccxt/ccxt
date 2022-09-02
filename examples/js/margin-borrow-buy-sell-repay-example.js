'use strict';
const ccxt = require ('../../ccxt.js');

// AUTO-TRANSPILE //

// Note: examples or implementations are subject to possible change in future. Please subscribe to CCXT-announcements telegram/discord channel to be informed of related & important updates.

async function example () {
    const exchange = new ccxt['binance']({'apikey': 'xxx', 'secret': 'yyy'});
    // set target symbol
    const symbol = 'BUSD/USDT';
    // which asset you want to use for margin-borrow collateral
    const collateral_coin = 'USDT'; 
    // which coin to borrow
    const borrow_coin = 'BUSD'; 
    // how many coins to sell
    const amount_to_trade = 20;
    // at what limit-price you want to sell (set undefined/null/None if market-order)
    const limit_price = 20;
    // what is the target margin. This might be obtainable from exchange automatically, using available endpoints, but for example purposes, we set here manually
    const margin_magnitude = 10; 
    // for example purposes, let's also check available balance at first
    const balance_margin = await exchange.fetchBalance ({'defaultType': 'margin', 'marginMode': 'isolated'}); // 'isolated' or 'cross'.
    // if we don't have enought coins, then we have to borrow at first
    if (balance_margin[symbol][borrow_coin]['free'] < amount_to_trade) {
        console.log ('hmm, I dont have enough margin balance, I should borrow at first.');
        // To initate a borrow, at first, check if we have enough collateral
        const needed_collateral_amount = amount_to_trade/ (margin_magnitude - 1); // as we sell-short, we need '-1' to keep for collateral currency
        // if we don't have any collateral, then at first, we need to transfer it from spot
        if (balance_margin[symbol][collateral_coin]['free'] < needed_collateral_amount) {
            console.log ('hmm, at first I should transfer some collateral from spot');
            // let's check if we have spot balance at all
            const balance_spot = await exchange.fetchBalance ({'type': 'spot'});
            if (balance_spot[collateral_coin]['free'] < needed_collateral_amount) {
                console.log ('hmm, I neither do have enough balance on spot');
                return;
            }  else {
                console.log ('Transferring some ' + collateral_coin + ' to margin account');
                await exchange.transfer (collateral_coin, needed_collateral_amount, 'spot', 'isolated', {'symbol': symbol});
            }
        }
        // now, as we have enough margin collateral, initiate borrow
        console.log ('Initiating margin borrow');
        const borrowResult = await exchange.borrowMargin ('BUSD', amount_to_trade, 'BUSD/USDT', {'marginMode': 'isolated'});
    }
    const order = await exchange.createOrder (symbol, 'market', 'sell', amount_to_trade, limit_price, {'type': 'margin', 'marginMode': 'isolated'});
}

example();