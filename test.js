"use strict";

const ccxt      = require ('./ccxt')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')

let markets
let verbose = true

try {

    markets = require ('./config')

} catch (e) {

    markets = { // defaults

        _1broker:    { 'verbose': verbose, apiKey: '' }, // 1broker uses public apiKey only, does not use secret key
        _1btcxe:     { 'verbose': verbose, apiKey: '', secret: '', },
        anxpro:      { 'verbose': verbose, apiKey: '', secret: '', },
        bit2c:       { 'verbose': verbose, apiKey: '', secret: '', },
        bitbay:      { 'verbose': verbose, apiKey: '', secret: '', },
        bitbays:     { 'verbose': verbose, apiKey: '', secret: '', },
        bitcoincoid: { 'verbose': verbose, apiKey: '', secret: '', },
        bitfinex:    { 'verbose': verbose, apiKey: '', secret: '', },
        bitlish:     { 'verbose': verbose, apiKey: '', login: '', password: '', },
        bitmarket:   { 'verbose': verbose, apiKey: '', secret: '', },    
        bitmex:      { 'verbose': verbose, apiKey: '', secret: '', },
        bitso:       { 'verbose': verbose, apiKey: '', secret: '', },
        bitstamp:    { 'verbose': verbose, apiKey: '', secret: '', uid: '', },
        bittrex:     { 'verbose': verbose, apiKey: '', secret: '', },
        btcchina:    { 'verbose': verbose, apiKey: '', secret: '', },
        btce:        { 'verbose': verbose, apiKey: '', secret: '', },
        btcx:        { 'verbose': verbose, apiKey: '', secret: '', },
        bxinth:      { 'verbose': verbose, apiKey: '', secret: '', },
        ccex:        { 'verbose': verbose, apiKey: '', secret: '', },
        cex:         { 'verbose': verbose, apiKey: '', secret: '', uid: '', }, 
        coincheck:   { 'verbose': verbose, apiKey: '', secret: '', },
        coinmate:    { 'verbose': verbose, apiKey: '', secret: '', },
        coinsecure:  { 'verbose': verbose, apiKey: '', },
        exmo:        { 'verbose': verbose, apiKey: '', secret: '', },
        fybse:       { 'verbose': verbose, apiKey: '', secret: '', },
        fybsg:       { 'verbose': verbose, apiKey: '', secret: '', },
        gdax:        { 'verbose': verbose, apiKey: '', secret: '', password: '' }, 
        gemini:      { 'verbose': verbose, apiKey: '', secret: '', },
        hitbtc:      { 'verbose': verbose, apiKey: '', secret: '', },
        huobi:       { 'verbose': verbose, apiKey: '', secret: '', },
        itbit:       { 'verbose': verbose, apiKey: '', secret: '', },
        jubi:        { 'verbose': verbose, apiKey: '', secret: '', },    
        kraken:      { 'verbose': verbose, apiKey: '', secret: '', },    
        luno:        { 'verbose': verbose, apiKey: '', secret: '', },
        mercado:     { 'verbose': verbose, apiKey: '', secret: '', },
        okcoinusd:   { 'verbose': verbose, apiKey: '', secret: '', },
        okcoincny:   { 'verbose': verbose, apiKey: '', secret: '', },
        paymium:     { 'verbose': verbose, apiKey: '', secret: '', },
        poloniex:    { 'verbose': verbose, apiKey: '', secret: '', },
        quadrigacx:  { 'verbose': verbose, apiKey: '', secret: '', uid: 123, },    
        quoine:      { 'verbose': verbose, apiKey: '', secret: '', },    
        therock:     { 'verbose': verbose, apiKey: '', secret: '', },    
        vaultoro:    { 'verbose': verbose, apiKey: '', secret: '', },
        virwox:      { 'verbose': verbose, apiKey: '', login: '', password: '', },
        yobit:       { 'verbose': verbose, apiKey: '', secret: '', },
        zaif:        { 'verbose': verbose, apiKey: '', secret: '', },
    }
}

// console.log (ccxt)

for (let id in markets) {
    markets[id] = new (ccxt)[id] (markets[id])
    markets[id].verbose = verbose
}

console.log (Object.values (ccxt).length)

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}


let sleep = async ms => await new Promise (resolve => setTimeout (resolve, ms))

let testMarket = market => new Promise (async resolve => {

    let delay = 2000

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
            // let ticker = await market.fetchTicker (symbol)
            // console.log (market.id, symbol, 'ticker',
            //     ticker['datetime'],
            //     'high: '    + ticker['high'],
            //     'low: '     + ticker['low'],
            //     'bid: '     + ticker['bid'],
            //     'ask: '     + ticker['ask'],
            //     'volume: '  + ticker['quoteVolume'])
            // await sleep (delay)

            let orderbook = await market.fetchOrderBook (symbol)
            console.log (market.id, symbol, 'order book',
                orderbook['datetime'],
                'bid: '       + orderbook.bids[0][0], 
                'bidVolume: ' + orderbook.bids[0][1],
                'ask: '       + orderbook.asks[0][0],
                'askVolume: ' + orderbook.asks[0][1])
            await sleep (delay)
        }
    }

    
    // let ticker = await market.fetchTicker ('BTC/SLL')
    // let ticker = await market.fetchTicker (symbol)
    // console.log (market.id, symbol, 'ticker')
    // console.log (ticker)
        
    // let trades = await market.fetchTrades (Object.keys (market.products)[0])
    // console.log (market.id, trades)

    if (!market.apiKey || (market.apiKey.length < 1))
        return true

    // sleep (delay)

    let balance = await market.fetchBalance ()
    console.log (market.id, 'balance', balance)

    sleep (delay)

    // try {

    //     let marketSellOrder = await market.sell (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketSellOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'market sell', e)
    // }

    // sleep (delay)

    // try {

    //     let marketBuyOrder = await market.buy (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketBuyOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'market buy', e)
    // }

    // sleep (delay)

    // try {

    //     let limitSellOrder = await market.sell (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitSellOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'limit sell', e)
    // }

    // sleep (delay)

    // try {

    //     let limitBuyOrder = await market.buy (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitBuyOrder)

    // } catch (e) {

    //     console.log (market.id, 'error', 'limit buy', e)
    // }

    // let order = await market.sell ('BTC/USD', 1, 3000)
    // console.log (market.id, order)

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
