'use strict';

const ccxtpro = require ('ccxt.pro')
    , SocksProxyAgent = require ('socks-proxy-agent')
    , socks = 'socks://127.0.0.1:7000'
    , socksAgent = new SocksProxyAgent (socks)
    , exchange = new ccxtpro.binance ({
        enableRatLimit: true,
        httpsAgent: socksAgent, // ←--------------------- socksAgent here
        options: {
            'ws': {
                'options': { agent: socksAgent }, // ←--- socksAgent here
            },
        },
    })

;(async () => {
    console.log (socks)
    const symbol = 'BTC/USDT'
    await exchange.loadMarkets ()
    console.log ('Markets loaded')
    while (true) {
        try {
            const orderbook = await exchange.watchOrderBook (symbol)
            console.log (exchange.iso8601 (exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0])
        } catch (e) {
            console.log (e.constructor.name, e.message)
        }
    }
}) ()