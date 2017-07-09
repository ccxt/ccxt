"use strict";

const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')

let markets = {}
let verbose = true

try {

    markets = require ('./config')

} catch (e) {

    markets = {}
}

// console.log (ccxt)

ccxt.markets.forEach (id => {
    markets[id] = new (ccxt)[id] ({ 'verbose': verbose, apiKey: '', secret: '', })
})

console.log (Object.values (ccxt).length)

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}


let sleep = async ms => await new Promise (resolve => setTimeout (resolve, ms))

let testMarket = market => new Promise (async resolve => {

    let delay = market.rateLimit

    let products  = await market.loadProducts ()

    let keys = Object.keys (products)
    console.log (market.id , keys.length, 'symbols', keys.join (', '))

    // Object.values (market.products).map (x => console.log (market.id, x.id))
    // console.log (market.id, 'products', market.products)
    // console.log (market.id, Object.keys (market.products).length, 'symbols', Object.keys (market.products).join (', '))

    // sleep (delay)

    // let orderbook = await market.fetchOrderBook (Object.keys (market.products)[0])
    // console.log (market.id, orderbook)

    // sleep (delay)

    // let symbol = keys[0]
    // let symbols = [
    //     'BTC/USD',
    //     'BTC/CNY',
    //     'BTC/ETH',
    //     'ETH/BTC',
    //     'BTC/JPY',
    //     'LTC/BTC',
    // ]
    // for (let s in symbols) {
    //     if (symbols[s] in keys) {
    //         symbol = symbols[s]
    //         break
    //     }
    // }

    for (let s in keys) {
        let symbol = keys[s]
        if (symbol.indexOf ('.d') < 0) {

            await sleep (delay)
            let ticker = await market.fetchTicker (symbol)
            console.log (market.id, symbol, 'ticker',
                ticker['datetime'],
                'high: '    + ticker['high'],
                'low: '     + ticker['low'],
                'bid: '     + ticker['bid'],
                'ask: '     + ticker['ask'],
                'volume: '  + ticker['quoteVolume'])

            await sleep (delay) 
            let orderbook = await market.fetchOrderBook (symbol)
            console.log (market.id, symbol, 'order book',
                orderbook['datetime'],
                'bid: '       + ((orderbook.bids.length > 0) ? orderbook.bids[0][0] : 'N/A'), 
                'bidVolume: ' + ((orderbook.bids.length > 0) ? orderbook.bids[0][1] : 'N/A'),
                'ask: '       + ((orderbook.asks.length > 0) ? orderbook.asks[0][0] : 'N/A'),
                'askVolume: ' + ((orderbook.asks.length > 0) ? orderbook.asks[0][1] : 'N/A'))

            let bids = orderbook.bids
            if (bids.length > 1) {
                let first = 0
                let last = bids.length - 1
                if (bids[first][0] < bids[last][0])
                    console.log (market.id, symbol, 'bids reversed')
                else if (bids[first][0] > bids[last][0])
                    console.log (market.id, symbol, 'bids ok')
            }
            let asks = orderbook.asks
            if (asks.length > 1) {
                let first = 0
                let last = asks.length - 1
                if (asks[first][0] > asks[last][0])
                    console.log (market.id, symbol, 'asks reversed', asks[first][0], asks[last][0])
                else if (asks[first][0] < asks[last][0])
                    console.log (market.id, symbol, 'asks ok')
            }
        }
    }
            
    // let trades = await market.fetchTrades (Object.keys (market.products)[0])
    // console.log (market.id, trades)

    if (!market.apiKey || (market.apiKey.length < 1))
        return true

    sleep (delay)

    let balance = await market.fetchBalance ()
    console.log (market.id, 'balance', balance)

    // sleep (delay)

    // try {
    //     let marketSellOrder = await market.createMarketSellOrder (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market sell', e)
    // }

    // sleep (delay)

    // try {
    //     let marketBuyOrder = await market.createMarketBuyOrder (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market buy', e)
    // }

    // sleep (delay)

    // try {
    //     let limitSellOrder = await market.createLimitSellOrder (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit sell', e)
    // }

    // sleep (delay)

    // try {
    //     let limitBuyOrder = await market.createLimitBuyOrder (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit buy', e)
    // }

})

//-----------------------------------------------------------------------------

var test = async function () {

    //-------------------------------------------------------------------------
    // list all supported exchanges
    
    console.log (asTable.configure ({ delimiter: ' | ' }) (Object.values (markets).map (market => {
        let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
        let countries = Array.isArray (market.countries) ? market.countries.map (countryName).join (', ') : countryName (market.countries)
        let doc = Array.isArray (market.urls.doc) ? market.urls.doc[0] : market.urls.doc
        return {
            ' ': '',
            'id':        market.id,
            'name':      '[' + market.name + '](' + website + ')', 
            'docs':      '[API](' + doc + ')',
            'countries': countries,
            
            // 'notes':     'Full support',
            '  ': '',
        }        
    })))

    if (process.argv.length > 2) {
        let id = process.argv[2]        
        if (markets[id]) {
            let market = markets[id]         
            try {
                await testMarket (market)
            } catch (e) {
                console.log (market.id, e)
                process.exit ()   
            }
        }
    } else {
        Object.keys (markets).forEach (async id => {
            var market = markets[id]
            try {
                await testMarket (market)
            } catch (e) {
                console.log (market.id, e)
                process.exit ()   
            }
            sleep (1000)
        })
    }

} ()
