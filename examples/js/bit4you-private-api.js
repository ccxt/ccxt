"use strict";

const ccxt = require('../../ccxt.js');
const asTable = require('as-table');
const log = require('ololog').configure({ locate: false });

require('ansicolor').nice

async function b4yTest () {
        // let exchange2 = new ccxt.coinbase();
        // const res = await exchange2.fetchMarkets();
        // console.log(res)
        const token = 'token here';
        let exchange = new ccxt.bit4you({
            'token': token, // bearer token : need to sign on www.bit4you.io
            'enableRateLimit': true,
            'simulation': true // to active demo mode set on true - default (false)
        })

        console.log('simulation mode:', exchange.simulation)

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
        // console.log(await exchange.fetchTransactions())

        // createOrder
        // symbol, type, side, amount, price = undefined, params = {}
        // console.log(await exchange.createOrder('ADA/USDT','market','buy',100,null,{quantity_iso:'ADA'}))
        // console.log(await exchange.createOrder('AVAX-USDT','market','sell',80,null))
        // console.log(await exchange.createOrder('LTC-USDT','market','sell',34.10,null))

        
        // cancelOrder
        // console.log(await exchange.cancelOrder('28ce0de2fe1c4a42a84bc36162f66ce4', null))

        // fetchOpenOrders
        console.log(await exchange.fetchOrders())

        // fetchOrders
        // console.log(await exchange.fetchOrder('5aaa14cec86a49deb1f7d2c6a8c68c98'))
        
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