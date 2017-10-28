"use strict";

/*

MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

"use strict";

//-----------------------------------------------------------------------------
// dependencies

const CryptoJS = require ('crypto-js')
    , qs       = require ('qs') // querystring

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.9.282'

// const _1broker           = require ('./exchanges/_1broker.js')
// const _1btcxe            = require ('./exchanges/_1btcxe.js')
// const acx                = require ('./exchanges/acx.js')
// const allcoin            = require ('./exchanges/allcoin.js')
// const anxpro             = require ('./exchanges/anxpro.js')
// const binance            = require ('./exchanges/binance.js')
// const bit2c              = require ('./exchanges/bit2c.js')
// const bitbay             = require ('./exchanges/bitbay.js')
// const bitcoincoid        = require ('./exchanges/bitcoincoid.js')
// const bitfinex           = require ('./exchanges/bitfinex.js')
// const bitfinex2          = require ('./exchanges/bitfinex2.js')
// const bitflyer           = require ('./exchanges/bitflyer.js')
// const bithumb            = require ('./exchanges/bithumb.js')
// const bitlish            = require ('./exchanges/bitlish.js')
// const bitmarket          = require ('./exchanges/bitmarket.js')
// const bitmex             = require ('./exchanges/bitmex.js')
// const bitso              = require ('./exchanges/bitso.js')
// const bitstamp1          = require ('./exchanges/bitstamp1.js')
// const bitstamp           = require ('./exchanges/bitstamp.js')
// const bittrex            = require ('./exchanges/bittrex.js')
// const blinktrade         = require ('./exchanges/blinktrade.js')
// const bl3p               = require ('./exchanges/bl3p.js')
// const bleutrade          = require ('./exchanges/bleutrade.js')
// const btcbox             = require ('./exchanges/btcbox.js')
// const btcchina           = require ('./exchanges/btcchina.js')
const btce               = require ('./exchanges/btce.js')
// const btcmarkets         = require ('./exchanges/btcmarkets.js')
// const btcexchange        = require ('./exchanges/btcexchange.js')
// const btctradeua         = require ('./exchanges/btctradeua.js')
// const btcturk            = require ('./exchanges/btcturk.js')
// const btcx               = require ('./exchanges/btcx.js')
// const bter               = require ('./exchanges/bter.js')
// const bxinth             = require ('./exchanges/bxinth.js')
// const ccex               = require ('./exchanges/ccex.js')
// const cex                = require ('./exchanges/cex.js')
// const chbtc              = require ('./exchanges/chbtc.js')
// const chilebit           = require ('./exchanges/chilebit.js')
// const coincheck          = require ('./exchanges/coincheck.js')
// const coinfloor          = require ('./exchanges/coinfloor.js')
// const coingi             = require ('./exchanges/coingi.js')
// const coinmarketcap      = require ('./exchanges/coinmarketcap.js')
// const coinmate           = require ('./exchanges/coinmate.js')
// const coinsecure         = require ('./exchanges/coinsecure.js')
// const coinspot           = require ('./exchanges/coinspot.js')
// const cryptopia          = require ('./exchanges/cryptopia.js')
// const dsx                = require ('./exchanges/dsx.js')
// const exmo               = require ('./exchanges/exmo.js')
// const flowbtc            = require ('./exchanges/flowbtc.js')
// const foxbit             = require ('./exchanges/foxbit.js')
// const fybse              = require ('./exchanges/fybse.js')
// const fybsg              = require ('./exchanges/fybsg.js')
// const gatecoin           = require ('./exchanges/gatecoin.js')
// const gateio             = require ('./exchanges/gateio.js')
// const gdax               = require ('./exchanges/gdax.js')
// const gemini             = require ('./exchanges/gemini.js')
// const hitbtc             = require ('./exchanges/hitbtc.js')
// const hitbtc2            = require ('./exchanges/hitbtc2.js')
// const huobi1             = require ('./exchanges/huobi1.js')
// const huobicny           = require ('./exchanges/huobicny.js')
// const huobipro           = require ('./exchanges/huobipro.js')
// const huobi              = require ('./exchanges/huobi.js')
// const independentreserve = require ('./exchanges/independentreserve.js')
// const itbit              = require ('./exchanges/itbit.js')
// const jubi               = require ('./exchanges/jubi.js')
// const kraken             = require ('./exchanges/kraken.js')
// const kuna               = require ('./exchanges/kuna.js')
// const lakebtc            = require ('./exchanges/lakebtc.js')
// const livecoin           = require ('./exchanges/livecoin.js')
// const liqui              = require ('./exchanges/liqui.js')
// const luno               = require ('./exchanges/luno.js')
// const mercado            = require ('./exchanges/mercado.js')
// const mixcoins           = require ('./exchanges/mixcoins.js')
// const nova               = require ('./exchanges/nova.js')
// const okcoincny          = require ('./exchanges/okcoincny.js')
// const okcoinusd          = require ('./exchanges/okcoinusd.js')
// const okex               = require ('./exchanges/okex.js')
// const paymium            = require ('./exchanges/paymium.js')
// const poloniex           = require ('./exchanges/poloniex.js')
// const quadrigacx         = require ('./exchanges/quadrigacx.js')
// const qryptos            = require ('./exchanges/qryptos.js')
// const quoine             = require ('./exchanges/quoine.js')
// const southxchange       = require ('./exchanges/southxchange.js')
// const surbitcoin         = require ('./exchanges/surbitcoin.js')
// const tidex              = require ('./exchanges/tidex.js')
// const therock            = require ('./exchanges/therock.js')
// const urdubit            = require ('./exchanges/urdubit.js')
// const vaultoro           = require ('./exchanges/vaultoro.js')
// const vbtc               = require ('./exchanges/vbtc.js')
// const virwox             = require ('./exchanges/virwox.js')
// const wex                = require ('./exchanges/wex.js')
// const xbtce              = require ('./exchanges/xbtce.js')
// const yobit              = require ('./exchanges/yobit.js')
// const yunbi              = require ('./exchanges/yunbi.js')
// const zaif               = require ('./exchanges/zaif.js')

//=============================================================================

var exchanges = {

    '_1broker':          _1broker,
    '_1btcxe':           _1btcxe,
    'acx':                acx,
    'allcoin':            allcoin,
    'anxpro':             anxpro,
    'binance':            binance,
    'bit2c':              bit2c,
    'bitbay':             bitbay,
    'bitcoincoid':        bitcoincoid,
    'bitfinex':           bitfinex,
    'bitfinex2':          bitfinex2,
    'bitflyer':           bitflyer,
    'bithumb':            bithumb,
    'bitlish':            bitlish,
    'bitmarket':          bitmarket,
    'bitmex':             bitmex,
    'bitso':              bitso,
    'bitstamp1':          bitstamp1,
    'bitstamp':           bitstamp,
    'bittrex':            bittrex,
    'bl3p':               bl3p,
    'bleutrade':          bleutrade,
    'btcbox':             btcbox,
    'btcchina':           btcchina,
    'btcexchange':        btcexchange,
    'btcmarkets':         btcmarkets,
    'btctradeua':         btctradeua,
    'btcturk':            btcturk,
    'btcx':               btcx,
    'bter':               bter,
    'bxinth':             bxinth,
    'ccex':               ccex,
    'cex':                cex,
    'chbtc':              chbtc,
    'chilebit':           chilebit,
    'coincheck':          coincheck,
    'coinfloor':          coinfloor,
    'coingi':             coingi,
    'coinmarketcap':      coinmarketcap,
    'coinmate':           coinmate,
    'coinsecure':         coinsecure,
    'coinspot':           coinspot,
    'cryptopia':          cryptopia,
    'dsx':                dsx,
    'exmo':               exmo,
    'flowbtc':            flowbtc,
    'foxbit':             foxbit,
    'fybse':              fybse,
    'fybsg':              fybsg,
    'gatecoin':           gatecoin,
    'gateio':             gateio,
    'gdax':               gdax,
    'gemini':             gemini,
    'hitbtc':             hitbtc,
    'hitbtc2':            hitbtc2,
    'huobi':              huobi,
    'huobicny':           huobicny,
    'huobipro':           huobipro,
    'independentreserve': independentreserve,
    'itbit':              itbit,
    'jubi':               jubi,
    'kraken':             kraken,
    'kuna':               kuna,
    'lakebtc':            lakebtc,
    'livecoin':           livecoin,
    'liqui':              liqui,
    'luno':               luno,
    'mercado':            mercado,
    'mixcoins':           mixcoins,
    'nova':               nova,
    'okcoincny':          okcoincny,
    'okcoinusd':          okcoinusd,
    'okex':               okex,
    'paymium':            paymium,
    'poloniex':           poloniex,
    'quadrigacx':         quadrigacx,
    'qryptos':            qryptos,
    'quoine':             quoine,
    'southxchange':       southxchange,
    'surbitcoin':         surbitcoin,
    'tidex':              tidex,
    'therock':            therock,
    'urdubit':            urdubit,
    'vaultoro':           vaultoro,
    'vbtc':               vbtc,
    'virwox':             virwox,
    'wex':                wex,
    'xbtce':              xbtce,
    'yobit':              yobit,
    'yunbi':              yunbi,
    'zaif':               zaif,
}

let defineAllExchanges = function (exchanges) {
    let result = {}
    for (let id in exchanges) {
        result[id] = function (params) {
            return new Exchange (deepExtend (exchanges[id], params || {}))
        }
    }
    result.exchanges = Object.keys (exchanges)
    return result
}

//-----------------------------------------------------------------------------

const ccxt = Object.assign (defineAllExchanges (exchanges), {

    version,

    // Exchange constructor (do not use directly, will be replaced by a class soon)

    Exchange,

})

//-----------------------------------------------------------------------------

module.exports = ccxt

//-----------------------------------------------------------------------------