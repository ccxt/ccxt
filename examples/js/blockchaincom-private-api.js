"use strict";

const ccxt = require('../../ccxt.js')
const asTable = require('as-table')
const log = require('ololog').configure({ locate: false })

require('ansicolor').nice

    ; (async () => {

        let exchange = new ccxt.blockchaincom({
            'secret': 'YOUR_SECRET_KEY'
        })
        let withdrawal_beneficiary = 'BENEFICIARY'

        try {

            // fetch fees
            let tradingFees = await exchange.fetchTradingFees()
            log('tradingFees'.green, tradingFees)

            // my trades
            let myTrades = await exchange.fetchMyTrades('BTC-USD', undefined, 5)
            log('myTrades'.green, asTable(myTrades))

            // deposits
            let deposits = await exchange.fetchDeposits()
            log('Deposits'.green, asTable(deposits))

            // fetch account balance from the exchange
            let balance = await exchange.fetchBalance()
            log('balance'.green, balance.total)

             // withdrawals
            let withdrawals = await exchange.fetchWithdrawals()
            log('Withdrawals'.green, asTable(withdrawals))

            // deposit address
            let paxDeposit = await exchange.fetchDepositAddress("XLM")
            log('Pax deposit address'.green, paxDeposit)

            // create new limit order
            let newOrder = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.01, 2000)
            console.log('New limit order'.green, newOrder);

            // open orders
            let openOrders = await exchange.fetchOpenOrders()
            log('Open orders'.green, asTable(openOrders))

            // cancel order
            let canceledOrder = await exchange.cancelOrder(newOrder.id)
            console.log('Canceled order'.green, canceledOrder);

            // closed orders
            let closedOrders = await exchange.fetchClosedOrders()
            log('Closed orders'.green, asTable(closedOrders))

            // orders by state
            let ordersByState = await exchange.fetchOrdersByState("CANCELED")
            log('Orders by State'.green, asTable(ordersByState))

            // fetch withdrawal white list
            let whiteList = await exchange.fetchWithdrawalWhitelist()
            log('whiteList'.green, asTable(whiteList))

            // cancel all open orders
            let canceledOrders = await exchange.cancelOrders(null)
            console.log('Canceled all open orders'.green, canceledOrders);

            // withdrawal
            const params = { 'beneficiary': withdrawal_beneficiary }
            let btcWithdraw = await exchange.withdraw("BTC", 0.01, "", undefined, params)
            log('BTC withdrawal'.green, btcWithdraw)

        } catch (e) {

            if (e instanceof ccxt.DDoSProtection || e.message.includes('ECONNRESET')) {
                log.bright.yellow('[DDoS Protection] ' + e.message)
            } else if (e instanceof ccxt.RequestTimeout) {
                log.bright.yellow('[Request Timeout] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.yellow('[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                log.bright.yellow('[Exchange Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                log.bright.yellow('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NetworkError) {
                log.bright.yellow('[Network Error] ' + e.message)
            } else {
                throw e;
            }
        }

    })()