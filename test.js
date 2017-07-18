"use strict";

const ccxt      = require ('./ccxt.js')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog')

require ('ansicolor').nice;

let markets = {}

try {

    markets = require ('./config')

} catch (e) {

    markets = {}
}

ccxt.markets.forEach (id => {
    markets[id] = new (ccxt)[id] ({
        verbose: true,
        // proxy: 'https://crossorigin.me/',
        // proxy: 'https://cors-anywhere.herokuapp.com/',
        // proxy: 'http://cors-proxy.htmldriven.com/?url=',
    })
})

let config = {
    '_1broker':    { 'apiKey': 'A0f79063a5e91e6d62fbcbbbbdd63258' },
    '_1btcxe':     { 'apiKey': '7SuUd4B6zfGAojPn', 'secret': '392WCRKmGpcXdiVzsyQqwengLTOHkhDa' },
    'bit2c':       { 'apiKey': '5296814c-b1dc-4201-a62a-9b2364e890da', 'secret': '8DC1100F7CAB0AE6FE72451C442BE7B111404CBD569CE6162F8F2122CAEB211C' },
    'bitbay':      { 'apiKey': '3faec3e5458d24809a68fbaf0e97245b', 'secret': '2ffb20992e10dd54fd4fd4133cc09b00' },
    'bitcoincoid': { 'apiKey': 'KFB2MWYU-HTOUVOSO-UZYRPLUY-LIYMVPRU-UTOMHXYD', 'secret': '5ecb9464b3fad228110f33c6fbb32990b755351216e63089fdaf8f2735b4577bd9c335236f1a71e3' },
    'bitfinex':    { 'apiKey': '3oMHSKu37ZoJliKwcN35JHfXUBHxWvVqQmRfaFhbBTF', 'secret': 'm9Cf9krGuRolalRxsIBO53GNLmr6GXYIASwoGJiZxhS' },
    'bitlish':     { 'apiKey': 'fixed:N5lK4iokAc9ajk0Z8pvHfpoJsyzNzQ2nespNH/mY7is', 'login': 'igor.kroitor@gmail.com', 'password': 'VfvfVskfHfve229!' },
    'bitmarket':   { 'apiKey': '43a868dc9517485f28905b320581d1cf', 'secret': '892b34c7d8e6669550aa9d12aed0ad34' },
    'bitmex':      { 'apiKey': 'nsLKchj2hAxc5t5CP6LGTNSC', 'secret': '4AqteCYo9ZCPx9J3dhNiGY-_LTfmtLyqCzh-XSbCibuC-Pf6' },
    'bitso':       { 'apiKey': 'FZZzVkZgza', 'secret': 'f763b98d46d8c5e352b4ef70050bc9b1' },
    'bittrex':     { 'apiKey': '60f38a5818934fc08308778f94d3d8c4', 'secret': '9d294ddb5b944403b58e5298653720c1' },
    'btcx':        { 'apiKey': '53IPO-ZBQEN-91UNL-B8VD5-CTU1Z-E6RB1-S9X3P', 'secret': 'ptrearsi6oy1lmzazfcytnbozmsvjsnzha8hrrqqbjlnvgnqlpjb7kqxyency45a' },
    'bxinth':      { 'apiKey': '191c59bb46d5', 'secret': '03031e588e69' },
    // 'ccex':        { 'apiKey': '301D5954466D87CEAA9BA713A7951F5A', 'secret': 'F7DC06D6329FC1C266BFFA18DCC8A07D' },
    'cex':         { 'apiKey': 'eqCv267WySlu577JnFbGK2RQzIs', 'secret': 'pZnbuNEm5eE4W1VRuFQvZEiFCA', 'uid': 'up105393824' },
    'coincheck':   { 'apiKey': '1YBiSTpyEIkchWdE', 'secret': 'URuZrMASNkcd7vh1zb7zn4IQfZMoai3S' },
    'coinsecure':  { 'apiKey': 'gzrm0fP6BGMilMzmsoJFPMpWjDvCLThyrVanX0yu' },
    'coinspot':    { 'apiKey': '36b5803f892fe97ccd0b22da79ce6b21', 'secret': 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH', },
    'fybse':       { 'apiKey': 'gY7y57RlYqKN5ZI50O5C', 'secret': '1qm63Ojf5a' },
    'fybsg':       { 'apiKey': '', 'secret': '' },
    'gdax':        { 'apiKey': '92560ffae9b8a01d012726c698bcb2f1', 'secret': '9aHjPmW+EtRRKN/OiZGjXh8OxyThnDL4mMDre4Ghvn8wjMniAr5jdEZJLN/knW6FHeQyiz3dPIL5ytnF0Y6Xwg==', 'password': '6kszf4aci8r', },
    'hitbtc':      { 'apiKey': '18339694544745d9357f9e7c0f7c41bb', 'secret': '8340a60fb4e9fc73a169c26c7a7926f5' },
    'huobi':       { 'apiKey': '09bdde40-cc179779-1941272a-433a7', 'secret': 'ce6487f4-f078c39f-018ea6ce-01922' },
    'jubi':        { 'apiKey': '4edas-tn7jn-cpr8a-1er4k-r8h8i-cp6kj-jpzyz', 'secret': 'YYO(r-mp$2G-m4&1b-EYu~$-%tS4&-jNNhI-L!pg^' },
    'livecoin':    { 'apiKey': 'W5z7bvQM2pEShvGmqq1bXZkb1MR32GKw', 'secret': 'n8FrknvqwsRnTpGeNAbC51waYdE4xxSB', },
    'luno':        { 'apiKey': 'nrpzg7rkd8pnf', 'secret': 'Ps0DXw0TpTzdJ2Yek8V5TzFDfTWzyU5vfLdCiBP6vsI' },
    'okcoinusd':   { 'apiKey': 'da83cf1b-6fdc-495a-af55-f809bec64e2b', 'secret': '614D2E6D3428C2C5E54C81139A500BE0' },
    'okcoincny':   { 'apiKey': '', 'secret' : '' },
    'poloniex':    { 'apiKey': 'DW6G1D24-2HWMZZTY-6TUADS2O-TF87O6LS', 'secret': '70cc628f95e4e536bd2de702c058ff482fff52f176ac884d6aa605040c29e31caca93430755d1c56a09d0c6a9fe90077754da54b194523f21591e63015bf81fd' },
    'quadrigacx':  { 'apiKey': 'jKvWkMqrOj', 'secret': 'f65a2e3bf3c73171ee14e389314b2f78', 'uid': '395037' },
    'quoine':      { 'apiKey': '80953', 'secret': 'WfHUWcdFoGvZSuE7pE8XDh8FG9t5OP69iYrcwdnRs4rRn2uzZW+AHCyp/nBjlZcB+LWe3r6y2DCCYu+WcYkCAA==' },
    'therock':     { 'apiKey': '2b2a54cc6258b2a971318000d60e6b61ba4af05e', 'secret': 'b424a76088bda492852dbd5cadbb60ebcf144427' },
    'vaultoro':    { 'apiKey': 'A5jfgi567JP5QPpXYpETfsw92khpuNfR', 'secret': 'OExkUFpUX3o5UHB4amFtQ2R4QUh1RFBPMUhnX0k1bUY=' },
    'virwox':      { 'apiKey': '1ea680450b32585f743c50c051bf8e4e', 'login': 'IgorKroitor', 'password': 'HfveVskfVfvf260' },
    'xbtce':       { 'apiKey': 'dK2jBXMTppAM57ZJ', 'secret': 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT', 'uid': '68ef0552-3c37-4896-ba56-76173d9cd573', },
    'yobit':       { 'apiKey': '5DB6C7C6034E667D77F85B245772A7FD', 'secret': '1b6cf1838716f5c87f07391a9b30f974' },
    'zaif':        { 'apiKey': '580c7232-06c7-4698-8fb7-4cd2a543cea8', 'secret': '4c529fd6-fb28-4879-b20d-2a8f02c5db47' },
}

for (let id in config)
    for (let key in config[id])
        markets[id][key] = config[id][key]

markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'
markets['anxpro'].proxy = 'https://crossorigin.me/'

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

let testMarketSymbolTicker = async (market, symbol) => {
    await sleep (market.rateLimit)
    let ticker = await market.fetchTicker (symbol)
    log (market.id, symbol, 'ticker', ticker,
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['quoteVolume'])

    if (ticker['bid'] > ticker['ask'])
        console.log (this.id, symbol, 'ticker', 'bid is greater than ask!')

    return ticker;
}

let testMarketSymbolOrderbook = async (market, symbol) => {
    await sleep (market.rateLimit) 
    let orderbook = await market.fetchOrderBook (symbol)
    log (market.id, symbol, 'order book',
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

    if (bids.length && asks.length)
        if (bids[0][0] > asks[0][0])
            console.log (this.id, symbol, 'order book', 'bid is greater than ask!')

    return orderbook
}

let testMarketSymbol = async (market, symbol) => {
    await testMarketSymbolTicker (market, symbol)
    if (market.id == 'coinmarketcap') {
        // console.log (await market.fetchTickers ());
        console.log (await market.fetchGlobal ());
    } else {
        await testMarketSymbolOrderbook (market, symbol)

    }
}

let loadMarket = async market => {
    let products  = await market.loadProducts ()
    let keys = Object.keys (products)
    console.log (market.id, keys.length, 'symbols', keys.join (', '))
}

let testMarket = async market => {

    let delay = market.rateLimit

    let keys = Object.keys (market.products)

    let symbol = keys[0]
    let symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]
    for (let s in symbols) {
        if (keys.includes (symbols[s])) {
            symbol = symbols[s]
            break
        }
    }

    log.green ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testMarketSymbol (market, symbol)
    }

    // let trades = await market.fetchTrades (Object.keys (market.products)[0])
    // console.log (market.id, trades)

    if (!market.apiKey || (market.apiKey.length < 1))
        return true

    // await sleep (delay)

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

}

//-----------------------------------------------------------------------------

var test = async function () {

    process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
    process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

    //-------------------------------------------------------------------------
    // list all supported exchanges
    
    // console.log (asTable.configure ({ delimiter: ' | ' }) (Object.values (markets).map (market => {
    //     let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
    //     let countries = Array.isArray (market.countries) ? market.countries.map (countryName).join (', ') : countryName (market.countries)
    //     let doc = Array.isArray (market.urls.doc) ? market.urls.doc[0] : market.urls.doc
    //     return {
    //         'id':        market.id,
    //         'name':      market.name,
    //         'countries': countries,
    //     }        
    // })))

    if (process.argv.length > 2) {
        let id = process.argv[2]
        if (!markets[id])
            throw new Error ('Market `' + id + '` not found')
        const market = markets[id]
        await loadMarket (market)
        if (process.argv.length > 3) {
            let symbol = process.argv[3]
            await testMarketSymbol (market, symbol)
        } else {
            await testMarket (market)
        }
    } else {

        for (const id of Object.keys (markets)) {

            if (['lakebtc', 'coinspot', 'urdubit' ].indexOf (id) < 0) {

                log.bright.green ('MARKET:', id)

                try {
                    const market = markets[id]
                    await loadMarket (market)
                    await testMarket (market)
                } catch (e) {
                    if (e instanceof ccxt.DDoSProtectionError || e.message.includes ('ECONNRESET')) {
                        log.bright.yellow ('[DDoS Protection Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.TimeoutError) {
                        log.bright.yellow ('[Timeout Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.AuthenticationError) {
                        log.bright.yellow ('[Authentication Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.MarketNotAvailaibleError) {
                        log.bright.yellow ('[Market Not Available Error] ' + e.message + ' (ignoring)')
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

} ()
