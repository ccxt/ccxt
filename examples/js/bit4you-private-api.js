"use strict";

const ccxt = require('../../ccxt.js');
const asTable = require('as-table');
const log = require('ololog').configure({ locate: false });

require('ansicolor').nice

async function b4yTest () {
        // let exchange2 = new ccxt.coinbase();
        // const res = await exchange2.fetchMarkets();
        // console.log(res)
        const token = 'bearer token here';
        let exchange = new ccxt.bit4you({
            'token': token, // bearer token : need to sign on bit4you
            'enableRateLimit': true,
            'simulation': false // to active demo mode set on true - default (false)
        })

        // console.log(exchange.simulation)

        // fetchOrderBook
        // console.log(await exchange.fetchOrderBook('BTC-USDT'))

        // fetchMarkets
        // console.log(await exchange.fetchStatus())
        
        // fetchCurrencies
        // console.log(await exchange.loadMarkets())

        // fetchMyTrades
        // console.log(await exchange.fetchMyTrades())

        // fetchBalance
        // console.log(await exchange.fetchBalance())

        // createOrder
        // symbol, type, side, amount, price = undefined, params = {}
        // console.log(await exchange.createOrder('SHIB-USDT','market','sell',100))
        // console.log(await exchange.createOrder('AVAX-USDT','market','buy',80))
        // console.log(await exchange.createOrder('LTC-USDT','market','sell',34.10))

        
        // cancelOrder
        // console.log(await exchange.cancelOrder('0d2eb5951c18ba130c74947cdcb1c8fb9fe26732', null, {simulation: true}))

        // fetchOpenOrders
        // console.log(await exchange.fetchOpenOrders(null,null,null,{}))

        // fetchOrders
        // console.log(await exchange.fetchOrders("BTC-USDT",null,null,{}))
        
        // fetchClosedOrders
        // console.log(await exchange.fetchClosedOrders(null,null,null,{}))

        // witdraw
        // console.log(await exchange.withdraw("ADA",null,null,{simulation: true}))

        // fetchTransactions
        // console.log('--- Start ---')
        // console.log(await exchange.fetchTransactions())
        
        
        // console.log('--- Start ---')
        // console.log(await exchange.fetchMyTrades())
        

    };

    b4yTest()