"use strict";

const ccxt = require('../../ccxt.js')
const asTable = require('as-table')
const log = require('ololog').configure({ locate: false })

require('ansicolor').nice

async function b4yTest () {
        let apiUrl = 'https://www.bit4you.io/api';

        let exchange = new ccxt.bit4you({
            'token': '8ced29c268b38e2f03336de8a3e51118382c4271', //bearer token : need to sign on bit4you
            'enableRateLimit': true,
            urls: {
                'api': {
                    'public': apiUrl,
                    'private': apiUrl,
                    'v1': apiUrl
                }
            }
        })

        console.log(await exchange.fetchOrderBook('BTC-USDT'))

        // try {
        //     // fetch account balance from the exchange
        //     let balance = await exchange.fetchMarkets()
        //     console.log (balance)
            

        // } catch (e) {
        //     console.error('error:',e)
        // }

    };

    b4yTest()