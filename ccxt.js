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

(function () {

//-----------------------------------------------------------------------------
// dependencies

const CryptoJS = require ('crypto-js')
    , qs       = require ('qs') // querystring
    // , ws       = require ('ws') // websocket

//-----------------------------------------------------------------------------
// this is updated by vss.js when building

const version = '1.9.180'

//-----------------------------------------------------------------------------
// platform detection

const isNode     = (typeof window === 'undefined')
    , isCommonJS = (typeof module !== 'undefined') && (typeof require !== 'undefined')

//-----------------------------------------------------------------------------

class BaseError extends Error {
    constructor (message) {
        super (message)
        // a workaround to make `instanceof BaseError` work in ES5
        this.constructor = BaseError
        this.__proto__   = BaseError.prototype
        this.message     = message
    }
}

class ExchangeError extends BaseError {
    constructor (message) {
        super (message)
        this.constructor = ExchangeError
        this.__proto__   = ExchangeError.prototype
        this.message     = message
    }
}

class NotSupported extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = NotSupported
        this.__proto__   = NotSupported.prototype
        this.message     = message
    }
}

class AuthenticationError extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = AuthenticationError
        this.__proto__   = AuthenticationError.prototype
        this.message     = message
    }
}

class InsufficientFunds extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = InsufficientFunds
        this.__proto__   = InsufficientFunds.prototype
        this.message     = message
    }
}

class InvalidOrder extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = InvalidOrder
        this.__proto__   = InvalidOrder.prototype
        this.message     = message
    }
}

class NetworkError extends BaseError {
    constructor (message) {
        super (message)
        this.constructor = NetworkError
        this.__proto__   = NetworkError.prototype
        this.message     = message
    }
}

class DDoSProtection extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = DDoSProtection
        this.__proto__   = DDoSProtection.prototype
        this.message     = message
    }
}

class RequestTimeout extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = RequestTimeout
        this.__proto__   = RequestTimeout.prototype
        this.message     = message
    }
}

class ExchangeNotAvailable extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = ExchangeNotAvailable
        this.__proto__   = ExchangeNotAvailable.prototype
        this.message     = message
    }
}

//-----------------------------------------------------------------------------
// utility helpers

const setTimeout_safe = (done, ms, targetTime = Date.now () + ms) => { // setTimeout can fire earlier than specified, so we need to ensure it does not happen...

    setTimeout (() => {
        const rest = targetTime - Date.now ()
        if (rest > 0) {
            setTimeout_safe (done, rest, targetTime) // try sleep more
        } else {
            done ()
        }
    }, ms)
}

const sleep = ms => new Promise (resolve => setTimeout_safe (resolve, ms))

const decimal = float => parseFloat (float).toString ()

const timeout = (ms, promise) =>
        Promise.race ([
            promise,
            sleep (ms).then (() => { throw new RequestTimeout ('request timed out') })
        ])

const capitalize = string => string.length ? (string.charAt (0).toUpperCase () + string.slice (1)) : string

const keysort = object => {
    const result = {}
    Object.keys (object).sort ().forEach (key => result[key] = object[key])
    return result
}

const extend = (...args) => Object.assign ({}, ...args)

const deepExtend = function (...args) {

    let result = undefined

    for (const arg of args) {

        if (arg && (typeof arg == 'object') && (arg.constructor === Object || !('constructor' in arg))) {

            if (typeof result != 'object') {
                result = {}
            }

            for (const key in arg) {
                result[key] = deepExtend (result[key], arg[key])
            }

        } else {

            result = arg
        }
    }

    return result
}

const omit = (object, ...args) => {
    const result = extend (object)
    for (const x of args) {
        if (typeof x === 'string') {
            delete result[x]
        } else if (Array.isArray (x)) {
            for (const k of x)
                delete result[k]
        }
    }
    return result
}

const groupBy = (array, key) => {
    const result = {}
    Object
        .values (array)
        .filter (entry => entry[key] != 'undefined')
        .forEach (entry => {
            if (typeof result[entry[key]] == 'undefined')
                result[entry[key]] = []
            result[entry[key]].push (entry)
        })
    return result
}

const indexBy = (array, key) => {
    const result = {}
    Object
        .values (array)
        .filter (entry => entry[key] != 'undefined')
        .forEach (entry => {
            result[entry[key]] = entry
        })
    return result
}

const sortBy = (array, key, descending = false) => {
    descending = descending ? -1 : 1
    return array.sort ((a, b) => ((a[key] < b[key]) ? -descending : ((a[key] > b[key]) ? descending : 0)))
}

const flatten = (array, result = []) => {
    for (let i = 0, length = array.length; i < length; i++) {
        const value = array[i]
        if (Array.isArray (value)) {
            flatten (value, result)
        } else {
            result.push (value)
        }
    }
    return result
}

const unique = array => array.filter ((value, index, self) => (self.indexOf (value) == index))

const pluck = (array, key) => array
                                .filter (element => (typeof element[key] != 'undefined'))
                                .map (element => element[key])

const urlencode = object => qs.stringify (object)
const rawencode = object => qs.stringify (object, { encode: false })

const sum = (...args) => {
    const result = args.filter (arg => typeof arg != 'undefined')
    return (result.length > 0) ?
        result.reduce ((sum, value) => sum + value, 0) : undefined
}

const safeFloat = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? parseFloat (object[key]) : defaultValue
}

const safeString = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? object[key].toString () : defaultValue
}

const safeInteger = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? parseInt (object[key]) : defaultValue
}

const safeValue = (object, key, defaultValue = undefined) => {
    return ((key in object) && object[key]) ? object[key] : defaultValue
}

// See https://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript for discussion

// > So, after all it turned out, rounding bugs will always haunt you, no matter how hard you try to compensate them.
// > Hence the problem should be attacked by representing numbers exactly in decimal notation.

const truncate_regExpCache = []
    , truncate = (num, precision = 0) => {
        const re = truncate_regExpCache[precision] || (truncate_regExpCache[precision] = new RegExp("([-]*\\d+\\.\\d{" + precision + "})(\\d)"))
        const [,result] = num.toString ().match (re) || [null, num]
        return parseFloat (result)
    }

const ordered = x => x // a stub to keep assoc keys in order, in JS it does nothing, it's mostly for Python

const aggregate = function (bidasks) {

    let result = {}

    bidasks.forEach (([ price, volume ]) => {
        result[price] = (result[price] || 0) + volume
    })

    return Object.keys (result).map (price => [
        parseFloat (price),
        parseFloat (result[price]),
    ])
}

//-----------------------------------------------------------------------------
// a cross-platform Fetch API

const nodeFetch   = isNode && module.require ('node-fetch')         // using module.require to prevent Webpack / React Native from trying to include it
    , windowFetch = (typeof window !== 'undefined' && window.fetch) // native Fetch API (in newer browsers)
    , xhrFetch    = (url, options, verbose = false) =>              // a quick ad-hoc polyfill (for older browsers)
                        new Promise ((resolve, reject) => {

                            if (verbose)
                                console.log (url, options)

                            const xhr = new XMLHttpRequest ()
                            const method = options.method || 'GET'

                            xhr.open (method, url, true)
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState == 4) {
                                    if (xhr.status == 200)
                                        resolve (xhr.responseText)
                                    else { // [403, 404, ...].indexOf (xhr.status) >= 0
                                        throw new Error (method, url, xhr.status, xhr.responseText)
                                    }
                                }
                            }

                            if (typeof options.headers != 'undefined')
                                for (var header in options.headers)
                                    xhr.setRequestHeader (header, options.headers[header])

                            xhr.send (options.body)
                        })

const fetch = nodeFetch || windowFetch || xhrFetch

//-----------------------------------------------------------------------------
// string ←→ binary ←→ base64 conversion routines

const stringToBinary = str => {
    const arr = new Uint8Array (str.length)
    for (let i = 0; i < str.length; i++) { arr[i] = str.charCodeAt(i); }
    return CryptoJS.lib.WordArray.create (arr)
}

const stringToBase64 = string => CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
    , utf16ToBase64  = string => CryptoJS.enc.Utf16 .parse (string).toString (CryptoJS.enc.Base64)
    , base64ToBinary = string => CryptoJS.enc.Base64.parse (string)
    , base64ToString = string => CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
    , binaryToString = string => string

const binaryConcat = (...args) => args.reduce ((a, b) => a.concat (b))

// url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
const urlencodeBase64 = base64string => base64string.replace (/[=]+$/, '')
                                                    .replace (/\+/g, '-')
                                                    .replace (/\//g, '_')

//-----------------------------------------------------------------------------
// cryptography

const hash = (request, hash = 'md5', digest = 'hex') => {
    const result = CryptoJS[hash.toUpperCase ()] (request)
    return (digest == 'binary') ? result : result.toString (CryptoJS.enc[capitalize (digest)])
}

const hmac = (request, secret, hash = 'sha256', digest = 'hex') => {
    const encoding = (digest == 'binary') ? 'Latin1' : capitalize (digest)
    return CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret).toString (CryptoJS.enc[capitalize (encoding)])
}

//-----------------------------------------------------------------------------
// a JSON Web Token authentication method

const jwt = (request, secret, alg = 'HS256', hash = 'sha256') => {
    const encodedHeader = urlencodeBase64 (stringToBase64 (JSON.stringify ({ 'alg': alg, 'typ': 'JWT' })))
        , encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)))
        , token = [ encodedHeader, encodedData ].join ('.')
        , signature = urlencodeBase64 (utf16ToBase64 (hmac (token, secret, hash, 'utf16')))
    return [ token, signature ].join ('.')
}

//-----------------------------------------------------------------------------
// const WebSocket = require('ws')
// const ws = new WebSocket (this.urls['websocket'])
// ws.on ('open', function open () {
//     console.log ('connected')
//     // ws.send (Date.now ())
// })
// ws.on ('close', function close () {
//     console.log ('disconnected')
// });
// ws.on ('message', function incoming (data) {
//     // console.log (`Roundtrip time: ${Date.now() - data} ms`);
//     setTimeout (function timeout () {
//         ws.send (Date.now ())
//     }, 500)
// })

//-----------------------------------------------------------------------------
// the base class

const Exchange = function (config) {

    this.hash = hash
    this.hmac = hmac
    this.jwt = jwt // JSON Web Token

    this.binaryConcat = binaryConcat
    this.stringToBinary = stringToBinary
    this.stringToBase64 = stringToBase64
    this.base64ToBinary = base64ToBinary
    this.base64ToString = base64ToString
    this.binaryToString = binaryToString
    this.utf16ToBase64 = utf16ToBase64
    this.encodeURIComponent = encodeURIComponent
    this.urlencode   = urlencode
    this.rawencode   = rawencode
    this.omit        = omit
    this.pluck       = pluck
    this.unique      = unique
    this.extend      = extend
    this.deepExtend  = deepExtend
    this.flatten     = flatten
    this.groupBy     = groupBy
    this.indexBy     = indexBy
    this.sortBy      = sortBy
    this.keysort     = keysort
    this.decimal     = decimal
    this.safeFloat   = safeFloat
    this.safeString  = safeString
    this.safeInteger = safeInteger
    this.safeValue   = safeValue
    this.capitalize  = capitalize
    this.json        = JSON.stringify
    this.unjson      = JSON.parse
    this.sum         = sum
    this.ordered     = ordered
    this.aggregate   = aggregate
    this.truncate    = truncate

    this.encode = string => string
    this.decode = string => string

    if (isNode)
        this.nodeVersion = process.version.match (/\d+\.\d+.\d+/) [0]

    this.init = function () {
        if (this.api)
            this.defineRestApi (this.api, 'request');
        if (this.markets)
            this.setMarkets (this.markets);
    }

    this.defineRestApi = function (api, methodName, options = {}) {
        Object.keys (api).forEach (type => {
            Object.keys (api[type]).forEach (httpMethod => {
                let urls = api[type][httpMethod]
                for (let i = 0; i < urls.length; i++) {
                    let url = urls[i].trim ()
                    let splitPath = url.split (/[^a-zA-Z0-9]/)

                    let uppercaseMethod  = httpMethod.toUpperCase ()
                    let lowercaseMethod  = httpMethod.toLowerCase ()
                    let camelcaseMethod  = capitalize (lowercaseMethod)
                    let camelcaseSuffix  = splitPath.map (capitalize).join ('')
                    let underscoreSuffix = splitPath.map (x => x.trim ().toLowerCase ()).filter (x => x.length > 0).join ('_')

                    if (camelcaseSuffix.indexOf (camelcaseMethod) === 0)
                        camelcaseSuffix = camelcaseSuffix.slice (camelcaseMethod.length)

                    if (underscoreSuffix.indexOf (lowercaseMethod) === 0)
                        underscoreSuffix = underscoreSuffix.slice (lowercaseMethod.length)

                    let camelcase  = type + camelcaseMethod + capitalize (camelcaseSuffix)
                    let underscore = type + '_' + lowercaseMethod + '_' + underscoreSuffix

                    if ('suffixes' in options) {
                        if ('camelcase' in options['suffixes'])
                            camelcase += options['suffixes']['camelcase']
                        if ('underscore' in options.suffixes)
                            underscore += options['suffixes']['underscore']
                    }

                    if ('underscore_suffix' in options)
                        underscore += options.underscoreSuffix;
                    if ('camelcase_suffix' in options)
                        camelcase += options.camelcaseSuffix;

                    let partial = async params => this[methodName] (url, type, uppercaseMethod, params)

                    this[camelcase]  = partial
                    this[underscore] = partial
                }
            })
        })
    }

    // this.initializeStreamingAPI = function () {
    //     this.ws = new WebSocket (this.urls['websocket'])
    //     ws.on ('open', function open () {
    //         console.log ('connected')
    //         // ws.send (Date.now ())
    //     })
    //     ws.on ('close', function close () {
    //         console.log ('disconnected')
    //     })
    //     ws.on ('message', function incoming (data) {
    //         // console.log (`Roundtrip time: ${Date.now() - data} ms`);
    //         setTimeout (function timeout () {
    //             ws.send (Date.now ())
    //         }, 500)
    //     })
    // },

    // internal rate-limiting REST poller

    let lastRestRequestTimestamp = 0
      , lastRestPollTimestamp = 0
      , restRequestQueue = []
      , restPollerLoopIsRunning = false

      , throttle = async () => {

            let elapsed = this.milliseconds () - lastRestPollTimestamp
            let delay = this.rateLimit - elapsed

            if (delay > 0) {
                await sleep (delay)
            }
        }

      , runRestPollerLoop = async () => {

            if (!restPollerLoopIsRunning) {

                restPollerLoopIsRunning = true
                lastRestPollTimestamp = Math.max (lastRestPollTimestamp, lastRestRequestTimestamp)

                while (restRequestQueue.length > 0) {

                    await throttle ()

                    let { args, resolve, reject } = restRequestQueue.shift ()
                    lastRestPollTimestamp = this.milliseconds ()

                    this.executeRestRequest (...args)
                        .then (resolve)
                        .catch (reject)
                }

                restPollerLoopIsRunning = false
            }
        }

    const issueRestRequest = (...args) => {

        if (this.enableRateLimit) {
            return new Promise ((resolve, reject) => {
                restRequestQueue.push ({ args, resolve, reject })
                runRestPollerLoop ()
            })
        } else {
            return this.executeRestRequest (...args)
        }
    }

    this.executeRestRequest = function (url, method = 'GET', headers = undefined, body = undefined) {

        lastRestRequestTimestamp = this.milliseconds ()

        let promise =
            fetch (url, { 'method': method, 'headers': headers, 'body': body })
                .catch (e => {
                    if (isNode)
                        throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '))
                    throw e // rethrow all unknown errors
                })
                .then (response => this.handleRestErrors (response, url, method, headers, body))
                .then (response => this.handleRestResponse (response, url, method, headers, body))

        return timeout (this.timeout, promise).catch (e => {
            if (e instanceof RequestTimeout)
                throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' ' + e.message)
            throw e
        })
    }

    this.fetch = function (url, method = 'GET', headers = undefined, body = undefined) {

        if (isNode && this.userAgent) {
            if (typeof this.userAgent == 'string')
                headers = extend ({ 'User-Agent': this.userAgent }, headers)
            else if ((typeof this.userAgent == 'object') && ('User-Agent' in this.userAgent))
                headers = extend (this.userAgent, headers)
        }

        if (typeof this.proxy == 'function') {

            url = this.proxy (url)
            headers = extend ({ 'Origin': '*' }, headers)

        } else if (typeof this.proxy == 'string') {

            if (this.proxy.length)
                headers = extend ({ 'Origin': '*' }, headers)

            url = this.proxy + url
        }

        if (this.verbose)
            console.log (this.id, method, url, "\nRequest:\n", headers, body)

        return issueRestRequest (url, method, headers, body)
    }

    this.fetch2 = function (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {

        let request = this.sign (path, api, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    this.request = function (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, api, method, params, headers, body);
    }

    this.handleRestErrors = function (response, url, method = 'GET', headers = undefined, body = undefined) {

        if (typeof response == 'string')
            return response

        return response.text ().then (text => {
            if (this.verbose)
                console.log (this.id, method, url, text ? ("\nResponse:\n" + text) : '')
            if ((response.status >= 200) && (response.status <= 300))
                return text
            let error = undefined
            let details = text
            if ([ 429 ].includes (response.status)) {
                error = DDoSProtection
            } else if ([ 404, 409, 422, 500, 501, 502, 520, 521, 522, 525 ].includes (response.status)) {
                error = ExchangeNotAvailable
            } else if ([ 400, 403, 405, 503, 530 ].includes (response.status)) {
                let ddosProtection = text.match (/cloudflare|incapsula/i)
                if (ddosProtection) {
                    error = DDoSProtection
                } else {
                    error = ExchangeNotAvailable
                    details = text + ' (possible reasons: ' + [
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline',
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting',
                    ].join (', ') + ')'
                }
            } else if ([ 408, 504 ].includes (response.status)) {
                error = RequestTimeout
            } else if ([ 401, 511 ].includes (response.status)) {
                error = AuthenticationError
            } else {
                error = ExchangeError
            }
            throw new error ([ this.id, method, url, response.status, response.statusText, details ].join (' '))
        })
    }

    this.handleRestResponse = function (response, url, method = 'GET', headers = undefined, body = undefined) {

        try {

            if ((typeof response != 'string') || (response.length < 2))
                throw new ExchangeError ([this.id, method, url, 'returned empty response'].join (' '))

            this.last_http_response = response
            this.last_json_response = JSON.parse (response)

            return this.last_json_response

        } catch (e) {

            let maintenance = response.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            let ddosProtection = response.match (/cloudflare|incapsula|overload/i)

            if (e instanceof SyntaxError) {

                let error = ExchangeNotAvailable
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance or unreachable from this location at the moment'
                if (ddosProtection)
                    error = DDoSProtection
                throw new error ([ this.id, method, url, details ].join (' '))
            }

            if (this.verbose)
                console.log (this.id, method, url, 'error', e, "response body:\n'" + response + "'")

            throw e
        }
    }

    this.setMarkets = function (markets) {
        let values = Object.values (markets).map (market => extend ({
            'limits': this.limits,
            'precision': this.precision,
        }, this.fees['trading'], market))
        this.markets = indexBy (values, 'symbol')
        this.marketsById = indexBy (markets, 'id')
        this.markets_by_id = this.marketsById
        this.symbols = Object.keys (this.markets).sort ()
        this.ids = Object.keys (this.markets_by_id).sort ()
        let base = this.pluck (values.filter (market => 'base' in market), 'base')
        let quote = this.pluck (values.filter (market => 'quote' in market), 'quote')
        this.currencies = this.unique (base.concat (quote))
        return this.markets
    }

    this.loadMarkets = function (reload = false) {
        if (!reload && this.markets) {
            if (!this.marketsById) {
                return new Promise ((resolve, reject) => resolve (this.setMarkets (this.markets)))
            }
            return new Promise ((resolve, reject) => resolve (this.markets))
        }
        return this.fetchMarkets ().then (markets => {
            return this.setMarkets (markets)
        })
    }

    this.fetchTickers = function (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTickers not supported yet')
    }

    this.fetchOrder = function (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not supported yet');
    }

    this.fetchOrders = function (symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrders not supported yet');
    }

    this.fetchOpenOrders = function (symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOpenOrders not supported yet');
    }

    this.fetchClosedOrders = function (symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchClosedOrders not supported yet');
    }

    this.fetchMarkets = function () {
        return new Promise ((resolve, reject) => resolve (this.markets))
    }

    this.fetchOrderStatus = async function (id, market = undefined) {
        let order = await this.fetchOrder (id)
        return order['status']
    }

    this.account = function () {
        return {
            'free': 0.0,
            'used': 0.0,
            'total': 0.0,
        }
    }

    this.commonCurrencyCode = function (currency) {
        if (!this.substituteCommonCurrencyCodes)
            return currency
        if (currency == 'XBT')
            return 'BTC'
        if (currency == 'BCC')
            return 'BCH'
        if (currency == 'DRK')
            return 'DASH'
        return currency
    }

    this.market = function (symbol) {

        if (typeof this.markets == 'undefined')
            return new ExchangeError (this.id + ' markets not loaded')

        if ((typeof symbol === 'string') && (symbol in this.markets))
            return this.markets[symbol]

        throw new ExchangeError (this.id + ' does not have market symbol ' + symbol)
    }

    this.market_id =
    this.marketId = function (symbol) {
        return this.market (symbol).id || symbol
    }

    this.market_ids =
    this.marketIds = function (symbols) {
        return symbols.map (symbol => this.marketId(symbol));
    }

    this.symbol = function (symbol) {
        return this.market (symbol).symbol || symbol
    }

    this.extract_params =
    this.extractParams = function (string) {
        var re = /{([a-zA-Z0-9_]+?)}/g
        var matches = []
        let match
        while (match = re.exec (string))
            matches.push (match[1])
        return matches
    }

    this.implode_params =
    this.implodeParams = function (string, params) {
        for (var property in params)
            string = string.replace ('{' + property + '}', params[property])
        return string
    }

    this.url = function (path, params = {}) {
        let result = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path))
        if (Object.keys (query).length)
            result += '?' + this.urlencode (query)
        return result
    }

    this.parseBidAsk = function (bidask, priceKey = 0, amountKey = 1) {
        let price = parseFloat (bidask[priceKey])
        let amount = parseFloat (bidask[amountKey])
        return [ price, amount ]
    }

    this.parseBidAsks = function (bidasks, priceKey = 0, amountKey = 1) {
        return Object.values (bidasks || []).map (bidask => this.parseBidAsk (bidask, priceKey, amountKey))
    }

    this.fetchL2OrderBook = async function (symbol, params = {}) {
        let orderbook = await this.fetchOrderBook (symbol, params)
        return extend (orderbook, {
            'bids': sortBy (aggregate (orderbook.bids), 0, true),
            'asks': sortBy (aggregate (orderbook.asks), 0),
        })
    }

    this.parseOrderBook = function (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        timestamp = timestamp || this.milliseconds ();
        return {
            'bids': (bidsKey in orderbook) ? this.parseBidAsks (orderbook[bidsKey], priceKey, amountKey) : [],
            'asks': (asksKey in orderbook) ? this.parseBidAsks (orderbook[asksKey], priceKey, amountKey) : [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    this.getCurrencyUsedOnOpenOrders = function (currency) {
        return Object.values (this.orders).filter (order => (order['status'] == 'open')).reduce ((total, order) => {
            let symbol = order['symbol'];
            let market = this.markets[symbol];
            if (currency == market['base'] && order['side'] == 'sell') {
                return total + order['amount']
            } else if (currency == market['quote'] && order['side'] == 'buy') {
                return total + (order['cost'] || (order['price'] * order['amount']))
            } else {
                return total
            }
        }, 0)
    }

    this.parseBalance = function (balance) {

        const currencies = Object.keys (this.omit (balance, 'info'));

        currencies.forEach (currency => {

            if (typeof balance[currency].used == 'undefined') {
                balance[currency].used = this.getCurrencyUsedOnOpenOrders (currency)
                balance[currency].total = balance[currency].used + balance[currency].free
            }

            [ 'free', 'used', 'total' ].forEach (account => {
                balance[account] = balance[account] || {}
                balance[account][currency] = balance[currency][account]
            })
        })
        return balance;
    }

    this.fetchPartialBalance = async function (part, params = {}) {
        let balance = await this.fetchBalance (params)
        return balance[part]
    }

    this.fetchFreeBalance = function (params = {}) {
        return this.fetchPartialBalance ('free', params)
    }

    this.fetchUsedBalance = function (params = {}) {
        return this.fetchPartialBalance ('used', params)
    }

    this.fetchTotalBalance = function (params = {}) {
        return this.fetchPartialBalance ('total', params)
    }

    this.parseTrades = function (trades, market = undefined) {
        return Object.values (trades).map (trade => this.parseTrade (trade, market))
    }

    this.parseOrders = function (orders, market = undefined) {
        return Object.values (orders).map (order => this.parseOrder (order, market))
    }

    this.parseOHLCV = function (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return ohlcv
    }

    this.parseOHLCVs = function (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return Object.values (ohlcvs).map (ohlcv => this.parseOHLCV (ohlcv, market, timeframe, since, limit))
    }

    this.editLimitBuyOrder = function (id, symbol, ...args) {
        return this.editLimitOrder (symbol, 'buy', ...args)
    }

    this.editLimitSellOrder = function (id, symbol, ...args) {
        return this.editLimitOrder (symbol, 'sell', ...args)
    }

    this.editLimitOrder = function (id, symbol, ...args) {
        return this.editOrder (id, symbol, 'limit', ...args)
    }

    this.editOrder = async function (id, symbol, ...args) {
        if (!this.enableRateLimit)
            throw new ExchangeError (this.id + ' editOrder() requires enableRateLimit = true')
        await this.cancelOrder (id, symbol);
        return this.createOrder (symbol, ...args)
    }

    this.createLimitBuyOrder = function (symbol, ...args) {
        return this.createOrder  (symbol, 'limit', 'buy', ...args)
    }

    this.createLimitSellOrder = function (symbol, ...args) {
        return this.createOrder (symbol, 'limit', 'sell', ...args)
    }

    this.createMarketBuyOrder = function (symbol, amount, params = {}) {
        return this.createOrder (symbol, 'market', 'buy', amount, undefined, params)
    }

    this.createMarketSellOrder = function (symbol, amount, params = {}) {
        return this.createOrder (symbol, 'market', 'sell', amount, undefined, params)
    }

    this.costToPrecision = function (symbol, cost) {
        return parseFloat (cost).toFixed (this.markets[symbol].precision.price)
    }

    this.priceToPrecision = function (symbol, price) {
        return parseFloat (price).toFixed (this.markets[symbol].precision.price)
    }

    this.amountToPrecision = function (symbol, amount) {
        return parseFloat (amount).toFixed (this.markets[symbol].precision.amount)
    }

    this.feeToPrecision = function (symbol, fee) {
        return parseFloat (fee).toFixed (this.markets[symbol].precision.price)
    }

    this.calculateFee = function (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol]
        let rate = market[takerOrMaker]
        let cost = parseFloat (this.costToPrecision (symbol, amount * price))
        return {
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        }
    }

    this.iso8601         = timestamp => new Date (timestamp).toISOString ()
    this.parse8601       = x => Date.parse (((x.indexOf ('+') >= 0) || (x.slice (-1) == 'Z')) ? x : (x + 'Z'))
    this.seconds         = () => Math.floor (this.milliseconds () / 1000)
    this.microseconds    = () => Math.floor (this.milliseconds () * 1000)
    this.milliseconds    = Date.now
    this.nonce           = this.seconds
    this.id              = undefined
    this.enableRateLimit = false
    this.rateLimit       = 2000  // milliseconds = seconds * 1000
    this.timeout         = 10000 // milliseconds
    this.verbose         = false
    this.userAgent       = false
    this.twofa           = false // two-factor authentication (2FA)
    this.substituteCommonCurrencyCodes = true
    this.timeframes      = undefined
    this.hasPublicAPI         = true
    this.hasPrivateAPI        = true
    this.hasCORS              = false
    this.hasFetchTicker       = true
    this.hasFetchOrderBook    = true
    this.hasFetchTrades       = true
    this.hasFetchTickers      = false
    this.hasFetchOHLCV        = false
    this.hasFetchBalance      = true
    this.hasFetchOrder        = false
    this.hasFetchOrders       = false
    this.hasFetchOpenOrders   = false
    this.hasFetchClosedOrders = false
    this.hasFetchMyTrades     = false
    this.hasDeposit           = false
    this.hasWithdraw          = false
    this.hasCreateOrder       = this.hasPrivateAPI
    this.hasCancelOrder       = this.hasPrivateAPI

    this.balance    = {}
    this.orderbooks = {}
    this.fees       = {}
    this.orders     = {}
    this.trades     = {}

    this.last_http_response = undefined
    this.last_json_response = undefined

    this.Ymd = function (timestamp, infix = ' ') {
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m
        d = d < 10 ? ('0' + d) : d
        return Y + '-' + m + '-' + d
    }

    this.YmdHMS = function (timestamp, infix = ' ') {
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        let H = date.getUTCHours ()
        let M = date.getUTCMinutes ()
        let S = date.getUTCSeconds ()
        m = m < 10 ? ('0' + m) : m
        d = d < 10 ? ('0' + d) : d
        H = H < 10 ? ('0' + H) : H
        M = M < 10 ? ('0' + M) : M
        S = S < 10 ? ('0' + S) : S
        return Y + '-' + m + '-' + d + infix + H + ':' + M + ':' + S
    }

    if (isNode)
        this.userAgent = {
            'User-Agent': 'ccxt/' + version +
                ' (+https://github.com/ccxt-dev/ccxt)' +
                ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        }

    // prepended to URL, like https://proxy.com/https://exchange.com/api...
    this.proxy = ''

    for (var property in config)
        this[property] = config[property]

    this.account                  = this.account
    this.fetch_balance               = this.fetchBalance
    this.fetch_free_balance          = this.fetchFreeBalance
    this.fetch_used_balance          = this.fetchUsedBalance
    this.fetch_total_balance         = this.fetchTotalBalance
    this.fetch_l2_order_book         = this.fetchL2OrderBook
    this.fetch_order_book            = this.fetchOrderBook
    this.fetch_tickers               = this.fetchTickers
    this.fetch_ticker                = this.fetchTicker
    this.fetch_trades                = this.fetchTrades
    this.fetch_order                 = this.fetchOrder
    this.fetch_orders                = this.fetchOrders
    this.fetch_open_orders           = this.fetchOpenOrders
    this.fetch_closed_orders         = this.fetchClosedOrders
    this.fetch_order_status          = this.fetchOrderStatus
    this.fetch_markets               = this.fetchMarkets
    this.load_markets                = this.loadMarkets
    this.set_markets                 = this.setMarkets
    this.parse_balance               = this.parseBalance
    this.parse_bidask                = this.parseBidAsk
    this.parse_bidasks               = this.parseBidAsks
    this.parse_order_book            = this.parseOrderBook
    this.parse_trades                = this.parseTrades
    this.parse_orders                = this.parseOrders
    this.parse_ohlcv                 = this.parseOHLCV
    this.parse_ohlcvs                = this.parseOHLCVs
    this.edit_limit_buy_order        = this.editLimitBuyOrder
    this.edit_limit_sell_order       = this.editLimitSellOrder
    this.edit_limit_order            = this.editLimitOrder
    this.edit_order                  = this.editOrder
    this.create_limit_buy_order      = this.createLimitBuyOrder
    this.create_limit_sell_order     = this.createLimitSellOrder
    this.create_market_buy_order     = this.createMarketBuyOrder
    this.create_market_sell_order    = this.createMarketSellOrder
    this.create_order                = this.createOrder
    this.calculate_fee               = this.calculateFee
    this.calculate_fee_rate          = this.calculateFeeRate
    this.common_currency_code        = this.commonCurrencyCode
    this.price_to_precision          = this.priceToPrecision
    this.amount_to_precision         = this.amountToPrecision
    this.fee_to_precision            = this.feeToPrecision
    this.cost_to_precision           = this.costToPrecision

    this.init ()
}

//=============================================================================

var _1broker = {

    'id': '_1broker',
    'name': '1Broker',
    'countries': 'US',
    'rateLimit': 1500,
    'version': 'v2',
    'hasPublicAPI': false,
    'hasCORS': true,
    'hasFetchTrades': false,
    'hasFetchOHLCV': true,
    'timeframes': {
        '1m': '60',
        '15m': '900',
        '1h': '3600',
        '1d': '86400',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
        'api': 'https://1broker.com/api',
        'www': 'https://1broker.com',
        'doc': 'https://1broker.com/?c=en/content/api-documentation',
    },
    'api': {
        'private': {
            'get': [
                'market/bars',
                'market/categories',
                'market/details',
                'market/list',
                'market/quotes',
                'market/ticks',
                'order/cancel',
                'order/create',
                'order/open',
                'position/close',
                'position/close_cancel',
                'position/edit',
                'position/history',
                'position/open',
                'position/shared/get',
                'social/profile_statistics',
                'social/profile_trades',
                'user/bitcoin_deposit_address',
                'user/details',
                'user/overview',
                'user/quota_status',
                'user/transaction_log',
            ],
        },
    },

    async fetchCategories () {
        let response = await this.privateGetMarketCategories ();
        // they return an empty string among their categories, wtf?
        let categories = response['response'];
        let result = [];
        for (let i = 0; i < categories.length; i++) {
            if (categories[i])
                result.push (categories[i]);
        }
        return result;
    },

    async fetchMarkets () {
        let this_ = this; // workaround for Babel bug (not passing `this` to _recursive() call)
        let categories = await this.fetchCategories ();
        let result = [];
        for (let c = 0; c < categories.length; c++) {
            let category = categories[c];
            let markets = await this_.privateGetMarketList ({
                'category': category.toLowerCase (),
            });
            for (let p = 0; p < markets['response'].length; p++) {
                let market = markets['response'][p];
                let id = market['symbol'];
                let symbol = undefined;
                let base = undefined;
                let quote = undefined;
                if ((category == 'FOREX') || (category == 'CRYPTO')) {
                    symbol = market['name'];
                    let parts = symbol.split ('/');
                    base = parts[0];
                    quote = parts[1];
                } else {
                    base = id;
                    quote = 'USD';
                    symbol = base + '/' + quote;
                }
                base = this_.commonCurrencyCode (base);
                quote = this_.commonCurrencyCode (quote);
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                });
            }
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balance = await this.privateGetUserOverview ();
        let response = balance['response'];
        let result = {
            'info': response,
        };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            result[currency] = this.account ();
        }
        let total = parseFloat (response['balance']);
        result['BTC']['free'] = total;
        result['BTC']['total'] = total;
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetMarketQuotes (this.extend ({
            'symbols': this.marketId (symbol),
        }, params));
        let orderbook = response['response'][0];
        let timestamp = this.parse8601 (orderbook['updated']);
        let bidPrice = parseFloat (orderbook['bid']);
        let askPrice = parseFloat (orderbook['ask']);
        let bid = [ bidPrice, undefined ];
        let ask = [ askPrice, undefined ];
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bids': [ bid ],
            'asks': [ ask ],
        };
    },

    async fetchTrades (symbol) {
        throw new ExchangeError (this.id + ' fetchTrades () method not implemented yet');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let result = await this.privateGetMarketBars (this.extend ({
            'symbol': this.marketId (symbol),
            'resolution': 60,
            'limit': 1,
        }, params));
        let orderbook = await this.fetchOrderBook (symbol);
        let ticker = result['response'][0];
        let timestamp = this.parse8601 (ticker['date']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h']),
            'low': parseFloat (ticker['l']),
            'bid': orderbook['bids'][0][0],
            'ask': orderbook['asks'][0][0],
            'vwap': undefined,
            'open': parseFloat (ticker['o']),
            'close': parseFloat (ticker['c']),
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        };
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv['date']),
            parseFloat (ohlcv['o']),
            parseFloat (ohlcv['h']),
            parseFloat (ohlcv['l']),
            parseFloat (ohlcv['c']),
            undefined,
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (since)
            request['date_start'] = this.iso8601 (since); // they also support date_end
        if (limit)
            request['limit'] = limit;
        let result = await this.privateGetMarketBars (this.extend (request, params));
        return this.parseOHLCVs (result['response'], market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'margin': amount,
            'direction': (side == 'sell') ? 'short' : 'long',
            'leverage': 1,
            'type': side,
        };
        if (type == 'limit')
            order['price'] = price;
        else
            order['type'] += '_market';
        let result = await this.privateGetOrderCreate (this.extend (order, params));
        return {
            'info': result,
            'id': result['response']['order_id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        let url = this.urls['api'] + '/' + this.version + '/' + path + '.php';
        let query = this.extend ({ 'token': this.apiKey }, params);
        url += '?' + this.urlencode (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('warning' in response)
            if (response['warning'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        if ('error' in response)
            if (response['error'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var cryptocapital = {

    'id': 'cryptocapital',
    'name': 'Crypto Capital',
    'comment': 'Crypto Capital API',
    'countries': 'PA', // Panama
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'timeframes': {
        '1d': '1year',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
        'www': 'https://cryptocapital.co',
        'doc': 'https://github.com/cryptocap',
    },
    'api': {
        'public': {
            'get': [
                'stats',
                'historical-prices',
                'order-book',
                'transactions',
            ],
        },
        'private': {
            'post': [
                'balances-and-info',
                'open-orders',
                'user-transactions',
                'btc-deposit-address/get',
                'btc-deposit-address/new',
                'deposits/get',
                'withdrawals/get',
                'orders/new',
                'orders/edit',
                'orders/cancel',
                'orders/status',
                'withdrawals/new',
            ],
        },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalancesAndInfo ();
        let balance = response['balances-and-info'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            account['free'] = this.safeFloat (balance['available'], currency, 0.0);
            account['used'] = this.safeFloat (balance['on_hold'], currency, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        let response = await this.publicGetOrderBook (this.extend ({
            'currency': this.marketId (market),
        }, params));
        return this.parseOrderBook (response['order-book'], undefined, 'bid', 'ask', 'price', 'order_amount');
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetStats (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
        let ticker = response['stats'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['max']),
            'low': parseFloat (ticker['min']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': parseFloat (ticker['daily_change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['total_btc_traded']),
        };
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv['date'] + ' 00:00:00'),
            undefined,
            undefined,
            undefined,
            parseFloat (ohlcv['price']),
            undefined,
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetHistoricalPrices (this.extend ({
            'currency': market['id'],
            'timeframe': this.timeframes[timeframe],
        }, params));
        let ohlcvs = this.omit (response['historical-prices'], 'request_currency');
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': trade['maker_type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'currency': market['id'],
        }, params));
        let trades = this.omit (response['transactions'], 'request_currency');
        return this.parseTrades (trades, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'side': side,
            'type': type,
            'currency': this.marketId (symbol),
            'amount': amount,
        };
        if (type == 'limit')
            order['limit_price'] = price;
        let result = await this.privatePostOrdersNew (this.extend (order, params));
        return {
            'info': result,
            'id': result,
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrdersCancel ({ 'id': id });
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawalsNew (this.extend ({
            'currency': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id == 'cryptocapital')
            throw new ExchangeError (this.id + ' is an abstract base API for _1btcxe');
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.extend ({
                'api_key': this.apiKey,
                'nonce': this.nonce (),
            }, params);
            let request = this.json (query);
            query['signature'] = this.hmac (this.encode (request), this.encode (this.secret));
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response) {
            let errors = [];
            for (let e = 0; e < response['errors'].length; e++) {
                let error = response['errors'][e];
                errors.push (error['code'] + ': ' + error['message']);
            }
            errors = errors.join (' ');
            throw new ExchangeError (this.id + ' ' + errors);
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var _1btcxe = extend (cryptocapital, {

    'id': '_1btcxe',
    'name': '1BTCXE',
    'countries': 'PA', // Panama
    'comment': 'Crypto Capital API',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
        'api': 'https://1btcxe.com/api',
        'www': 'https://1btcxe.com',
        'doc': 'https://1btcxe.com/api-docs.php',
    },
    'markets': {
        'BTC/USD': { 'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'BTC/CNY': { 'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
        'BTC/RUB': { 'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB' },
        'BTC/CHF': { 'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF' },
        'BTC/JPY': { 'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
        'BTC/GBP': { 'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
        'BTC/CAD': { 'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
        'BTC/AUD': { 'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
        'BTC/AED': { 'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED' },
        'BTC/BGN': { 'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN' },
        'BTC/CZK': { 'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK' },
        'BTC/DKK': { 'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK' },
        'BTC/HKD': { 'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD' },
        'BTC/HRK': { 'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK' },
        'BTC/HUF': { 'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF' },
        'BTC/ILS': { 'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS' },
        'BTC/INR': { 'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
        'BTC/MUR': { 'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR' },
        'BTC/MXN': { 'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN' },
        'BTC/NOK': { 'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK' },
        'BTC/NZD': { 'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD' },
        'BTC/PLN': { 'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
        'BTC/RON': { 'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON' },
        'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
        'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
        'BTC/THB': { 'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB' },
        'BTC/TRY': { 'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
        'BTC/ZAR': { 'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR' },
    },
})

//-----------------------------------------------------------------------------

var acx = {

    'id': 'acx',
    'name': 'ACX',
    'countries': 'AU',
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': true,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'timeframes': {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '2h': '120',
        '4h': '240',
        '12h': '720',
        '1d': '1440',
        '3d': '4320',
        '1w': '10080',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg',
        'extension': '.json',
        'api': 'https://acx.io/api',
        'www': 'https://acx.io',
        'doc': 'https://acx.io/documents/api_v2',
    },
    'api': {
        'public': {
            'get': [
                'markets', // Get all available markets
                'tickers', // Get ticker of all markets
                'tickers/{market}', // Get ticker of specific market
                'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                'order_book', // Get the order book of specified market
                'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                'k', // Get OHLC(k line) of specific market
                'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                'timestamp', // Get server current time, in seconds since Unix epoch
            ],
        },
        'private': {
            'get': [
                'members/me', // Get your profile and accounts info
                'deposits', // Get your deposits history
                'deposit', // Get details of specific deposit
                'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                'orders', // Get your orders, results is paginated
                'order', // Get information of specified order
                'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                'withdraws', // Get your cryptocurrency withdraws
                'withdraw', // Get your cryptocurrency withdraw
            ],
            'post': [
                'orders', // Create a Sell/Buy order
                'orders/multi', // Create multiple sell/buy orders
                'orders/clear', // Cancel all my orders
                'order/delete', // Cancel an order
                'withdraw', // Create a withdraw
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let symbol = market['name'];
            let [ base, quote ] = symbol.split ('/');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetMembersMe ();
        let balances = response['accounts'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': parseFloat (balance['balance']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'market': market['id'],
            'limit': 300,
        }, params));
        let timestamp = orderbook['timestamp'] * 1000;
        let result = this.parseOrderBook (orderbook, timestamp);
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['at'] * 1000;
        ticker = ticker['ticker'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high', undefined),
            'low': this.safeFloat (ticker, 'low', undefined),
            'bid': this.safeFloat (ticker, 'buy', undefined),
            'ask': this.safeFloat (ticker, 'sell', undefined),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last', undefined),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'vol', undefined),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                base = base.toUpperCase ();
                quote = quote.toUpperCase ();
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                let symbol = base + '/' + quote;
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickersMarket (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (response, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = trade['timestamp'] * 1000;
        let side = (trade['type'] == 'bid') ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        // looks like they switched this endpoint off
        // it returns 503 Service Temporarily Unavailable always
        // return this.parseTrades (response, market);
        return response;
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!limit)
            limit = 500; // default is 30
        let request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since)
            request['timestamp'] = since;
        let response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'market': this.marketId (symbol),
            'side': side,
            'volume': amount.toString (),
            'ord_type': type,
        };
        if (type == 'limit') {
            order['price'] = price.toString ();
        }
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderDelete ({ 'id': id });
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostWithdraw (this.extend ({
            'currency': currency.toLowerCase (),
            'sum': amount,
            'address': address,
        }, params));
        return {
            'info': result,
            'id': undefined,
        };
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api' + '/' + this.version + '/' + this.implodeParams (path, params);
        if ('extension' in this.urls)
            request += this.urls['extension'];
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            let query = this.urlencode (this.keysort (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params)));
            let auth = method + '|' + request + '|' + query;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
            let suffix = query + '&signature=' + signature;
            if (method == 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------
// OKCoin
// China
// https://www.okcoin.com/
// https://www.okcoin.com/rest_getStarted.html
// https://github.com/OKCoin/websocket
// https://www.npmjs.com/package/okcoin.com
// https://www.okcoin.cn
// https://www.okcoin.cn/rest_getStarted.html

var okcoin = {

    'version': 'v1',
    'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
    'hasFetchOHLCV': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'extension': '.do', // appended to endpoint URL
    'timeframes': {
        '1m': '1min',
        '3m': '3min',
        '5m': '5min',
        '15m': '15min',
        '30m': '30min',
        '1h': '1hour',
        '2h': '2hour',
        '4h': '4hour',
        '6h': '6hour',
        '12h': '12hour',
        '1d': '1day',
        '3d': '3day',
        '1w': '1week',
    },
    'api': {
        'public': {
            'get': [
                'depth',
                'exchange_rate',
                'future_depth',
                'future_estimated_price',
                'future_hold_amount',
                'future_index',
                'future_kline',
                'future_price_limit',
                'future_ticker',
                'future_trades',
                'kline',
                'otcs',
                'ticker',
                'trades',
            ],
        },
        'private': {
            'post': [
                'account_records',
                'batch_trade',
                'borrow_money',
                'borrow_order_info',
                'borrows_info',
                'cancel_borrow',
                'cancel_order',
                'cancel_otc_order',
                'cancel_withdraw',
                'future_batch_trade',
                'future_cancel',
                'future_devolve',
                'future_explosive',
                'future_order_info',
                'future_orders_info',
                'future_position',
                'future_position_4fix',
                'future_trade',
                'future_trades_history',
                'future_userinfo',
                'future_userinfo_4fix',
                'lend_depth',
                'order_fee',
                'order_history',
                'order_info',
                'orders_info',
                'otc_order_history',
                'otc_order_info',
                'repayment',
                'submit_otc_order',
                'trade',
                'trade_history',
                'trade_otc_order',
                'withdraw',
                'withdraw_info',
                'unrepayments_info',
                'userinfo',
            ],
        },
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Depth';
        let orderbook = await this[method] (this.extend (request, params));
        let timestamp = this.milliseconds ();
        return {
            'bids': orderbook['bids'],
            'asks': this.sortBy (orderbook['asks'], 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Ticker';
        let response = await this[method] (this.extend (request, params));
        let timestamp = parseInt (response['date']) * 1000;
        let ticker = this.extend (response['ticker'], { 'timestamp': timestamp });
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': trade['date_ms'],
            'datetime': this.iso8601 (trade['date_ms']),
            'symbol': symbol,
            'id': trade['tid'],
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Trades';
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market);
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1440, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'publicGet';
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'Kline';
        if (limit)
            request['size'] = parseInt (limit);
        if (since) {
            request['since'] = since;
        } else {
            request['since'] = this.milliseconds () - 86400000; // last 24 hours
        }
        let response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserinfo ();
        let balances = response['info']['funds'];
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            account['free'] = this.safeFloat (balances['free'], lowercase, 0.0);
            account['used'] = this.safeFloat (balances['freezed'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let order = {
            'symbol': market['id'],
            'type': side,
        };
        if (market['future']) {
            method += 'Future';
            order = this.extend (order, {
                'contract_type': 'this_week', // next_week, quarter
                'match_price': 0, // match best counter party price? 0 or 1, ignores price if 1
                'lever_rate': 10, // leverage rate value: 10 or 20 (10 by default)
                'price': price,
                'amount': amount,
            });
        } else {
            if (type == 'limit') {
                order['price'] = price;
                order['amount'] = amount;
            } else {
                order['type'] += '_market';
                if (side == 'buy') {
                    order['price'] = this.safeFloat (params, 'cost');
                    if (!order['price'])
                        throw new ExchangeError (this.id + ' market buy orders require an additional cost parameter, cost = price * amount');
                } else {
                    order['amount'] = amount;
                }
            }
        }
        params = this.omit (params, 'cost');
        method += 'Trade';
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder() requires a symbol argument');
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'order_id': id,
        };
        let method = 'privatePost';
        if (market['future']) {
            method += 'FutureCancel';
            request['contract_type'] = 'this_week'; // next_week, quarter
        } else {
            method += 'CancelOrder';
        }
        let response = await this[method] (this.extend (request, params));
        return response;
    },

    getOrderStatus (status) {
        if (status == -1)
            return 'canceled';
        if (status == 0)
            return 'open';
        if (status == 1)
            return 'partial';
        if (status == 2)
            return 'closed';
        if (status == 4)
            return 'canceled';
        return status;
    },

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        if ('type' in order) {
            if ((order['type'] == 'buy') || (order['type'] == 'sell')) {
                side = order['type'];
                type = 'limit';
            } else {
                side = (order['type'] == 'buy_market') ? 'buy' : 'sell';
                type = 'market';
            }
        }
        let status = this.getOrderStatus (order['status']);
        let symbol = undefined;
        if (!market) {
            if ('symbol' in order)
                if (order['symbol'] in this.markets_by_id)
                    market = this.markets_by_id[order['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        if ('create_date' in order)
            timestamp = order['create_date'];
        let amount = order['amount'];
        let filled = order['deal_amount'];
        let remaining = amount - filled;
        let average = order['avg_price'];
        let cost = average * filled;
        let result = {
            'info': order,
            'id': order['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': order['price'],
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'order_id': id,
            'symbol': market['id'],
            // 'status': 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page': 1, // current page number
            // 'page_length': 200, // number of orders returned per page, maximum 200
        };
        if (market['future']) {
            method += 'Future';
            request['contract_type'] = 'this_week'; // next_week, quarter
        }
        method += 'OrderInfo';
        let response = await this[method] (this.extend (request, params));
        return this.parseOrder (response['orders'][0]);
    },

    async fetchOrders (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost';
        let request = {
            'symbol': market['id'],
        };
        let order_id_in_params = ('order_id' in params);
        if (market['future']) {
            method += 'FutureOrdersInfo';
            request['contract_type'] = 'this_week'; // next_week, quarter
            if (!order_id_in_params)
                throw new ExchangeError (this.id + ' fetchOrders() requires order_id param for futures market ' + symbol + ' (a string of one or more order ids, comma-separated)');
        } else {
            let type = this.safeValue (params, 'type');
            let status = this.safeValue (params, 'status');
            if (type) {
                status = params['type'];
            } else if (status) {
                status = params['status'];
            } else {
                throw new ExchangeError (this.id + ' fetchOrders() requires type param or status param for spot market ' + symbol + ' (0 or "open" for unfilled orders, 1 or "closed" for filled orders)');
            }
            if (status == 'open')
                status = 0;
            if (status == 'closed')
                status = 1;
            if (order_id_in_params) {
                method += 'OrdersInfo';
                request = this.extend (request, {
                    'type': status,
                });
            } else {
                method += 'OrderHistory';
                request = this.extend (request, {
                    'status': status,
                    'current_page': 1, // current page number
                    'page_length': 200, // number of orders returned per page, maximum 200
                });
            }
            params = this.omit (params, [ 'type', 'status' ]);
        }
        let response = await this[method] (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, this.extend ({
            'status': open,
        }, params));
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        let closed = 1; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, this.extend ({
            'status': closed,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api != 'web')
            url += this.version + '/';
        url += path + this.extension;
        if (api == 'private') {
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            // secret key must be at the end of query
            let queryString = this.rawencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (!response['result'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var allcoin = extend (okcoin, {
    'id': 'allcoin',
    'name': 'Allcoin',
    'countries': 'CA',
    'hasCORS': false,
    'extension': '',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
        'api': {
            'web': 'https://allcoin.com',
            'public': 'https://api.allcoin.com/api',
            'private': 'https://api.allcoin.com/api',
        },
        'www': 'https://allcoin.com',
        'doc': 'https://allcoin.com/About/APIReference',
    },
    'api': {
        'web': {
            'get': [
                'marketoverviews/',
            ],
        },
        'public': {
            'get': [
                'depth',
                'kline',
                'ticker',
                'trades',
            ],
        },
        'private': {
            'post': [
                'batch_trade',
                'cancel_order',
                'order_history',
                'order_info',
                'orders_info',
                'repayment',
                'trade',
                'trade_history',
                'userinfo',
            ],
        },
    },

    async fetchMarkets () {
        let currencies = [ 'BTC', 'ETH', 'USD', 'QTUM' ];
        let result = [];
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let response = await this.webGetMarketoverviews ({
                'type': 'full',
                'secondary': currency,
            });
            let markets = response['Markets'];
            for (let k = 0; k < markets.length; k++) {
                let market = markets[k];
                let base = market['Primary'];
                let quote = market['Secondary'];
                let id = base.toLowerCase () + '_' + quote.toLowerCase ();
                let symbol = base + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'type': 'spot',
                    'spot': true,
                    'future': false,
                    'info': market,
                });
            }
        }
        return result;
    },

    getOrderStatus (status) {
        if (status == -1)
            return 'canceled';
        if (status == 0)
            return 'open';
        if (status == 1)
            return 'partial';
        if (status == 2)
            return 'closed';
        if (status == 10)
            return 'canceled';
        return status;
    },
})

//-----------------------------------------------------------------------------

var anxpro = {

    'id': 'anxpro',
    'name': 'ANXPro',
    'countries': [ 'JP', 'SG', 'HK', 'NZ' ],
    'version': '2',
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchTrades': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
        'api': 'https://anxpro.com/api',
        'www': 'https://anxpro.com',
        'doc': [
            'http://docs.anxv2.apiary.io',
            'https://anxpro.com/pages/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{currency_pair}/money/ticker',
                '{currency_pair}/money/depth/full',
                '{currency_pair}/money/trade/fetch', // disabled by ANXPro
            ],
        },
        'private': {
            'post': [
                '{currency_pair}/money/order/add',
                '{currency_pair}/money/order/cancel',
                '{currency_pair}/money/order/quote',
                '{currency_pair}/money/order/result',
                '{currency_pair}/money/orders',
                'money/{currency}/address',
                'money/{currency}/send_simple',
                'money/info',
                'money/trade/list',
                'money/wallet/history',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/HKD': { 'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD' },
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'BTC/CAD': { 'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
        'BTC/AUD': { 'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
        'BTC/SGD': { 'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
        'BTC/JPY': { 'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
        'BTC/GBP': { 'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
        'BTC/NZD': { 'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD' },
        'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'DOGE/BTC': { 'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
        'STR/BTC': { 'id': 'STRBTC', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC' },
        'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostMoneyInfo ();
        let balance = response['data'];
        let currencies = Object.keys (balance['Wallets']);
        let result = { 'info': balance };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = this.account ();
            if (currency in balance['Wallets']) {
                let wallet = balance['Wallets'][currency];
                account['free'] = parseFloat (wallet['Available_Balance']['value']);
                account['total'] = parseFloat (wallet['Balance']['value']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyDepthFull (this.extend ({
            'currency_pair': this.marketId (market),
        }, params));
        let orderbook = response['data'];
        let t = parseInt (orderbook['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyTicker (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        let t = parseInt (ticker['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        let bid = this.safeFloat (ticker['buy'], 'value');
        let ask = this.safeFloat (ticker['sell'], 'value');;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']['value']),
            'low': parseFloat (ticker['low']['value']),
            'bid': bid,
            'ask': ask,
            'vwap': parseFloat (ticker['vwap']['value']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']['value']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']['value']),
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']['value']),
        };
    },

    async fetchTrades (market, params = {}) {
        throw new ExchangeError (this.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled');
        return this.publicGetCurrencyPairMoneyTradeFetch (this.extend ({
            'currency_pair': this.marketId (market),
        }, params));
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        let order = {
            'currency_pair': this.marketId (market),
            'amount_int': parseInt (amount * 100000000), // 10^8
            'type': side,
        };
        if (type == 'limit')
            order['price_int'] = parseInt (price * 100000); // 10^5
        let result = await this.privatePostCurrencyPairOrderAdd (this.extend (order, params));
        return {
            'info': result,
            'id': result['data']
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCurrencyPairOrderCancel ({ 'oid': id });
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostMoneyCurrencySendSimple (this.extend ({
            'currency': currency,
            'amount_int': parseInt (amount * 100000000), // 10^8
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            let auth = request + "\0" + body;
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (response['result'] == 'success')
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var binance = {

    'id': 'binance',
    'name': 'Binance',
    'countries': 'CN', // China
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchOHLCV': true,
    'hasFetchMyTrades': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'timeframes': {
        '1m': '1m',
        '3m': '3m',
        '5m': '5m',
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '2h': '2h',
        '4h': '4h',
        '6h': '6h',
        '8h': '8h',
        '12h': '12h',
        '1d': '1d',
        '3d': '3d',
        '1w': '1w',
        '1M': '1M',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
        'api': 'https://www.binance.com/api',
        'www': 'https://www.binance.com',
        'doc': 'https://www.binance.com/restapipub.html',
        'fees': 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
    },
    'api': {
        'public': {
            'get': [
                'ping',
                'time',
                'depth',
                'aggTrades',
                'klines',
                'ticker/24hr',
            ],
        },
        'private': {
            'get': [
                'order',
                'openOrders',
                'allOrders',
                'account',
                'myTrades',
            ],
            'post': [
                'order',
                'order/test',
                'userDataStream',
            ],
            'put': [
                'userDataStream'
            ],
            'delete': [
                'order',
                'userDataStream',
            ],
        },
    },
    'fees': {
        'trading': {
            'taker': 0.001,
            'maker': 0.001,
        },
        'funding': {
            'withdraw': {
                'BNB': 1.0,
                'BTC': 0.0005,
                'ETH': 0.005,
                'LTC': 0.001,
                'NEO': 0.0,
                'QTUM': 0.1,
                'SNT': 1.0,
                'EOS': 0.1,
                'BCC': undefined,
                'GAS': 0.0,
                'USDT': 5.0,
                'HSR': 0.0001,
                'OAX': 0.1,
                'DNT': 1.0,
                'MCO': 0.1,
                'ICN': 0.1,
                'WTC': 0.1,
                'OMG': 0.1,
                'ZRX': 1.0,
                'STRAT': 0.1,
                'SNGLS': 1.0,
                'BQX': 1.0,
            },
        },
    },
    'precision': {
        'amount': 6,
        'price': 6,
    },
    'markets': {
        'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'BNB/BTC': { 'id': 'BNBBTC', 'symbol': 'BNB/BTC', 'base': 'BNB', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'NEO/BTC': { 'id': 'NEOBTC', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'GAS/BTC': { 'id': 'GASBTC', 'symbol': 'GAS/BTC', 'base': 'GAS', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'BCC/BTC': { 'id': 'BCCBTC', 'symbol': 'BCC/BTC', 'base': 'BCC', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'MCO/BTC': { 'id': 'MCOBTC', 'symbol': 'MCO/BTC', 'base': 'MCO', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'WTC/BTC': { 'id': 'WTCBTC', 'symbol': 'WTC/BTC', 'base': 'WTC', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'OMG/BTC': { 'id': 'OMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'ZRX/BTC': { 'id': 'ZRXBTC', 'symbol': 'ZRX/BTC', 'base': 'ZRX', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'BQX/BTC': { 'id': 'BQXBTC', 'symbol': 'BQX/BTC', 'base': 'BQX', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'KNC/BTC': { 'id': 'KNCBTC', 'symbol': 'KNC/BTC', 'base': 'KNC', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'FUN/BTC': { 'id': 'FUNBTC', 'symbol': 'FUN/BTC', 'base': 'FUN', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'SNM/BTC': { 'id': 'SNMBTC', 'symbol': 'SNM/BTC', 'base': 'SNM', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'XVG/BTC': { 'id': 'XVGBTC', 'symbol': 'XVG/BTC', 'base': 'XVG', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'CTR/BTC': { 'id': 'CTRBTC', 'symbol': 'CTR/BTC', 'base': 'CTR', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'BNB/ETH': { 'id': 'BNBETH', 'symbol': 'BNB/ETH', 'base': 'BNB', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'SNT/ETH': { 'id': 'SNTETH', 'symbol': 'SNT/ETH', 'base': 'SNT', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'BNT/ETH': { 'id': 'BNTETH', 'symbol': 'BNT/ETH', 'base': 'BNT', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'EOS/ETH': { 'id': 'EOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'OAX/ETH': { 'id': 'OAXETH', 'symbol': 'OAX/ETH', 'base': 'OAX', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'DNT/ETH': { 'id': 'DNTETH', 'symbol': 'DNT/ETH', 'base': 'DNT', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'MCO/ETH': { 'id': 'MCOETH', 'symbol': 'MCO/ETH', 'base': 'MCO', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'ICN/ETH': { 'id': 'ICNETH', 'symbol': 'ICN/ETH', 'base': 'ICN', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'WTC/ETH': { 'id': 'WTCETH', 'symbol': 'WTC/ETH', 'base': 'WTC', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'OMG/ETH': { 'id': 'OMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'ZRX/ETH': { 'id': 'ZRXETH', 'symbol': 'ZRX/ETH', 'base': 'ZRX', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'BQX/ETH': { 'id': 'BQXETH', 'symbol': 'BQX/ETH', 'base': 'BQX', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'KNC/ETH': { 'id': 'KNCETH', 'symbol': 'KNC/ETH', 'base': 'KNC', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'FUN/ETH': { 'id': 'FUNETH', 'symbol': 'FUN/ETH', 'base': 'FUN', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'SNM/ETH': { 'id': 'SNMETH', 'symbol': 'SNM/ETH', 'base': 'SNM', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'NEO/ETH': { 'id': 'NEOETH', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'XVG/ETH': { 'id': 'XVGETH', 'symbol': 'XVG/ETH', 'base': 'XVG', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'CTR/ETH': { 'id': 'CTRETH', 'symbol': 'CTR/ETH', 'base': 'CTR', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'QTUM/BTC': { 'id': 'QTUMBTC', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'LINK/BTC': { 'id': 'LINKBTC', 'symbol': 'LINK/BTC', 'base': 'LINK', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'SALT/BTC': { 'id': 'SALTBTC', 'symbol': 'SALT/BTC', 'base': 'SALT', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'IOTA/BTC': { 'id': 'IOTABTC', 'symbol': 'IOTA/BTC', 'base': 'IOTA', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'QTUM/ETH': { 'id': 'QTUMETH', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'LINK/ETH': { 'id': 'LINKETH', 'symbol': 'LINK/ETH', 'base': 'LINK', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'SALT/ETH': { 'id': 'SALTETH', 'symbol': 'SALT/ETH', 'base': 'SALT', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'IOTA/ETH': { 'id': 'IOTAETH', 'symbol': 'IOTA/ETH', 'base': 'IOTA', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'BTC/USDT': { 'id': 'BTCUSDT', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT', 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 1, 'max': undefined }}},
        'ETH/USDT': { 'id': 'ETHUSDT', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT', 'limits': { 'amount': { 'min': 0.00001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 1, 'max': undefined }}},
        'STRAT/ETH': { 'id': 'STRATETH', 'symbol': 'STRAT/ETH', 'base': 'STRAT', 'quote': 'ETH', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'SNGLS/ETH': { 'id': 'SNGLSETH', 'symbol': 'SNGLS/ETH', 'base': 'SNGLS', 'quote': 'ETH', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
        'STRAT/BTC': { 'id': 'STRATBTC', 'symbol': 'STRAT/BTC', 'base': 'STRAT', 'quote': 'BTC', 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
        'SNGLS/BTC': { 'id': 'SNGLSBTC', 'symbol': 'SNGLS/BTC', 'base': 'SNGLS', 'quote': 'BTC', 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
    },

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    },

    async fetchBalance (params = {}) {
        let response = await this.privateGetAccount (params);
        let result = { 'info': response };
        let balances = response['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let asset = balance['asset'];
            let currency = this.commonCurrencyCode (asset);
            let account = {
                'free': parseFloat (balance['free']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'symbol': market['id'],
            'limit': 100, // default = maximum = 100
        }, params));
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market) {
        let timestamp = ticker['closeTime'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['highPrice']),
            'low': parseFloat (ticker['lowPrice']),
            'bid': parseFloat (ticker['bidPrice']),
            'ask': parseFloat (ticker['askPrice']),
            'vwap': parseFloat (ticker['weightedAvgPrice']),
            'open': parseFloat (ticker['openPrice']),
            'close': parseFloat (ticker['prevClosePrice']),
            'first': undefined,
            'last': parseFloat (ticker['lastPrice']),
            'change': parseFloat (ticker['priceChangePercent']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': parseFloat (ticker['quoteVolume']),
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTicker24hr (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response, market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        request['limit'] = (limit) ? limit : 500; // default == max == 500
        if (since)
            request['startTime'] = since;
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    parseTrade (trade, market = undefined) {
        let timestampField = ('T' in trade) ? 'T' : 'time';
        let timestamp = trade[timestampField];
        let priceField = ('p' in trade) ? 'p' : 'price';
        let price = parseFloat (trade[priceField]);
        let amountField = ('q' in trade) ? 'q' : 'qty';
        let amount = parseFloat (trade[amountField]);
        let idField = ('a' in trade) ? 'a' : 'id';
        let id = trade[idField].toString ();
        let side = undefined;
        let order = undefined;
        if ('orderId' in trade)
            order = trade['orderId'].toString ();
        if ('m' in trade) {
            side = 'sell';
            if (trade['m'])
                side = 'buy';
        } else {
            side = (trade['isBuyer']) ? 'buy' : 'sell';
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': parseFloat (trade['commission']),
                'currency': trade['commissionAsset'],
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetAggTrades (this.extend ({
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            'limit': 500,        // default = maximum = 500
        }, params));
        return this.parseTrades (response, market);
    },

    parseOrderStatus (status) {
        if (status == 'NEW')
            return 'open';
        if (status == 'PARTIALLY_FILLED')
            return 'partial';
        if (status == 'FILLED')
            return 'closed';
        if (status == 'CANCELED')
            return 'canceled';
        return status.toLowerCase ();
    },

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = order['time'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['origQty']);
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let result = {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (type == 'limit') {
            order = this.extend (order, {
                'price': this.priceToPrecision (symbol, price),
                'timeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            });
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderId'].toString (),
        };
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol param');
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
        }, params));
        return this.parseOrder (response, market);
    },

    async fetchOrders (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        let market = this.market (symbol);
        let response = await this.privateGetAllOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseOrders (response, market);
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        let market = this.market (symbol);
        let response = await this.privateGetOpenOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseOrders (response, market);
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol param');
        let market = this.market (symbol);
        let response = undefined;
        try {
            response = await this.privateDeleteOrder (this.extend ({
                'symbol': market['id'],
                'orderId': parseInt (id),
                // 'origClientOrderId': id,
            }, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'msg');
                if (message == 'UNKOWN_ORDER')
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    },

    nonce () {
        return this.milliseconds ();
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol');
        let market = this.market (symbol);
        let response = await this.privateGetMyTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            let query = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            let auth = this.secret + '|' + query;
            let signature = this.hash (this.encode (auth), 'sha256');
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if (method == 'GET') {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if (response['code'] < 0) {
                if (response['code'] == -2010)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var bit2c = {

    'id': 'bit2c',
    'name': 'Bit2C',
    'countries': 'IL', // Israel
    'rateLimit': 3000,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
        'api': 'https://www.bit2c.co.il',
        'www': 'https://www.bit2c.co.il',
        'doc': [
            'https://www.bit2c.co.il/home/api',
            'https://github.com/OferE/bit2c',
        ],
    },
    'api': {
        'public': {
            'get': [
                'Exchanges/{pair}/Ticker',
                'Exchanges/{pair}/orderbook',
                'Exchanges/{pair}/trades',
            ],
        },
        'private': {
            'post': [
                'Account/Balance',
                'Account/Balance/v2',
                'Merchant/CreateCheckout',
                'Order/AccountHistory',
                'Order/AddCoinFundsRequest',
                'Order/AddFund',
                'Order/AddOrder',
                'Order/AddOrderMarketPriceBuy',
                'Order/AddOrderMarketPriceSell',
                'Order/CancelOrder',
                'Order/MyOrders',
                'Payment/GetMyId',
                'Payment/Send',
            ],
        },
    },
    'markets': {
        'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS' },
        'BCH/NIS': { 'id': 'BchNis', 'symbol': 'BCH/NIS', 'base': 'BCH', 'quote': 'NIS' },
        'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS' },
    },

    async fetchBalance (params = {}) {
        let balance = await this.privatePostAccountBalanceV2 ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance) {
                let available = 'AVAILABLE_' + currency;
                account['free'] = balance[available];
                account['total'] = balance[currency];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        let orderbook = await this.publicGetExchangesPairOrderbook (this.extend ({
            'pair': this.marketId (market),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetExchangesPairTicker (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['h']),
            'ask': parseFloat (ticker['l']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['ll']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['av']),
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['a']),
        };
    },

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetExchangesPairTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostOrderAddOrder';
        let order = {
            'Amount': amount,
            'Pair': this.marketId (symbol),
        };
        if (type == 'market') {
            method += 'MarketPrice' + this.capitalize (side);
        } else {
            order['Price'] = price;
            order['Total'] = amount * price;
            order['IsBid'] = (side == 'buy');
        }
        let result = await this[method] (this.extend (order, params));
        return {
            'info': result,
            'id': result['NewOrder']['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderCancelOrder ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (api == 'public') {
            url += '.json';
        } else {
            let nonce = this.nonce ();
            let query = this.extend ({ 'nonce': nonce }, params);
            body = this.urlencode (query);
            let signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bitbay = {

    'id': 'bitbay',
    'name': 'BitBay',
    'countries': [ 'PL', 'EU' ], // Poland
    'rateLimit': 1000,
    'hasCORS': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
        'www': 'https://bitbay.net',
        'api': {
            'public': 'https://bitbay.net/API/Public',
            'private': 'https://bitbay.net/API/Trading/tradingApi.php',
        },
        'doc': [
            'https://bitbay.net/public-api',
            'https://bitbay.net/account/tab-api',
            'https://github.com/BitBayNet/API',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{id}/all',
                '{id}/market',
                '{id}/orderbook',
                '{id}/ticker',
                '{id}/trades',
            ],
        },
        'private': {
            'post': [
                'info',
                'trade',
                'cancel',
                'orderbook',
                'orders',
                'transfer',
                'withdraw',
                'history',
                'transactions',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
        'LTC/USD': { 'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
        'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
        'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
        'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
        'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
        'ETH/PLN': { 'id': 'ETHPLN', 'symbol': 'ETH/PLN', 'base': 'ETH', 'quote': 'PLN' },
        'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'LSK/USD': { 'id': 'LSKUSD', 'symbol': 'LSK/USD', 'base': 'LSK', 'quote': 'USD' },
        'LSK/EUR': { 'id': 'LSKEUR', 'symbol': 'LSK/EUR', 'base': 'LSK', 'quote': 'EUR' },
        'LSK/PLN': { 'id': 'LSKPLN', 'symbol': 'LSK/PLN', 'base': 'LSK', 'quote': 'PLN' },
        'LSK/BTC': { 'id': 'LSKBTC', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostInfo ();
        if ('balances' in response) {
            let balance = response['balances'];
            let result = { 'info': balance };
            for (let c = 0; c < this.currencies.length; c++) {
                let currency = this.currencies[c];
                let account = this.account ();
                if (currency in balance) {
                    account['free'] = parseFloat (balance[currency]['available']);
                    account['used'] = parseFloat (balance[currency]['locked']);
                    account['total'] = this.sum (account['free'], account['used']);
                }
                result[currency] = account;
            }
            return this.parseBalance (result);
        }
        throw new ExchangeError (this.id + ' empty balance response ' + this.json (response));
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetIdOrderbook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetIdTicker (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['max']),
            'low': parseFloat (ticker['min']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['average']),
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        return this.privatePostTrade (this.extend ({
            'type': side,
            'currency': market['base'],
            'amount': amount,
            'payment_currency': market['quote'],
            'rate': price,
        }, params));
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    },

    isFiat (currency) {
        let fiatCurrencies = {
            'USD': true,
            'EUR': true,
            'PLN': true,
        };
        if (currency in fiatCurrencies)
            return true;
        return false;
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        let request = {
            'currency': currency,
            'quantity': amount,
        };
        if (this.isFiat (currency)) {
            method = 'privatePostWithdraw';
            // request['account'] = params['account']; // they demand an account number
            // request['express'] = params['express']; // whatever it means, they don't explain
            // request['bic'] = '';
        } else {
            method = 'privatePostTransfer';
            request['address'] = address;
        }
        let response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.implodeParams (path, params) + '.json';
        } else {
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bitcoincoid = {

    'id': 'bitcoincoid',
    'name': 'Bitcoin.co.id',
    'countries': 'ID', // Indonesia
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
        'api': {
            'public': 'https://vip.bitcoin.co.id/api',
            'private': 'https://vip.bitcoin.co.id/tapi',
        },
        'www': 'https://www.bitcoin.co.id',
        'doc': [
            'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
            'https://vip.bitcoin.co.id/trade_api',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{pair}/ticker',
                '{pair}/trades',
                '{pair}/depth',
            ],
        },
        'private': {
            'post': [
                'getInfo',
                'transHistory',
                'trade',
                'tradeHistory',
                'openOrders',
                'cancelOrder',
            ],
        },
    },
    'markets': {
        'BTC/IDR': { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
        'BCH/IDR': { 'id': 'bch_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bch', 'quoteId': 'idr' },
        'ETH/IDR': { 'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr' },
        'ETC/IDR': { 'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr' },
        'XRP/IDR': { 'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr' },
        'XZC/IDR': { 'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr' },
        'BTS/BTC': { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc' },
        'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc' },
        'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
        'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
        'NXT/BTC': { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc' },
        'XLM/BTC': { 'id': 'str_btc', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc' },
        'XEM/BTC': { 'id': 'nem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc' },
        'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetInfo ();
        let balance = response['return'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            account['free'] = this.safeFloat (balance['balance'], lowercase, 0.0);
            account['used'] = this.safeFloat (balance['balance_hold'], lowercase, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetPairDepth (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell');
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetPairTicker (this.extend ({
            'pair': market['id'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseFloat (ticker['server_time']) * 1000;
        let baseVolume = 'vol_' + market['baseId'].toLowerCase ();
        let quoteVolume = 'vol_' + market['quoteId'].toLowerCase ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker[baseVolume]),
            'quoteVolume': parseFloat (ticker[quoteVolume]),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetPairTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'type': side,
            'price': price,
        };
        let base = market['baseId'];
        order[base] = amount;
        let result = await this.privatePostTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['return']['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + response['error']);
        return response;
    },
}

//-----------------------------------------------------------------------------

var bitfinex = {

    'id': 'bitfinex',
    'name': 'Bitfinex',
    'countries': 'US',
    'version': 'v1',
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchOrder': true,
    'hasFetchTickers': false,
    'hasDeposit': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
        'api': 'https://api.bitfinex.com',
        'www': 'https://www.bitfinex.com',
        'doc': [
            'https://bitfinex.readme.io/v1/docs',
            'https://github.com/bitfinexcom/bitfinex-api-node',
        ],
    },
    'api': {
        'public': {
            'get': [
                'book/{symbol}',
                // 'candles/{symbol}',
                'lendbook/{currency}',
                'lends/{currency}',
                'pubticker/{symbol}',
                'stats/{symbol}',
                'symbols',
                'symbols_details',
                'today',
                'trades/{symbol}',
            ],
        },
        'private': {
            'post': [
                'account_infos',
                'balances',
                'basket_manage',
                'credits',
                'deposit/new',
                'funding/close',
                'history',
                'history/movements',
                'key_info',
                'margin_infos',
                'mytrades',
                'mytrades_funding',
                'offer/cancel',
                'offer/new',
                'offer/status',
                'offers',
                'offers/hist',
                'order/cancel',
                'order/cancel/all',
                'order/cancel/multi',
                'order/cancel/replace',
                'order/new',
                'order/new/multi',
                'order/status',
                'orders',
                'orders/hist',
                'position/claim',
                'positions',
                'summary',
                'taken_funds',
                'total_taken_funds',
                'transfer',
                'unused_taken_funds',
                'withdraw',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetSymbolsDetails ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['pair'].toUpperCase ();
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            let base = baseId;
            let quote = quoteId;
            // issue #4 Bitfinex names Dash as DSH, instead of DASH
            if (base == 'DSH')
                base = 'DASH';
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostBalances ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            if (balance['type'] == 'exchange') {
                let currency = balance['currency'];
                let uppercase = currency.toUpperCase ();
                // issue #4 Bitfinex names dash as dsh
                if (uppercase == 'DSH')
                    uppercase = 'DASH';
                let account = this.account ();
                account['free'] = parseFloat (balance['available']);
                account['total'] = parseFloat (balance['amount']);
                account['used'] = account['total'] - account['free'];
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetPubtickerSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let timestamp = parseFloat (ticker['timestamp']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['mid']),
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['timestamp'] * 1000;
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = type;
        if ((type == 'limit') || (type == 'market'))
            orderType = 'exchange ' + type;
        let order = {
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'side': side,
            'type': orderType,
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type == 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            order['price'] = price.toString ();
        }
        let result = await this.privatePostOrderNew (this.extend (order, params));
        return {
            'info': result,
            'id': result['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_id': parseInt (id) });
    },

    parseOrder (order, market = undefined) {
        let side = order['side'];
        let open = order['is_live'];
        let canceled = order['is_cancelled'];
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (!market) {
            let exchange = order['symbol'].toUpperCase ();
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        if (market)
            symbol = market['symbol'];
        let orderType = order['type'];
        let exchange = orderType.indexOf ('exchange ') >= 0;
        if (exchange) {
            let [ prefix, orderType ] = order['type'].split (' ');
        }
        let timestamp = parseInt (parseFloat (order['timestamp']) * 1000);
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': parseFloat (order['price']),
            'average': parseFloat (order['avg_execution_price']),
            'amount': parseFloat (order['original_amount']),
            'remaining': parseFloat (order['remaining_amount']),
            'filled': parseFloat (order['executed_amount']),
            'status': status,
            'fee': undefined,
        };
        return result;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrders (params);
        return this.parseOrders (response);
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrdersHist (this.extend ({
            'limit': 100, // default 100
        }, params));
        return this.parseOrders (response);
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus (this.extend ({
            'order_id': parseInt (id),
        }, params));
        return this.parseOrder (response);
    },

    getCurrencyName (currency) {
        if (currency == 'BTC') {
            return 'bitcoin';
        } else if (currency == 'LTC') {
            return 'litecoin';
        } else if (currency == 'ETH') {
            return 'ethereum';
        } else if (currency == 'ETC') {
            return 'ethereumc';
        } else if (currency == 'OMNI') {
            return 'mastercoin'; // ???
        } else if (currency == 'ZEC') {
            return 'zcash';
        } else if (currency == 'XMR') {
            return 'monero';
        } else if (currency == 'USD') {
            return 'wire';
        } else if (currency == 'DASH') {
            return 'dash';
        } else if (currency == 'XRP') {
            return 'ripple';
        } else if (currency == 'EOS') {
            return 'eos';
        }
        throw new NotSupported (this.id + ' ' + currency + ' not supported for withdrawal');
    },

    async deposit (currency, params = {}) {
        await this.loadMarkets ();
        let name = this.getCurrencyName (currency);
        let request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        let response = await this.privatePostDepositNew (this.extend (request, params));
        return {
            'info': response,
            'address': response['address'],
        };
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let name = this.getCurrencyName (currency);
        let request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': amount.toString (),
            'address': address,
        };
        let responses = await this.privatePostWithdraw (this.extend (request, params));
        let response = responses[0];
        return {
            'info': response,
            'id': response['withdrawal_id'],
        };
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            query = this.json (query);
            query = this.encode (query);
            let payload = this.stringToBase64 (query);
            let secret = this.encode (this.secret);
            let signature = this.hmac (payload, secret, 'sha384');
            headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': this.decode (payload),
                'X-BFX-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            if (response['message'].indexOf ('not enough exchange balance') >= 0)
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var bitfinex2 = extend (bitfinex, {

    'id': 'bitfinex2',
    'name': 'Bitfinex v2',
    'countries': 'US',
    'version': 'v2',
    'hasCORS': true,
    'hasFetchTickers': false, // true but at least one pair is required
    'hasFetchOHLCV': true,
    'timeframes': {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '3h': '3h',
        '6h': '6h',
        '12h': '12h',
        '1d': '1D',
        '1w': '7D',
        '2w': '14D',
        '1M': '1M',
    },
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
        'api': 'https://api.bitfinex.com',
        'www': 'https://www.bitfinex.com',
        'doc': [
            'https://bitfinex.readme.io/v2/docs',
            'https://github.com/bitfinexcom/bitfinex-api-node',
        ],
    },
    'api': {
        'public': {
            'get': [
                'platform/status',
                'tickers', // replies with an empty list :\
                'ticker/{symbol}',
                'trades/{symbol}/hist',
                'book/{symbol}/{precision}',
                'book/{symbol}/P0',
                'book/{symbol}/P1',
                'book/{symbol}/P2',
                'book/{symbol}/P3',
                'book/{symbol}/R0',
                'symbols_details',
                'stats1/{key}:{size}:{symbol}/{side}/{section}',
                'stats1/{key}:{size}:{symbol}/long/last',
                'stats1/{key}:{size}:{symbol}/long/hist',
                'stats1/{key}:{size}:{symbol}/short/last',
                'stats1/{key}:{size}:{symbol}/short/hist',
                'candles/trade:{timeframe}:{symbol}/{section}',
                'candles/trade:{timeframe}:{symbol}/last',
                'candles/trade:{timeframe}:{symbol}/hist',
            ],
            'post': [
                'calc/trade/avg',
            ],
        },
        'private': {
            'post': [
                'auth/r/wallets',
                'auth/r/orders/{symbol}',
                'auth/r/orders/{symbol}/new',
                'auth/r/orders/{symbol}/hist',
                'auth/r/order/{symbol}:{id}/trades',
                'auth/r/trades/{symbol}/hist',
                'auth/r/funding/offers/{symbol}',
                'auth/r/funding/offers/{symbol}/hist',
                'auth/r/funding/loans/{symbol}',
                'auth/r/funding/loans/{symbol}/hist',
                'auth/r/funding/credits/{symbol}',
                'auth/r/funding/credits/{symbol}/hist',
                'auth/r/funding/trades/{symbol}/hist',
                'auth/r/info/margin/{key}',
                'auth/r/info/funding/{key}',
                'auth/r/movements/{currency}/hist',
                'auth/r/stats/perf:{timeframe}/hist',
                'auth/r/alerts',
                'auth/w/alert/set',
                'auth/w/alert/{type}:{symbol}:{price}/del',
                'auth/calc/order/avail',
            ],
        },
    },
    'markets': {
        'BCC/BTC': { 'id': 'tBCCBTC', 'symbol': 'BCC/BTC', 'base': 'BCC', 'quote': 'BTC' },
        'BCC/USD': { 'id': 'tBCCUSD', 'symbol': 'BCC/USD', 'base': 'BCC', 'quote': 'USD' },
        'BCH/BTC': { 'id': 'tBCHBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC' },
        'BCH/ETH': { 'id': 'tBCHETH', 'symbol': 'BCH/ETH', 'base': 'BCH', 'quote': 'ETH' },
        'BCH/USD': { 'id': 'tBCHUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD' },
        'BCU/BTC': { 'id': 'tBCUBTC', 'symbol': 'BCU/BTC', 'base': 'BCU', 'quote': 'BTC' },
        'BCU/USD': { 'id': 'tBCUUSD', 'symbol': 'BCU/USD', 'base': 'BCU', 'quote': 'USD' },
        'BTC/USD': { 'id': 'tBTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'DASH/BTC': { 'id': 'tDSHBTC', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
        'DASH/USD': { 'id': 'tDSHUSD', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USD' },
        'EOS/BTC': { 'id': 'tEOSBTC', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC' },
        'EOS/ETH': { 'id': 'tEOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH' },
        'EOS/USD': { 'id': 'tEOSUSD', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD' },
        'ETC/BTC': { 'id': 'tETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC' },
        'ETC/USD': { 'id': 'tETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD' },
        'ETH/BTC': { 'id': 'tETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'ETH/USD': { 'id': 'tETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
        'IOT/BTC': { 'id': 'tIOTBTC', 'symbol': 'IOT/BTC', 'base': 'IOT', 'quote': 'BTC' },
        'IOT/ETH': { 'id': 'tIOTETH', 'symbol': 'IOT/ETH', 'base': 'IOT', 'quote': 'ETH' },
        'IOT/USD': { 'id': 'tIOTUSD', 'symbol': 'IOT/USD', 'base': 'IOT', 'quote': 'USD' },
        'LTC/BTC': { 'id': 'tLTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'LTC/USD': { 'id': 'tLTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
        'OMG/BTC': { 'id': 'tOMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC' },
        'OMG/ETH': { 'id': 'tOMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH' },
        'OMG/USD': { 'id': 'tOMGUSD', 'symbol': 'OMG/USD', 'base': 'OMG', 'quote': 'USD' },
        'RRT/BTC': { 'id': 'tRRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC' },
        'RRT/USD': { 'id': 'tRRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD' },
        'SAN/BTC': { 'id': 'tSANBTC', 'symbol': 'SAN/BTC', 'base': 'SAN', 'quote': 'BTC' },
        'SAN/ETH': { 'id': 'tSANETH', 'symbol': 'SAN/ETH', 'base': 'SAN', 'quote': 'ETH' },
        'SAN/USD': { 'id': 'tSANUSD', 'symbol': 'SAN/USD', 'base': 'SAN', 'quote': 'USD' },
        'XMR/BTC': { 'id': 'tXMRBTC', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC' },
        'XMR/USD': { 'id': 'tXMRUSD', 'symbol': 'XMR/USD', 'base': 'XMR', 'quote': 'USD' },
        'XRP/BTC': { 'id': 'tXRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        'XRP/USD': { 'id': 'tXRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
        'ZEC/BTC': { 'id': 'tZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC' },
        'ZEC/USD': { 'id': 'tZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostAuthRWallets ();
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let [ type, currency, total, interest, available ] = balance;
            if (currency[0] == 't')
                currency = currency.slice (1);
            let uppercase = currency.toUpperCase ();
            // issue #4 Bitfinex names Dash as DSH, instead of DASH
            if (uppercase == 'DSH')
                uppercase = 'DASH';
            let account = this.account ();
            account['free'] = available;
            account['total'] = total;
            if (account['free'])
                account['used'] = account['total'] - account['free'];
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetBookSymbolPrecision (this.extend ({
            'symbol': this.marketId (symbol),
            'precision': 'R0',
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < orderbook.length; i++) {
            let order = orderbook[i];
            let price = order[1];
            let amount = order[2];
            let side = (amount > 0) ? 'bids' : 'asks';
            amount = Math.abs (amount);
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let [ bid, bidSize, ask, askSize, change, percentage, last, volume, high, low ] = ticker;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let [ id, timestamp, amount, price ] = trade;
        let side = (amount < 0) ? 'sell' : 'buy';
        return {
            'id': id.toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbolHist (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (limit)
            request['limit'] = limit;
        if (since)
            request['start'] = since;
        request = this.extend (request, params);
        let response = await this.publicGetCandlesTradeTimeframeSymbolHist (request);
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    },

    cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder not implemented yet');
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not implemented yet');
    },

    async withdraw (currency, amount, address, params = {}) {
        throw new NotSupported (this.id + ' withdraw not implemented yet');
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + request;
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = '/api' + '/' + request + nonce + body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha384');
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': this.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            if (response['message'].indexOf ('not enough exchange balance') >= 0)
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
})

//-----------------------------------------------------------------------------

var bitflyer = {

    'id': 'bitflyer',
    'name': 'bitFlyer',
    'countries': 'JP',
    'version': 'v1',
    'rateLimit': 500,
    'hasCORS': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
        'api': 'https://api.bitflyer.jp',
        'www': 'https://bitflyer.jp',
        'doc': 'https://bitflyer.jp/API',
    },
    'api': {
        'public': {
            'get': [
                'getmarkets',    // or 'markets'
                'getboard',      // or 'board'
                'getticker',     // or 'ticker'
                'getexecutions', // or 'executions'
                'gethealth',
                'getchats',
            ],
        },
        'private': {
            'get': [
                'getpermissions',
                'getbalance',
                'getcollateral',
                'getcollateralaccounts',
                'getaddresses',
                'getcoinins',
                'getcoinouts',
                'getbankaccounts',
                'getdeposits',
                'getwithdrawals',
                'getchildorders',
                'getparentorders',
                'getparentorder',
                'getexecutions',
                'getpositions',
                'gettradingcommission',
            ],
            'post': [
                'sendcoin',
                'withdraw',
                'sendchildorder',
                'cancelchildorder',
                'sendparentorder',
                'cancelparentorder',
                'cancelallchildorders',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['product_code'];
            let currencies = id.split ('_');
            let base = undefined;
            let quote = undefined;
            let symbol = id;
            let numCurrencies = currencies.length;
            if (numCurrencies == 1) {
                base = symbol.slice (0, 3);
                quote = symbol.slice (3, 6);
            } else if (numCurrencies == 2) {
                base = currencies[0];
                quote = currencies[1];
                symbol = base + '/' + quote;
            } else {
                base = currencies[1];
                quote = currencies[2];
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = {};
        for (let b = 0; b < response.length; b++) {
            let account = response[b];
            let currency = account['currency_code'];
            balances[currency] = account;
        }
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balances) {
                account['total'] = balances[currency]['amount'];
                account['free'] = balances[currency]['available'];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBoard (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'size');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTicker (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        let timestamp = this.parse8601 (ticker['timestamp']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['best_bid']),
            'ask': parseFloat (ticker['best_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['ltp']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_by_product']),
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let side = undefined;
        let order = undefined;
        if ('side' in trade)
            if (trade['side']) {
                side = trade['side'].toLowerCase ();
                let id = side + '_child_order_acceptance_id';
                if (id in trade)
                    order = trade[id];
            }
        let timestamp = this.parse8601 (trade['exec_date']);
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['size'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetExecutions (this.extend ({
            'product_code': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'product_code': this.marketId (symbol),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        let result = await this.privatePostSendchildorder (this.extend (order, params));
        return {
            'info': result,
            'id': result['child_order_acceptance_id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelchildorder (this.extend ({
            'parent_order_id': id,
        }, params));
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdraw (this.extend ({
            'currency_code': currency,
            'amount': amount,
            // 'bank_account_id': 1234,
        }, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        if (api == 'private')
            request += 'me/';
        request += path;
        if (method == 'GET') {
            if (Object.keys (params).length)
                request += '?' + this.urlencode (params);
        }
        let url = this.urls['api'] + request;
        if (api == 'private') {
            let nonce = this.nonce ().toString ();
            body = this.json (params);
            let auth = [ nonce, method, request, body ].join ('');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-TIMESTAMP': nonce,
                'ACCESS-SIGN': this.hmac (this.encode (auth), this.secret),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bithumb = {

    'id': 'bithumb',
    'name': 'Bithumb',
    'countries': 'KR', // South Korea
    'rateLimit': 500,
    'hasCORS': true,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
        'api': {
            'public': 'https://api.bithumb.com/public',
            'private': 'https://api.bithumb.com',
        },
        'www': 'https://www.bithumb.com',
        'doc': 'https://www.bithumb.com/u1/US127',
    },
    'api': {
        'public': {
            'get': [
                'ticker/{currency}',
                'ticker/all',
                'orderbook/{currency}',
                'orderbook/all',
                'recent_transactions/{currency}',
                'recent_transactions/all',
            ],
        },
        'private': {
            'post': [
                'info/account',
                'info/balance',
                'info/wallet_address',
                'info/ticker',
                'info/orders',
                'info/user_transactions',
                'trade/place',
                'info/order_detail',
                'trade/cancel',
                'trade/btc_withdrawal',
                'trade/krw_deposit',
                'trade/krw_withdrawal',
                'trade/market_buy',
                'trade/market_sell',
            ],
        },
    },
    'markets': {
        'BTC/KRW': { 'id': 'BTC', 'symbol': 'BTC/KRW', 'base': 'BTC', 'quote': 'KRW' },
        'ETH/KRW': { 'id': 'ETH', 'symbol': 'ETH/KRW', 'base': 'ETH', 'quote': 'KRW' },
        'LTC/KRW': { 'id': 'LTC', 'symbol': 'LTC/KRW', 'base': 'LTC', 'quote': 'KRW' },
        'ETC/KRW': { 'id': 'ETC', 'symbol': 'ETC/KRW', 'base': 'ETC', 'quote': 'KRW' },
        'XRP/KRW': { 'id': 'XRP', 'symbol': 'XRP/KRW', 'base': 'XRP', 'quote': 'KRW' },
        'BCH/KRW': { 'id': 'BCH', 'symbol': 'BCH/KRW', 'base': 'BCH', 'quote': 'KRW' },
        'XMR/KRW': { 'id': 'XMR', 'symbol': 'XMR/KRW', 'base': 'XMR', 'quote': 'KRW' },
        'ZEC/KRW': { 'id': 'ZEC', 'symbol': 'ZEC/KRW', 'base': 'ZEC', 'quote': 'KRW' },
        'DASH/KRW': { 'id': 'DASH', 'symbol': 'DASH/KRW', 'base': 'DASH', 'quote': 'KRW' },
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfoBalance (this.extend ({
            'currency': 'ALL',
        }, params));
        let result = { 'info': response };
        let balances = response['data'];
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            let lowercase = currency.toLowerCase ();
            account['total'] = this.safeFloat (balances, 'total_' + lowercase);
            account['used'] = this.safeFloat (balances, 'in_use_' + lowercase);
            account['free'] = this.safeFloat (balances, 'available_' + lowercase);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetOrderbookCurrency (this.extend ({
            'count': 50, // max = 50
            'currency': market['base'],
        }, params));
        let orderbook = response['data'];
        let timestamp = parseInt (orderbook['timestamp']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'quantity');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = parseInt (ticker['date']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max_price'),
            'low': this.safeFloat (ticker, 'min_price'),
            'bid': this.safeFloat (ticker, 'buy_price'),
            'ask': this.safeFloat (ticker, 'sell_price'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'opening_price'),
            'close': this.safeFloat (ticker, 'closing_price'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'last_trade'),
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average_price'),
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume_1day'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetTickerAll (params);
        let result = {};
        let timestamp = response['data']['date'];
        let tickers = this.omit (response['data'], 'date');
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            ticker['date'] = timestamp;
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTickerCurrency (this.extend ({
            'currency': market['base'],
        }, params));
        return this.parseTicker (response['data'], market);
    },

    parseTrade (trade, market) {
        // a workaround for their bug in date format, hours are not 0-padded
        let [ transaction_date, transaction_time ] = trade['transaction_date'].split (' ');
        let transaction_time_short = transaction_time.length < 8;
        if (transaction_time_short)
            transaction_time = '0' + transaction_time;
        let timestamp = this.parse8601 (transaction_date + ' ' + transaction_time);
        let side = (trade['type'] == 'ask') ? 'sell' : 'buy';
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['units_traded']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetRecentTransactionsCurrency (this.extend ({
            'currency': market['base'],
            'count': 100, // max = 100
        }, params));
        return this.parseTrades (response['data'], market);
    },

    createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' private API not implemented yet');
        //     let prefix = '';
        //     if (type == 'market')
        //         prefix = 'market_';
        //     let order = {
        //         'pair': this.marketId (symbol),
        //         'quantity': amount,
        //         'price': price || 0,
        //         'type': prefix + side,
        //     };
        //     let response = await this.privatePostOrderCreate (this.extend (order, params));
        //     return {
        //         'info': response,
        //         'id': response['order_id'].toString (),
        //     };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        let side = ('side' in params);
        if (!side)
            throw new ExchangeError (this.id + ' cancelOrder requires a side parameter (sell or buy)');
        side = (side == 'buy') ? 'purchase' : 'sales';
        let currency = ('currency' in params);
        if (!currency)
            throw new ExchangeError (this.id + ' cancelOrder requires a currency parameter');
        return await this.privatePostTradeCancel ({
            'order_id': id,
            'type': params['side'],
            'currency': params['currency'],
        });
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            body = this.urlencode (this.extend ({
                'endpoint': endpoint,
            }, query));
            let nonce = this.nonce ().toString ();
            let auth = endpoint + "\0" + body + "\0" + nonce;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            headers = {
                'Api-Key': this.apiKey,
                'Api-Sign': this.stringToBase64 (this.encode (signature)),
                'Api-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response) {
            if (response['status'] == '0000')
                return response;
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var bitlish = {

    'id': 'bitlish',
    'name': 'bitlish',
    'countries': [ 'GB', 'EU', 'RU' ],
    'rateLimit': 1500,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
        'api': 'https://bitlish.com/api',
        'www': 'https://bitlish.com',
        'doc': 'https://bitlish.com/api',
    },
    'api': {
        'public': {
            'get': [
                'instruments',
                'ohlcv',
                'pairs',
                'tickers',
                'trades_depth',
                'trades_history',
            ],
            'post': [
                'instruments',
                'ohlcv',
                'pairs',
                'tickers',
                'trades_depth',
                'trades_history',
            ],
        },
        'private': {
            'post': [
                'accounts_operations',
                'balance',
                'cancel_trade',
                'cancel_trades_by_ids',
                'cancel_all_trades',
                'create_bcode',
                'create_template_wallet',
                'create_trade',
                'deposit',
                'list_accounts_operations_from_ts',
                'list_active_trades',
                'list_bcodes',
                'list_my_matches_from_ts',
                'list_my_trades',
                'list_my_trads_from_ts',
                'list_payment_methods',
                'list_payments',
                'redeem_code',
                'resign',
                'signin',
                'signout',
                'trade_details',
                'trade_options',
                'withdraw',
                'withdraw_by_id',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetPairs ();
        let result = [];
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let market = markets[keys[p]];
            let id = market['id'];
            let symbol = market['name'];
            let [ base, quote ] = symbol.split ('/');
            // issue #4 bitlish names Dash as DSH, instead of DASH
            if (base == 'DSH')
                base = 'DASH';
            symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    parseTicker (ticker, market) {
        let timestamp = this.milliseconds ();
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['max']),
            'low': parseFloat (ticker['min']),
            'bid': parseFloat (ticker['min']),
            'ask': parseFloat (ticker['max']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': parseFloat (ticker['first']),
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTickers (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // let market = this.market (symbol);
        let now = this.seconds ();
        let start = now - 86400 * 30; // last 30 days
        let interval = [ start.toString (), undefined ];
        return await this.publicPostOhlcv (this.extend ({
            'time_range': interval,
        }, params));
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetTradesDepth (this.extend ({
            'pair_id': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (parseInt (orderbook['last']) / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bid', 'ask', 'price', 'volume');
    },

    parseTrade (trade, market = undefined) {
        let side = (trade['dir'] == 'bid') ? 'buy' : 'sell';
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (trade['created'] / 1000);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesHistory (this.extend ({
            'pair_id': market['id'],
        }, params));
        return this.parseTrades (response['list'], market);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let result = { 'info': response };
        let currencies = Object.keys (response);
        let balance = {};
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = response[currency];
            currency = currency.toUpperCase ();
            // issue #4 bitlish names Dash as DSH, instead of DASH
            if (currency == 'DSH')
                currency = 'DASH';
            balance[currency] = account;
        }
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance) {
                account['free'] = parseFloat (balance[currency]['funds']);
                account['used'] = parseFloat (balance[currency]['holded']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    signIn () {
        return this.privatePostSignin ({
            'login': this.login,
            'passwd': this.password,
        });
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'pair_id': this.marketId (symbol),
            'dir': (side == 'buy') ? 'bid' : 'ask',
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let result = await this.privatePostCreateTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelTrade ({ 'id': id });
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        if (currency != 'BTC') {
            // they did not document other types...
            throw new NotSupported (this.id + ' currently supports BTC withdrawals only, until they document other currencies...');
        }
        let response = await this.privatePostWithdraw (this.extend ({
            'currency': currency.toLowerCase (),
            'amount': parseFloat (amount),
            'account': address,
            'payment_method': 'bitcoin', // they did not document other types...
        }, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (method == 'GET') {
                if (Object.keys (params).length)
                    url += '?' + this.urlencode (params);
            }
            else {
                body = this.json (params);
                headers = { 'Content-Type': 'application/json' };
            }
        } else {
            body = this.json (this.extend ({ 'token': this.apiKey }, params));
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bitmarket = {

    'id': 'bitmarket',
    'name': 'BitMarket',
    'countries': [ 'PL', 'EU' ],
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'timeframes': {
        '90m': '90m',
        '6h': '6h',
        '1d': '1d',
        '1w': '7d',
        '1M': '1m',
        '3M': '3m',
        '6M': '6m',
        '1y': '1y',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
        'api': {
            'public': 'https://www.bitmarket.net',
            'private': 'https://www.bitmarket.pl/api2/', // last slash is critical
        },
        'www': [
            'https://www.bitmarket.pl',
            'https://www.bitmarket.net',
        ],
        'doc': [
            'https://www.bitmarket.net/docs.php?file=api_public.html',
            'https://www.bitmarket.net/docs.php?file=api_private.html',
            'https://github.com/bitmarket-net/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                'json/{market}/ticker',
                'json/{market}/orderbook',
                'json/{market}/trades',
                'json/ctransfer',
                'graphs/{market}/90m',
                'graphs/{market}/6h',
                'graphs/{market}/1d',
                'graphs/{market}/7d',
                'graphs/{market}/1m',
                'graphs/{market}/3m',
                'graphs/{market}/6m',
                'graphs/{market}/1y',
            ],
        },
        'private': {
            'post': [
                'info',
                'trade',
                'cancel',
                'orders',
                'trades',
                'history',
                'withdrawals',
                'tradingdesk',
                'tradingdeskStatus',
                'tradingdeskConfirm',
                'cryptotradingdesk',
                'cryptotradingdeskStatus',
                'cryptotradingdeskConfirm',
                'withdraw',
                'withdrawFiat',
                'withdrawPLNPP',
                'withdrawFiatFast',
                'deposit',
                'transfer',
                'transfers',
                'marginList',
                'marginOpen',
                'marginClose',
                'marginCancel',
                'marginModify',
                'marginBalanceAdd',
                'marginBalanceRemove',
                'swapList',
                'swapOpen',
                'swapClose',
            ],
        },
    },
    'markets': {
        'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
        'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'LiteMineX/BTC': { 'id': 'LiteMineXBTC', 'symbol': 'LiteMineX/BTC', 'base': 'LiteMineX', 'quote': 'BTC' },
        'PlnX/BTC': { 'id': 'PlnxBTC', 'symbol': 'PlnX/BTC', 'base': 'PlnX', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfo ();
        let data = response['data'];
        let balance = data['balances'];
        let result = { 'info': data };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance['available'])
                account['free'] = balance['available'][currency];
            if (currency in balance['blocked'])
                account['used'] = balance['blocked'][currency];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetJsonMarketOrderbook (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetJsonMarketTicker (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let side = (trade['type'] == 'bid') ? 'buy' : 'sell';
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetJsonMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '90m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'] * 1000,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['vol']),
        ];
    },

    async fetchOHLCV (symbol, timeframe = '90m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'publicGetGraphsMarket' + this.timeframes[timeframe];
        let market = this.market (symbol);
        let response = await this[method] (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostTrade (this.extend ({
            'market': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        let result = {
            'info': response,
        };
        if ('id' in response['order'])
            result['id'] = response['id'];
        return result;
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    },

    isFiat (currency) {
        if (currency == 'EUR')
            return true;
        if (currency == 'PLN')
            return true;
        return false;
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        let request = {
            'currency': currency,
            'quantity': amount,
        };
        if (this.isFiat (currency)) {
            method = 'privatePostWithdrawFiat';
            if ('account' in params) {
                request['account'] = params['account']; // bank account code for withdrawal
            } else {
                throw new ExchangeError (this.id + ' requires account parameter to withdraw fiat currency');
            }
            if ('account2' in params) {
                request['account2'] = params['account2']; // bank SWIFT code (EUR only)
            } else {
                if (currency == 'EUR')
                    throw new ExchangeError (this.id + ' requires account2 parameter to withdraw EUR');
            }
            if ('withdrawal_note' in params) {
                request['withdrawal_note'] = params['withdrawal_note']; // a 10-character user-specified withdrawal note (PLN only)
            } else {
                if (currency == 'PLN')
                    throw new ExchangeError (this.id + ' requires withdrawal_note parameter to withdraw PLN');
            }
        } else {
            method = 'privatePostWithdraw';
            request['address'] = address;
        }
        let response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response,
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.implodeParams (path + '.json', params);
        } else {
            let nonce = this.nonce ();
            let query = this.extend ({
                'tonce': nonce,
                'method': path,
            }, params);
            body = this.urlencode (query);
            headers = {
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bitmex = {

    'id': 'bitmex',
    'name': 'BitMEX',
    'countries': 'SC', // Seychelles
    'version': 'v1',
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'timeframes': {
        '1m': '1m',
        '5m': '5m',
        '1h': '1h',
        '1d': '1d',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
        'api': 'https://www.bitmex.com',
        'www': 'https://www.bitmex.com',
        'doc': [
            'https://www.bitmex.com/app/apiOverview',
            'https://github.com/BitMEX/api-connectors/tree/master/official-http',
        ],
    },
    'api': {
        'public': {
            'get': [
                'announcement',
                'announcement/urgent',
                'funding',
                'instrument',
                'instrument/active',
                'instrument/activeAndIndices',
                'instrument/activeIntervals',
                'instrument/compositeIndex',
                'instrument/indices',
                'insurance',
                'leaderboard',
                'liquidation',
                'orderBook',
                'orderBook/L2',
                'quote',
                'quote/bucketed',
                'schema',
                'schema/websocketHelp',
                'settlement',
                'stats',
                'stats/history',
                'trade',
                'trade/bucketed',
            ],
        },
        'private': {
            'get': [
                'apiKey',
                'chat',
                'chat/channels',
                'chat/connected',
                'execution',
                'execution/tradeHistory',
                'notification',
                'order',
                'position',
                'user',
                'user/affiliateStatus',
                'user/checkReferralCode',
                'user/commission',
                'user/depositAddress',
                'user/margin',
                'user/minWithdrawalFee',
                'user/wallet',
                'user/walletHistory',
                'user/walletSummary',
            ],
            'post': [
                'apiKey',
                'apiKey/disable',
                'apiKey/enable',
                'chat',
                'order',
                'order/bulk',
                'order/cancelAllAfter',
                'order/closePosition',
                'position/isolate',
                'position/leverage',
                'position/riskLimit',
                'position/transferMargin',
                'user/cancelWithdrawal',
                'user/confirmEmail',
                'user/confirmEnableTFA',
                'user/confirmWithdrawal',
                'user/disableTFA',
                'user/logout',
                'user/logoutAll',
                'user/preferences',
                'user/requestEnableTFA',
                'user/requestWithdrawal',
            ],
            'put': [
                'order',
                'order/bulk',
                'user',
            ],
            'delete': [
                'apiKey',
                'order',
                'order/all',
            ],
        }
    },

    async fetchMarkets () {
        let markets = await this.publicGetInstrumentActiveAndIndices ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['symbol'];
            let base = market['underlying'];
            let quote = market['quoteCurrency'];
            let isFuturesContract = id != (base + quote);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = isFuturesContract ? id : (base + '/' + quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserMargin ({ 'currency': 'all' });
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let currency = balance['currency'].toUpperCase ();
            currency = this.commonCurrencyCode (currency);
            let account = {
                'free': balance['availableMargin'],
                'used': 0.0,
                'total': balance['amount'],
            };
            if (currency == 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookL2 (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let o = 0; o < orderbook.length; o++) {
            let order = orderbook[o];
            let side = (order['side'] == 'Sell') ? 'asks' : 'bids';
            let amount = order['size'];
            let price = order['price'];
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let request = this.extend ({
            'symbol': this.marketId (symbol),
            'binSize': '1d',
            'partial': true,
            'count': 1,
            'reverse': true,
        }, params);
        let quotes = await this.publicGetQuoteBucketed (request);
        let quotesLength = quotes.length;
        let quote = quotes[quotesLength - 1];
        let tickers = await this.publicGetTradeBucketed (request);
        let ticker = tickers[0];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (quote['bidPrice']),
            'ask': parseFloat (quote['askPrice']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': parseFloat (ticker['close']),
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['homeNotional']),
            'quoteVolume': parseFloat (ticker['foreignNotional']),
            'info': ticker,
        };
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timestamp']);
        return [
            timestamp,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'binSize': this.timeframes[timeframe],
            'partial': true,     // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (since)
            request['startTime'] = since; // starting date filter for results
        if (limit)
            request['count'] = limit; // default 100
        let response = await this.publicGetTradeBucketed (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        let symbol = undefined;
        if (!market) {
            if ('symbol' in trade)
                market = this.markets_by_id[trade['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['trdMatchID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrade (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (type == 'limit')
            order['rate'] = price;
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderID'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrder ({ 'orderID': id });
    },

    isFiat (currency) {
        if (currency == 'EUR')
            return true;
        if (currency == 'PLN')
            return true;
        return false;
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        if (currency != 'BTC')
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        let request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': response['transactID'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api' + '/' + this.version + '/' + path;
        if (Object.keys (params).length)
            query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (api == 'private') {
            let nonce = this.nonce ().toString ();
            if (method == 'POST')
                if (Object.keys (params).length)
                    body = this.json (params);
            let request = [ method, query, nonce, body || ''].join ('');
            headers = {
                'Content-Type': 'application/json',
                'api-nonce': nonce,
                'api-key': this.apiKey,
                'api-signature': this.hmac (this.encode (request), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bitso = {

    'id': 'bitso',
    'name': 'Bitso',
    'countries': 'MX', // Mexico
    'rateLimit': 2000, // 30 requests per minute
    'version': 'v3',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
        'api': 'https://api.bitso.com',
        'www': 'https://bitso.com',
        'doc': 'https://bitso.com/api_info',
    },
    'api': {
        'public': {
            'get': [
                'available_books',
                'ticker',
                'order_book',
                'trades',
            ],
        },
        'private': {
            'get': [
                'account_status',
                'balance',
                'fees',
                'fundings',
                'fundings/{fid}',
                'funding_destination',
                'kyc_documents',
                'ledger',
                'ledger/trades',
                'ledger/fees',
                'ledger/fundings',
                'ledger/withdrawals',
                'mx_bank_codes',
                'open_orders',
                'order_trades/{oid}',
                'orders/{oid}',
                'user_trades',
                'user_trades/{tid}',
                'withdrawals/',
                'withdrawals/{wid}',
            ],
            'post': [
                'bitcoin_withdrawal',
                'debit_card_withdrawal',
                'ether_withdrawal',
                'orders',
                'phone_number',
                'phone_verification',
                'phone_withdrawal',
                'spei_withdrawal',
            ],
            'delete': [
                'orders/{oid}',
                'orders/all',
            ],
        }
    },

    async fetchMarkets () {
        let markets = await this.publicGetAvailableBooks ();
        let result = [];
        for (let p = 0; p < markets['payload'].length; p++) {
            let market = markets['payload'][p];
            let id = market['book'];
            let symbol = id.toUpperCase ().replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['payload']['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'].toUpperCase ();
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['locked']),
                'total': parseFloat (balance['total']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let orderbook = response['payload'];
        let timestamp = this.parse8601 (orderbook['updated_at']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let ticker = response['payload'];
        let timestamp = this.parse8601 (ticker['created_at']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (!market) {
            if ('book' in trade)
                market = this.markets_by_id[trade['book']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['maker_side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTrades (response['payload'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'book': this.marketId (symbol),
            'side': side,
            'type': type,
            'major': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['payload']['oid'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrders ({ 'oid': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + query;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            if (Object.keys (params).length)
                body = this.json (params);
            let nonce = this.nonce ().toString ();
            let request = [ nonce, method, query, body || '' ].join ('');
            let signature = this.hmac (this.encode (request), this.encode (this.secret));
            let auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = { 'Authorization': "Bitso " + auth };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var bitstamp1 = {

    'id': 'bitstamp1',
    'name': 'Bitstamp v1',
    'countries': 'GB',
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
        'api': 'https://www.bitstamp.net/api',
        'www': 'https://www.bitstamp.net',
        'doc': 'https://www.bitstamp.net/api',
    },
    'api': {
        'public': {
            'get': [
                'ticker',
                'ticker_hour',
                'order_book',
                'transactions',
                'eur_usd',
            ],
        },
        'private': {
            'post': [
                'balance',
                'user_transactions',
                'open_orders',
                'order_status',
                'cancel_order',
                'cancel_all_orders',
                'buy',
                'sell',
                'bitcoin_deposit_address',
                'unconfirmed_btc',
                'ripple_withdrawal',
                'ripple_address',
                'withdrawal_requests',
                'bitcoin_withdrawal',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD' },
        'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
        'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR' },
        'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        'LTC/USD': { 'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
        'LTC/EUR': { 'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
        'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'ETH/USD': { 'id': 'ethusd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
        'ETH/EUR': { 'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
        'ETH/BTC': { 'id': 'ethbtc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
    },

    async fetchOrderBook (symbol, params = {}) {
        if (symbol != 'BTC/USD')
            throw new ExchangeError (this.id + ' ' + this.version + " fetchOrderBook doesn't support " + symbol + ', use it for BTC/USD only');
        let orderbook = await this.publicGetOrderBook (params);
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    },

    async fetchTicker (symbol, params = {}) {
        if (symbol != 'BTC/USD')
            throw new ExchangeError (this.id + ' ' + this.version + " fetchTicker doesn't support " + symbol + ', use it for BTC/USD only');
        let ticker = await this.publicGetTicker (params);
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': vwap,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('date' in trade) {
            timestamp = parseInt (trade['date']);
        } else if ('datetime' in trade) {
            // timestamp = this.parse8601 (trade['datetime']);
            timestamp = parseInt (trade['datetime']);
        }
        let side = (trade['type'] == 0) ? 'buy' : 'sell';
        let order = undefined;
        if ('order_id' in trade)
            order = trade['order_id'].toString ();
        if ('currency_pair' in trade) {
            if (trade['currency_pair'] in this.markets_by_id)
                market = this.markets_by_id[trade['currency_pair']];
        }
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        if (symbol != 'BTC/USD')
            throw new ExchangeError (this.id + ' ' + this.version + " fetchTrades doesn't support " + symbol + ', use it for BTC/USD only');
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'time': 'minute',
        }, params));
        return this.parseTrades (response, market);
    },

    async fetchBalance (params = {}) {
        let balance = await this.privatePostBalance ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let total = lowercase + '_balance';
            let free = lowercase + '_available';
            let used = lowercase + '_reserved';
            let account = this.account ();
            account['free'] = this.safeFloat (balance, free, 0.0);
            account['used'] = this.safeFloat (balance, used, 0.0);
            account['total'] = this.safeFloat (balance, total, 0.0);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type != 'limit')
            throw new ExchangeError (this.id + ' ' + this.version + ' accepts limit orders only');
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'id': this.marketId (symbol),
            'amount': amount,
            'price': price,
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    },

    parseOrderStatus (order) {
        if ((order['status'] == 'Queue') || (order['status'] == 'Open'))
            return 'open';
        if (order['status'] == 'Finished')
            return 'closed';
        return order['status'];
    },

    async fetchOrderStatus (id, symbol = undefined) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus ({ 'id': id });
        return this.parseOrderStatus (response);
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = this.extend ({ 'id': pair }, params);
        let response = await this.privatePostOpenOrdersId (request);
        return this.parseTrades (response, market);
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder is not implemented yet');
        await this.loadMarkets ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] == 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var bitstamp = {

    'id': 'bitstamp',
    'name': 'Bitstamp',
    'countries': 'GB',
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
        'api': 'https://www.bitstamp.net/api',
        'www': 'https://www.bitstamp.net',
        'doc': 'https://www.bitstamp.net/api',
    },
    'api': {
        'public': {
            'get': [
                'order_book/{pair}/',
                'ticker_hour/{pair}/',
                'ticker/{pair}/',
                'transactions/{pair}/',
            ],
        },
        'private': {
            'post': [
                'balance/',
                'balance/{pair}/',
                'user_transactions/',
                'user_transactions/{pair}/',
                'open_orders/all/',
                'open_orders/{pair}',
                'order_status/',
                'cancel_order/',
                'buy/{pair}/',
                'buy/market/{pair}/',
                'sell/{pair}/',
                'sell/market/{pair}/',
                'ltc_withdrawal/',
                'ltc_address/',
                'eth_withdrawal/',
                'eth_address/',
                'transfer-to-main/',
                'transfer-from-main/',
                'xrp_withdrawal/',
                'xrp_address/',
                'withdrawal/open/',
                'withdrawal/status/',
                'withdrawal/cancel/',
                'liquidation_address/new/',
                'liquidation_address/info/',
            ],
        },
        'v1': {
            'post': [
                'bitcoin_deposit_address/',
                'unconfirmed_btc/',
                'bitcoin_withdrawal/',
            ]
        }
    },
    'markets': {
        'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD' },
        'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
        'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR' },
        'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        'LTC/USD': { 'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
        'LTC/EUR': { 'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
        'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'ETH/USD': { 'id': 'ethusd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
        'ETH/EUR': { 'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
        'ETH/BTC': { 'id': 'ethbtc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetOrderBookPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': vwap,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('date' in trade) {
            timestamp = parseInt (trade['date']);
        } else if ('datetime' in trade) {
            // timestamp = this.parse8601 (trade['datetime']);
            timestamp = parseInt (trade['datetime']);
        }
        let side = (trade['type'] == 0) ? 'buy' : 'sell';
        let order = undefined;
        if ('order_id' in trade)
            order = trade['order_id'].toString ();
        if ('currency_pair' in trade) {
            if (trade['currency_pair'] in this.markets_by_id)
                market = this.markets_by_id[trade['currency_pair']];
        }
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactionsPair (this.extend ({
            'pair': market['id'],
            'time': 'minute',
        }, params));
        return this.parseTrades (response, market);
    },

    async fetchBalance (params = {}) {
        let balance = await this.privatePostBalance ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let total = lowercase + '_balance';
            let free = lowercase + '_available';
            let used = lowercase + '_reserved';
            let account = this.account ();
            if (free in balance)
                account['free'] = parseFloat (balance[free]);
            if (used in balance)
                account['used'] = parseFloat (balance[used]);
            if (total in balance)
                account['total'] = parseFloat (balance[total]);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'pair': this.marketId (symbol),
            'amount': amount,
        };
        if (type == 'market')
            method += 'Market';
        else
            order['price'] = price;
        method += 'Pair';
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    },

    parseOrderStatus (order) {
        if ((order['status'] == 'Queue') || (order['status'] == 'Open'))
            return 'open';
        if (order['status'] == 'Finished')
            return 'closed';
        return order['status'];
    },

    async fetchOrderStatus (id, symbol = undefined) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus ({ 'id': id });
        return this.parseOrderStatus (response);
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = this.extend ({ 'pair': pair }, params);
        let response = await this.privatePostOpenOrdersPair (request);
        return this.parseTrades (response, market);
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder is not implemented yet');
        await this.loadMarkets ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api != 'v1')
            url += this.version + '/';
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] == 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var bittrex = {

    'id': 'bittrex',
    'name': 'Bittrex',
    'countries': 'US',
    'version': 'v1.1',
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchMyTrades': false,
    'hasWithdraw': true,
    'timeframes': {
        '1m': 'oneMin',
        '5m': 'fiveMin',
        '30m': 'thirtyMin',
        '1h': 'hour',
        '1d': 'day',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
        'api': {
            'public': 'https://bittrex.com/api',
            'account': 'https://bittrex.com/api',
            'market': 'https://bittrex.com/api',
            'v2': 'https://bittrex.com/api/v2.0/pub',
        },
        'www': 'https://bittrex.com',
        'doc': [
            'https://bittrex.com/Home/Api',
            'https://www.npmjs.org/package/node.bittrex.api',
        ],
        'fees': [
            'https://bittrex.com/Fees',
            'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
        ],
    },
    'api': {
        'v2': {
            'get': [
                'currencies/GetBTCPrice',
                'market/GetTicks',
                'market/GetLatestTick',
                'Markets/GetMarketSummaries',
                'market/GetLatestTick',
            ],
        },
        'public': {
            'get': [
                'currencies',
                'markethistory',
                'markets',
                'marketsummaries',
                'marketsummary',
                'orderbook',
                'ticker',
            ],
        },
        'account': {
            'get': [
                'balance',
                'balances',
                'depositaddress',
                'deposithistory',
                'order',
                'orderhistory',
                'withdrawalhistory',
                'withdraw',
            ],
        },
        'market': {
            'get': [
                'buylimit',
                'buymarket',
                'cancel',
                'openorders',
                'selllimit',
                'sellmarket',
            ],
        },
    },
    'fees': {
        'trading': {
            'maker': 0.0025,
            'taker': 0.0025,
        },
    },

    costToPrecision (symbol, cost) {
        return this.truncate (parseFloat (cost), this.markets[symbol].precision.price);
    },

    feeToPrecision (symbol, fee) {
        return this.truncate (parseFloat (fee), this.markets[symbol]['precision']['price']);
    },

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets['result'].length; p++) {
            let market = markets['result'][p];
            let id = market['MarketName'];
            let base = market['MarketCurrency'];
            let quote = market['BaseCurrency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let amountLimits = {
                'min': market['MinTradeSize'],
                'max': undefined,
            };
            let priceLimits = { 'min': undefined, 'max': undefined };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'precision': precision,
                'limits': limits,
            }));
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.accountGetBalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'Currency');
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in indexed) {
                let balance = indexed[currency];
                let free = parseFloat (balance['Available']);
                let total = parseFloat (balance['Balance']);
                let used = total - free;
                account['free'] = free;
                account['used'] = used;
                account['total'] = total;
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (market),
            'type': 'both',
            'depth': 50,
        }, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['TimeStamp']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['High']),
            'low': parseFloat (ticker['Low']),
            'bid': parseFloat (ticker['Bid']),
            'ask': parseFloat (ticker['Ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['Last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['Volume']),
            'quoteVolume': parseFloat (ticker['BaseVolume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketsummaries (params);
        let tickers = response['result'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['MarketName'];
            let market = undefined;
            let symbol = id;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let [ quote, base ] = id.split ('-');
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsummary (this.extend ({
            'market': market['id'],
        }, params));
        let ticker = response['result'][0];
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['TimeStamp']);
        let side = undefined;
        if (trade['OrderType'] == 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] == 'SELL') {
            side = 'sell';
        }
        let id = undefined;
        if ('Id' in trade)
            id = trade['Id'].toString ();
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade['Price'],
            'amount': trade['Quantity'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response['result'], market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['T']);
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tickInterval': this.timeframes[timeframe],
            'marketName': market['id'],
        };
        let response = await this.v2GetMarketGetTicks (this.extend (request, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.marketGetOpenorders (this.extend (request, params));
        return this.parseOrders (response['result'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type == 'limit')
            order['rate'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        let result = {
            'info': response,
            'id': response['result']['uuid'],
        };
        return result;
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.marketGetCancel (this.extend ({
                'uuid': id,
            }, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message == 'ORDER_NOT_OPEN')
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
                if (message == 'UUID_INVALID')
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    },

    parseOrder (order, market = undefined) {
        let side = undefined;
        if ('OrderType' in order)
            side = (order['OrderType'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        if ('Type' in order)
            side = (order['Type'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        let status = 'open';
        if (order['Closed']) {
            status = 'closed';
        } else if (order['CancelInitiated']) {
            status = 'canceled';
        }
        let symbol = undefined;
        if (!market) {
            if ('Exchange' in order)
                if (order['Exchange'] in this.markets_by_id)
                    market = this.markets_by_id[order['Exchange']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        if ('Opened' in order)
            timestamp = this.parse8601 (order['Opened']);
        if ('TimeStamp' in order)
            timestamp = this.parse8601 (order['TimeStamp']);
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': parseFloat (order[commission]),
                'currency': market['quote'],
            };
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        let amount = this.safeFloat (order, 'Quantity');
        let remaining = this.safeFloat (order, 'QuantityRemaining', 0.0);
        let filled = amount - remaining;
        if (!cost) {
            if (price && amount)
                cost = price * amount;
        }
        if (!price) {
            if (cost && filled)
                price = cost / filled;
        }
        let average = this.safeFloat (order, 'PricePerUnit');
        let result = {
            'info': order,
            'id': order['OrderUuid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.accountGetOrder ({ 'uuid': id });
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message == 'UUID_INVALID')
                    throw new InvalidOrder (this.id + ' fetchOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return this.parseOrder (response['result']);
    },

    async fetchOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbol) {
            let market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.accountGetOrderhistory (this.extend (request, params));
        return this.parseOrders (response['result']);
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.accountGetWithdraw (this.extend ({
            'currency': currency,
            'quantity': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api != 'v2')
            url += this.version + '/';
        if (api == 'public') {
            url += api + '/' + method.toLowerCase () + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else if (api == 'v2') {
            url += path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            url += api + '/';
            if (((api == 'account') && (path != 'withdraw')) || (path == 'openorders'))
                url += method.toLowerCase ();
            url += path + '?' + this.urlencode (this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, params));
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (response['success'])
                return response;
        if ('message' in response)
            if (response['message'] == "INSUFFICIENT_FUNDS")
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var blinktrade = {

    'id': 'blinktrade',
    'name': 'BlinkTrade',
    'countries': [ 'US', 'VE', 'VN', 'BR', 'PK', 'CL' ],
    'rateLimit': 1000,
    'version': 'v1',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27990968-75d9c884-6470-11e7-9073-46756c8e7e8c.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://blinktrade.com',
        'doc': 'https://blinktrade.com/docs',
    },
    'api': {
        'public': {
            'get': [
                '{currency}/ticker',    // ?crypto_currency=BTC
                '{currency}/orderbook', // ?crypto_currency=BTC
                '{currency}/trades',    // ?crypto_currency=BTC&since=<TIMESTAMP>&limit=<NUMBER>
            ],
        },
        'private': {
            'post': [
                'D',   // order
                'F',   // cancel order
                'U2',  // balance
                'U4',  // my orders
                'U6',  // withdraw
                'U18', // deposit
                'U24', // confirm withdrawal
                'U26', // list withdrawals
                'U30', // list deposits
                'U34', // ledger
                'U70', // cancel withdrawal
            ],
        },
    },
    'markets': {
        'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin' },
        'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC' },
        'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit' },
        'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit' },
        'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit' },
    },

    fetchBalance (params = {}) {
        // todo parse balance
        return this.privatePostU2 ({
            'BalanceReqID': this.nonce (),
        });
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetCurrencyOrderbook (this.extend ({
            'currency': market['quote'],
            'crypto_currency': market['base'],
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let ticker = await this.publicGetCurrencyTicker (this.extend ({
            'currency': market['quote'],
            'crypto_currency': market['base'],
        }, params));
        let timestamp = this.milliseconds ();
        let lowercaseQuote = market['quote'].toLowerCase ();
        let quoteVolume = 'vol_' + lowercaseQuote;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': parseFloat (ticker[quoteVolume]),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetCurrencyTrades (this.extend ({
            'currency': market['quote'],
            'crypto_currency': market['base'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let market = this.market (symbol);
        let order = {
            'ClOrdID': this.nonce (),
            'Symbol': market['id'],
            'Side': this.capitalize (side),
            'OrdType': '2',
            'Price': price,
            'OrderQty': amount,
            'BrokerID': market['brokerId'],
        };
        let response = await this.privatePostD (this.extend (order, params));
        let indexed = this.indexBy (response['Responses'], 'MsgType');
        let execution = indexed['8'];
        return {
            'info': response,
            'id': execution['OrderID'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostF (this.extend ({
            'ClOrdID': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            let request = this.extend ({ 'MsgType': path }, query);
            body = this.json (request);
            headers = {
                'APIKey': this.apiKey,
                'Nonce': nonce,
                'Signature': this.hmac (this.encode (nonce), this.encode (this.secret)),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('Status' in response)
            if (response['Status'] != 200)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var bl3p = {

    'id': 'bl3p',
    'name': 'BL3P',
    'countries': [ 'NL', 'EU' ], // Netherlands, EU
    'rateLimit': 1000,
    'version': '1',
    'comment': 'An exchange market by BitonicNL',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
        'api': 'https://api.bl3p.eu',
        'www': [
            'https://bl3p.eu',
            'https://bitonic.nl',
        ],
        'doc': [
            'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
            'https://bl3p.eu/api',
            'https://bitonic.nl/en/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{market}/ticker',
                '{market}/orderbook',
                '{market}/trades',
            ],
        },
        'private': {
            'post': [
                '{market}/money/depth/full',
                '{market}/money/order/add',
                '{market}/money/order/cancel',
                '{market}/money/order/result',
                '{market}/money/orders',
                '{market}/money/orders/history',
                '{market}/money/trades/fetch',
                'GENMKT/money/info',
                'GENMKT/money/deposit_address',
                'GENMKT/money/new_deposit_address',
                'GENMKT/money/wallet/history',
                'GENMKT/money/withdraw',
            ],
        },
    },
    'markets': {
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostGENMKTMoneyInfo ();
        let data = response['data'];
        let balance = data['wallets'];
        let result = { 'info': data };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance) {
                if ('available' in balance[currency]) {
                    account['free'] = parseFloat (balance[currency]['available']['value']);
                }
            }
            if (currency in balance) {
                if ('balance' in balance[currency]) {
                    account['total'] = parseFloat (balance[currency]['balance']['value']);
                }
            }
            if (account['total']) {
                if (account['free']) {
                    account['used'] = account['total'] - account['free'];
                }
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    parseBidAsk (bidask, priceKey = 0, amountKey = 0) {
        return [
            bidask['price_int'] / 100000.0,
            bidask['amount_int'] / 100000000.0,
        ];
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetMarketOrderbook (this.extend ({
            'market': market['id'],
        }, params));
        let orderbook = response['data'];
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetMarketTicker (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let timestamp = ticker['timestamp'] * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']['24h']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        return {
            'id': trade['trade_id'],
            'info': trade,
            'timestamp': trade['date'],
            'datetime': this.iso8601 (trade['date']),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price_int'] / 100000.0,
            'amount': trade['amount_int'] / 100000000.0,
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        let result = this.parseTrades (response['data']['trades'], market);
        return result;
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'market': market['id'],
            'amount_int': amount,
            'fee_currency': market['quote'],
            'type': (side == 'buy') ? 'bid' : 'ask',
        };
        if (type == 'limit')
            order['price_int'] = price;
        let response = await this.privatePostMarketMoneyOrderAdd (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostMarketMoneyOrderCancel ({ 'order_id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            let auth = request + "\0" + body;
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var bleutrade = extend (bittrex, {

    'id': 'bleutrade',
    'name': 'Bleutrade',
    'countries': 'BR', // Brazil
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': true,
    'hasFetchTickers': true,
    'hasFetchOHLCV': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
        'api': {
            'public': 'https://bleutrade.com/api',
            'account': 'https://bleutrade.com/api',
            'market': 'https://bleutrade.com/api',
        },
        'www': 'https://bleutrade.com',
        'doc': 'https://bleutrade.com/help/API',
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (market),
            'type': 'ALL',
            'depth': 50,
        }, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    },
})

//-----------------------------------------------------------------------------

var asia = {

    'id': 'asia',
    'name': 'Asia',
    'comment': 'a common base API for several exchanges from China and Japan',
    'countries': [ 'JP', 'CN' ],
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchOHLCV': false,
    'api': {
        'public': {
            'get': [
                'depth',
                'orders',
                'ticker',
                'allticker',
            ],
        },
        'private': {
            'post': [
                'balance',
                'trade_add',
                'trade_cancel',
                'trade_list',
                'trade_view',
                'wallet',
            ],
        },
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            if (lowercase == 'dash')
                lowercase = 'drk';
            let account = this.account ();
            let free = lowercase + '_balance';
            let used = lowercase + '_lock';
            if (free in balances)
                account['free'] = parseFloat (balances[free]);
            if (used in balances)
                account['used'] = parseFloat (balances[used]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        let result = this.parseOrderBook (orderbook);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetAllticker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let ticker = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'id': trade['tid'],
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let response = await this.publicGetOrders (this.extend (request, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'amount': amount,
            'price': price,
            'type': side,
        };
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let response = await this.privatePostTradeAdd (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostTradeCancel (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ().toString ();
            let query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, params);
            let request = this.urlencode (query);
            let secret = this.hash (this.encode (this.secret));
            query['signature'] = this.hmac (this.encode (request), this.encode (secret));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (!response['result'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var btcbox = extend (asia, {

    'id': 'btcbox',
    'name': 'BtcBox',
    'countries': 'JP',
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchOHLCV': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
        'api': 'https://www.btcbox.co.jp/api',
        'www': 'https://www.btcbox.co.jp/',
        'doc': 'https://www.btcbox.co.jp/help/asm',
    },
    'markets': {
        'BTC/JPY': { 'id': 'BTC/JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
    },
})

//-----------------------------------------------------------------------------

var btcchina = {

    'id': 'btcchina',
    'name': 'BTCChina',
    'countries': 'CN',
    'rateLimit': 1500,
    'version': 'v1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
        'api': {
            'plus': 'https://plus-api.btcchina.com/market',
            'public': 'https://data.btcchina.com/data',
            'private': 'https://api.btcchina.com/api_trade_v1.php',
        },
        'www': 'https://www.btcchina.com',
        'doc': 'https://www.btcchina.com/apidocs'
    },
    'api': {
        'plus': {
            'get': [
                'orderbook',
                'ticker',
                'trade',
            ],
        },
        'public': {
            'get': [
                'historydata',
                'orderbook',
                'ticker',
                'trades',
            ],
        },
        'private': {
            'post': [
                'BuyIcebergOrder',
                'BuyOrder',
                'BuyOrder2',
                'BuyStopOrder',
                'CancelIcebergOrder',
                'CancelOrder',
                'CancelStopOrder',
                'GetAccountInfo',
                'getArchivedOrder',
                'getArchivedOrders',
                'GetDeposits',
                'GetIcebergOrder',
                'GetIcebergOrders',
                'GetMarketDepth',
                'GetMarketDepth2',
                'GetOrder',
                'GetOrders',
                'GetStopOrder',
                'GetStopOrders',
                'GetTransactions',
                'GetWithdrawal',
                'GetWithdrawals',
                'RequestWithdrawal',
                'SellIcebergOrder',
                'SellOrder',
                'SellOrder2',
                'SellStopOrder',
            ],
        },
    },
    'markets': {
        'BTC/CNY': { 'id': 'btccny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'api': 'public', 'plus': false },
        'LTC/CNY': { 'id': 'ltccny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'api': 'public', 'plus': false },
        'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'api': 'public', 'plus': false },
        'BCH/CNY': { 'id': 'bcccny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY', 'api': 'plus', 'plus': true },
        'ETH/CNY': { 'id': 'ethcny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', 'api': 'plus', 'plus': true },
    },

    async fetchMarkets () {
        let markets = await this.publicGetTicker ({
            'market': 'all',
        });
        let result = [];
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let key = keys[p];
            let market = markets[key];
            let parts = key.split ('_');
            let id = parts[1];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            base = base.toUpperCase ();
            quote = quote.toUpperCase ();
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };

        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances['balance'])
                account['total'] = parseFloat (balances['balance'][lowercase]['amount']);
            if (lowercase in balances['frozen'])
                account['used'] = parseFloat (balances['frozen'][lowercase]['amount']);
            account['free'] = account['total'] - account['used'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    createMarketRequest (market) {
        let request = {};
        let field = (market['plus']) ? 'symbol' : 'market';
        request[field] = market['id'];
        return request;
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = market['api'] + 'GetOrderbook';
        let request = this.createMarketRequest (market);
        let orderbook = await this[method] (this.extend (request, params));
        let timestamp = orderbook['date'] * 1000;
        let result = this.parseOrderBook (orderbook, timestamp);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    parseTicker (ticker, market) {
        let timestamp = ticker['date'] * 1000;
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': parseFloat (ticker['vwap']),
            'open': parseFloat (ticker['open']),
            'close': parseFloat (ticker['prev_close']),
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    parseTickerPlus (ticker, market) {
        let timestamp = ticker['Timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['High']),
            'low': parseFloat (ticker['Low']),
            'bid': parseFloat (ticker['BidPrice']),
            'ask': parseFloat (ticker['AskPrice']),
            'vwap': undefined,
            'open': parseFloat (ticker['Open']),
            'close': parseFloat (ticker['PrevCls']),
            'first': undefined,
            'last': parseFloat (ticker['Last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['Volume24H']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = market['api'] + 'GetTicker';
        let request = this.createMarketRequest (market);
        let tickers = await this[method] (this.extend (request, params));
        let ticker = tickers['ticker'];
        if (market['plus'])
            return this.parseTickerPlus (ticker, market);
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    parseTradePlus (trade, market) {
        let timestamp = this.parse8601 (trade['timestamp']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    },

    parseTradesPlus (trades, market = undefined) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            result.push (this.parseTradePlus (trades[i], market));
        }
        return result;
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = market['api'] + 'GetTrade';
        let request = this.createMarketRequest (market);
        if (market['plus']) {
            let now = this.milliseconds ();
            request['start_time'] = now - 86400 * 1000;
            request['end_time'] = now;
        } else {
            method += 's'; // trades vs trade
        }
        let response = await this[method] (this.extend (request, params));
        if (market['plus']) {
            return this.parseTradesPlus (response['trades'], market);
        }
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'Order2';
        let order = {};
        let id = market['id'].toUpperCase ();
        if (type == 'market') {
            order['params'] = [ undefined, amount, id ];
        } else {
            order['params'] = [ price, amount, id ];
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = params['market']; // TODO fixme
        return await this.privatePostCancelOrder (this.extend ({
            'params': [ id, market ],
        }, params));
    },

    nonce () {
        return this.microseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api == 'private') {
            if (!this.apiKey)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.apiKey` property for authentication');
            if (!this.secret)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.secret` property for authentication');
            let p = [];
            if ('params' in params)
                p = params['params'];
            let nonce = this.nonce ();
            let request = {
                'method': path,
                'id': nonce,
                'params': p,
            };
            p = p.join (',');
            body = this.json (request);
            let query = (
                'tonce=' + nonce +
                '&accesskey=' + this.apiKey +
                '&requestmethod=' + method.toLowerCase () +
                '&id=' + nonce +
                '&method=' + path +
                '&params=' + p
            );
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha1');
            let auth = this.apiKey + ':' + signature;
            headers = {
                'Authorization': 'Basic ' + this.stringToBase64 (auth),
                'Json-Rpc-Tonce': nonce,
            };
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var btce = {

    'id': 'btce',
    'name': 'BTC-e',
    'comment': 'Base API for many markets, including Liqui, WEX, Tidex, DSX, YoBit...',
    'version': '3',
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchTickers': true,
    'hasFetchMyTrades': true,
    'api': {
        'public': {
            'get': [
                'info',
                'ticker/{pair}',
                'depth/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'getInfo',
                'Trade',
                'ActiveOrders',
                'OrderInfo',
                'CancelOrder',
                'TradeHistory',
                'TransHistory',
                'CoinDepositAddress',
                'WithdrawCoin',
                'CreateCoupon',
                'RedeemCoupon',
            ],
        },
    },

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    },

    commonCurrencyCode (currency) {
        if (!this.substituteCommonCurrencyCodes)
            return currency;
        if (currency == 'XBT')
            return 'BTC';
        if (currency == 'BCC')
            return 'BCH';
        if (currency == 'DRK')
            return 'DASH';
        // they misspell DASH as dsh :/
        if (currency == 'DSH')
            return 'DASH';
        return currency;
    },

    getBaseQuoteFromMarketId (id) {
        let uppercase = id.toUpperCase ();
        let [ base, quote ] = uppercase.split ('_');
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return [ base, quote ];
    },

    async fetchMarkets () {
        let response = await this.publicGetInfo ();
        let markets = response['pairs'];
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ base, quote ] = this.getBaseQuoteFromMarketId (id);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            let amountLimits = {
                'min': this.safeFloat (market, 'min_amount'),
                'max': this.safeFloat (market, 'max_amount'),
            };
            let priceLimits = {
                'min': this.safeFloat (market, 'min_price'),
                'max': this.safeFloat (market, 'max_price'),
            };
            let costLimits = {
                'min': this.safeFloat (market, 'min_total'),
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'taker': market['fee'] / 100,
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            uppercase = this.commonCurrencyCode (uppercase);
            let total = undefined;
            let used = undefined;
            if (balances['open_orders'] == 0) {
                total = funds[currency];
                used = 0.0;
            }
            let account = {
                'free': funds[currency],
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetDepthPair (this.extend ({
            'pair': market['id'],
        }, params));
        let market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse)
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        let orderbook = response[market['id']];
        let result = this.parseOrderBook (orderbook);
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': this.safeFloat (ticker, 'vol_cur'),
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            let numIds = this.ids.length;
            if (numIds > 256)
                throw new ExchangeError (this.id + ' fetchTickers() requires symbols argument');
            ids = this.ids;
        } else {
            ids = this.marketIds (symbols);
        }
        let tickers = await this.publicGetTickerPair (this.extend ({
            'pair': ids.join ('-'),
        }, params));
        let result = {};
        let keys = Object.keys (tickers);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let ticker = tickers[id];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    },

    parseTrade (trade, market) {
        let timestamp = trade['timestamp'] * 1000;
        let side = trade['type'];
        if (side == 'ask')
            side = 'sell';
        if (side == 'bid')
            side = 'buy';
        let price = this.safeFloat (trade, 'price');
        if ('rate' in trade)
            price = this.safeFloat (trade, 'rate');
        let id = this.safeString (trade, 'tid');
        if ('trade_id' in trade)
            id = this.safeString (trade, 'trade_id');
        let order = this.safeString (trade, this.getOrderIdKey ());
        let fee = undefined;
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': trade['amount'],
            'fee': fee,
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesPair (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response[market['id']], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostTrade (this.extend (request, params));
        let id = this.safeString (response['return'], this.getOrderIdKey ());
        if (!id)
            id = this.safeString (response['return'], 'init_order_id');
        let timestamp = this.milliseconds ();
        price = parseFloat (price);
        amount = parseFloat (amount);
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    },

    getOrderIdKey () {
        return 'order_id';
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = {};
            let idKey = this.getOrderIdKey ();
            request[idKey] = id;
            response = await this.privatePostCancelOrder (this.extend (request, params));
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'error');
                if (message.indexOf ('not found') >= 0)
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    },

    parseOrder (order, market = undefined) {
        let id = order['id'].toString ();
        let status = order['status'];
        if (status == 0) {
            status = 'open';
        } else if (status == 1) {
            status = 'closed';
        } else if ((status == 2) || (status == 3)) {
            status = 'canceled';
        }
        let timestamp = order['timestamp_created'] * 1000;
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['pair']];
        if (market)
            symbol = market['symbol'];
        let remaining = order['amount'];
        let amount = this.safeFloat (order, 'start_amount', remaining);
        if (!amount) {
            if (id in this.orders) {
                amount = this.orders[id]['amount'];
            }
        }
        let price = order['rate'];
        let filled = undefined;
        let cost = undefined;
        if (amount) {
            filled = amount - remaining;
            cost = price * filled;
        }
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
        };
        return result;
    },

    parseOrders (orders, market = undefined) {
        let ids = Object.keys (orders);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = orders[id];
            let extended = this.extend (order, { 'id': id });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderInfo (this.extend ({
            'order_id': parseInt (id),
        }, params));
        let order = this.parseOrder (this.extend ({ 'id': id }, response['return'][id]));
        this.orders[id] = this.extend (this.orders[id], order);
        return order;
    },

    async fetchOrders (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = { 'pair': market['id'] };
        let response = await this.privatePostActiveOrders (this.extend (request, params));
        let openOrders = [];
        if ('return' in response)
            openOrders = this.parseOrders (response['return'], market);
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (order['symbol'] == symbol)
                result.push (order);
        }
        return result;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'open')
                result.push (orders[i]);
        }
        return result;
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'closed')
                result.push (orders[i]);
        }
        return result;
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = this.extend ({
            // 'from': 123456789, // trade ID, from which the display starts numerical 0
            'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC
            // 'since': 1234567890, // UTC start time, default = 0
            // 'end': 1234567890, // UTC end time, default = ∞
            // 'pair': 'eth_btc', // default = all markets
        }, params);
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        let response = await this.privatePostTradeHistory (request);
        let trades = [];
        if ('return' in response)
            trades = response['return'];
        return this.parseTrades (trades, market);
    },

    signBodyWithSecret (body) {
        return this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
    },

    getVersionString () {
        return '/' + this.version;
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            let signature = this.signBodyWithSecret (body);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else {
            url += this.getVersionString () + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (!response['success']) {
                if (response['error'].indexOf ('Not enougth') >= 0) { // not enougTh is a typo inside Liqui's own API...
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                } else if (response['error'] == 'Requests too often') {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else if ((response['error'] == 'not available') || (response['error'] == 'external service unavailable')) {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else {
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var btcmarkets = {

    'id': 'btcmarkets',
    'name': 'BTC Markets',
    'countries': 'AU', // Australia
    'rateLimit': 1000, // market data cached for 1 second (trades cached for 2 seconds)
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
        'api': 'https://api.btcmarkets.net',
        'www': 'https://btcmarkets.net/',
        'doc': 'https://github.com/BTCMarkets/API',
    },
    'api': {
        'public': {
            'get': [
                'market/{id}/tick',
                'market/{id}/orderbook',
                'market/{id}/trades',
            ],
        },
        'private': {
            'get': [
                'account/balance',
                'account/{id}/tradingfee',
            ],
            'post': [
                'fundtransfer/withdrawCrypto',
                'fundtransfer/withdrawEFT',
                'order/create',
                'order/cancel',
                'order/history',
                'order/open',
                'order/trade/history',
                'order/createBatch', // they promise it's coming soon...
                'order/detail',
            ],
        },
    },
    'markets': {
        'BTC/AUD': { 'id': 'BTC/AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
        'LTC/AUD': { 'id': 'LTC/AUD', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD' },
        'ETH/AUD': { 'id': 'ETH/AUD', 'symbol': 'ETH/AUD', 'base': 'ETH', 'quote': 'AUD' },
        'ETC/AUD': { 'id': 'ETC/AUD', 'symbol': 'ETC/AUD', 'base': 'ETC', 'quote': 'AUD' },
        'XRP/AUD': { 'id': 'XRP/AUD', 'symbol': 'XRP/AUD', 'base': 'XRP', 'quote': 'AUD' },
        'BCH/AUD': { 'id': 'BCH/AUD', 'symbol': 'BCH/AUD', 'base': 'BCH', 'quote': 'AUD' },
        'LTC/BTC': { 'id': 'LTC/BTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'ETH/BTC': { 'id': 'ETH/BTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'ETC/BTC': { 'id': 'ETC/BTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC' },
        'XRP/BTC': { 'id': 'XRP/BTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        'BCH/BTC': { 'id': 'BCH/BTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let multiplier = 100000000;
            let free = parseFloat (balance['balance'] / multiplier);
            let used = parseFloat (balance['pendingFunds'] / multiplier);
            let account = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetMarketIdOrderbook (this.extend ({
            'id': market['id'],
        }, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bestBid']),
            'ask': parseFloat (ticker['bestAsk']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['lastPrice']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume24h']),
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketIdTick (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketIdTrades (this.extend ({
            // 'since': 59868345231,
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let multiplier = 100000000; // for price and volume
        // does BTC Markets support market orders at all?
        let orderSide = (side == 'buy') ? 'Bid' : 'Ask';
        let order = this.ordered ({
            'currency': market['quote'],
            'instrument': market['base'],
            'price': price * multiplier,
            'volume': amount * multiplier,
            'orderSide': orderSide,
            'ordertype': this.capitalize (type),
            'clientRequestId': this.nonce ().toString (),
        });
        let response = await this.privatePostOrderCreate (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrders (ids) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_ids': ids });
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.cancelOrders ([ id ]);
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let uri = '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + uri;
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ().toString ();
            let auth = uri + "\n" + nonce + "\n";
            headers = {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'timestamp': nonce,
            };
            if (method == 'POST') {
                body = this.urlencode (query);
                auth += body;
            }
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers['signature'] = this.decode (signature);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'private') {
            if ('success' in response)
                if (!response['success'])
                    throw new ExchangeError (this.id + ' ' + this.json (response));
            return response;
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var btctrader = {

    'id': 'btctrader',
    'name': 'BTCTrader',
    'countries': [ 'TR', 'GR', 'PH' ], // Turkey, Greece, Philippines
    'rateLimit': 1000,
    'hasFetchOHLCV': true,
    'timeframes': {
        '1d': '1d',
    },
    'comment': 'base API for BTCExchange, BTCTurk',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27992404-cda1e386-649c-11e7-8dc1-40bbd2897768.jpg',
        'api': 'https://www.btctrader.com/api',
        'www': 'https://www.btctrader.com',
        'doc': 'https://github.com/BTCTrader/broker-api-docs',
    },
    'api': {
        'public': {
            'get': [
                'ohlcdata', // ?last=COUNT
                'orderbook',
                'ticker',
                'trades',   // ?last=COUNT (max 50)
            ],
        },
        'private': {
            'get': [
                'balance',
                'openOrders',
                'userTransactions', // ?offset=0&limit=25&sort=asc
            ],
            'post': [
                'buy',
                'cancelOrder',
                'sell',
            ],
        },
    },

    async fetchBalance (params = {}) {
        let response = await this.privateGetBalance ();
        let result = { 'info': response };
        let base = {
            'free': response['bitcoin_available'],
            'used': response['bitcoin_reserved'],
            'total': response['bitcoin_balance'],
        };
        let quote = {
            'free': response['money_available'],
            'used': response['money_reserved'],
            'total': response['money_balance'],
        };
        let symbol = this.symbols[0];
        let market = this.markets[symbol];
        result[market['base']] = base;
        result[market['quote']] = quote;
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'pairSymbol': market['id'],
        }, params));
        let timestamp = parseInt (orderbook['timestamp'] * 1000);
        return this.parseOrderBook (orderbook, timestamp);
    },

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['average']),
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let symbol = ticker['pair'];
            let market = undefined;
            if (symbol in this.markets_by_id) {
                market = this.markets_by_id[symbol];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.fetchTickers ();
        let result = undefined;
        if (symbol in tickers)
            result = tickers[symbol];
        return result;
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        // let maxCount = 50;
        let response = await this.publicGetTrades (this.extend ({
            'pairSymbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['Time']);
        return [
            timestamp,
            ohlcv['Open'],
            ohlcv['High'],
            ohlcv['Low'],
            ohlcv['Close'],
            ohlcv['Volume'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        if (limit)
            request['last'] = limit;
        let response = await this.publicGetOhlcdata (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'Type': (side == 'buy') ? 'BuyBtc' : 'SelBtc',
            'IsMarketOrder': (type == 'market') ? 1 : 0,
        };
        if (type == 'market') {
            if (side == 'buy')
                order['Total'] = amount;
            else
                order['Amount'] = amount;
        } else {
            order['Price'] = price;
            order['Amount'] = amount;
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id == 'btctrader')
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ().toString;
            body = this.urlencode (params);
            let secret = this.base64ToString (this.secret);
            let auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce.toString (),
                'X-Signature': this.hmac (this.encode (auth), secret, 'sha256', 'base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var btcexchange = extend (btctrader, {

    'id': 'btcexchange',
    'name': 'BTCExchange',
    'countries': 'PH', // Philippines
    'rateLimit': 1500,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
        'api': 'https://www.btcexchange.ph/api',
        'www': 'https://www.btcexchange.ph',
        'doc': 'https://github.com/BTCTrader/broker-api-docs',
    },
    'markets': {
        'BTC/PHP': { 'id': 'BTC/PHP', 'symbol': 'BTC/PHP', 'base': 'BTC', 'quote': 'PHP' },
    },
})

//-----------------------------------------------------------------------------

var btctradeua = {

    'id': 'btctradeua',
    'name': 'BTC Trade UA',
    'countries': 'UA', // Ukraine,
    'rateLimit': 3000,
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
        'api': 'https://btc-trade.com.ua/api',
        'www': 'https://btc-trade.com.ua',
        'doc': 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
    },
    'api': {
        'public': {
            'get': [
                'deals/{symbol}',
                'trades/sell/{symbol}',
                'trades/buy/{symbol}',
                'japan_stat/high/{symbol}',
            ],
        },
        'private': {
            'post': [
                'auth',
                'ask/{symbol}',
                'balance',
                'bid/{symbol}',
                'buy/{symbol}',
                'my_orders/{symbol}',
                'order/status/{id}',
                'remove/order/{id}',
                'sell/{symbol}',
            ],
        },
    },
    'markets': {
        'BTC/UAH': { 'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH' },
        'ETH/UAH': { 'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH' },
        'LTC/UAH': { 'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH' },
        'DOGE/UAH': { 'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH' },
        'DASH/UAH': { 'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH' },
        'SIB/UAH': { 'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH' },
        'KRB/UAH': { 'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH' },
        'NVC/UAH': { 'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH' },
        'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'NVC/BTC': { 'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC' },
        'ITI/UAH': { 'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH' },
        'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
        'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
    },

    signIn () {
        return this.privatePostAuth ();
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalance ();
        let result = { 'info': response };
        if ('accounts' in result) {
            let accounts = response['accounts'];
            for (let b = 0; b < accounts.length; b++) {
                let account = accounts[b];
                let currency = account['currency'];
                let balance = parseFloat (account['balance']);
                result[currency] = {
                    'free': balance,
                    'used': 0.0,
                    'total': balance,
                };
            }
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let bids = await this.publicGetTradesBuySymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let asks = await this.publicGetTradesSellSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let orderbook = {
            'bids': [],
            'asks': [],
        };
        if (bids) {
            if ('list' in bids)
                orderbook['bids'] = bids['list'];
        }
        if (asks) {
            if ('list' in asks)
                orderbook['asks'] = asks['list'];
        }
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'currency_trade');
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetJapanStatHighSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let orderbook = await this.fetchOrderBook (symbol);
        let bid = undefined;
        let numBids = orderbook['bids'].length;
        if (numBids > 0)
            bid = orderbook['bids'][0][0];
        let ask = undefined;
        let numAsks = orderbook['asks'].length;
        if (numAsks > 0)
            ask = orderbook['asks'][0][0];
        let ticker = response['trades'];
        let timestamp = this.milliseconds ();
        let result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
        let tickerLength = ticker.length;
        if (tickerLength > 0) {
            let start = Math.max (tickerLength - 48, 0);
            for (let t = start; t < ticker.length; t++) {
                let candle = ticker[t];
                if (typeof result['open'] == 'undefined')
                    result['open'] = candle[1];
                if ((typeof result['high'] == 'undefined') || (result['high'] < candle[2]))
                    result['high'] = candle[2];
                if ((typeof result['low'] == 'undefined') || (result['low'] > candle[3]))
                    result['low'] = candle[3];
                if (typeof result['quoteVolume'] == 'undefined')
                    result['quoteVolume'] = -candle[5];
                else
                    result['quoteVolume'] -= candle[5];
            }
            let last = tickerLength - 1;
            result['close'] = ticker[last][4];
            result['quoteVolume'] = -1 * result['quoteVolume'];
        }
        return result;
    },

    parseTrade (trade, market) {
        let timestamp = this.milliseconds (); // until we have a better solution for python
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amnt_base']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetDealsSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'Id';
        let order = {
            'count': amount,
            'currency1': market['quote'],
            'currency': market['base'],
            'price': price,
        };
        return this[method] (this.extend (order, params));
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostRemoveOrderId ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += this.implodeParams (path, query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query));
            let auth = body + this.secret;
            headers = {
                'public-key': this.apiKey,
                'api-sign': this.hash (this.encode (auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var btcturk = extend (btctrader, {

    'id': 'btcturk',
    'name': 'BTCTurk',
    'countries': 'TR', // Turkey
    'rateLimit': 1000,
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
        'api': 'https://www.btcturk.com/api',
        'www': 'https://www.btcturk.com',
        'doc': 'https://github.com/BTCTrader/broker-api-docs',
    },
    'markets': {
        'BTC/TRY': { 'id': 'BTCTRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
        'ETH/TRY': { 'id': 'ETHTRY', 'symbol': 'ETH/TRY', 'base': 'ETH', 'quote': 'TRY' },
        'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
    },
})

//-----------------------------------------------------------------------------

var btcx = {

    'id': 'btcx',
    'name': 'BTCX',
    'countries': [ 'IS', 'US', 'EU' ],
    'rateLimit': 1500, // support in english is very poor, unable to tell rate limits
    'version': 'v1',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg',
        'api': 'https://btc-x.is/api',
        'www': 'https://btc-x.is',
        'doc': 'https://btc-x.is/custom/api-document.html',
    },
    'api': {
        'public': {
            'get': [
                'depth/{id}/{limit}',
                'ticker/{id}',
                'trade/{id}/{limit}',
            ],
        },
        'private': {
            'post': [
                'balance',
                'cancel',
                'history',
                'order',
                'redeem',
                'trade',
                'withdraw',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'btc/usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'btc/eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    async fetchBalance (params = {}) {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': balances[currency],
                'used': 0.0,
                'total': balances[currency],
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetDepthIdLimit (this.extend ({
            'id': this.marketId (symbol),
            'limit': 1000,
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTickerId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = ticker['time'] * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['sell']),
            'ask': parseFloat (ticker['buy']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        let side = (trade['type'] == 'ask') ? 'sell' : 'buy';
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTradeIdLimit (this.extend ({
            'id': market['id'],
            'limit': 1000,
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostTrade (this.extend ({
            'type': side.toUpperCase (),
            'market': this.marketId (symbol),
            'amount': amount,
            'price': price,
        }, params));
        return {
            'info': response,
            'id': response['order']['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'order': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/';
        if (api == 'public') {
            url += this.implodeParams (path, params);
        } else {
            let nonce = this.nonce ();
            url += api;
            body = this.urlencode (this.extend ({
                'Method': path.toUpperCase (),
                'Nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Signature': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var bter = {
    'id': 'bter',
    'name': 'Bter',
    'countries': [ 'VG', 'CN' ], // British Virgin Islands, China
    'version': '2',
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27980479-cfa3188c-6387-11e7-8191-93fc4184ba5c.jpg',
        'api': {
            'public': 'https://data.bter.com/api',
            'private': 'https://api.bter.com/api',
        },
        'www': 'https://bter.com',
        'doc': 'https://bter.com/api2',
    },
    'api': {
        'public': {
            'get': [
                'pairs',
                'marketinfo',
                'marketlist',
                'tickers',
                'ticker/{id}',
                'orderBook/{id}',
                'trade/{id}',
                'tradeHistory/{id}',
                'tradeHistory/{id}/{tid}',
            ],
        },
        'private': {
            'post': [
                'balances',
                'depositAddress',
                'newAddress',
                'depositsWithdrawals',
                'buy',
                'sell',
                'cancelOrder',
                'cancelAllOrders',
                'getOrder',
                'openOrders',
                'tradeHistory',
                'withdraw',
            ],
        },
    },

    async fetchMarkets () {
        let response = await this.publicGetMarketlist ();
        let markets = response['data'];
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['pair'];
            let base = market['curr_a'];
            let quote = market['curr_b'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balance = await this.privatePostBalances ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let code = this.commonCurrencyCode (currency);
            let account = this.account ();
            if ('available' in balance) {
                if (currency in balance['available']) {
                    account['free'] = parseFloat (balance['available'][currency]);
                }
            }
            if ('locked' in balance) {
                if (currency in balance['locked']) {
                    account['used'] = parseFloat (balance['locked'][currency]);
                }
            }
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let result = this.parseOrderBook (orderbook);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24hr']),
            'low': parseFloat (ticker['low24hr']),
            'bid': parseFloat (ticker['highestBid']),
            'ask': parseFloat (ticker['lowestAsk']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': parseFloat (ticker['percentChange']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['quoteVolume']),
            'quoteVolume': parseFloat (ticker['baseVolume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let ticker = tickers[id];
            let market = undefined;
            if (symbol in this.markets)
                market = this.markets[symbol];
            if (id in this.markets_by_id)
                market = this.markets_by_id[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        return {
            'id': trade['tradeID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['rate'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        await this.loadMarkets ();
        let response = await this.publicGetTradeHistoryId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['data'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'currencyPair': this.marketId (symbol),
            'rate': price,
            'amount': amount,
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderNumber'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'orderNumber': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let prefix = (api == 'private') ? (api + '/') : '';
        let url = this.urls['api'][api] + this.version + '/1/' + prefix + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = { 'nonce': nonce };
            body = this.urlencode (this.extend (request, query));
            let signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Key': this.apiKey,
                'Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (response['result'] != 'true')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var bxinth = {

    'id': 'bxinth',
    'name': 'BX.in.th',
    'countries': 'TH', // Thailand
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
        'api': 'https://bx.in.th/api',
        'www': 'https://bx.in.th',
        'doc': 'https://bx.in.th/info/api',
    },
    'api': {
        'public': {
            'get': [
                '', // ticker
                'options',
                'optionbook',
                'orderbook',
                'pairing',
                'trade',
                'tradehistory',
            ],
        },
        'private': {
            'post': [
                'balance',
                'biller',
                'billgroup',
                'billpay',
                'cancel',
                'deposit',
                'getorders',
                'history',
                'option-issue',
                'option-bid',
                'option-sell',
                'option-myissue',
                'option-mybid',
                'option-myoptions',
                'option-exercise',
                'option-cancel',
                'option-history',
                'order',
                'withdrawal',
                'withdrawal-history',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetPairing ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let market = markets[keys[p]];
            let id = market['pairing_id'].toString ();
            let base = market['primary_currency'];
            let quote = market['secondary_currency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    commonCurrencyCode (currency) {
        // why would they use three letters instead of four for currency codes
        if (currency == 'DAS')
            return 'DASH';
        if (currency == 'DOG')
            return 'DOGE';
        return currency;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let balance = response['balance'];
        let result = { 'info': balance };
        let currencies = Object.keys (balance);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let code = this.commonCurrencyCode (currency);
            let account = {
                'free': parseFloat (balance[currency]['available']),
                'used': 0.0,
                'total': parseFloat (balance[currency]['total']),
            };
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'pairing': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['orderbook']['bids']['highbid']),
            'ask': parseFloat (ticker['orderbook']['asks']['highbid']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': parseFloat (ticker['change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume_24hours']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGet (params);
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let ticker = tickers[id];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGet (this.extend ({
            'pairing': market['id'],
        }, params));
        let id = market['id'].toString ();
        let ticker = tickers[id];
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['trade_date']);
        return {
            'id': trade['trade_id'],
            'info': trade,
            'order': trade['order_id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['trade_type'],
            'price': parseFloat (trade['rate']),
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrade (this.extend ({
            'pairing': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrder (this.extend ({
            'pairing': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let pairing = undefined; // TODO fixme
        return await this.privatePostCancel ({
            'order_id': id,
            'pairing': pairing,
        });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (path)
            url += path + '/';
        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);
        if (api == 'private') {
            let nonce = this.nonce ();
            let auth = this.apiKey + nonce.toString () + this.secret;
            let signature = this.hash (this.encode (auth), 'sha256');
            body = this.urlencode (this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
                'signature': signature,
                // twofa: this.twofa,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'public')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var ccex = {

    'id': 'ccex',
    'name': 'C-CEX',
    'countries': [ 'DE', 'EU' ],
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
        'api': {
            'tickers': 'https://c-cex.com/t',
            'public': 'https://c-cex.com/t/api_pub.html',
            'private': 'https://c-cex.com/t/api.html',
        },
        'www': 'https://c-cex.com',
        'doc': 'https://c-cex.com/?id=api',
    },
    'api': {
        'tickers': {
            'get': [
                'coinnames',
                '{market}',
                'pairs',
                'prices',
                'volume_{coin}',
            ],
        },
        'public': {
            'get': [
                'balancedistribution',
                'markethistory',
                'markets',
                'marketsummaries',
                'orderbook',
            ],
        },
        'private': {
            'get': [
                'buylimit',
                'cancel',
                'getbalance',
                'getbalances',
                'getopenorders',
                'getorder',
                'getorderhistory',
                'mytrades',
                'selllimit',
            ],
        },
    },

    commonCurrencyCode (currency) {
        if (currency == 'IOT')
            return 'IoTcoin';
        return currency;
    },

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets['result'].length; p++) {
            let market = markets['result'][p];
            let id = market['MarketName'];
            let base = market['MarketCurrency'];
            let quote = market['BaseCurrency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['Currency'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': balance['Available'],
                'used': balance['Pending'],
                'total': balance['Balance'],
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (symbol),
            'type': 'both',
            'depth': 100,
        }, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['lastprice']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']),
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'buysupport'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.tickersGetPrices (params);
        let result = { 'info': tickers };
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let ticker = tickers[id];
            let uppercase = id.toUpperCase ();
            let market = undefined;
            let symbol = undefined;
            if (uppercase in this.markets_by_id) {
                market = this.markets_by_id[uppercase];
                symbol = market['symbol'];
            } else {
                let [ base, quote ] = uppercase.split ('-');
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.tickersGetMarket (this.extend ({
            'market': market['id'].toLowerCase (),
        }, params));
        let ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['TimeStamp']);
        return {
            'id': trade['Id'],
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['OrderType'].toLowerCase (),
            'price': trade['Price'],
            'amount': trade['Quantity'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
            'type': 'both',
            'depth': 100,
        }, params));
        return this.parseTrades (response['result'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privateGet' + this.capitalize (side) + type;
        let response = await this[method] (this.extend ({
            'market': this.marketId (symbol),
            'quantity': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateGetCancel ({ 'uuid': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'private') {
            let nonce = this.nonce ().toString ();
            let query = this.keysort (this.extend ({
                'a': path,
                'apikey': this.apiKey,
                'nonce': nonce,
            }, params));
            url += '?' + this.urlencode (query);
            headers = { 'apisign': this.hmac (this.encode (url), this.encode (this.secret), 'sha512') };
        } else if (api == 'public') {
            url += '?' + this.urlencode (this.extend ({
                'a': 'get' + path,
            }, params));
        } else {
            url += '/' + this.implodeParams (path, params) + '.json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'tickers')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var cex = {

    'id': 'cex',
    'name': 'CEX.IO',
    'countries': [ 'GB', 'EU', 'CY', 'RU' ],
    'rateLimit': 1500,
    'hasCORS': true,
    'hasFetchOHLCV': true,
    'hasFetchTickers': false,
    'hasFetchOpenOrders': true,
    'timeframes': {
        '1m': '1m',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
        'api': 'https://cex.io/api',
        'www': 'https://cex.io',
        'doc': 'https://cex.io/cex-api',
    },
    'api': {
        'public': {
            'get': [
                'currency_limits/',
                'last_price/{pair}/',
                'last_prices/{currencies}/',
                'ohlcv/hd/{yyyymmdd}/{pair}',
                'order_book/{pair}/',
                'ticker/{pair}/',
                'tickers/{currencies}/',
                'trade_history/{pair}/',
            ],
            'post': [
                'convert/{pair}',
                'price_stats/{pair}',
            ],
        },
        'private': {
            'post': [
                'active_orders_status/',
                'archived_orders/{pair}/',
                'balance/',
                'cancel_order/',
                'cancel_orders/{pair}/',
                'cancel_replace_order/{pair}/',
                'close_position/{pair}/',
                'get_address/',
                'get_myfee/',
                'get_order/',
                'get_order_tx/',
                'open_orders/{pair}/',
                'open_orders/',
                'open_position/{pair}/',
                'open_positions/{pair}/',
                'place_order/{pair}/',
            ],
        }
    },

    async fetchMarkets () {
        let markets = await this.publicGetCurrencyLimits ();
        let result = [];
        for (let p = 0; p < markets['data']['pairs'].length; p++) {
            let market = markets['data']['pairs'][p];
            let id = market['symbol1'] + '/' + market['symbol2'];
            let symbol = id;
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            if (currency in balances) {
                let account = {
                    'free': parseFloat (balances[currency]['available']),
                    'used': parseFloat (balances[currency]['orders']),
                    'total': 0.0,
                };
                account['total'] = this.sum (account['free'], account['used']);
                result[currency] = account;
            }
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!since)
            since = this.milliseconds () - 86400000; // yesterday
        let ymd = this.Ymd (since);
        ymd = ymd.split ('-');
        ymd = ymd.join ('');
        let request = {
            'pair': market['id'],
            'yyyymmdd': ymd,
        };
        let response = await this.publicGetOhlcvHdYyyymmddPair (this.extend (request, params));
        let key = 'data' + this.timeframes[timeframe];
        let ohlcvs = this.unjson (response[key]);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = undefined;
        let iso8601 = undefined;
        if ('timestamp' in ticker) {
            timestamp = parseInt (ticker['timestamp']) * 1000;
            iso8601 = this.iso8601 (timestamp);
        }
        let volume = this.safeFloat (ticker, 'volume');
        let high = this.safeFloat (ticker, 'high');
        let low = this.safeFloat (ticker, 'low');
        let bid = this.safeFloat (ticker, 'bid');
        let ask = this.safeFloat (ticker, 'ask');
        let last = this.safeFloat (ticker, 'last');
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': iso8601,
            'high': high,
            'low': low,
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': volume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let currencies = this.currencies.join ('/');
        let response = await this.publicGetTickersCurrencies (this.extend ({
            'currencies': currencies,
        }, params));
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let symbol = ticker['pair'].replace (':', '/');
            let market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerPair (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'id': trade['tid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradeHistoryPair (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'pair': this.marketId (symbol),
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        else
            order['order_type'] = type;
        let response = await this.privatePostPlaceOrderPair (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'id': id });
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostGetOrder (this.extend ({
            'id': id.toString (),
        }, params));
    },

    parseOrder (order, market = undefined) {
        let timestamp = parseInt (order['time']);
        let symbol = undefined;
        if (!market) {
            let symbol = order['symbol1'] + '/' + order['symbol2'];
            if (symbol in this.markets)
                market = this.market (symbol);
        }
        let status = order['status'];
        if (status == 'cd') {
            status = 'canceled';
        } else if (status == 'c') {
            status = 'canceled';
        } else if (status == 'd') {
            status = 'closed';
        }
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        let remaining = this.safeFloat (order, 'pending');
        if (!remaining)
            remaining = this.safeFloat (order, 'remains');
        let filled = amount - remaining;
        let fee = undefined;
        let cost = undefined;
        if (market) {
            symbol = market['symbol'];
            cost = this.safeFloat (order, 'ta:' + market['quote']);
            let baseFee = 'fa:' + market['base'];
            let quoteFee = 'fa:' + market['quote'];
            let feeRate = this.safeFloat (order, 'tradingFeeMaker');
            if (!feeRate)
                feeRate = this.safeFloat (order, 'tradingFeeTaker', feeRate);
            if (feeRate)
                feeRate /= 100.0; // convert to mathematically-correct percentage coefficients: 1.0 = 100%
            if (baseFee in order) {
                fee = {
                    'currency': market['base'],
                    'rate': feeRate,
                    'cost': this.safeFloat (order, baseFee),
                };
            } else if (quoteFee in order) {
                fee = {
                    'currency': market['quote'],
                    'rate': feeRate,
                    'cost': this.safeFloat (order, quoteFee),
                };
            }
        }
        if (!cost)
            cost = price * filled;
        return {
            'id': order['id'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets();
        let request = {};
        let method = 'privatePostOpenOrders';
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        let orders = await this[method] (this.extend (request, params));
        for (let i = 0; i < orders.length; i++) {
            orders[i] = this.extend (orders[i], { 'status': 'open' });
        }
        return this.parseOrders (orders, market);
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.urlencode (this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (!response) {
            throw new ExchangeError (this.id + ' returned ' + this.json (response));
        } else if (response == true) {
            return response;
        } else if ('e' in response) {
            if ('ok' in response)
                if (response['ok'] == 'ok')
                    return response;
            throw new ExchangeError (this.id + ' ' + this.json (response));
        } else if ('error' in response) {
            if (response['error'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var chbtc = {
    'id': 'chbtc',
    'name': 'CHBTC',
    'countries': 'CN',
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchOrder': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
        'api': {
            'public': 'http://api.chbtc.com/data', // no https for public API
            'private': 'https://trade.chbtc.com/api',
        },
        'www': 'https://trade.chbtc.com/api',
        'doc': 'https://www.chbtc.com/i/developer',
    },
    'api': {
        'public': {
            'get': [
                'ticker',
                'depth',
                'trades',
                'kline',
            ],
        },
        'private': {
            'post': [
                'order',
                'cancelOrder',
                'getOrder',
                'getOrders',
                'getOrdersNew',
                'getOrdersIgnoreTradeType',
                'getUnfinishedOrdersIgnoreTradeType',
                'getAccountInfo',
                'getUserAddress',
                'getWithdrawAddress',
                'getWithdrawRecord',
                'getChargeRecord',
                'getCnyWithdrawRecord',
                'getCnyChargeRecord',
                'withdraw',
            ],
        },
    },
    'markets': {
        'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
        'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' },
        'ETH/CNY': { 'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY' },
        'ETC/CNY': { 'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY' },
        'BTS/CNY': { 'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY' },
        // 'EOS/CNY': { 'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY' },
        'BCH/CNY': { 'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY' },
        'HSR/CNY': { 'id': 'hsr_cny', 'symbol': 'HSR/CNY', 'base': 'HSR', 'quote': 'CNY' },
        'QTUM/CNY': { 'id': 'qtum_cny', 'symbol': 'QTUM/CNY', 'base': 'QTUM', 'quote': 'CNY' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balances['balance'])
                account['free'] = parseFloat (balances['balance'][currency]['amount']);
            if (currency in balances['frozen'])
                account['used'] = parseFloat (balances['frozen'][currency]['amount']);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'currency': market['id'],
        }, params));
        let timestamp = this.milliseconds ();
        let bids = undefined;
        let asks = undefined;
        if ('bids' in orderbook)
            bids = orderbook['bids'];
        if ('asks' in orderbook)
            asks = orderbook['asks'];
        let result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        if (result['bids'])
            result['bids'] = this.sortBy (result['bids'], 0, true);
        if (result['asks'])
            result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetTicker (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
        let ticker = response['ticker'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let side = (trade['trade_type'] == 'bid') ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let paramString = '&price=' + price.toString ();
        paramString += '&amount=' + amount.toString ();
        let tradeType = (side == 'buy') ? '1' : '0';
        paramString += '&tradeType=' + tradeType;
        paramString += '&currency=' + this.marketId (symbol);
        let response = await this.privatePostOrder (paramString);
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        let paramString = '&id=' + id.toString ();
        if ('currency' in params)
            paramString += '&currency=' + params['currency'];
        return await this.privatePostCancelOrder (paramString);
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        let paramString = '&id=' + id.toString ();
        if ('currency' in params)
            paramString += '&currency=' + params['currency'];
        return await this.privatePostGetOrder (paramString);
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let paramsLength = params.length; // params should be a string here
            let nonce = this.nonce ();
            let auth = 'method=' + path;
            auth += '&accesskey=' + this.apiKey;
            auth += paramsLength ? params : '';
            let secret = this.hash (this.encode (this.secret), 'sha1');
            let signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            let suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'private')
            if ('code' in response)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var chilebit = extend (blinktrade, {
    'id': 'chilebit',
    'name': 'ChileBit',
    'countries': 'CL',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://chilebit.net',
        'doc': 'https://blinktrade.com/docs',
    },
    'comment': 'Blinktrade API',
    'markets': {
        'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit' },
    },
})

//-----------------------------------------------------------------------------

var coincheck = {

    'id': 'coincheck',
    'name': 'coincheck',
    'countries': [ 'JP', 'ID' ],
    'rateLimit': 1500,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
        'api': 'https://coincheck.com/api',
        'www': 'https://coincheck.com',
        'doc': 'https://coincheck.com/documents/exchange/api',
    },
    'api': {
        'public': {
            'get': [
                'exchange/orders/rate',
                'order_books',
                'rate/{pair}',
                'ticker',
                'trades',
            ],
        },
        'private': {
            'get': [
                'accounts',
                'accounts/balance',
                'accounts/leverage_balance',
                'bank_accounts',
                'deposit_money',
                'exchange/orders/opens',
                'exchange/orders/transactions',
                'exchange/orders/transactions_pagination',
                'exchange/leverage/positions',
                'lending/borrows/matches',
                'send_money',
                'withdraws',
            ],
            'post': [
                'bank_accounts',
                'deposit_money/{id}/fast',
                'exchange/orders',
                'exchange/transfers/to_leverage',
                'exchange/transfers/from_leverage',
                'lending/borrows',
                'lending/borrows/{id}/repay',
                'send_money',
                'withdraws',
            ],
            'delete': [
                'bank_accounts/{id}',
                'exchange/orders/{id}',
                'withdraws/{id}',
            ],
        },
    },
    'markets': {
        'BTC/JPY': { 'id': 'btc_jpy', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' }, // the only real pair
        // 'ETH/JPY': { 'id': 'eth_jpy', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY' },
        // 'ETC/JPY': { 'id': 'etc_jpy', 'symbol': 'ETC/JPY', 'base': 'ETC', 'quote': 'JPY' },
        // 'DAO/JPY': { 'id': 'dao_jpy', 'symbol': 'DAO/JPY', 'base': 'DAO', 'quote': 'JPY' },
        // 'LSK/JPY': { 'id': 'lsk_jpy', 'symbol': 'LSK/JPY', 'base': 'LSK', 'quote': 'JPY' },
        // 'FCT/JPY': { 'id': 'fct_jpy', 'symbol': 'FCT/JPY', 'base': 'FCT', 'quote': 'JPY' },
        // 'XMR/JPY': { 'id': 'xmr_jpy', 'symbol': 'XMR/JPY', 'base': 'XMR', 'quote': 'JPY' },
        // 'REP/JPY': { 'id': 'rep_jpy', 'symbol': 'REP/JPY', 'base': 'REP', 'quote': 'JPY' },
        // 'XRP/JPY': { 'id': 'xrp_jpy', 'symbol': 'XRP/JPY', 'base': 'XRP', 'quote': 'JPY' },
        // 'ZEC/JPY': { 'id': 'zec_jpy', 'symbol': 'ZEC/JPY', 'base': 'ZEC', 'quote': 'JPY' },
        // 'XEM/JPY': { 'id': 'xem_jpy', 'symbol': 'XEM/JPY', 'base': 'XEM', 'quote': 'JPY' },
        // 'LTC/JPY': { 'id': 'ltc_jpy', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY' },
        // 'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY' },
        // 'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        // 'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC' },
        // 'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
        // 'FCT/BTC': { 'id': 'fct_btc', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC' },
        // 'XMR/BTC': { 'id': 'xmr_btc', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC' },
        // 'REP/BTC': { 'id': 'rep_btc', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC' },
        // 'XRP/BTC': { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        // 'ZEC/BTC': { 'id': 'zec_btc', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC' },
        // 'XEM/BTC': { 'id': 'xem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC' },
        // 'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        // 'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        let balances = await this.privateGetAccountsBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances)
                account['free'] = parseFloat (balances[lowercase]);
            let reserved = lowercase + '_reserved';
            if (reserved in balances)
                account['used'] = parseFloat (balances[reserved]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        if (symbol != 'BTC/JPY')
            throw new NotSupported (this.id + ' fetchOrderBook () supports BTC/JPY only');
        let orderbook = await this.publicGetOrderBooks (params);
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        if (symbol != 'BTC/JPY')
            throw new NotSupported (this.id + ' fetchTicker () supports BTC/JPY only');
        let ticker = await this.publicGetTicker (params);
        let timestamp = ticker['timestamp'] * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['created_at']);
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['order_type'],
            'price': parseFloat (trade['rate']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        if (symbol != 'BTC/JPY')
            throw new NotSupported (this.id + ' fetchTrades () supports BTC/JPY only');
        let market = this.market (symbol);
        let response = await this.publicGetTrades (params);
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let prefix = '';
        let order = {
            'pair': this.marketId (symbol),
        };
        if (type == 'market') {
            let order_type = type + '_' + side;
            order['order_type'] = order_type;
            let prefix = (side == 'buy') ? (order_type + '_') : '';
            order[prefix + 'amount'] = amount;
        } else {
            order['order_type'] = side;
            order['rate'] = price;
            order['amount'] = amount;
        }
        let response = await this.privatePostExchangeOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privateDeleteExchangeOrdersId ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            if (Object.keys (query).length)
                body = this.urlencode (this.keysort (query));
            let auth = nonce + url + (body || '');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'public')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var coinfloor = {

    'id': 'coinfloor',
    'name': 'coinfloor',
    'rateLimit': 1000,
    'countries': 'UK',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg',
        'api': 'https://webapi.coinfloor.co.uk:8090/bist',
        'www': 'https://www.coinfloor.co.uk',
        'doc': [
            'https://github.com/coinfloor/api',
            'https://www.coinfloor.co.uk/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{id}/ticker/',
                '{id}/order_book/',
                '{id}/transactions/',
            ],
        },
        'private': {
            'post': [
                '{id}/balance/',
                '{id}/user_transactions/',
                '{id}/open_orders/',
                '{id}/cancel_order/',
                '{id}/buy/',
                '{id}/sell/',
                '{id}/buy_market/',
                '{id}/sell_market/',
                '{id}/estimate_sell_market/',
                '{id}/estimate_buy_market/',
            ],
        },
    },
    'markets': {
        'BTC/GBP': { 'id': 'XBT/GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
        'BTC/EUR': { 'id': 'XBT/EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'BTC/USD': { 'id': 'XBT/USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/PLN': { 'id': 'XBT/PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
        'BCH/GBP': { 'id': 'BCH/GBP', 'symbol': 'BCH/GBP', 'base': 'BCH', 'quote': 'GBP' },
    },

    fetchBalance (params = {}) {
        let symbol = undefined;
        if ('symbol' in params)
            symbol = params['symbol'];
        if ('id' in params)
            symbol = params['id'];
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchBalance requires a symbol param');
        // todo parse balance
        return this.privatePostIdBalance ({
            'id': this.marketId (symbol),
        });
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetIdOrderBook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market = undefined) {
        // rewrite to get the timestamp from HTTP headers
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let ticker = await this.publicGetIdTicker (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetIdTransactions (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = { 'id': this.marketId (symbol) };
        let method = 'privatePostId' + this.capitalize (side);
        if (type == 'market') {
            order['quantity'] = amount;
            method += 'Market';
        } else {
            order['price'] = price;
            order['amount'] = amount;
        }
        return this[method] (this.extend (order, params));
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostIdCancelOrder ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // curl -k -u '[User ID]/[API key]:[Passphrase]' https://webapi.coinfloor.co.uk:8090/bist/XBT/GBP/balance/
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let auth = this.uid + '/' + this.apiKey + ':' + this.password;
            let signature = this.stringToBase64 (auth);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var coingi = {

    'id': 'coingi',
    'name': 'Coingi',
    'rateLimit': 1000,
    'countries': [ 'PA', 'BG', 'CN', 'US' ], // Panama, Bulgaria, China, US
    'hasFetchTickers': true,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
        'api': 'https://api.coingi.com',
        'www': 'https://coingi.com',
        'doc': 'http://docs.coingi.apiary.io/',
    },
    'api': {
        'current': {
            'get': [
                'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                'transactions/{pair}/{maxCount}',
                '24hour-rolling-aggregation',
            ],
        },
        'user': {
            'post': [
                'balance',
                'add-order',
                'cancel-order',
                'orders',
                'transactions',
                'create-crypto-withdrawal',
            ],
        },
    },
    'markets': {
        'LTC/BTC': { 'id': 'ltc-btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'PPC/BTC': { 'id': 'ppc-btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC' },
        'DOGE/BTC': { 'id': 'doge-btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
        'VTC/BTC': { 'id': 'vtc-btc', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC' },
        'FTC/BTC': { 'id': 'ftc-btc', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC' },
        'NMC/BTC': { 'id': 'nmc-btc', 'symbol': 'NMC/BTC', 'base': 'NMC', 'quote': 'BTC' },
        'DASH/BTC': { 'id': 'dash-btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
    },

    async fetchBalance (params = {}) {
        let currencies = [];
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c].toLowerCase ();
            currencies.push (currency);
        }
        let balances = await this.userPostBalance ({
            'currencies': currencies.join (',')
        });
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency']['name'];
            currency = currency.toUpperCase ();
            let account = {
                'free': balance['available'],
                'used': balance['blocked'] + balance['inOrders'] + balance['withdrawing'],
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.currentGetOrderBookPairAskCountBidCountDepth (this.extend ({
            'pair': market['id'],
            'askCount': 512, // maximum returned number of asks 1-512
            'bidCount': 512, // maximum returned number of bids 1-512
            'depth': 32, // maximum number of depth range steps 1-32
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'baseAmount');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['highestBid'],
            'ask': ticker['lowestAsk'],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['counterVolume'],
            'info': ticker,
        };
        return ticker;
    },

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.currentGet24hourRollingAggregation (params);
        let result = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let base = ticker['currencyPair']['base'].toUpperCase ();
            let quote = ticker['currencyPair']['counter'].toUpperCase ();
            let symbol = base + '/' + quote;
            let market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let tickers = await this.fetchTickers (undefined, params);
        if (symbol in tickers)
            return tickers[symbol];
        throw new ExchangeError (this.id + ' return did not contain ' + symbol);
    },

    parseTrade (trade, market = undefined) {
        if (!market)
            market = this.markets_by_id[trade['currencyPair']];
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined, // type
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.currentGetTransactionsPairMaxCount (this.extend ({
            'pair': market['id'],
            'maxCount': 128,
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'currencyPair': this.marketId (symbol),
            'volume': amount,
            'price': price,
            'orderType': (side == 'buy') ? 0 : 1,
        };
        let response = await this.userPostAddOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['result'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.userPostCancelOrder ({ 'orderId': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'current') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = this.extend ({
                'token': this.apiKey,
                'nonce': nonce,
            }, query);
            let auth = nonce.toString () + '$' + this.apiKey;
            request['signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (request);
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var coinmarketcap = {

    'id': 'coinmarketcap',
    'name': 'CoinMarketCap',
    'rateLimit': 10000,
    'version': 'v1',
    'countries': 'US',
    'hasCORS': true,
    'hasPrivateAPI': false,
    'hasCreateOrder': false,
    'hasCancelOrder': false,
    'hasFetchBalance': false,
    'hasFetchOrderBook': false,
    'hasFetchTrades': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
        'api': 'https://api.coinmarketcap.com',
        'www': 'https://coinmarketcap.com',
        'doc': 'https://coinmarketcap.com/api',
    },
    'api': {
        'public': {
            'get': [
                'ticker/',
                'ticker/{id}/',
                'global/',
            ],
        },
    },
    'currencies': [
        'AUD',
        'BRL',
        'CAD',
        'CHF',
        'CNY',
        'EUR',
        'GBP',
        'HKD',
        'IDR',
        'INR',
        'JPY',
        'KRW',
        'MXN',
        'RUB',
        'USD',
    ],

    async fetchOrderBook (market, params = {}) {
        throw new ExchangeError ('Fetching order books is not supported by the API of ' + this.id);
    },

    async fetchMarkets () {
        let markets = await this.publicGetTicker ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            for (let c = 0; c < this.currencies.length; c++) {
                let base = market['symbol'];
                let baseId = market['id'];
                let quote = this.currencies[c];
                let quoteId = quote.toLowerCase ();
                let symbol = base + '/' + quote;
                let id = baseId + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                });
            }
        }
        return result;
    },

    async fetchGlobal (currency = 'USD') {
        await this.loadMarkets ();
        let request = {};
        if (currency)
            request['convert'] = currency;
        return this.publicGetGlobal (request);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        if ('last_updated' in ticker)
            if (ticker['last_updated'])
                timestamp = parseInt (ticker['last_updated']) * 1000;
        let volume = undefined;
        let volumeKey = '24h_volume_' + market['quoteId'];
        if (ticker[volumeKey])
            volume = parseFloat (ticker[volumeKey]);
        let price = 'price_' + market['quoteId'];
        let change = undefined;
        let changeKey = 'percent_change_24h';
        if (ticker[changeKey])
            change = parseFloat (ticker[changeKey]);
        let last = undefined;
        if (price in ticker)
            if (ticker[price])
                last = parseFloat (ticker[price]);
        let symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'ask': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    },

    async fetchTickers (currency = 'USD', params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (currency)
            request['convert'] = currency;
        let response = await this.publicGetTicker (this.extend (request, params));
        let tickers = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let id = ticker['id'] + '/' + currency;
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            tickers[symbol] = this.parseTicker (ticker, market);
        }
        return tickers;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'convert': market['quote'],
            'id': market['baseId'],
        }, params);
        let response = await this.publicGetTickerId (request);
        let ticker = response[0];
        return this.parseTicker (ticker, market);
    },

    request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var coinmate = {

    'id': 'coinmate',
    'name': 'CoinMate',
    'countries': [ 'GB', 'CZ' ], // UK, Czech Republic
    'rateLimit': 1000,
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg',
        'api': 'https://coinmate.io/api',
        'www': 'https://coinmate.io',
        'doc': [
            'http://docs.coinmate.apiary.io',
            'https://coinmate.io/developers',
        ],
    },
    'api': {
        'public': {
            'get': [
                'orderBook',
                'ticker',
                'transactions',
            ],
        },
        'private': {
            'post': [
                'balances',
                'bitcoinWithdrawal',
                'bitcoinDepositAddresses',
                'buyInstant',
                'buyLimit',
                'cancelOrder',
                'cancelOrderWithInfo',
                'createVoucher',
                'openOrders',
                'redeemVoucher',
                'sellInstant',
                'sellLimit',
                'transactionHistory',
                'unconfirmedBitcoinDeposits',
            ],
        },
    },
    'markets': {
        'BTC/EUR': { 'id': 'BTC_EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'BTC/CZK': { 'id': 'BTC_CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalances ();
        let balances = response['data'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balances) {
                account['free'] = balances[currency]['available'];
                account['used'] = balances[currency]['reserved'];
                account['total'] = balances[currency]['balance'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let response = await this.publicGetOrderBook (this.extend ({
            'currencyPair': this.marketId (symbol),
            'groupByPriceLimit': 'False',
        }, params));
        let orderbook = response['data'];
        let timestamp = orderbook['timestamp'] * 1000;
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetTicker (this.extend ({
            'currencyPair': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        let timestamp = ticker['timestamp'] * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['amount']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        if (!market)
            market = this.markets_by_id[trade['currencyPair']];
        return {
            'id': trade['transactionId'],
            'info': trade,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'currencyPair': market['id'],
            'minutesIntoHistory': 10,
        }, params));
        return this.parseTrades (response['data'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'currencyPair': this.marketId (symbol),
        };
        if (type == 'market') {
            if (side == 'buy')
                order['total'] = amount; // amount in fiat
            else
                order['amount'] = amount; // amount in fiat
            method += 'Instant';
        } else {
            order['amount'] = amount; // amount in crypto
            order['price'] = price;
            method += this.capitalize (type);
        }
        let response = await this[method] (self.extend (order, params));
        return {
            'info': response,
            'id': response['data'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder ({ 'orderId': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.urlencode (this.extend ({
                'clientId': this.uid,
                'nonce': nonce,
                'publicKey': this.apiKey,
                'signature': signature.toUpperCase (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            if (response['error'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var coinsecure = {

    'id': 'coinsecure',
    'name': 'Coinsecure',
    'countries': 'IN', // India
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg',
        'api': 'https://api.coinsecure.in',
        'www': 'https://coinsecure.in',
        'doc': [
            'https://api.coinsecure.in',
            'https://github.com/coinsecure/plugins',
        ],
    },
    'api': {
        'public': {
            'get': [
                'bitcoin/search/confirmation/{txid}',
                'exchange/ask/low',
                'exchange/ask/orders',
                'exchange/bid/high',
                'exchange/bid/orders',
                'exchange/lastTrade',
                'exchange/max24Hr',
                'exchange/min24Hr',
                'exchange/ticker',
                'exchange/trades',
            ],
        },
        'private': {
            'get': [
                'mfa/authy/call',
                'mfa/authy/sms',
                'netki/search/{netkiName}',
                'user/bank/otp/{number}',
                'user/kyc/otp/{number}',
                'user/profile/phone/otp/{number}',
                'user/wallet/coin/address/{id}',
                'user/wallet/coin/deposit/confirmed/all',
                'user/wallet/coin/deposit/confirmed/{id}',
                'user/wallet/coin/deposit/unconfirmed/all',
                'user/wallet/coin/deposit/unconfirmed/{id}',
                'user/wallet/coin/wallets',
                'user/exchange/bank/fiat/accounts',
                'user/exchange/bank/fiat/balance/available',
                'user/exchange/bank/fiat/balance/pending',
                'user/exchange/bank/fiat/balance/total',
                'user/exchange/bank/fiat/deposit/cancelled',
                'user/exchange/bank/fiat/deposit/unverified',
                'user/exchange/bank/fiat/deposit/verified',
                'user/exchange/bank/fiat/withdraw/cancelled',
                'user/exchange/bank/fiat/withdraw/completed',
                'user/exchange/bank/fiat/withdraw/unverified',
                'user/exchange/bank/fiat/withdraw/verified',
                'user/exchange/ask/cancelled',
                'user/exchange/ask/completed',
                'user/exchange/ask/pending',
                'user/exchange/bid/cancelled',
                'user/exchange/bid/completed',
                'user/exchange/bid/pending',
                'user/exchange/bank/coin/addresses',
                'user/exchange/bank/coin/balance/available',
                'user/exchange/bank/coin/balance/pending',
                'user/exchange/bank/coin/balance/total',
                'user/exchange/bank/coin/deposit/cancelled',
                'user/exchange/bank/coin/deposit/unverified',
                'user/exchange/bank/coin/deposit/verified',
                'user/exchange/bank/coin/withdraw/cancelled',
                'user/exchange/bank/coin/withdraw/completed',
                'user/exchange/bank/coin/withdraw/unverified',
                'user/exchange/bank/coin/withdraw/verified',
                'user/exchange/bank/summary',
                'user/exchange/coin/fee',
                'user/exchange/fiat/fee',
                'user/exchange/kycs',
                'user/exchange/referral/coin/paid',
                'user/exchange/referral/coin/successful',
                'user/exchange/referral/fiat/paid',
                'user/exchange/referrals',
                'user/exchange/trade/summary',
                'user/login/token/{token}',
                'user/summary',
                'user/wallet/summary',
                'wallet/coin/withdraw/cancelled',
                'wallet/coin/withdraw/completed',
                'wallet/coin/withdraw/unverified',
                'wallet/coin/withdraw/verified',
            ],
            'post': [
                'login',
                'login/initiate',
                'login/password/forgot',
                'mfa/authy/initiate',
                'mfa/ga/initiate',
                'signup',
                'user/netki/update',
                'user/profile/image/update',
                'user/exchange/bank/coin/withdraw/initiate',
                'user/exchange/bank/coin/withdraw/newVerifycode',
                'user/exchange/bank/fiat/withdraw/initiate',
                'user/exchange/bank/fiat/withdraw/newVerifycode',
                'user/password/change',
                'user/password/reset',
                'user/wallet/coin/withdraw/initiate',
                'wallet/coin/withdraw/newVerifycode',
            ],
            'put': [
                'signup/verify/{token}',
                'user/exchange/kyc',
                'user/exchange/bank/fiat/deposit/new',
                'user/exchange/ask/new',
                'user/exchange/bid/new',
                'user/exchange/instant/buy',
                'user/exchange/instant/sell',
                'user/exchange/bank/coin/withdraw/verify',
                'user/exchange/bank/fiat/account/new',
                'user/exchange/bank/fiat/withdraw/verify',
                'user/mfa/authy/initiate/enable',
                'user/mfa/ga/initiate/enable',
                'user/netki/create',
                'user/profile/phone/new',
                'user/wallet/coin/address/new',
                'user/wallet/coin/new',
                'user/wallet/coin/withdraw/sendToExchange',
                'user/wallet/coin/withdraw/verify',
            ],
            'delete': [
                'user/gcm/{code}',
                'user/logout',
                'user/exchange/bank/coin/withdraw/unverified/cancel/{withdrawID}',
                'user/exchange/bank/fiat/deposit/cancel/{depositID}',
                'user/exchange/ask/cancel/{orderID}',
                'user/exchange/bid/cancel/{orderID}',
                'user/exchange/bank/fiat/withdraw/unverified/cancel/{withdrawID}',
                'user/mfa/authy/disable/{code}',
                'user/mfa/ga/disable/{code}',
                'user/profile/phone/delete',
                'user/profile/image/delete/{netkiName}',
                'user/wallet/coin/withdraw/unverified/cancel/{withdrawID}',
            ],
        },
    },
    'markets': {
        'BTC/INR': { 'id': 'BTC/INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privateGetUserExchangeBankSummary ();
        let balance = response['message'];
        let coin = {
            'free': balance['availableCoinBalance'],
            'used': balance['pendingCoinBalance'],
            'total': balance['totalCoinBalance'],
        };
        let fiat = {
            'free': balance['availableFiatBalance'],
            'used': balance['pendingFiatBalance'],
            'total': balance['totalFiatBalance'],
        };
        let result = {
            'info': balance,
            'BTC': coin,
            'INR': fiat,
        };
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        let bids = await this.publicGetExchangeBidOrders (params);
        let asks = await this.publicGetExchangeAskOrders (params);
        let orderbook = {
            'bids': bids['message'],
            'asks': asks['message'],
        };
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'rate', 'vol');
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetExchangeTicker (params);
        let ticker = response['message'];
        let timestamp = ticker['timestamp'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['lastPrice']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['coinvolume']),
            'quoteVolume': parseFloat (ticker['fiatvolume']),
            'info': ticker,
        };
    },

    fetchTrades (market, params = {}) {
        return this.publicGetExchangeTrades (params);
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePutUserExchange';
        let order = {};
        if (type == 'market') {
            method += 'Instant' + this.capitalize (side);
            if (side == 'buy')
                order['maxFiat'] = amount;
            else
                order['maxVol'] = amount;
        } else {
            let direction = (side == 'buy') ? 'Bid' : 'Ask';
            method += direction + 'New';
            order['rate'] = price;
            order['vol'] = amount;
        }
        let response = await this[method] (self.extend (order, params));
        return {
            'info': response,
            'id': response['message']['orderID'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new ExchangeError (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        return await this[method] ({ 'orderID': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            headers = { 'Authorization': this.apiKey };
            if (Object.keys (query).length) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var coinspot = {

    'id': 'coinspot',
    'name': 'CoinSpot',
    'countries': 'AU', // Australia
    'rateLimit': 1000,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
        'api': {
            'public': 'https://www.coinspot.com.au/pubapi',
            'private': 'https://www.coinspot.com.au/api',
        },
        'www': 'https://www.coinspot.com.au',
        'doc': 'https://www.coinspot.com.au/api',
    },
    'api': {
        'public': {
            'get': [
                'latest',
            ],
        },
        'private': {
            'post': [
                'orders',
                'orders/history',
                'my/coin/deposit',
                'my/coin/send',
                'quote/buy',
                'quote/sell',
                'my/balances',
                'my/orders',
                'my/buy',
                'my/sell',
                'my/buy/cancel',
                'my/sell/cancel',
            ],
        },
    },
    'markets': {
        'BTC/AUD': { 'id': 'BTC', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
        'LTC/AUD': { 'id': 'LTC', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD' },
        'DOGE/AUD': { 'id': 'DOGE', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostMyBalances ();
        let result = { 'info': response };
        if ('balance' in response) {
            let balances = response['balance'];
            let currencies = Object.keys (balances);
            for (let c = 0; c < currencies.length; c++) {
                let currency = currencies[c];
                let uppercase = currency.toUpperCase ();
                let account = {
                    'free': balances[currency],
                    'used': 0.0,
                    'total': balances[currency],
                };
                if (uppercase == 'DRK')
                    uppercase = 'DASH';
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.privatePostOrders (this.extend ({
            'cointype': market['id'],
        }, params));
        let result = this.parseOrderBook (orderbook, undefined, 'buyorders', 'sellorders', 'rate', 'amount');
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetLatest (params);
        let id = this.marketId (symbol);
        id = id.toLowerCase ();
        let ticker = response['prices'][id];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    fetchTrades (market, params = {}) {
        return this.privatePostOrdersHistory (this.extend ({
            'cointype': this.marketId (market),
        }, params));
    },

    createOrder (market, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostMy' + this.capitalize (side);
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let order = {
            'cointype': this.marketId (market),
            'amount': amount,
            'rate': price,
        };
        return this[method] (this.extend (order, params));
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new ExchangeError (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privatePostMyBuy';
        return await this[method] ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        let url = this.urls['api'][api] + '/' + path;
        if (api == 'private') {
            let nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var cryptopia = {

    'id': 'cryptopia',
    'name': 'Cryptopia',
    'rateLimit': 1500,
    'countries': 'NZ', // New Zealand
    'hasFetchTickers': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchMyTrades': true,
    'hasCORS': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
        'api': 'https://www.cryptopia.co.nz/api',
        'www': 'https://www.cryptopia.co.nz',
        'doc': [
            'https://www.cryptopia.co.nz/Forum/Thread/255',
            'https://www.cryptopia.co.nz/Forum/Thread/256',
        ],
    },
    'api': {
        'public': {
            'get': [
                'GetCurrencies',
                'GetTradePairs',
                'GetMarkets',
                'GetMarkets/{id}',
                'GetMarkets/{hours}',
                'GetMarkets/{id}/{hours}',
                'GetMarket/{id}',
                'GetMarket/{id}/{hours}',
                'GetMarketHistory/{id}',
                'GetMarketHistory/{id}/{hours}',
                'GetMarketOrders/{id}',
                'GetMarketOrders/{id}/{count}',
                'GetMarketOrderGroups/{ids}/{count}',
            ],
        },
        'private': {
            'post': [
                'CancelTrade',
                'GetBalance',
                'GetDepositAddress',
                'GetOpenOrders',
                'GetTradeHistory',
                'GetTransactions',
                'SubmitTip',
                'SubmitTrade',
                'SubmitTransfer',
                'SubmitWithdraw',
            ],
        },
    },

    commonCurrencyCode (currency) {
        if (currency == 'CC')
            return 'CCX';
        return currency;
    },

    async fetchMarkets () {
        let response = await this.publicGetTradePairs ();
        let result = [];
        let markets = response['Data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['Id'];
            let symbol = market['Label'];
            let [ base, quote ] = symbol.split ('/');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let amountLimits = {
                'min': market['MinimumTrade'],
                'max': market['MaximumTrade']
            };
            let priceLimits = {
                'min': market['MinimumPrice'],
                'max': market['MaximumPrice'],
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'maker': market['TradeFee'] / 100,
                'taker': market['TradeFee'] / 100,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketOrdersId (this.extend ({
            'id': this.marketId (market),
        }, params));
        let orderbook = response['Data'];
        return this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['High']),
            'low': parseFloat (ticker['Low']),
            'bid': parseFloat (ticker['BidPrice']),
            'ask': parseFloat (ticker['AskPrice']),
            'vwap': undefined,
            'open': parseFloat (ticker['Open']),
            'close': parseFloat (ticker['Close']),
            'first': undefined,
            'last': parseFloat (ticker['LastPrice']),
            'change': parseFloat (ticker['Change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['Volume']),
            'quoteVolume': parseFloat (ticker['BaseVolume']),
        };
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketId (this.extend ({
            'id': market['id'],
        }, params));
        let ticker = response['Data'];
        return this.parseTicker (ticker, market);
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarkets (params);
        let result = {};
        let tickers = response['Data'];
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['TradePairId'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('Timestamp' in trade) {
            timestamp = trade['Timestamp'] * 1000;
        } else if ('TimeStamp' in trade) {
            timestamp = this.parse8601 (trade['TimeStamp']);
        }
        let price = this.safeFloat (trade, 'Price');
        if (!price)
            price = this.safeFloat (trade, 'Rate');
        let cost = this.safeFloat (trade, 'Total');
        let id = this.safeString (trade, 'TradeId');
        if (!market) {
            if ('TradePairId' in trade)
                if (trade['TradePairId'] in this.markets_by_id)
                    market = this.markets_by_id[trade['TradePairId']];
        }
        let symbol = undefined;
        let fee = undefined;
        if (market) {
            symbol = market['symbol'];
            if ('Fee' in trade) {
                fee = {
                    'currency': market['quote'],
                    'cost': trade['Fee'],
                };
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': trade['Type'].toLowerCase (),
            'price': price,
            'cost': cost,
            'amount': trade['Amount'],
            'fee': fee,
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketHistoryIdHours (this.extend ({
            'id': market['id'],
            'hours': 24, // default
        }, params));
        let trades = response['Data'];
        return this.parseTrades (trades, market);
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetTradeHistory (this.extend ({
            // 'Market': market['id'],
            'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 10, // max = 100
        }, params));
        return this.parseTrades (response['Data'], market);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetBalance ();
        let balances = response['Data'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let code = balance['Symbol'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': balance['Available'],
                'used': 0.0,
                'total': balance['Total'],
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        price = parseFloat (price);
        amount = parseFloat (amount);
        let request = {
            'TradePairId': market['id'],
            'Type': this.capitalize (side),
            'Rate': this.priceToPrecision (symbol, price),
            'Amount': this.amountToPrecision (symbol, amount),
        };
        let response = await this.privatePostSubmitTrade (this.extend (request, params));
        let id = response['Data']['OrderId'].toString ();
        let timestamp = this.milliseconds ();
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelTrade (this.extend ({
                'Type': 'Trade',
                'OrderId': id,
            }, params));
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'Error');
                if (message) {
                    if (message.indexOf ('does not exist') >= 0)
                        throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        return response;
    },

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else if ('Market' in order) {
            let id = order['Market'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = this.parse8601 (order['TimeStamp']);
        let amount = order['Amount'];
        let remaining = order['Remaining'];
        let filled = amount - remaining;
        return {
            'id': order['OrderId'].toString (),
            'info': this.omit (order, 'status'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': 'limit',
            'side': order['Type'].toLowerCase (),
            'price': order['Rate'],
            'cost': order['Total'],
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    },

    async fetchOrders (symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetOpenOrders ({
            // 'Market': market['id'],
            'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 100, // default = 100
        }, params);
        let orders = [];
        for (let i = 0; i < response['Data'].length; i++) {
            orders.push (this.extend (response['Data'][i], { 'status': 'open' }));
        }
        let openOrders = this.parseOrders (orders, market);
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (order['symbol'] == symbol)
                result.push (order);
        }
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] == id)
                return orders[i];
        }
        return undefined;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'open')
                result.push (orders[i]);
        }
        return result;
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'closed')
                result.push (orders[i]);
        }
        return result;
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostSubmitWithdraw (this.extend ({
            'Currency': currency,
            'Amount': amount,
            'Address': address, // Address must exist in you AddressBook in security settings
        }, params));
        return {
            'info': response,
            'id': response['Data'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let hash = this.hash (this.encode (body), 'md5', 'base64');
            let secret = this.base64ToBinary (this.secret);
            let uri = this.encodeURIComponent (url);
            let lowercase = uri.toLowerCase ();
            let payload = this.apiKey + method + lowercase + nonce + this.binaryToString (hash);
            let signature = this.hmac (this.encode (payload), secret, 'sha256', 'base64');
            let auth = 'amx ' + this.apiKey + ':' + this.binaryToString (signature) + ':' + nonce;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': auth,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response)
            if ('Success' in response)
                if (response['Success'])
                    return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var dsx = extend (btce, {

    'id': 'dsx',
    'name': 'DSX',
    'countries': 'UK',
    'rateLimit': 1500,
    'hasCORS': false,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchTickers': true,
    'hasFetchMyTrades': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
        'api': {
            'public': 'https://dsx.uk/mapi', // market data
            'private': 'https://dsx.uk/tapi', // trading
            'dwapi': 'https://dsx.uk/dwapi', // deposit/withdraw
        },
        'www': 'https://dsx.uk',
        'doc': [
            'https://api.dsx.uk',
            'https://dsx.uk/api_docs/public',
            'https://dsx.uk/api_docs/private',
            '',
        ],
    },
    'api': {
        // market data (public)
        'public': {
            'get': [
                'barsFromMoment/{id}/{period}/{start}', // empty reply :\
                'depth/{pair}',
                'info',
                'lastBars/{id}/{period}/{amount}', // period is (m, h or d)
                'periodBars/{id}/{period}/{start}/{end}',
                'ticker/{pair}',
                'trades/{pair}',
            ],
        },
        // trading (private)
        'private': {
            'post': [
                'getInfo',
                'TransHistory',
                'TradeHistory',
                'OrderHistory',
                'ActiveOrders',
                'Trade',
                'CancelOrder',
            ],
        },
        // deposit / withdraw (private)
        'dwapi': {
            'post': [
                'getCryptoDepositAddress',
                'cryptoWithdraw',
                'fiatWithdraw',
                'getTransactionStatus',
                'getTransactions',
            ],
        },
    },

    getBaseQuoteFromMarketId (id) {
        let uppercase = id.toUpperCase ();
        let base = uppercase.slice (0, 3);
        let quote = uppercase.slice (3, 6);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return [ base, quote ];
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            uppercase = this.commonCurrencyCode (uppercase);
            let account = {
                'free': funds[currency],
                'used': 0.0,
                'total': balances['total'][currency],
            };
            account['used'] = account['total'] - account['free'];
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    getOrderIdKey () {
        return 'orderId';
    },

    signBodyWithSecret (body) {
        return this.decode (this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64'));
    },

    getVersionString () {
        return ''; // they don't prepend version number to public URLs as other BTC-e clones do
    },
})

//-----------------------------------------------------------------------------

var exmo = {

    'id': 'exmo',
    'name': 'EXMO',
    'countries': [ 'ES', 'RU' ], // Spain, Russia
    'rateLimit': 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
    'version': 'v1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
        'api': 'https://api.exmo.com',
        'www': 'https://exmo.me',
        'doc': [
            'https://exmo.me/ru/api_doc',
            'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
        ],
    },
    'api': {
        'public': {
            'get': [
                'currency',
                'order_book',
                'pair_settings',
                'ticker',
                'trades',
            ],
        },
        'private': {
            'post': [
                'user_info',
                'order_create',
                'order_cancel',
                'user_open_orders',
                'user_trades',
                'user_cancelled_orders',
                'order_trades',
                'required_amount',
                'deposit_address',
                'withdraw_crypt',
                'withdraw_get_txid',
                'excode_create',
                'excode_load',
                'wallet_history',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetPairSettings ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let symbol = id.replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostUserInfo ();
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in response['balances'])
                account['free'] = parseFloat (response['balances'][currency]);
            if (currency in response['reserved'])
                account['used'] = parseFloat (response['reserved'][currency]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOrderBook (this.extend ({
            'pair': market['id'],
        }, params));
        let orderbook = response[market['id']];
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy_price']),
            'ask': parseFloat (ticker['sell_price']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_trade']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']),
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': parseFloat (ticker['vol_curr']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let result = {};
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (params);
        let market = this.market (symbol);
        return this.parseTicker (response[market['id']], market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['trade_id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response[market['id']], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let prefix = '';
        if (type == 'market')
            prefix = 'market_';
        let order = {
            'pair': this.marketId (symbol),
            'quantity': amount,
            'price': price || 0,
            'type': prefix + side,
        };
        let response = await this.privatePostOrderCreate (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_id': id });
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostWithdrawCrypt (this.extend ({
            'amount': amount,
            'currency': currency,
            'address': address,
        }, params));
        return {
            'info': result,
            'id': result['task_id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response) {
            if (response['result'])
                return response;
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var flowbtc = {

    'id': 'flowbtc',
    'name': 'flowBTC',
    'countries': 'BR', // Brazil
    'version': 'v1',
    'rateLimit': 1000,
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
        'api': 'https://api.flowbtc.com:8400/ajax',
        'www': 'https://trader.flowbtc.com',
        'doc': 'http://www.flowbtc.com.br/api/',
    },
    'api': {
        'public': {
            'post': [
                'GetTicker',
                'GetTrades',
                'GetTradesByDate',
                'GetOrderBook',
                'GetProductPairs',
                'GetProducts',
            ],
        },
        'private': {
            'post': [
                'CreateAccount',
                'GetUserInfo',
                'SetUserInfo',
                'GetAccountInfo',
                'GetAccountTrades',
                'GetDepositAddresses',
                'Withdraw',
                'CreateOrder',
                'ModifyOrder',
                'CancelOrder',
                'CancelAllOrders',
                'GetAccountOpenOrders',
                'GetOrderFee',
            ],
        },
    },

    async fetchMarkets () {
        let response = await this.publicPostGetProductPairs ();
        let markets = response['productPairs'];
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['name'];
            let base = market['product1Label'];
            let quote = market['product2Label'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['currencies'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['name'];
            let account = {
                'free': balance['balance'],
                'used': balance['hold'],
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicPostGetOrderBook (this.extend ({
            'productPair': market['id'],
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'px', 'qty');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicPostGetTicker (this.extend ({
            'productPair': market['id'],
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume24hr']),
            'quoteVolume': parseFloat (ticker['volume24hrProduct2']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['unixtime'] * 1000;
        let side = (trade['incomingOrderSide'] == 0) ? 'buy' : 'sell';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['px'],
            'amount': trade['qty'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicPostGetTrades (this.extend ({
            'ins': market['id'],
            'startIndex': -1,
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = (type == 'market') ? 1 : 0;
        let order = {
            'ins': this.marketId (symbol),
            'side': side,
            'orderType': orderType,
            'qty': amount,
            'px': price,
        };
        let response = await this.privatePostCreateOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['serverOrderId'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if ('ins' in params) {
            return await this.privatePostCancelOrder (this.extend ({
                'serverOrderId': id,
            }, params));
        }
        throw new ExchangeError (this.id + ' requires `ins` symbol parameter for cancelling an order');
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length) {
                body = this.json (params);
            }
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ();
            let auth = nonce.toString () + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
            body = this.json (this.extend ({
                'apiKey': this.apiKey,
                'apiNonce': nonce,
                'apiSig': signature.toUpperCase (),
            }, params));
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('isAccepted' in response)
            if (response['isAccepted'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var foxbit = extend (blinktrade, {
    'id': 'foxbit',
    'name': 'FoxBit',
    'countries': 'BR',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://foxbit.exchange',
        'doc': 'https://blinktrade.com/docs',
    },
    'comment': 'Blinktrade API',
    'markets': {
        'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit' },
    },
})

//-----------------------------------------------------------------------------

var fyb = {

    'rateLimit': 1500,
    'api': {
        'public': {
            'get': [
                'ticker',
                'tickerdetailed',
                'orderbook',
                'trades',
            ],
        },
        'private': {
            'post': [
                'test',
                'getaccinfo',
                'getpendingorders',
                'getorderhistory',
                'cancelpendingorder',
                'placeorder',
                'withdraw',
            ],
        },
    },

    async fetchBalance (params = {}) {
        let balance = await this.privatePostGetaccinfo ();
        let btc = parseFloat (balance['btcBal']);
        let symbol = this.symbols[0];
        let quote = this.markets[symbol]['quote'];
        let lowercase = quote.toLowerCase () + 'Bal';
        let fiat = parseFloat (balance[lowercase]);
        let crypto = {
            'free': btc,
            'used': 0.0,
            'total': btc,
        };
        let result = { 'BTC': crypto };
        result[quote] = {
            'free': fiat,
            'used': 0.0,
            'total': fiat,
        };
        result['info'] = balance;
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetOrderbook (params);
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTickerdetailed (params);
        let timestamp = this.milliseconds ();
        let last = undefined;
        let volume = undefined;
        if ('last' in ticker)
            last = parseFloat (ticker['last']);
        if ('vol' in ticker)
            volume = parseFloat (ticker['vol']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (params);
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostPlaceorder (this.extend ({
            'qty': amount,
            'price': price,
            'type': side[0].toUpperCase ()
        }, params));
        return {
            'info': response,
            'id': response['pending_oid'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelpendingorder ({ 'orderNo': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            url += '.json';
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sig': this.hmac (this.encode (body), this.encode (this.secret), 'sha1')
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'private')
            if ('error' in response)
                if (response['error'])
                    throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var fybse = extend (fyb, {
    'id': 'fybse',
    'name': 'FYB-SE',
    'countries': 'SE', // Sweden
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
        'api': 'https://www.fybse.se/api/SEK',
        'www': 'https://www.fybse.se',
        'doc': 'http://docs.fyb.apiary.io',
    },
    'markets': {
        'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
    },
})

//-----------------------------------------------------------------------------

var fybsg = extend (fyb, {
    'id': 'fybsg',
    'name': 'FYB-SG',
    'countries': 'SG', // Singapore
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
        'api': 'https://www.fybsg.com/api/SGD',
        'www': 'https://www.fybsg.com',
        'doc': 'http://docs.fyb.apiary.io',
    },
    'markets': {
        'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
    },
})

//-----------------------------------------------------------------------------

var gatecoin = {

    'id': 'gatecoin',
    'name': 'Gatecoin',
    'rateLimit': 2000,
    'countries': 'HK', // Hong Kong
    'comment': 'a regulated/licensed exchange',
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'timeframes': {
        '1m': '1m',
        '15m': '15m',
        '1h': '1h',
        '6h': '6h',
        '1d': '24h',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg',
        'api': 'https://api.gatecoin.com',
        'www': 'https://gatecoin.com',
        'doc': [
            'https://gatecoin.com/api',
            'https://github.com/Gatecoin/RESTful-API-Implementation',
            'https://api.gatecoin.com/swagger-ui/index.html',
        ],
    },
    'api': {
        'public': {
            'get': [
                'Public/ExchangeRate', // Get the exchange rates
                'Public/LiveTicker', // Get live ticker for all currency
                'Public/LiveTicker/{CurrencyPair}', // Get live ticker by currency
                'Public/LiveTickers', // Get live ticker for all currency
                'Public/MarketDepth/{CurrencyPair}', // Gets prices and market depth for the currency pair.
                'Public/NetworkStatistics/{DigiCurrency}', // Get the network status of a specific digital currency
                'Public/StatisticHistory/{DigiCurrency}/{Typeofdata}', // Get the historical data of a specific digital currency
                'Public/TickerHistory/{CurrencyPair}/{Timeframe}', // Get ticker history
                'Public/Transactions/{CurrencyPair}', // Gets recent transactions
                'Public/TransactionsHistory/{CurrencyPair}', // Gets all transactions
                'Reference/BusinessNatureList', // Get the business nature list.
                'Reference/Countries', // Get the country list.
                'Reference/Currencies', // Get the currency list.
                'Reference/CurrencyPairs', // Get the currency pair list.
                'Reference/CurrentStatusList', // Get the current status list.
                'Reference/IdentydocumentTypes', // Get the different types of identity documents possible.
                'Reference/IncomeRangeList', // Get the income range list.
                'Reference/IncomeSourceList', // Get the income source list.
                'Reference/VerificationLevelList', // Get the verif level list.
                'Stream/PublicChannel', // Get the public pubnub channel list
            ],
            'post': [
                'Export/Transactions', // Request a export of all trades from based on currencypair, start date and end date
                'Ping', // Post a string, then get it back.
                'Public/Unsubscribe/{EmailCode}', // Lets the user unsubscribe from emails
                'RegisterUser', // Initial trader registration.
            ],
        },
        'private': {
            'get': [
                'Account/CorporateData', // Get corporate account data
                'Account/DocumentAddress', // Check if residence proof uploaded
                'Account/DocumentCorporation', // Check if registered document uploaded
                'Account/DocumentID', // Check if ID document copy uploaded
                'Account/DocumentInformation', // Get Step3 Data
                'Account/Email', // Get user email
                'Account/FeeRate', // Get fee rate of logged in user
                'Account/Level', // Get verif level of logged in user
                'Account/PersonalInformation', // Get Step1 Data
                'Account/Phone', // Get user phone number
                'Account/Profile', // Get trader profile
                'Account/Questionnaire', // Fill the questionnaire
                'Account/Referral', // Get referral information
                'Account/ReferralCode', // Get the referral code of the logged in user
                'Account/ReferralNames', // Get names of referred traders
                'Account/ReferralReward', // Get referral reward information
                'Account/ReferredCode', // Get referral code
                'Account/ResidentInformation', // Get Step2 Data
                'Account/SecuritySettings', // Get verif details of logged in user
                'Account/User', // Get all user info
                'APIKey/APIKey', // Get API Key for logged in user
                'Auth/ConnectionHistory', // Gets connection history of logged in user
                'Balance/Balances', // Gets the available balance for each currency for the logged in account.
                'Balance/Balances/{Currency}', // Gets the available balance for s currency for the logged in account.
                'Balance/Deposits', // Get all account deposits, including wire and digital currency, of the logged in user
                'Balance/Withdrawals', // Get all account withdrawals, including wire and digital currency, of the logged in user
                'Bank/Accounts/{Currency}/{Location}', // Get internal bank account for deposit
                'Bank/Transactions', // Get all account transactions of the logged in user
                'Bank/UserAccounts', // Gets all the bank accounts related to the logged in user.
                'Bank/UserAccounts/{Currency}', // Gets all the bank accounts related to the logged in user.
                'ElectronicWallet/DepositWallets', // Gets all crypto currency addresses related deposits to the logged in user.
                'ElectronicWallet/DepositWallets/{DigiCurrency}', // Gets all crypto currency addresses related deposits to the logged in user by currency.
                'ElectronicWallet/Transactions', // Get all digital currency transactions of the logged in user
                'ElectronicWallet/Transactions/{DigiCurrency}', // Get all digital currency transactions of the logged in user
                'ElectronicWallet/UserWallets', // Gets all external digital currency addresses related to the logged in user.
                'ElectronicWallet/UserWallets/{DigiCurrency}', // Gets all external digital currency addresses related to the logged in user by currency.
                'Info/ReferenceCurrency', // Get user's reference currency
                'Info/ReferenceLanguage', // Get user's reference language
                'Notification/Messages', // Get from oldest unread + 3 read message to newest messages
                'Trade/Orders', // Gets open orders for the logged in trader.
                'Trade/Orders/{OrderID}', // Gets an order for the logged in trader.
                'Trade/StopOrders', // Gets all stop orders for the logged in trader. Max 1000 record.
                'Trade/StopOrdersHistory', // Gets all stop orders for the logged in trader. Max 1000 record.
                'Trade/Trades', // Gets all transactions of logged in user
                'Trade/UserTrades', // Gets all transactions of logged in user
            ],
            'post': [
                'Account/DocumentAddress', // Upload address proof document
                'Account/DocumentCorporation', // Upload registered document document
                'Account/DocumentID', // Upload ID document copy
                'Account/Email/RequestVerify', // Request for verification email
                'Account/Email/Verify', // Verification email
                'Account/GoogleAuth', // Enable google auth
                'Account/Level', // Request verif level of logged in user
                'Account/Questionnaire', // Fill the questionnaire
                'Account/Referral', // Post a referral email
                'APIKey/APIKey', // Create a new API key for logged in user
                'Auth/ChangePassword', // Change password.
                'Auth/ForgotPassword', // Request reset password
                'Auth/ForgotUserID', // Request user id
                'Auth/Login', // Trader session log in.
                'Auth/Logout', // Logout from the current session.
                'Auth/LogoutOtherSessions', // Logout other sessions.
                'Auth/ResetPassword', // Reset password
                'Bank/Transactions', // Request a transfer from the traders account of the logged in user. This is only available for bank account
                'Bank/UserAccounts', // Add an account the logged in user
                'ElectronicWallet/DepositWallets/{DigiCurrency}', // Add an digital currency addresses to the logged in user.
                'ElectronicWallet/Transactions/Deposits/{DigiCurrency}', // Get all internal digital currency transactions of the logged in user
                'ElectronicWallet/Transactions/Withdrawals/{DigiCurrency}', // Get all external digital currency transactions of the logged in user
                'ElectronicWallet/UserWallets/{DigiCurrency}', // Add an external digital currency addresses to the logged in user.
                'ElectronicWallet/Withdrawals/{DigiCurrency}', // Request a transfer from the traders account to an external address. This is only available for crypto currencies.
                'Notification/Messages', // Mark all as read
                'Notification/Messages/{ID}', // Mark as read
                'Trade/Orders', // Place an order at the exchange.
                'Trade/StopOrders', // Place a stop order at the exchange.
            ],
            'put': [
                'Account/CorporateData', // Update user company data for corporate account
                'Account/DocumentID', // Update ID document meta data
                'Account/DocumentInformation', // Update Step3 Data
                'Account/Email', // Update user email
                'Account/PersonalInformation', // Update Step1 Data
                'Account/Phone', // Update user phone number
                'Account/Questionnaire', // update the questionnaire
                'Account/ReferredCode', // Update referral code
                'Account/ResidentInformation', // Update Step2 Data
                'Account/SecuritySettings', // Update verif details of logged in user
                'Account/User', // Update all user info
                'Bank/UserAccounts', // Update the label of existing user bank accounnt
                'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Update the name of an address
                'ElectronicWallet/UserWallets/{DigiCurrency}', // Update the name of an external address
                'Info/ReferenceCurrency', // User's reference currency
                'Info/ReferenceLanguage', // Update user's reference language
            ],
            'delete': [
                'APIKey/APIKey/{PublicKey}', // Remove an API key
                'Bank/Transactions/{RequestID}', // Delete pending account withdraw of the logged in user
                'Bank/UserAccounts/{Currency}/{Label}', // Delete an account of the logged in user
                'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Delete an digital currency addresses related to the logged in user.
                'ElectronicWallet/UserWallets/{DigiCurrency}/{AddressName}', // Delete an external digital currency addresses related to the logged in user.
                'Trade/Orders', // Cancels all existing order
                'Trade/Orders/{OrderID}', // Cancels an existing order
                'Trade/StopOrders', // Cancels all existing stop orders
                'Trade/StopOrders/{ID}', // Cancels an existing stop order
            ],
        },
    },

    async fetchMarkets () {
        let response = await this.publicGetPublicLiveTickers ();
        let markets = response['tickers'];
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['currencyPair'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalanceBalances ();
        let balances = response['balances'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': balance['availableBalance'],
                'used': this.sum (
                    balance['pendingIncoming'],
                    balance['pendingOutgoing'],
                    balance['openOrder']),
                'total': balance['balance'],
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetPublicMarketDepthCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'volume');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = parseInt (ticker['createDateTime']) * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetPublicLiveTickers (params);
        let tickers = response['tickers'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['currencyPair'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicLiveTickerCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        let ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let side = undefined;
        let order = undefined;
        if ('way' in trade) {
            side = (trade['way'] == 'bid') ? 'buy' : 'sell';
            let orderId = trade['way'] + 'OrderId';
            order = trade[orderId];
        }
        let timestamp = parseInt (trade['transactionTime']) * 1000;
        if (!market)
            market = this.markets_by_id[trade['currencyPair']];
        return {
            'info': trade,
            'id': trade['transactionId'].toString (),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['quantity'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicTransactionsCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        return this.parseTrades (response['transactions'], market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv['createDateTime']) * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            undefined,
            ohlcv['volume'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'CurrencyPair': market['id'],
            'Timeframe': this.timeframes[timeframe],
        };
        if (limit)
            request['Count'] = limit;
        request = this.extend (request, params);
        let response = await this.publicGetPublicTickerHistoryCurrencyPairTimeframe (request);
        return this.parseOHLCVs (response['tickers'], market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'Code': this.marketId (symbol),
            'Way': (side == 'buy') ? 'Bid' : 'Ask',
            'Amount': amount,
        };
        if (type == 'limit')
            order['Price'] = price;
        if (this.twofa) {
            if ('ValidationCode' in params)
                order['ValidationCode'] = params['ValidationCode'];
            else
                throw new AuthenticationError (this.id + ' two-factor authentication requires a missing ValidationCode parameter');
        }
        let response = await this.privatePostTradeOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['clOrderId'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteTradeOrdersOrderID ({ 'OrderID': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let contentType = (method == 'GET') ? '' : 'application/json';
            let auth = method + url + contentType + nonce.toString ();
            auth = auth.toLowerCase ();
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'API_PUBLIC_KEY': this.apiKey,
                'API_REQUEST_SIGNATURE': signature,
                'API_REQUEST_DATE': nonce,
            };
            if (method != 'GET') {
                headers['Content-Type'] = contentType;
                body = this.json (this.extend ({ 'nonce': nonce }, params));
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('responseStatus' in response)
            if ('message' in response['responseStatus'])
                if (response['responseStatus']['message'] == 'OK')
                    return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var gdax = {
    'id': 'gdax',
    'name': 'GDAX',
    'countries': 'US',
    'rateLimit': 1000,
    'hasCORS': true,
    'hasFetchOHLCV': true,
    'hasWithdraw': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'timeframes': {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '30m': 1800,
        '1h': 3600,
        '2h': 7200,
        '4h': 14400,
        '12h': 43200,
        '1d': 86400,
        '1w': 604800,
        '1M': 2592000,
        '1y': 31536000,
    },
    'urls': {
        'test': 'https://api-public.sandbox.gdax.com',
        'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
        'api': 'https://api.gdax.com',
        'www': 'https://www.gdax.com',
        'doc': 'https://docs.gdax.com',
    },
    'api': {
        'public': {
            'get': [
                'currencies',
                'products',
                'products/{id}/book',
                'products/{id}/candles',
                'products/{id}/stats',
                'products/{id}/ticker',
                'products/{id}/trades',
                'time',
            ],
        },
        'private': {
            'get': [
                'accounts',
                'accounts/{id}',
                'accounts/{id}/holds',
                'accounts/{id}/ledger',
                'coinbase-accounts',
                'fills',
                'funding',
                'orders',
                'orders/{id}',
                'payment-methods',
                'position',
                'reports/{id}',
                'users/self/trailing-volume',
            ],
            'post': [
                'deposits/coinbase-account',
                'deposits/payment-method',
                'funding/repay',
                'orders',
                'position/close',
                'profiles/margin-transfer',
                'reports',
                'withdrawals/coinbase',
                'withdrawals/crypto',
                'withdrawals/payment-method',
            ],
            'delete': [
                'orders',
                'orders/{id}',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quote_currency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccounts ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['hold']),
                'total': parseFloat (balance['balance']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdBook (this.extend ({
            'id': this.marketId (market),
            'level': 2, // 1 best bidask, 2 aggregated, 3 full
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'id': market['id'],
        }, params);
        let ticker = await this.publicGetProductsIdTicker (request);
        let quote = await this.publicGetProductsIdStats (request);
        let timestamp = this.parse8601 (ticker['time']);
        let bid = undefined;
        let ask = undefined;
        if ('bid' in ticker)
            bid = parseFloat (ticker['bid']);
        if ('ask' in ticker)
            ask = parseFloat (ticker['ask']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (quote['high']),
            'low': parseFloat (quote['low']),
            'bid': bid,
            'ask': ask,
            'vwap': undefined,
            'open': parseFloat (quote['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (quote['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (['time']);
        // let type = undefined;
        return {
            'id': trade['trade_id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['size']),
        };
    },

    async fetchTrades (market, params = {}) {
        await this.loadMarkets ();
        return await this.publicGetProductsIdTrades (this.extend ({
            'id': this.marketId (market), // fixes issue #2
        }, params));
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            ohlcv[3],
            ohlcv[2],
            ohlcv[1],
            ohlcv[4],
            ohlcv[5],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let granularity = this.timeframes[timeframe];
        let request = {
            'id': market['id'],
            'granularity': granularity,
        };
        if (since) {
            request['start'] = this.iso8601 (since);
            if (!limit)
                limit = 200; // max = 200
            request['end'] = this.iso8601 (limit * granularity * 1000 + since);
        }
        let response = await this.publicGetProductsIdCandles (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    },

    async fetchTime () {
        let response = this.publicGetTime ();
        return this.parse8601 (response['iso']);
    },

    getOrderStatus (status) {
        let statuses = {
            'pending': 'open',
            'active': 'open',
            'open': 'partial',
            'done': 'closed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    },

    parseOrder (order, market = undefined) {
        let timestamp = this.parse8601 (order['created_at']);
        let symbol = undefined;
        if (!market) {
            if (order['product_id'] in this.markets_by_id)
                market = this.markets_by_id[order['product_id']];
        }
        let status = this.getOrderStatus (order['status']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled_size');
        let remaining = amount - filled;
        let cost = this.safeFloat (order, 'executed_value');
        if (market)
            symbol = market['symbol'];
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
        };
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response);
    },

    async fetchOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'status': 'all',
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'status': 'done',
        };
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // let oid = this.nonce ().toString ();
        let order = {
            'product_id': this.marketId (market),
            'side': side,
            'size': amount,
            'type': type,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrdersId ({ 'id': id });
    },

    async getPaymentMethods () {
        let response = await this.privateGetPaymentMethods ();
        return response;
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        if ('payment_method_id' in params) {
            response = await this.privatePostWithdrawalsPaymentMethod (this.extend ({
                'currency': currency,
                'amount': amount,
            }, params));
        } else {
            response = await this.privatePostWithdrawalsCrypto (this.extend ({
                'currency': currency,
                'amount': amount,
                'crypto_address': address,
            }, params));
        }
        if (!response)
            throw ExchangeError (this.id + ' withdraw() error: ' + this.json (response));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method == 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + request;
        if (api == 'private') {
            if (!this.apiKey)
                throw new AuthenticationError (this.id + ' requires apiKey property for authentication and trading');
            if (!this.secret)
                throw new AuthenticationError (this.id + ' requires secret property for authentication and trading');
            if (!this.password)
                throw new AuthenticationError (this.id + ' requires password property for authentication and trading');
            let nonce = this.nonce ().toString ();
            let payload = '';
            if (method == 'POST') {
                if (Object.keys (query).length)
                    body = this.json (query);
                    payload = body;
            }
            // let payload = (body) ? body : '';
            let what = nonce + method + request + payload;
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': this.decode (signature),
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var gemini = {
    'id': 'gemini',
    'name': 'Gemini',
    'countries': 'US',
    'rateLimit': 1500, // 200 for private API
    'version': 'v1',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
        'api': 'https://api.gemini.com',
        'www': 'https://gemini.com',
        'doc': 'https://docs.gemini.com/rest-api',
    },
    'api': {
        'public': {
            'get': [
                'symbols',
                'pubticker/{symbol}',
                'book/{symbol}',
                'trades/{symbol}',
                'auction/{symbol}',
                'auction/{symbol}/history',
            ],
        },
        'private': {
            'post': [
                'order/new',
                'order/cancel',
                'order/cancel/session',
                'order/cancel/all',
                'order/status',
                'orders',
                'mytrades',
                'tradevolume',
                'balances',
                'deposit/{currency}/newAddress',
                'withdraw/{currency}',
                'heartbeat',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let id = markets[p];
            let market = id;
            let uppercase = market.toUpperCase ();
            let base = uppercase.slice (0, 3);
            let quote = uppercase.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (market),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPubtickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let timestamp = ticker['volume']['timestamp'];
        let baseVolume = market['base'];
        let quoteVolume = market['quote'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume'][baseVolume]),
            'quoteVolume': parseFloat (ticker['volume'][quoteVolume]),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['timestampms'];
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostBalances ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': parseFloat (balance['available']),
                'used': 0.0,
                'total': parseFloat (balance['amount']),
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let order = {
            'client_order_id': this.nonce (),
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'price': price.toString (),
            'side': side,
            'type': 'exchange limit', // gemini allows limit orders only
        };
        let response = await this.privatePostOrderNew (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'order_id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = this.extend ({
                'request': url,
                'nonce': nonce,
            }, query);
            let payload = this.json (request);
            payload = this.stringToBase64 (this.encode (payload));
            let signature = this.hmac (payload, this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'text/plain',
                'X-GEMINI-APIKEY': this.apiKey,
                'X-GEMINI-PAYLOAD': payload,
                'X-GEMINI-SIGNATURE': signature,
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response)
            if (response['result'] == 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var hitbtc = {

    'id': 'hitbtc',
    'name': 'HitBTC',
    'countries': 'HK', // Hong Kong
    'rateLimit': 1500,
    'version': '1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOrder': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
        'api': 'http://api.hitbtc.com',
        'www': 'https://hitbtc.com',
        'doc': [
            'https://hitbtc.com/api',
            'http://hitbtc-com.github.io/hitbtc-api',
            'http://jsfiddle.net/bmknight/RqbYB',
        ],
    },
    'api': {
        'public': {
            'get': [
                '{symbol}/orderbook',
                '{symbol}/ticker',
                '{symbol}/trades',
                '{symbol}/trades/recent',
                'symbols',
                'ticker',
                'time,'
            ],
        },
        'trading': {
            'get': [
                'balance',
                'orders/active',
                'orders/recent',
                'order',
                'trades/by/order',
                'trades',
            ],
            'post': [
                'new_order',
                'cancel_order',
                'cancel_orders',
            ],
        },
        'payment': {
            'get': [
                'balance',
                'address/{currency}',
                'transactions',
                'transactions/{transaction}',
            ],
            'post': [
                'transfer_to_trading',
                'transfer_to_main',
                'address/{currency}',
                'payout',
            ],
        }
    },

    async fetchMarkets () {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < markets['symbols'].length; p++) {
            let market = markets['symbols'][p];
            let id = market['symbol'];
            let base = market['commodity'];
            let quote = market['currency'];
            let lot = parseFloat (market['lot']);
            let step = parseFloat (market['step']);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let method = this.safeString (params, 'type', 'trading');
        method += 'GetBalance';
        let query = this.omit (params, 'type');
        let response = await this[method] (query);
        let balances = response['balance'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['currency_code'];
            let currency = this.commonCurrencyCode (code);
            let free = this.safeFloat (balance, 'cash', 0.0);
            free = this.safeFloat (balance, 'balance', free);
            let used = this.safeFloat (balance, 'reserved', 0.0);
            let account = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetSymbolOrderbook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume_quote'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetSymbolTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        return {
            'info': trade,
            'id': trade[0],
            'timestamp': trade[3],
            'datetime': this.iso8601 (trade[3]),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade[4],
            'price': parseFloat (trade[1]),
            'amount': parseFloat (trade[2]),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetSymbolTrades (this.extend ({
            'symbol': market['id'],
            // 'from': 0,
            // 'till': 100,
            // 'by': 'ts', // or by trade_id
            // 'sort': 'desc', // or asc
            // 'start_index': 0,
            // 'max_results': 1000,
            // 'format_item': 'object',
            // 'format_price': 'number',
            // 'format_amount': 'number',
            // 'format_tid': 'string',
            // 'format_timestamp': 'millisecond',
            // 'format_wrap': false,
            'side': 'true',
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // check if amount can be evenly divided into lots
        // they want integer quantity in lot units
        let quantity = parseFloat (amount) / market['lot'];
        let wholeLots = Math.round (quantity);
        let difference = quantity - wholeLots;
        if (Math.abs (difference) > market['step'])
            throw new ExchangeError (this.id + ' order amount should be evenly divisible by lot unit size of ' + market['lot'].toString ());
        let clientOrderId = this.milliseconds ();
        let order = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': wholeLots.toString (), // quantity in integer lot units
            'type': type,
        };
        if (type == 'limit') {
            order['price'] = price.toFixed (10);
        } else {
            order['timeInForce'] = 'FOK';
        }
        let response = await this.tradingPostNewOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['ExecutionReport']['clientOrderId'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.tradingPostCancelOrder (this.extend ({
            'clientOrderId': id,
        }, params));
    },

    parseOrders (orders, market = undefined) {
        let result = [];
        let ids = Object.keys (orders);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.parseOrder (order, market));
        }
        return result;
    },

    getOrderStatus (status) {
        let statuses = {
            'new': 'open',
            'partiallyFilled': 'partial',
            'filled': 'closed',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        };
        return this.safeString (statuses, status);
    },

    parseOrder (order, market = undefined) {
        let timestamp = parseInt (order['lastTimestamp']);
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['symbol']];
        let status = this.safeString (order, 'orderStatus');
        if (status)
            status = this.getOrderStatus (status);
        let averagePrice = this.safeFloat (order, 'avgPrice', 0.0);
        let price = this.safeFloat (order, 'orderPrice');
        let amount = this.safeFloat (order, 'orderQuantity');
        let remaining = this.safeFloat (order, 'quantityLeaves');
        let filled = undefined;
        let cost = undefined;
        if (market) {
            symbol = market['symbol'];
            amount *= market['lot'];
            remaining *= market['lot'];
        }
        if (amount && remaining) {
            filled = amount - remaining;
            cost = averagePrice * filled;
        }
        return {
            'id': order['clientOrderId'].toString (),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
        };
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.tradingGetOrder (this.extend ({
            'client_order_id': id,
        }, params));
        return this.parseOrder (response['orders'][0]);
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let statuses = [ 'new', 'partiallyFiiled' ];
        let market = this.market (symbol);
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
        };
        if (market)
            request['symbols'] = market['id'];
        let response = await this.tradingGetOrdersActive (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let statuses = [ 'filled', 'canceled', 'rejected', 'expired' ];
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
            'max_results': 1000,
        };
        if (market)
            request['symbols'] = market['id'];
        let response = await this.tradingGetOrdersRecent (this.extend (request, params));
        return this.parseOrders (response['orders'], market);
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.paymentPostPayout (this.extend ({
            'currency_code': currency,
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['transaction'],
        };
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + 'api' + '/' + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let payload = { 'nonce': nonce, 'apikey': this.apiKey };
            query = this.extend (payload, query);
            if (method == 'GET')
                url += '?' + this.urlencode (query);
            else
                url += '?' + this.urlencode (payload);
            let auth = url;
            if (method == 'POST') {
                if (Object.keys (query).length) {
                    body = this.urlencode (query);
                    auth += body;
                }
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512').toLowerCase (),
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if ('ExecutionReport' in response) {
                if (response['ExecutionReport']['orderRejectReason'] == 'orderExceedsLimit')
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
            }
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    },
}


//-----------------------------------------------------------------------------

var hitbtc2 = extend (hitbtc, {

    'id': 'hitbtc2',
    'name': 'HitBTC v2',
    'countries': 'HK', // Hong Kong
    'rateLimit': 1500,
    'version': '2',
    'hasCORS': true,
    'hasFetchTickers': true,
    'hasFetchOrders': false,
    'hasFetchOpenOrders': false,
    'hasFetchClosedOrders': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
        'api': 'https://api.hitbtc.com',
        'www': 'https://hitbtc.com',
        'doc': [
            'https://api.hitbtc.com/api/2/explore',
            'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
        ],
    },
    'api': {
        'public': {
            'get': [
                'symbol', // Available Currency Symbols
                'symbol/{symbol}', // Get symbol info
                'currency', // Available Currencies
                'currency/{currency}', // Get currency info
                'ticker', // Ticker list for all symbols
                'ticker/{symbol}', // Ticker for symbol
                'trades/{symbol}', // Trades
                'orderbook/{symbol}', // Orderbook
            ],
        },
        'private': {
            'get': [
                'order', // List your current open orders
                'order/{clientOrderId}', // Get a single order by clientOrderId
                'trading/balance', // Get trading balance
                'trading/fee/{symbol}', // Get trading fee rate
                'history/trades', // Get historical trades
                'history/order', // Get historical orders
                'history/order/{id}/trades', // Get historical trades by specified order
                'account/balance', // Get main acccount balance
                'account/transactions', // Get account transactions
                'account/transactions/{id}', // Get account transaction by id
                'account/crypto/address/{currency}', // Get deposit crypro address
            ],
            'post': [
                'order', // Create new order
                'account/crypto/withdraw', // Withdraw crypro
                'account/crypto/address/{currency}', // Create new deposit crypro address
                'account/transfer', // Transfer amount to trading
            ],
            'put': [
                'order/{clientOrderId}', // Create new order
                'account/crypto/withdraw/{id}', // Commit withdraw crypro
            ],
            'delete': [
                'order', // Cancel all open orders
                'order/{clientOrderId}', // Cancel order
                'account/crypto/withdraw/{id}', // Rollback withdraw crypro
            ],
            'patch': [
                'order/{clientOrderId}', // Cancel Replace order
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetSymbol ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let base = market['baseCurrency'];
            let quote = market['quoteCurrency'];
            let lot = market['quantityIncrement'];
            let step = market['tickSize'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetTradingBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['currency'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['reserved']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bid', 'ask', 'price', 'size');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['timestamp']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'close'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['symbol'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['quantity']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let clientOrderId = this.milliseconds ();
        amount = parseFloat (amount);
        let order = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': amount.toString (),
            'type': type,
        };
        if (type == 'limit') {
            price = parseFloat (price);
            order['price'] = price.toFixed (10);
        } else {
            order['timeInForce'] = 'FOK';
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['clientOrderId'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrderClientOrderId (this.extend ({
            'clientOrderId': id,
        }, params));
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        amount = parseFloat (amount);
        let response = await this.privatePostAccountCryptoWithdraw (this.extend ({
            'currency': currency,
            'amount': amount.toString (),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api' + '/' + this.version + '/';
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            url += api + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            url += this.implodeParams (path, params) + '?' + this.urlencode (query);
            if (method != 'GET')
                if (Object.keys (query).length)
                    body = this.json (query);
            let payload = this.encode (this.apiKey + ':' + this.secret);
            let auth = this.stringToBase64 (payload);
            headers = {
                'Authorization': "Basic " + this.decode (auth),
                'Content-Type': 'application/json',
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
})

//-----------------------------------------------------------------------------

var huobi1 = {

    'id': 'huobi1',
    'name': 'Huobi v1',
    'countries': 'CN',
    'rateLimit': 2000,
    'version': 'v1',
    'hasFetchOHLCV': true,
    'accounts': undefined,
    'accountsById': undefined,
    'timeframes': {
        '1m': '1min',
        '5m': '5min',
        '15m': '15min',
        '30m': '30min',
        '1h': '60min',
        '1d': '1day',
        '1w': '1week',
        '1M': '1mon',
        '1y': '1year',
    },
    'api': {
        'market': {
            'get': [
                'history/kline', // 获取K线数据
                'detail/merged', // 获取聚合行情(Ticker)
                'depth', // 获取 Market Depth 数据
                'trade', // 获取 Trade Detail 数据
                'history/trade', // 批量获取最近的交易记录
                'detail', // 获取 Market Detail 24小时成交量数据
            ],
        },
        'public': {
            'get': [
                'common/symbols', // 查询系统支持的所有交易对
                'common/currencys', // 查询系统支持的所有币种
                'common/timestamp', // 查询系统当前时间
            ],
        },
        'private': {
            'get': [
                'account/accounts', // 查询当前用户的所有账户(即account-id)
                'account/accounts/{id}/balance', // 查询指定账户的余额
                'order/orders/{id}', // 查询某个订单详情
                'order/orders/{id}/matchresults', // 查询某个订单的成交明细
                'order/orders', // 查询当前委托、历史委托
                'order/matchresults', // 查询当前成交、历史成交
                'dw/withdraw-virtual/addresses', // 查询虚拟币提现地址
            ],
            'post': [
                'order/orders/place', // 创建并执行一个新订单 (一步下单， 推荐使用)
                'order/orders', // 创建一个新的订单请求 （仅创建订单，不执行下单）
                'order/orders/{id}/place', // 执行一个订单 （仅执行已创建的订单）
                'order/orders/{id}/submitcancel', // 申请撤销一个订单请求
                'order/orders/batchcancel', // 批量撤销订单
                'dw/balance/transfer', // 资产划转
                'dw/withdraw-virtual/create', // 申请提现虚拟币
                'dw/withdraw-virtual/{id}/place', // 确认申请虚拟币提现
                'dw/withdraw-virtual/{id}/cancel', // 申请取消提现虚拟币
            ],
        },
    },

    async fetchMarkets () {
        let response = await this.publicGetCommonSymbols ();
        let markets = response['data'];
        let numMarkets = markets.length;
        if (numMarkets < 1)
            throw new ExchangeError (this.id + ' publicGetCommonSymbols returned empty response: ' + this.json (response));
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let baseId = market['base-currency'];
            let quoteId = market['quote-currency'];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let id = baseId + quoteId;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = undefined;
        if ('last' in ticker)
            last = ticker['last'];
        let timestamp = this.milliseconds ();
        if ('ts' in ticker)
            timestamp = ticker['ts'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'][0],
            'ask': ticker['ask'][0],
            'vwap': undefined,
            'open': ticker['open'],
            'close': ticker['close'],
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['amount']),
            'quoteVolume': ticker['vol'],
            'info': ticker,
        };
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetDepth (this.extend ({
            'symbol': market['id'],
            'type': 'step0',
        }, params));
        return this.parseOrderBook (response['tick'], response['tick']['ts']);
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetDetailMerged (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response['tick'], market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['ts'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['direction'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    parseTradesData (data, market) {
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let trades = this.parseTrades (data[i]['data'], market);
            for (let k = 0; k < trades.length; k++) {
                result.push (trades[k]);
            }
        }
        return result;
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetHistoryTrade (this.extend ({
            'symbol': market['id'],
            'size': 2000,
        }, params));
        return this.parseTradesData (response['data'], market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['id'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetHistoryKline (this.extend ({
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
            'size': 2000, // max = 2000
        }, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    },

    async loadAccounts (reload = false) {
        if (reload) {
            this.accounts = await this.fetchAccounts ();
        } else {
            if (this.accounts) {
                return this.accounts;
            } else {
                this.accounts = await this.fetchAccounts ();
                this.accountsById = this.indexBy (this.accounts, 'id');
            }
        }
        return this.accounts;
    },

    async fetchAccounts () {
        await this.loadMarkets ();
        let response = await this.privateGetAccountAccounts ();
        return response['data'];
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let response = await this.privateGetAccountAccountsIdBalance (this.extend ({
            'id': this.accounts[0]['id'],
        }, params));
        let balances = response['data']['list'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let uppercase = balance['currency'].toUpperCase ();
            let currency = this.commonCurrencyCode (uppercase);
            let account = this.account ();
            account['free'] = parseFloat (balance['balance']);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = this.market (symbol);
        let order = {
            'account-id': this.accounts[0]['id'],
            'amount': amount.toFixed (10),
            'symbol': market['id'],
            'type': side + '-' + type,
        };
        if (type == 'limit')
            order['price'] = price.toFixed (10);
        let response = await this.privatePostOrderOrdersPlace (this.extend (order, params));
        return {
            'info': response,
            'id': response['data'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderOrdersIdSubmitcancel ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api == 'market')
            url += api;
        else
            url += this.version;
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            let timestamp = this.YmdHMS (this.milliseconds (), 'T');
            let request = this.keysort (this.extend ({
                'SignatureMethod': 'HmacSHA256',
                'SignatureVersion': '2',
                'AccessKeyId': this.apiKey,
                'Timestamp': timestamp,
            }, query));
            let auth = this.urlencode (request);
            let payload = [ method, this.hostname, url, auth ].join ("\n");
            let signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            auth += '&' + this.urlencode ({ 'Signature': signature });
            if (method == 'GET') {
                url += '?' + auth;
            } else {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] == 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var huobicny = extend (huobi1, {

    'id': 'huobicny',
    'name': 'Huobi CNY',
    'hostname': 'be.huobi.com',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
        'api': 'https://be.huobi.com',
        'www': 'https://www.huobi.com',
        'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
    },
})

//-----------------------------------------------------------------------------

var huobipro = extend (huobi1, {

    'id': 'huobipro',
    'name': 'Huobi Pro',
    'hostname': 'api.huobi.pro',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
        'api': 'https://api.huobi.pro',
        'www': 'https://www.huobi.pro',
        'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
    },
})

//-----------------------------------------------------------------------------

var huobi = {

    'id': 'huobi',
    'name': 'Huobi',
    'countries': 'CN',
    'rateLimit': 2000,
    'version': 'v3',
    'hasCORS': false,
    'hasFetchOHLCV': true,
    'timeframes': {
        '1m': '001',
        '5m': '005',
        '15m': '015',
        '30m': '030',
        '1h': '060',
        '1d': '100',
        '1w': '200',
        '1M': '300',
        '1y': '400',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
        'api': 'http://api.huobi.com',
        'www': 'https://www.huobi.com',
        'doc': 'https://github.com/huobiapi/API_Docs_en/wiki',
    },
    'api': {
        'staticmarket': {
            'get': [
                '{id}_kline_{period}',
                'ticker_{id}',
                'depth_{id}',
                'depth_{id}_{length}',
                'detail_{id}',
            ],
        },
        'usdmarket': {
            'get': [
                '{id}_kline_{period}',
                'ticker_{id}',
                'depth_{id}',
                'depth_{id}_{length}',
                'detail_{id}',
            ],
        },
        'trade': {
            'post': [
                'get_account_info',
                'get_orders',
                'order_info',
                'buy',
                'sell',
                'buy_market',
                'sell_market',
                'cancel_order',
                'get_new_deal_orders',
                'get_order_id_by_trade_id',
                'withdraw_coin',
                'cancel_withdraw_coin',
                'get_withdraw_coin_result',
                'transfer',
                'loan',
                'repayment',
                'get_loan_available',
                'get_loans',
            ],
        },
    },
    'markets': {
        'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1 },
        'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2 },
        // 'BTC/USD': { 'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket',    'coinType': 1 },
    },

    async fetchBalance (params = {}) {
        let balances = await this.tradePostGetAccountInfo ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            let available = 'available_' + lowercase + '_display';
            let frozen = 'frozen_' + lowercase + '_display';
            let loan = 'loan_' + lowercase + '_display';
            if (available in balances)
                account['free'] = parseFloat (balances[available]);
            if (frozen in balances)
                account['used'] = parseFloat (balances[frozen]);
            if (loan in balances)
                account['used'] = this.sum (account['used'], parseFloat (balances[loan]));
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetDepthId';
        let orderbook = await this[method] (this.extend ({ 'id': market['id'] }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetTickerId';
        let response = await this[method] (this.extend ({
            'id': market['id'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseInt (response['time']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['ts'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['direction'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetDetailId';
        let response = await this[method] (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // not implemented yet
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[6],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetIdKlinePeriod';
        let ohlcvs = await this[method] (this.extend ({
            'id': market['id'],
            'period': this.timeframes[timeframe],
        }, params));
        return ohlcvs;
        // return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let method = 'tradePost' + this.capitalize (side);
        let order = {
            'coin_type': market['coinType'],
            'amount': amount,
            'market': market['quote'].toLowerCase (),
        };
        if (type == 'limit')
            order['price'] = price;
        else
            method += this.capitalize (type);
        let response = this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.tradePostCancelOrder ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (api == 'trade') {
            url += '/api' + this.version;
            let query = this.keysort (this.extend ({
                'method': path,
                'access_key': this.apiKey,
                'created': this.nonce (),
            }, params));
            let queryString = this.urlencode (this.omit (query, 'market'));
            // secret key must be appended to the query before signing
            queryString += '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            url += '/' + api + '/' + this.implodeParams (path, params) + '_json.js';
            let query = this.omit (params, this.extractParams (path));
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'trade', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] == 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        if ('code' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var independentreserve = {

    'id': 'independentreserve',
    'name': 'Independent Reserve',
    'countries': [ 'AU', 'NZ' ], // Australia, New Zealand
    'rateLimit': 1000,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg',
        'api': {
            'public': 'https://api.independentreserve.com/Public',
            'private': 'https://api.independentreserve.com/Private',
        },
        'www': 'https://www.independentreserve.com',
        'doc': 'https://www.independentreserve.com/API',
    },
    'api': {
        'public': {
            'get': [
                'GetValidPrimaryCurrencyCodes',
                'GetValidSecondaryCurrencyCodes',
                'GetValidLimitOrderTypes',
                'GetValidMarketOrderTypes',
                'GetValidOrderTypes',
                'GetValidTransactionTypes',
                'GetMarketSummary',
                'GetOrderBook',
                'GetTradeHistorySummary',
                'GetRecentTrades',
                'GetFxRates',
            ],
        },
        'private': {
            'post': [
                'PlaceLimitOrder',
                'PlaceMarketOrder',
                'CancelOrder',
                'GetOpenOrders',
                'GetClosedOrders',
                'GetClosedFilledOrders',
                'GetOrderDetails',
                'GetAccounts',
                'GetTransactions',
                'GetDigitalCurrencyDepositAddress',
                'GetDigitalCurrencyDepositAddresses',
                'SynchDigitalCurrencyDepositAddressWithBlockchain',
                'WithdrawDigitalCurrency',
                'RequestFiatWithdrawal',
                'GetTrades',
            ],
        },
    },

    async fetchMarkets () {
        let baseCurrencies = await this.publicGetValidPrimaryCurrencyCodes ();
        let quoteCurrencies = await this.publicGetValidSecondaryCurrencyCodes ();
        let result = [];
        for (let i = 0; i < baseCurrencies.length; i++) {
            let baseId = baseCurrencies[i];
            let baseIdUppercase = baseId.toUpperCase ();
            let base = this.commonCurrencyCode (baseIdUppercase);
            for (let j = 0; j < quoteCurrencies.length; j++) {
                let quoteId = quoteCurrencies[j];
                let quoteIdUppercase = quoteId.toUpperCase ();
                let quote = this.commonCurrencyCode (quoteIdUppercase);
                let id = baseId + '/' + quoteId;
                let symbol = base + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': id,
                });
            }
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostGetAccounts ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyCode = balance['CurrencyCode'];
            let uppercase = currencyCode.toUpperCase ();
            let currency = this.commonCurrencyCode (uppercase);
            let account = this.account ();
            account['free'] = balance['AvailableBalance'];
            account['total'] = balance['TotalBalance'];
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOrderBook (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params));
        let timestamp = this.parse8601 (response['CreatedTimestampUtc']);
        return this.parseOrderBook (response, timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['CreatedTimestampUtc']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['DayHighestPrice'],
            'low': ticker['DayLowestPrice'],
            'bid': ticker['CurrentHighestBidPrice'],
            'ask': ticker['CurrentLowestOfferPrice'],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': ticker['LastPrice'],
            'change': undefined,
            'percentage': undefined,
            'average': ticker['DayAvgPrice'],
            'baseVolume': ticker['DayVolumeXbtInSecondaryCurrrency'],
            'quoteVolume': ticker['DayVolumeXbt'],
            'info': ticker,
        };
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketSummary (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params));
        return this.parseTicker (response, market);
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['TradeTimestampUtc']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['SecondaryCurrencyTradePrice'],
            'amount': trade['PrimaryCurrencyAmount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetRecentTrades (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50, // max = 50
        }, params));
        return this.parseTrades (response['Trades'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let capitalizedOrderType = this.capitalize (type);
        let method = 'Place' + capitalizedOrderType + 'Order';
        let orderType = capitalizedOrderType;
        orderType += (side == 'sell') ?  'Offer' : 'Bid';
        let order = this.ordered ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        });
        if (type == 'limit')
            order['price'] = price;
        order['volume'] = amount;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['OrderGuid'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'orderGuid': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            let auth = [
                url,
                'apiKey=' + this.apiKey,
                'nonce=' + nonce.toString (),
            ];
            let keysorted = this.keysort (params);
            let keys = Object.keys (keysorted);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                auth.push (key + '=' + params[key]);
            }
            let message = auth.join (',');
            let signature = this.hmac (this.encode (message), this.encode (this.secret));
            let query = this.keysort (this.extend ({
                'apiKey': this.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params));
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // todo error handling
        return response;
    },
}

//-----------------------------------------------------------------------------

var itbit = {

    'id': 'itbit',
    'name': 'itBit',
    'countries': 'US',
    'rateLimit': 2000,
    'version': 'v1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
        'api': 'https://api.itbit.com',
        'www': 'https://www.itbit.com',
        'doc': [
            'https://api.itbit.com/docs',
            'https://www.itbit.com/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                'markets/{symbol}/ticker',
                'markets/{symbol}/order_book',
                'markets/{symbol}/trades',
            ],
        },
        'private': {
            'get': [
                'wallets',
                'wallets/{walletId}',
                'wallets/{walletId}/balances/{currencyCode}',
                'wallets/{walletId}/funding_history',
                'wallets/{walletId}/trades',
                'wallets/{walletId}/orders/{id}',
            ],
            'post': [
                'wallet_transfers',
                'wallets',
                'wallets/{walletId}/cryptocurrency_deposits',
                'wallets/{walletId}/cryptocurrency_withdrawals',
                'wallets/{walletId}/orders',
                'wire_withdrawal',
            ],
            'delete': [
                'wallets/{walletId}/orders/{id}',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
        'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetMarketsSymbolOrderBook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetMarketsSymbolTicker (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let serverTimeUTC = ('serverTimeUTC' in ticker);
        if (!serverTimeUTC)
            throw new ExchangeError (this.id + ' fetchTicker returned a bad response: ' + this.json (ticker));
        let timestamp = this.parse8601 (ticker['serverTimeUTC']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24h']),
            'low': parseFloat (ticker['low24h']),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': parseFloat (ticker['vwap24h']),
            'open': parseFloat (ticker['openToday']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['lastPrice']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume24h']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['timestamp']);
        let id = trade['matchNumber'].toString ();
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': id,
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetMarketsSymbolTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response['recentTrades'], market);
    },

    async fetchBalance (params = {}) {
        let response = await this.privateGetBalances ();
        let balances = response['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = {
                'free': parseFloat (balance['availableBalance']),
                'used': 0.0,
                'total': parseFloat (balance['totalBalance']),
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    fetchWallets () {
        return this.privateGetWallets ();
    },

    nonce () {
        return this.milliseconds ();
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let walletIdInParams = ('walletId' in params);
        if (!walletIdInParams)
            throw new ExchangeError (this.id + ' createOrder requires a walletId parameter');
        amount = amount.toString ();
        price = price.toString ();
        let market = this.market (symbol);
        let order = {
            'side': side,
            'type': type,
            'currency': market['base'],
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': market['id'],
        };
        let response = await this.privatePostTradeAdd (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        let walletIdInParams = ('walletId' in params);
        if (!walletIdInParams)
            throw new ExchangeError (this.id + ' cancelOrder requires a walletId parameter');
        return await this.privateDeleteWalletsWalletIdOrdersId (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (Object.keys (query).length)
                body = this.json (query);
            else
                body = '';
            let nonce = this.nonce ().toString ();
            let timestamp = nonce;
            let auth = [ method, url, body, nonce, timestamp ];
            let message = nonce + this.json (auth);
            let hash = this.hash (this.encode (message), 'sha256', 'binary');
            let binhash = this.binaryConcat (url, hash);
            let signature = this.hmac (binhash, this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Authorization': self.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var jubi = extend (asia, {

    'id': 'jubi',
    'name': 'jubi.com',
    'countries': 'CN',
    'rateLimit': 1500,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
        'api': 'https://www.jubi.com/api',
        'www': 'https://www.jubi.com',
        'doc': 'https://www.jubi.com/help/api.html',
    },

    async fetchMarkets () {
        let markets = await this.publicGetAllticker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let base = id.toUpperCase ();
            let quote = 'CNY'; // todo
            let symbol = base + '/' + quote;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': id,
            });
        }
        return result;
    },
})

//-----------------------------------------------------------------------------
// kraken is also owner of ex. Coinsetter / CaVirtEx / Clevercoin

var kraken = {

    'id': 'kraken',
    'name': 'Kraken',
    'countries': 'US',
    'version': '0',
    'rateLimit': 3000,
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'hasFetchOrder': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasWithdraw': true,
    'marketsByAltname': {},
    'timeframes': {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '4h': '240',
        '1d': '1440',
        '1w': '10080',
        '2w': '21600',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
        'api': 'https://api.kraken.com',
        'www': 'https://www.kraken.com',
        'doc': [
            'https://www.kraken.com/en-us/help/api',
            'https://github.com/nothingisdead/npm-kraken-api',
        ],
        'fees': 'https://www.kraken.com/en-us/help/fees',
    },
    'api': {
        'public': {
            'get': [
                'Assets',
                'AssetPairs',
                'Depth',
                'OHLC',
                'Spread',
                'Ticker',
                'Time',
                'Trades',
            ],
        },
        'private': {
            'post': [
                'AddOrder',
                'Balance',
                'CancelOrder',
                'ClosedOrders',
                'DepositAddresses',
                'DepositMethods',
                'DepositStatus',
                'Ledgers',
                'OpenOrders',
                'OpenPositions',
                'QueryLedgers',
                'QueryOrders',
                'QueryTrades',
                'TradeBalance',
                'TradesHistory',
                'TradeVolume',
                'Withdraw',
                'WithdrawCancel',
                'WithdrawInfo',
                'WithdrawStatus',
            ],
        },
    },

    costToPrecision (symbol, cost) {
        return this.truncate (parseFloat (cost), this.markets[symbol]['precision']['price']);
    },

    feeToPrecision (symbol, fee) {
        return this.truncate (parseFloat (fee), this.markets[symbol]['precision']['amount']);
    },

    async fetchMarkets () {
        let markets = await this.publicGetAssetPairs ();
        let keys = Object.keys (markets['result']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets['result'][id];
            let base = market['base'];
            let quote = market['quote'];
            if ((base[0] == 'X') || (base[0] == 'Z'))
                base = base.slice (1);
            if ((quote[0] == 'X') || (quote[0] == 'Z'))
                quote = quote.slice (1);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let darkpool = id.indexOf ('.d') >= 0;
            let symbol = darkpool ? market['altname'] : (base + '/' + quote);
            let maker = undefined;
            if ('fees_maker' in market) {
                maker = parseFloat (market['fees_maker'][0][1]) / 100;
            }
            let precision = {
                'amount': market['lot_decimals'],
                'price': market['pair_decimals'],
            };
            let amountLimits = {
                'min': Math.pow (10, -precision['amount']),
                'max': Math.pow (10, precision['amount']),
            };
            let priceLimits = {
                'min': Math.pow (10, -precision['price']),
                'max': undefined,
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'darkpool': darkpool,
                'info': market,
                'altname': market['altname'],
                'maker': maker,
                'taker': parseFloat (market['fees'][0][1]) / 100,
                'precision': precision,
                'limits': limits,
            });
        }
        this.marketsByAltname = this.indexBy (result, 'altname');
        return result;
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let darkpool = symbol.indexOf ('.d') >= 0;
        if (darkpool)
            throw new ExchangeError (this.id + ' does not provide an order book for darkpool symbol ' + symbol);
        let market = this.market (symbol);
        let response = await this.publicGetDepth (this.extend ({
            'pair': market['id'],
        }, params));
        let orderbook = response['result'][market['id']];
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h'][1]),
            'low': parseFloat (ticker['l'][1]),
            'bid': parseFloat (ticker['b'][0]),
            'ask': parseFloat (ticker['a'][0]),
            'vwap': parseFloat (ticker['p'][1]),
            'open': parseFloat (ticker['o']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['c'][0]),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['v'][1]),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let pairs = [];
        for (let s = 0; s < this.symbols.length; s++) {
            let symbol = this.symbols[s];
            let market = this.markets[symbol];
            if (!market['darkpool'])
                pairs.push (market['id']);
        }
        let filter = pairs.join (',');
        let response = await this.publicGetTicker (this.extend ({
            'pair': filter,
        }, params));
        let tickers = response['result'];
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let darkpool = symbol.indexOf ('.d') >= 0;
        if (darkpool)
            throw new ExchangeError (this.id + ' does not provide a ticker for darkpool symbol ' + symbol);
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'pair': market['id'],
        }, params));
        let ticker = response['result'][market['id']];
        return this.parseTicker (ticker, market);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[6]),
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since)
            request['since'] = parseInt (since / 1000);
        let response = await this.publicGetOHLC (this.extend (request, params));
        let ohlcvs = response['result'][market['id']];
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        let order = undefined;
        if ('ordertxid' in trade) {
            if (!market)
                market = this.findMarketByAltnameOrId (trade['pair']);
            order = trade['ordertxid'];
            id = trade['id'];
            timestamp = parseInt (trade['time'] * 1000);
            side = trade['type'];
            type = trade['ordertype'];
            price = parseFloat (trade['price']);
            amount = parseFloat (trade['vol']);
        } else {
            timestamp = parseInt (trade[2] * 1000);
            side = (trade[3] == 's') ? 'sell' : 'buy';
            type = (trade[4] == 'l') ? 'limit' : 'market';
            price = parseFloat (trade[0]);
            amount = parseFloat (trade[1]);
        }
        let symbol = (market) ? market['symbol'] : undefined;
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let id = market['id'];
        let response = await this.publicGetTrades (this.extend ({
            'pair': id,
        }, params));
        let trades = response['result'][id];
        return this.parseTrades (trades, market);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let balances = response['result'];
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let code = currency;
            // X-ISO4217-A3 standard currency codes
            if (code[0] == 'X') {
                code = code.slice (1);
            } else if (code[0] == 'Z') {
                code = code.slice (1);
            }
            code = this.commonCurrencyCode (code);
            let balance = parseFloat (balances[currency]);
            let account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': this.amountToPrecision (symbol, amount),
        };
        if (type == 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostAddOrder (this.extend (order, params));
        let length = response['result']['txid'].length;
        let id = (length > 1) ? response['result']['txid'] : response['result']['txid'][0];
        return {
            'info': response,
            'id': id,
        };
    },

    findMarketByAltnameOrId (id) {
        let result = undefined;
        if (id in this.marketsByAltname) {
            result = this.marketsByAltname[id];
        } else if (id in this.markets_by_id) {
            result = this.markets_by_id[id];
        }
        return result;
    },

    parseOrder (order, market = undefined) {
        let description = order['descr'];
        let side = description['type'];
        let type = description['ordertype'];
        let symbol = undefined;
        if (!market)
            market = this.findMarketByAltnameOrId (description['pair']);
        let timestamp = parseInt (order['opentm'] * 1000);
        let amount = parseFloat (order['vol']);
        let filled = parseFloat (order['vol_exec']);
        let remaining = amount - filled;
        let fee = undefined;
        let cost = this.safeFloat (order, 'cost');
        let price = this.safeFloat (description, 'price');
        if (!price)
            price = this.safeFloat (order, 'price');
        if (market) {
            symbol = market['symbol'];
            if ('fee' in order) {
                let flags = order['oflags'];
                let feeCost = this.safeFloat (order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf ('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                } else if (flags.indexOf ('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    },

    parseOrders (orders, market = undefined) {
        let result = [];
        let ids = Object.keys (orders);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.parseOrder (order, market));
        }
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostQueryOrders (this.extend ({
            'trades': true, // whether or not to include trades in output (optional, default false)
            'txid': id, // comma delimited list of transaction ids to query info about (20 maximum)
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        }, params));
        let orders = response['result'];
        let order = this.parseOrder (this.extend ({ 'id': id }, orders[id]));
        return this.extend ({ 'info': response }, order);
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTradesHistory (this.extend ({
            // 'type': 'all', // any position, closed position, closing position, no position
            // 'trades': false, // whether or not to include trades related to position in output
            // 'start': 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
            // 'end': 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
            // 'ofs' = result offset
        }, params));
        let trades = response['result']['trades'];
        let ids = Object.keys (trades);
        for (let i = 0; i < ids.length; i++) {
            trades[ids[i]]['id'] = ids[i];
        }
        return this.parseTrades (trades);
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'txid': id,
            }, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'error');
                if (message.indexOf ('EOrder:Unknown order') >= 0)
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    },

    async withdraw (currency, amount, address, params = {}) {
        if ('key' in params) {
            await this.loadMarkets ();
            let response = await this.privatePostWithdraw (this.extend ({
                'asset': currency,
                'amount': amount,
                // 'address': address, // they don't allow withdrawals to direct addresses
            }, params));
            return {
                'info': response,
                'id': response['result'],
            };
        }
        throw new ExchangeError (this.id + " withdraw requires a 'key' parameter (withdrawal key name, as set up on your account)");
    },

    filterOrdersBySymbol (orders, symbol = undefined) {
        let grouped = this.groupBy (orders, 'symbol');
        let result = orders;
        if (symbol)
            if (symbol in grouped)
                result = grouped[symbol];
        return result;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOpenOrders (params);
        let orders = this.parseOrders (response['result']['open']);
        return this.filterOrdersBySymbol (orders, symbol);
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostClosedOrders (params);
        let orders = this.parseOrders (response['result']['closed']);
        return this.filterOrdersBySymbol (orders, symbol);
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + api + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            let auth = this.encode (nonce + body);
            let hash = this.hash (auth, 'sha256', 'binary');
            let binary = this.stringToBinary (this.encode (url));
            let binhash = this.binaryConcat (binary, hash);
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (binhash, secret, 'sha512', 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': this.decode (signature),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            let numErrors = response['error'].length;
            if (numErrors) {
                for (let i = 0; i < response['error'].length; i++) {
                    if (response['error'][i] == 'EService:Unavailable')
                        throw new ExchangeNotAvailable (this.id + ' ' + this.json (response));
                }
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var kuna = extend (acx, {

    'id': 'kuna',
    'name': 'Kuna',
    'countries': 'UA',
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': false,
    'hasFetchTickers': false,
    'hasFetchOHLCV': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
        'api': 'https://kuna.io',
        'www': 'https://kuna.io',
        'doc': 'https://kuna.io/documents/api',
    },
    'api': {
        'public': {
            'get': [
                'tickers/{market}',
                'order_book',
                'order_book/{market}',
                'trades',
                'trades/{market}',
                'timestamp',
            ],
        },
        'private': {
            'get': [
                'members/me',
                'orders',
                'trades/my',
            ],
            'post': [
                'orders',
                'order/delete',
            ],
        },
    },
    'markets': {
        'BTC/UAH': { 'id': 'btcuah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
        'ETH/UAH': { 'id': 'ethuah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
        'GBG/UAH': { 'id': 'gbguah', 'symbol': 'GBG/UAH', 'base': 'GBG', 'quote': 'UAH', 'precision': { 'amount': 3, 'price': 2 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }}}, // Golos Gold (GBG != GOLOS)
        'KUN/BTC': { 'id': 'kunbtc', 'symbol': 'KUN/BTC', 'base': 'KUN', 'quote': 'BTC', 'precision': { 'amount': 6, 'price': 6 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }}},
        'BCH/BTC': { 'id': 'bchbtc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'precision': { 'amount': 6, 'price': 6 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }}},
        'WAVES/UAH': { 'id': 'wavesuah', 'symbol': 'WAVES/UAH', 'base': 'WAVES', 'quote': 'UAH', 'precision': { 'amount': 6, 'price': 0 }, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 1, 'max': undefined }}},
    },
    'fees': {
        'trading': {
            'taker': 0.2 / 100,
            'maker': 0.2 / 100,
        },
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderBook = await this.publicGetOrderBook (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrderBook (orderBook, undefined, 'bids', 'asks', 'price', 'volume');
    },

    parseOrder (order, market) {
        let symbol = market['symbol'];
        let timestamp = this.parse8601 (order['created_at']);
        return {
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': order['ord_type'],
            'side': order['side'],
            'price': parseFloat (order['price']),
            'amount': parseFloat (order['volume']),
            'filled': parseFloat (order['executed_volume']),
            'remaining': parseFloat (order['remaining_volume']),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    },

    async fetchOpenOrders (symbol, params = {}) {
        let market = this.market (symbol);
        let orders = await this.privateGetOrders (this.extend ({
            'market': market['id'],
        }, params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache + fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return this.parseOrders (orders, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['volume']),
            'info': trade,
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },
})

//-----------------------------------------------------------------------------

var lakebtc = {

    'id': 'lakebtc',
    'name': 'LakeBTC',
    'countries': 'US',
    'version': 'api_v2',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
        'api': 'https://api.lakebtc.com',
        'www': 'https://www.lakebtc.com',
        'doc': [
            'https://www.lakebtc.com/s/api_v2',
            'https://www.lakebtc.com/s/api',
        ],
    },
    'api': {
        'public': {
            'get': [
                'bcorderbook',
                'bctrades',
                'ticker',
            ],
        },
        'private': {
            'post': [
                'buyOrder',
                'cancelOrders',
                'getAccountInfo',
                'getExternalAccounts',
                'getOrders',
                'getTrades',
                'openOrders',
                'sellOrder',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetTicker ();
        let result = [];
        let keys = Object.keys (markets);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let market = markets[id];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            base = base.toUpperCase ();
            quote = quote.toUpperCase ();
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['balance'];
        let result = { 'info': response };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let balance = parseFloat (balances[currency]);
            let account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBcorderbook (this.extend ({
            'symbol': this.marketId (market),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        let ticker = tickers[market['id']];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetBctrades (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let method = 'privatePost' + this.capitalize (side) + 'Order';
        let marketId = this.marketId (market);
        let order = {
            'params': [ price, amount, marketId ],
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'params': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api == 'public') {
            url += '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            if (Object.keys (params).length)
                params = params.join (',');
            else
                params = '';
            let query = this.urlencode ({
                'tonce': nonce,
                'accesskey': this.apiKey,
                'requestmethod': method.toLowerCase (),
                'id': nonce,
                'method': path,
                'params': params,
            });
            body = this.json ({
                'method': path,
                'params': params,
                'id': nonce,
            });
            let signature = this.hmac (this.encode (query), this.secret, 'sha1', 'base64');
            headers = {
                'Json-Rpc-Tonce': nonce,
                'Authorization': "Basic " + this.apiKey + ':' + signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var livecoin = {

    'id': 'livecoin',
    'name': 'LiveCoin',
    'countries': [ 'US', 'UK', 'RU' ],
    'rateLimit': 1000,
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg',
        'api': 'https://api.livecoin.net',
        'www': 'https://www.livecoin.net',
        'doc': 'https://www.livecoin.net/api?lang=en',
    },
    'api': {
        'public': {
            'get': [
                'exchange/all/order_book',
                'exchange/last_trades',
                'exchange/maxbid_minask',
                'exchange/order_book',
                'exchange/restrictions',
                'exchange/ticker', // omit params to get all tickers at once
                'info/coinInfo',
            ],
        },
        'private': {
            'get': [
                'exchange/client_orders',
                'exchange/order',
                'exchange/trades',
                'exchange/commission',
                'exchange/commissionCommonInfo',
                'payment/balances',
                'payment/balance',
                'payment/get/address',
                'payment/history/size',
                'payment/history/transactions',
            ],
            'post': [
                'exchange/buylimit',
                'exchange/buymarket',
                'exchange/cancellimit',
                'exchange/selllimit',
                'exchange/sellmarket',
                'payment/out/capitalist',
                'payment/out/card',
                'payment/out/coin',
                'payment/out/okpay',
                'payment/out/payeer',
                'payment/out/perfectmoney',
                'payment/voucher/amount',
                'payment/voucher/make',
                'payment/voucher/redeem',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetExchangeTicker ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['symbol'];
            let symbol = id;
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetPaymentBalances ();
        let result = { 'info': balances };
        for (let b = 0; b < this.currencies.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let account = undefined;
            if (currency in result)
                account = result[currency];
            else
                account = this.account ();
            if (balance['type'] == 'total')
                account['total'] = parseFloat (balance['value']);
            if (balance['type'] == 'available')
                account['free'] = parseFloat (balance['value']);
            if (balance['type'] == 'trade')
                account['used'] = parseFloat (balance['value']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetExchangeOrderBook (this.extend ({
            'currencyPair': this.marketId (symbol),
            'groupByPrice': 'false',
            'depth': 100,
        }, params));
        let timestamp = orderbook['timestamp'];
        return this.parseOrderBook (orderbook, timestamp);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['best_bid']),
            'ask': parseFloat (ticker['best_ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetExchangeTicker (params);
        let tickers = this.indexBy (response, 'symbol');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetExchangeTicker (this.extend ({
            'currencyPair': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['time'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['id'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['quantity'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetExchangeLastTrades (this.extend ({
            'currencyPair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostExchange' + this.capitalize (side) + type;
        let order = {
            'currencyPair': this.marketId (symbol),
            'quantity': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostExchangeCancellimit (this.extend ({
            'orderId': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.urlencode (this.keysort (params));
            if (method == 'GET')
                if (query)
                    url += '?' + query;
            else
                if (query)
                    body = query;
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Api-Key': this.apiKey,
                'Sign': signature.toUpperCase (),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (!response['success'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var liqui = extend (btce, {
    'id': 'liqui',
    'name': 'Liqui',
    'countries': 'UA',
    'rateLimit': 2500,
    'version': '3',
    'hasCORS': false,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchTickers': true,
    'hasFetchMyTrades': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
        'api': {
            'public': 'https://api.liqui.io/api',
            'private': 'https://api.liqui.io/tapi',
        },
        'www': 'https://liqui.io',
        'doc': 'https://liqui.io/api',
        'fees': 'https://liqui.io/fee',
    },
    'api': {
        'public': {
            'get': [
                'info',
                'ticker/{pair}',
                'depth/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'getInfo',
                'Trade',
                'ActiveOrders',
                'OrderInfo',
                'CancelOrder',
                'TradeHistory',
                'TransHistory',
                'CoinDepositAddress',
                'WithdrawCoin',
                'CreateCoupon',
                'RedeemCoupon',
            ],
        },
    },
    'fees': {
        'trading': {
            'maker': 0.001,
            'taker': 0.0025,
        },
        'funding': 0.0,
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoin (this.extend ({
            'coinName': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['return']['tId'],
        };
    },
})

//-----------------------------------------------------------------------------

var luno = {

    'id': 'luno',
    'name': 'luno',
    'countries': [ 'GB', 'SG', 'ZA' ],
    'rateLimit': 3000,
    'version': '1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
        'api': 'https://api.mybitx.com/api',
        'www': 'https://www.luno.com',
        'doc': [
            'https://www.luno.com/en/api',
            'https://npmjs.org/package/bitx',
            'https://github.com/bausmeier/node-bitx',
        ],
    },
    'api': {
        'public': {
            'get': [
                'orderbook',
                'ticker',
                'tickers',
                'trades',
            ],
        },
        'private': {
            'get': [
                'accounts/{id}/pending',
                'accounts/{id}/transactions',
                'balance',
                'fee_info',
                'funding_address',
                'listorders',
                'listtrades',
                'orders/{id}',
                'quotes/{id}',
                'withdrawals',
                'withdrawals/{id}',
            ],
            'post': [
                'accounts',
                'postorder',
                'marketorder',
                'stoporder',
                'funding_address',
                'withdrawals',
                'send',
                'quotes',
                'oauth2/grant',
            ],
            'put': [
                'quotes/{id}',
            ],
            'delete': [
                'quotes/{id}',
                'withdrawals/{id}',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetTickers ();
        let result = [];
        for (let p = 0; p < markets['tickers'].length; p++) {
            let market = markets['tickers'][p];
            let id = market['pair'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['balance'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = this.commonCurrencyCode (balance['asset']);
            let reserved = parseFloat (balance['reserved']);
            let unconfirmed = parseFloat (balance['unconfirmed']);
            let account = {
                'free': parseFloat (balance['balance']),
                'used': this.sum (reserved, unconfirmed),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbook (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = orderbook['timestamp'];
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'volume');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_trade']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['rolling_24_hour_volume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = this.indexBy (response['tickers'], 'pair');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTicker (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let side = (trade['is_buy']) ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': undefined,
            'order': undefined,
            'timestamp': trade['timestamp'],
            'datetime': this.iso8601 (trade['timestamp']),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['volume']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost';
        let order = { 'pair': this.marketId (market) };
        if (type == 'market') {
            method += 'Marketorder';
            order['type'] = side.toUpperCase ();
            if (side == 'buy')
                order['counter_volume'] = amount;
            else
                order['base_volume'] = amount;
        } else {
            method += 'Order';
            order['volume'] = amount;
            order['price'] = price;
            if (side == 'buy')
                order['type'] = 'BID';
            else
                order['type'] = 'ASK';
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostStoporder ({ 'order_id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        if (api == 'private') {
            let auth = this.encode (this.apiKey + ':' + this.secret);
            auth = this.stringToBase64 (auth);
            headers = { 'Authorization': 'Basic ' + this.decode (auth) };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var mercado = {

    'id': 'mercado',
    'name': 'Mercado Bitcoin',
    'countries': 'BR', // Brazil
    'rateLimit': 1000,
    'version': 'v3',
    'hasCORS': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
        'api': {
            'public': 'https://www.mercadobitcoin.net/api',
            'private': 'https://www.mercadobitcoin.net/tapi',
        },
        'www': 'https://www.mercadobitcoin.com.br',
        'doc': [
            'https://www.mercadobitcoin.com.br/api-doc',
            'https://www.mercadobitcoin.com.br/trade-api',
        ],
    },
    'api': {
        'public': {
            'get': [
                'orderbook/', // last slash critical
                'orderbook_litecoin/',
                'ticker/',
                'ticker_litecoin/',
                'trades/',
                'trades_litecoin/',
                'v2/ticker/',
                'v2/ticker_litecoin/',
            ],
        },
        'private': {
            'post': [
                'cancel_order',
                'get_account_info',
                'get_order',
                'get_withdrawal',
                'list_system_messages',
                'list_orders',
                'list_orderbook',
                'place_buy_order',
                'place_sell_order',
                'withdraw_coin',
            ],
        },
    },
    'markets': {
        'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': '' },
        'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' },
    },

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let method = 'publicGetOrderbook' + this.capitalize (market['suffix']);
        let orderbook = await this[method] (params);
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let method = 'publicGetV2Ticker' + this.capitalize (market['suffix']);
        let response = await this[method] (params);
        let ticker = response['ticker'];
        let timestamp = parseInt (ticker['date']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let method = 'publicGetTrades' + this.capitalize (market['suffix']);
        let response = await this[method] (params);
        return this.parseTrades (response, market);
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['balance'];
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances) {
                account['free'] = parseFloat (balances[lowercase]['available']);
                account['total'] = parseFloat (balances[lowercase]['total']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let method = 'privatePostPlace' + this.capitalize (side) + 'Order';
        let order = {
            'coin_pair': this.marketId (symbol),
            'quantity': amount,
            'limit_price': price,
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['response_data']['order']['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let request = {
            'coin': currency,
            'quantity': amount.toFixed (10),
            'address': address,
        };
        if (currency == 'BRL') {
            let account_ref = ('account_ref' in params);
            if (!account_ref)
                throw new ExchangeError (this.id + ' requires account_ref parameter to withdraw ' + currency);
        } else if (currency != 'LTC') {
            let tx_fee = ('tx_fee' in params);
            if (!tx_fee)
                throw new ExchangeError (this.id + ' requires tx_fee parameter to withdraw ' + currency);
        }
        let response = await this.privatePostWithdrawCoin (this.extend (request, params));
        return {
            'info': response,
            'id': response['response_data']['withdrawal']['id'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api == 'public') {
            url += path;
        } else {
            url += this.version + '/';
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params));
            let auth = '/tapi/' + this.version + '/' + '?' + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': this.apiKey,
                'TAPI-MAC': this.hmac (this.encode (auth), this.secret, 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error_message' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var mixcoins = {

    'id': 'mixcoins',
    'name': 'MixCoins',
    'countries': [ 'GB', 'HK' ],
    'rateLimit': 1500,
    'version': 'v1',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg',
        'api': 'https://mixcoins.com/api',
        'www': 'https://mixcoins.com',
        'doc': 'https://mixcoins.com/help/api/',
    },
    'api': {
        'public': {
            'get': [
                'ticker',
                'trades',
                'depth',
            ],
        },
        'private': {
            'post': [
                'cancel',
                'info',
                'orders',
                'order',
                'transactions',
                'trade',
            ],
        },
    },
    'markets': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'BCH/BTC': { 'id': 'bcc_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC' },
        'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
        'BCH/USD': { 'id': 'bcc_usd', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD' },
        'ETH/USD': { 'id': 'eth_usd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
    },

    async fetchBalance (params = {}) {
        let response = await this.privatePostInfo ();
        let balance = response['result']['wallet'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balance) {
                account['free'] = parseFloat (balance[lowercase]['avail']);
                account['used'] = parseFloat (balance[lowercase]['lock']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let response = await this.publicGetDepth (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response['result']);
    },

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetTicker (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let ticker = response['result'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response['result'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'market': this.marketId (symbol),
            'op': side,
            'amount': amount,
        };
        if (type == 'market') {
            order['order_type'] = 1;
            order['price'] = price;
        } else {
            order['order_type'] = 0;
        }
        let response = await this.privatePostTrade (this.extend (order, params));
        return {
            'info': response,
            'id': response['result']['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.secret, 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] == 200)
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    },
}

//-----------------------------------------------------------------------------

var nova = {

    'id': 'nova',
    'name': 'Novaexchange',
    'countries': 'TZ', // Tanzania
    'rateLimit': 2000,
    'version': 'v2',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg',
        'api': 'https://novaexchange.com/remote',
        'www': 'https://novaexchange.com',
        'doc': 'https://novaexchange.com/remote/faq',
    },
    'api': {
        'public': {
            'get': [
                'markets/',
                'markets/{basecurrency}/',
                'market/info/{pair}/',
                'market/orderhistory/{pair}/',
                'market/openorders/{pair}/buy/',
                'market/openorders/{pair}/sell/',
                'market/openorders/{pair}/both/',
                'market/openorders/{pair}/{ordertype}/',
            ],
        },
        'private': {
            'post': [
                'getbalances/',
                'getbalance/{currency}/',
                'getdeposits/',
                'getwithdrawals/',
                'getnewdepositaddress/{currency}/',
                'getdepositaddress/{currency}/',
                'myopenorders/',
                'myopenorders_market/{pair}/',
                'cancelorder/{orderid}/',
                'withdraw/{currency}/',
                'trade/{pair}/',
                'tradehistory/',
                'getdeposithistory/',
                'getwithdrawalhistory/',
                'walletstatus/',
                'walletstatus/{currency}/',
            ],
        },
    },

    async fetchMarkets () {
        let response = await this.publicGetMarkets ();
        let markets = response['markets'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            if (!market['disabled']) {
                let id = market['marketname'];
                let [ quote, base ] = id.split ('_');
                let symbol = base + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                });
            }
        }
        return result;
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetMarketOpenordersPairBoth (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buyorders', 'sellorders', 'price', 'amount');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketInfoPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let ticker = response['markets'][0];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24h']),
            'low': parseFloat (ticker['low24h']),
            'bid': this.safeFloat (ticker, 'bid'),
            'ask': this.safeFloat (ticker, 'ask'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': parseFloat (ticker['change24h']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume24h']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = trade['unix_t_datestamp'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': trade['tradetype'].toLowerCase (),
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketOrderhistoryPair (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response['items'], market);
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetbalances ();
        let balances = response['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let lockbox = parseFloat (balance['amount_lockbox']);
            let trades = parseFloat (balance['amount_trades']);
            let account = {
                'free': parseFloat (balance['amount']),
                'used': this.sum (lockbox, trades),
                'total': parseFloat (balance['amount_total']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        amount = amount.toString ();
        price = price.toString ();
        let market = this.market (symbol);
        let order = {
            'tradetype': side.toUpperCase (),
            'tradeamount': amount,
            'tradeprice': price,
            'tradebase': 1,
            'pair': market['id'],
        };
        let response = await this.privatePostTradePair (this.extend (order, params));
        return {
            'info': response,
            'id': undefined,
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelorder (this.extend ({
            'orderid': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/';
        if (api == 'private')
            url += api + '/';
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            url += '?' + this.urlencode ({ 'nonce': nonce });
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512', 'base64');
            body = this.urlencode (this.extend ({
                'apikey': this.apiKey,
                'signature': signature,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] != 'success')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var okcoincny = extend (okcoin, {
    'id': 'okcoincny',
    'name': 'OKCoin CNY',
    'countries': 'CN',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
        'api': {
            'web': 'https://www.okcoin.cn',
            'public': 'https://www.okcoin.cn/pai',
            'private': 'https://www.okcoin.cn/api',
        },
        'www': 'https://www.okcoin.cn',
        'doc': 'https://www.okcoin.cn/rest_getStarted.html',
    },
    'markets': {
        'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'spot', 'spot': true, 'future': false },
        'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'spot', 'spot': true, 'future': false },
        'ETH/CNY': { 'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', 'type': 'spot', 'spot': true, 'future': false },
        'ETC/CNY': { 'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY', 'type': 'spot', 'spot': true, 'future': false },
        'BCH/CNY': { 'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY', 'type': 'spot', 'spot': true, 'future': false },
    },
})

//-----------------------------------------------------------------------------

var okcoinusd = extend (okcoin, {
    'id': 'okcoinusd',
    'name': 'OKCoin USD',
    'countries': [ 'CN', 'US' ],
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
        'api': {
            'web': 'https://www.okcoin.com',
            'public': 'https://www.okcoin.com/api',
            'private': 'https://www.okcoin.com/api',
        },
        'www': 'https://www.okcoin.com',
        'doc': [
            'https://www.okcoin.com/rest_getStarted.html',
            'https://www.npmjs.com/package/okcoin.com',
        ],
    },
    'markets': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
        'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
        'ETH/USD': { 'id': 'eth_usd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
        'ETC/USD': { 'id': 'etc_usd', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
    },
})

//-----------------------------------------------------------------------------

var okex = extend (okcoin, {
    'id': 'okex',
    'name': 'OKEX',
    'countries': [ 'CN', 'US' ],
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg',
        'api': {
            'www': 'https://www.okex.com',
            'public': 'https://www.okex.com/api',
            'private': 'https://www.okex.com/api',
        },
        'www': 'https://www.okex.com',
        'doc': 'https://www.okex.com/rest_getStarted.html',
    },
    'markets': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
        'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
        'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'BCH/BTC': { 'id': 'bcc_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
    },
})

//-----------------------------------------------------------------------------

var paymium = {

    'id': 'paymium',
    'name': 'Paymium',
    'countries': [ 'FR', 'EU' ],
    'rateLimit': 2000,
    'version': 'v1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
        'api': 'https://paymium.com/api',
        'www': 'https://www.paymium.com',
        'doc': [
            'https://github.com/Paymium/api-documentation',
            'https://www.paymium.com/page/developers',
        ],
    },
    'api': {
        'public': {
            'get': [
                'countries',
                'data/{id}/ticker',
                'data/{id}/trades',
                'data/{id}/depth',
                'bitcoin_charts/{id}/trades',
                'bitcoin_charts/{id}/depth',
            ],
        },
        'private': {
            'get': [
                'merchant/get_payment/{UUID}',
                'user',
                'user/addresses',
                'user/addresses/{btc_address}',
                'user/orders',
                'user/orders/{UUID}',
                'user/price_alerts',
            ],
            'post': [
                'user/orders',
                'user/addresses',
                'user/payment_requests',
                'user/price_alerts',
                'merchant/create_payment',
            ],
            'delete': [
                'user/orders/{UUID}/cancel',
                'user/price_alerts/{id}',
            ],
        },
    },
    'markets': {
        'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    async fetchBalance (params = {}) {
        let balances = await this.privateGetUser ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            let balance = 'balance_' + lowercase;
            let locked = 'locked_' + lowercase;
            if (balance in balances)
                account['free'] = balances[balance];
            if (locked in balances)
                account['used'] = balances[locked];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetDataIdDepth (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let result = this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
        result['bids'] = this.sortBy (result['bids'], 0, true);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetDataIdTicker (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = ticker['at'] * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['price']),
            'change': undefined,
            'percentage': parseFloat (ticker['variation']),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['created_at_int']) * 1000;
        let volume = 'traded_' + market['base'].toLowerCase ();
        return {
            'info': trade,
            'id': trade['uuid'],
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade[volume],
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetDataIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        let order = {
            'type': this.capitalize (type) + 'Order',
            'currency': this.marketId (market),
            'direction': side,
            'amount': amount,
        };
        if (type == 'market')
            order['price'] = price;
        let response = await this.privatePostUserOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['uuid'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'orderNumber': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            body = this.json (params);
            let nonce = this.nonce ().toString ();
            let auth = nonce + url + body;
            headers = {
                'Api-Key': this.apiKey,
                'Api-Signature': this.hmac (this.encode (auth), this.secret),
                'Api-Nonce': nonce,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var poloniex = {

    'id': 'poloniex',
    'name': 'Poloniex',
    'countries': 'US',
    'rateLimit': 1000, // up to 6 calls per second
    'hasCORS': true,
    'hasFetchMyTrades': true,
    'hasFetchOrder': true,
    'hasFetchOrders': true,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasFetchTickers': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
        'api': {
            'public': 'https://poloniex.com/public',
            'private': 'https://poloniex.com/tradingApi',
        },
        'www': 'https://poloniex.com',
        'doc': [
            'https://poloniex.com/support/api/',
            'http://pastebin.com/dMX7mZE0',
        ],
        'fees': 'https://poloniex.com/fees',
    },
    'api': {
        'public': {
            'get': [
                'return24hVolume',
                'returnChartData',
                'returnCurrencies',
                'returnLoanOrders',
                'returnOrderBook',
                'returnTicker',
                'returnTradeHistory',
            ],
        },
        'private': {
            'post': [
                'buy',
                'cancelLoanOffer',
                'cancelOrder',
                'closeMarginPosition',
                'createLoanOffer',
                'generateNewAddress',
                'getMarginPosition',
                'marginBuy',
                'marginSell',
                'moveOrder',
                'returnActiveLoans',
                'returnAvailableAccountBalances',
                'returnBalances',
                'returnCompleteBalances',
                'returnDepositAddresses',
                'returnDepositsWithdrawals',
                'returnFeeInfo',
                'returnLendingHistory',
                'returnMarginAccountSummary',
                'returnOpenLoanOffers',
                'returnOpenOrders',
                'returnOrderTrades',
                'returnTradableBalances',
                'returnTradeHistory',
                'sell',
                'toggleAutoRenew',
                'transferBalance',
                'withdraw',
            ],
        },
    },
    'fees': {
        'trading': {
            'maker': 0.0015,
            'taker': 0.0025,
        },
        'funding': 0.0,
    },
    'limits': {
        'amount': {
            'min': 0.00000001,
            'max': 1000000000,
        },
        'price': {
            'min': 0.00000001,
            'max': 1000000000,
        },
    },
    'precision': {
        'amount': 8,
        'price': 8,
    },

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    },

    async fetchMarkets () {
        let markets = await this.publicGetReturnTicker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ quote, base ] = id.split ('_');
            let symbol = base + '/' + quote;
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            }));
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostReturnCompleteBalances ({
            'account': 'all',
        });
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let balance = balances[currency];
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['onOrders']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchFees (params = {}) {
        await this.loadMarkets ();
        let fees = await this.privatePostReturnFeeInfo ();
        return {
            'info': fees,
            'maker': parseFloat (fees['makerFee']),
            'taker': parseFloat (fees['takerFee']),
            'withdraw': 0.0,
        };
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetReturnOrderBook (this.extend ({
            'currencyPair': this.marketId (market),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24hr']),
            'low': parseFloat (ticker['low24hr']),
            'bid': parseFloat (ticker['highestBid']),
            'ask': parseFloat (ticker['lowestAsk']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': parseFloat (ticker['percentChange']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['quoteVolume']),
            'quoteVolume': parseFloat (ticker['baseVolume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetReturnTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetReturnTicker (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['date']);
        let symbol = undefined;
        if ((!market) && ('currencyPair' in trade))
            market = this.markets_by_id[trade['currencyPair']]['symbol'];
        if (market)
            symbol = market['symbol'];
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tradeID'),
            'order': this.safeString (trade, 'orderNumber'),
            'type': 'limit',
            'side': trade['type'],
            'price': parseFloat (trade['rate']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetReturnTradeHistory (this.extend ({
            'currencyPair': market['id'],
            'end': this.seconds (), // last 50000 trades by default
        }, params));
        return this.parseTrades (trades, market);
    },

    async fetchMyTrades (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = this.extend ({
            'currencyPair': pair,
            // 'start': this.seconds () - 86400, // last 24 hours by default
            // 'end': this.seconds (), // last 50000 trades by default
        }, params);
        let response = await this.privatePostReturnTradeHistory (request);
        let result = [];
        if (market) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                let ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i];
                    let market = this.markets_by_id[id];
                    let symbol = market['symbol'];
                    let trades = this.parseTrades (response[id], market);
                    for (let j = 0; j < trades.length; j++) {
                        result.push (trades[j]);
                    }
                }
            }
        }
        return result;
    },

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'timestamp');
        if (!timestamp)
            timestamp = this.parse8601 (order['date']);
        let trades = undefined;
        if ('resultingTrades' in order)
            trades = this.parseTrades (order['resultingTrades'], market);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'total', 0.0);
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = amount - remaining;
        return {
            'info': order,
            'id': order['orderNumber'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
        };
    },

    parseOpenOrders (orders, market, result = []) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            let extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    },

    async fetchOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let response = await this.privatePostReturnOpenOrders (this.extend ({
            'currencyPair': pair,
        }));
        let openOrders = [];
        if (market) {
            openOrders = this.parseOpenOrders (response, market, openOrders);
        } else {
            let marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                let marketId = marketIds[i];
                let orders = response[marketId];
                let market = this.markets_by_id[marketId];
                openOrders = this.parseOpenOrders (orders, market, openOrders);
            }
        }
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (market) {
                if (order['symbol'] == symbol)
                    result.push (order);
            } else {
                result.push (order);
            }
        }
        return result;
    },

    async fetchOrder (id, symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] == id)
                return orders[i];
        }
        return undefined;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'open')
                result.push (orders[i]);
        }
        return result;
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'closed')
                result.push (orders[i]);
        }
        return result;
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let market = this.market (symbol);
        price = parseFloat (price);
        amount = parseFloat (amount);
        let response = await this[method] (this.extend ({
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        }, params));
        let timestamp = this.milliseconds ();
        let order = this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market);
        let id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    },

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        amount = parseFloat (amount);
        let request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        let response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id] = this.extend (this.orders[id], {
                'price': price,
                'amount': amount,
            });
            result = this.extend (this.orders[id], { 'info': response });
        } else {
            result = {
                'info': response,
                'id': response['orderNumber'],
            };
        }
        return result;
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'orderNumber': id,
            }, params));
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'error');
                if (message.indexOf ('Invalid order') >= 0)
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    },

    async fetchOrderStatus (id, symbol = undefined) {
        await this.loadMarkets ();
        let orders = await this.fetchOpenOrders (symbol);
        let indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    },

    async fetchOrderTrades (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let trades = await this.privatePostReturnOrderTrades (this.extend ({
            'orderNumber': id,
        }, params));
        return this.parseTrades (trades);
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePostWithdraw (this.extend ({
            'currency': currency,
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': result,
            'id': result['response'],
        };
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.extend ({ 'command': path }, params);
        if (api == 'public') {
            url += '?' + this.urlencode (query);
        } else {
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            let error = this.id + ' ' + this.json (response);
            let failed = response['error'].indexOf ('Not enough') >= 0;
            if (failed)
                throw new InsufficientFunds (error);
            throw new ExchangeError (error);
        }
        return response;
    },
}

//-----------------------------------------------------------------------------

var quadrigacx = {

    'id': 'quadrigacx',
    'name': 'QuadrigaCX',
    'countries': 'CA',
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
        'api': 'https://api.quadrigacx.com',
        'www': 'https://www.quadrigacx.com',
        'doc': 'https://www.quadrigacx.com/api_info',
    },
    'api': {
        'public': {
            'get': [
                'order_book',
                'ticker',
                'transactions',
            ],
        },
        'private': {
            'post': [
                'balance',
                'bitcoin_deposit_address',
                'bitcoin_withdrawal',
                'buy',
                'cancel_order',
                'ether_deposit_address',
                'ether_withdrawal',
                'lookup_order',
                'open_orders',
                'sell',
                'user_transactions',
            ],
        },
    },
    'markets': {
        'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD' },
    },

    async fetchBalance (params = {}) {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': parseFloat (balances[lowercase + '_available']),
                'used': parseFloat (balances[lowercase + '_reserved']),
                'total': parseFloat (balances[lowercase + '_balance']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    },

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetTicker (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': parseFloat (ticker['vwap']),
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'amount': amount,
            'book': this.marketId (symbol),
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            url += '?' + this.urlencode (params);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ();
            let request = [ nonce.toString (), this.uid, this.apiKey ].join ('');
            let signature = this.hmac (this.encode (request), this.encode (this.secret));
            let query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var qryptos = {

    'id': 'qryptos',
    'name': 'QRYPTOS',
    'countries': [ 'CN', 'TW' ],
    'version': '2',
    'rateLimit': 1000,
    'hasFetchTickers': true,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
        'api': 'https://api.qryptos.com',
        'www': 'https://www.qryptos.com',
        'doc': 'https://developers.quoine.com',
    },
    'api': {
        'public': {
            'get': [
                'products',
                'products/{id}',
                'products/{id}/price_levels',
                'executions',
                'ir_ladders/{currency}',
            ],
        },
        'private': {
            'get': [
                'accounts/balance',
                'crypto_accounts',
                'executions/me',
                'fiat_accounts',
                'loan_bids',
                'loans',
                'orders',
                'orders/{id}',
                'orders/{id}/trades',
                'trades',
                'trades/{id}/loans',
                'trading_accounts',
                'trading_accounts/{id}',
            ],
            'post': [
                'fiat_accounts',
                'loan_bids',
                'orders',
            ],
            'put': [
                'loan_bids/{id}/close',
                'loans/{id}',
                'orders/{id}',
                'orders/{id}/cancel',
                'trades/{id}',
                'trades/{id}/close',
                'trades/close_all',
                'trading_accounts/{id}',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'];
            let base = market['base_currency'];
            let quote = market['quoted_currency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountsBalance ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let total = parseFloat (balance['balance']);
            let account = {
                'free': total,
                'used': 0.0,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdPriceLevels (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy_price_levels', 'sell_price_levels');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = undefined;
        if ('last_traded_price' in ticker) {
            if (ticker['last_traded_price']) {
                let length = ticker['last_traded_price'].length;
                if (length > 0)
                    last = parseFloat (ticker['last_traded_price']);
            }
        }
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high_market_ask']),
            'low': parseFloat (ticker['low_market_bid']),
            'bid': parseFloat (ticker['market_bid']),
            'ask': parseFloat (ticker['market_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_24h']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetProducts (params);
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let base = ticker['base_currency'];
            let quote = ticker['quoted_currency'];
            let symbol = base + '/' + quote;
            let market = this.markets[symbol];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetProductsId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['created_at'] * 1000;
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['taker_side'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['quantity']),
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetExecutions (this.extend ({
            'product_id': market['id'],
        }, params));
        return this.parseTrades (response['models'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend ({
            'order': order,
        }, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-Type': 'application/json',
        };
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = {
                'path': url,
                'nonce': nonce,
                'token_id': this.apiKey,
                'iat': Math.floor (nonce / 1000), // issued at
            };
            if (Object.keys (query).length)
                body = this.json (query);
            headers['X-Quoine-Auth'] = this.jwt (request, this.secret);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var quoine = extend (qryptos, {

    'id': 'quoine',
    'name': 'QUOINE',
    'countries': [ 'JP', 'SG', 'VN' ],
    'version': '2',
    'rateLimit': 1000,
    'hasFetchTickers': true,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
        'api': 'https://api.quoine.com',
        'www': 'https://www.quoine.com',
        'doc': 'https://developers.quoine.com',
    },
})

//-----------------------------------------------------------------------------

var southxchange = {

    'id': 'southxchange',
    'name': 'SouthXchange',
    'countries': 'AR', // Argentina
    'rateLimit': 1000,
    'hasFetchTickers': true,
    'hasCORS': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
        'api': 'https://www.southxchange.com/api',
        'www': 'https://www.southxchange.com',
        'doc': 'https://www.southxchange.com/Home/Api',
    },
    'api': {
        'public': {
            'get': [
                'markets',
                'price/{symbol}',
                'prices',
                'book/{symbol}',
                'trades/{symbol}',
            ],
        },
        'private': {
            'post': [
                'cancelMarketOrders',
                'cancelOrder',
                'generatenewaddress',
                'listOrders',
                'listBalances',
                'placeOrder',
                'withdraw',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let base = market[0];
            let quote = market[1];
            let symbol = base + '/' + quote;
            let id = symbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostListBalances ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['Currency'];
            let uppercase = currency.toUpperCase ();
            let free = parseFloat (balance['Available']);
            let used = parseFloat (balance['Unconfirmed']);
            let total = this.sum (free, used);
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'Bid'),
            'ask': this.safeFloat (ticker, 'Ask'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'Last'),
            'change': this.safeFloat (ticker, 'Variation24Hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'Volume24Hr'),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetPrices (params);
        let tickers = this.indexBy (response, 'Market');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPriceSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market) {
        let timestamp = trade['At'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': trade['Type'],
            'price': trade['Price'],
            'amount': trade['Amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'listingCurrency': market['base'],
            'referenceCurrency': market['quote'],
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['limitPrice'] = price;
        let response = await this.privatePostPlaceOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response.toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder (this.extend ({
            'orderCode': id,
        }, params));
    },

    async withdraw (currency, amount, address, params = {}) {
        let response = await this.privatePostWithdraw (this.extend ({
            'currency': currency,
            'address': address,
            'amount': amount,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            let nonce = this.nonce ();
            query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, query);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
                'Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // if (!response)
        //     throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var surbitcoin = extend (blinktrade, {
    'id': 'surbitcoin',
    'name': 'SurBitcoin',
    'countries': 'VE',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://surbitcoin.com',
        'doc': 'https://blinktrade.com/docs',
    },
    'comment': 'Blinktrade API',
    'markets': {
        'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin' },
    },
})

//-----------------------------------------------------------------------------

var tidex = extend (btce, {
    'id': 'tidex',
    'name': 'Tidex',
    'countries': 'UK',
    'rateLimit': 1000,
    'version': '3',
    // 'hasCORS': false,
    // 'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
        'api': {
            'public': 'https://api.tidex.com/api',
            'private': 'https://api.tidex.com/tapi',
        },
        'www': 'https://tidex.com',
        'doc': 'https://tidex.com/public-api',
        'fees': 'https://tidex.com/pairs-spec'
    },
})

//-----------------------------------------------------------------------------

var therock = {

    'id': 'therock',
    'name': 'TheRockTrading',
    'countries': 'MT',
    'rateLimit': 1000,
    'version': 'v1',
    'hasCORS': false,
    'hasFetchTickers': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
        'api': 'https://api.therocktrading.com',
        'www': 'https://therocktrading.com',
        'doc': [
            'https://api.therocktrading.com/doc/v1/index.html',
            'https://api.therocktrading.com/doc/',
        ],
    },
    'api': {
        'public': {
            'get': [
                'funds/{id}/orderbook',
                'funds/{id}/ticker',
                'funds/{id}/trades',
                'funds/tickers',
            ],
        },
        'private': {
            'get': [
                'balances',
                'balances/{id}',
                'discounts',
                'discounts/{id}',
                'funds',
                'funds/{id}',
                'funds/{id}/trades',
                'funds/{fund_id}/orders',
                'funds/{fund_id}/orders/{id}',
                'funds/{fund_id}/position_balances',
                'funds/{fund_id}/positions',
                'funds/{fund_id}/positions/{id}',
                'transactions',
                'transactions/{id}',
                'withdraw_limits/{id}',
                'withdraw_limits',
            ],
            'post': [
                'atms/withdraw',
                'funds/{fund_id}/orders',
            ],
            'delete': [
                'funds/{fund_id}/orders/{id}',
                'funds/{fund_id}/orders/remove_all',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetFundsTickers ();
        let result = [];
        for (let p = 0; p < markets['tickers'].length; p++) {
            let market = markets['tickers'][p];
            let id = market['fund_id'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances ();
        let balances = response['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let free = balance['trading_balance'];
            let total = balance['balance'];
            let used = total - free;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetFundsIdOrderbook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = this.parse8601 (orderbook['date']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['date']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': parseFloat (ticker['close']),
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_traded']),
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetFundsTickers (params);
        let tickers = this.indexBy (response['tickers'], 'fund_id');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetFundsIdTicker (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    },

    parseTrade (trade, market = undefined) {
        if (!market)
            market = this.markets_by_id[trade['fund_id']];
        let timestamp = this.parse8601 (trade['date']);
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetFundsIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let response = await this.privatePostFundsFundIdOrders (this.extend ({
            'fund_id': this.marketId (symbol),
            'side': side,
            'amount': amount,
            'price': price,
        }, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteFundsFundIdOrdersId (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            let nonce = this.nonce ().toString ();
            let auth = nonce + url;
            headers = {
                'X-TRT-KEY': this.apiKey,
                'X-TRT-NONCE': nonce,
                'X-TRT-SIGN': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
            if (Object.keys (query).length) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var urdubit = extend (blinktrade, {
    'id': 'urdubit',
    'name': 'UrduBit',
    'countries': 'PK',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://urdubit.com',
        'doc': 'https://blinktrade.com/docs',
    },
    'comment': 'Blinktrade API',
    'markets': {
        'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit' },
    },
})

//-----------------------------------------------------------------------------

var vaultoro = {

    'id': 'vaultoro',
    'name': 'Vaultoro',
    'countries': 'CH',
    'rateLimit': 1000,
    'version': '1',
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
        'api': 'https://api.vaultoro.com',
        'www': 'https://www.vaultoro.com',
        'doc': 'https://api.vaultoro.com',
    },
    'api': {
        'public': {
            'get': [
                'bidandask',
                'buyorders',
                'latest',
                'latesttrades',
                'markets',
                'orderbook',
                'sellorders',
                'transactions/day',
                'transactions/hour',
                'transactions/month',
            ],
        },
        'private': {
            'get': [
                'balance',
                'mytrades',
                'orders',
            ],
            'post': [
                'buy/{symbol}/{type}',
                'cancel/{id}',
                'sell/{symbol}/{type}',
                'withdraw',
            ],
        },
    },

    async fetchMarkets () {
        let result = [];
        let markets = await this.publicGetMarkets ();
        let market = markets['data'];
        let base = market['BaseCurrency'];
        let quote = market['MarketCurrency'];
        let symbol = base + '/' + quote;
        let baseId = base;
        let quoteId = quote;
        let id = market['MarketName'];
        result.push ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
        });
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['data'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency_code'];
            let uppercase = currency.toUpperCase ();
            let free = balance['cash'];
            let used = balance['reserved'];
            let total = this.sum (free, used);
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (params);
        let orderbook = {
            'bids': response['data'][0]['b'],
            'asks': response['data'][1]['s'],
        };
        let result = this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'Gold_Price', 'Gold_Amount');
        result['bids'] = this.sortBy (result['bids'], 0, true);
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let quote = await this.publicGetBidandask (params);
        let bidsLength = quote['bids'].length;
        let bid = quote['bids'][bidsLength - 1];
        let ask = quote['asks'][0];
        let response = await this.publicGetMarkets (params);
        let ticker = response['data'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['24hHigh']),
            'low': parseFloat (ticker['24hLow']),
            'bid': bid[0],
            'ask': ask[0],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['LastPrice']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['24hVolume']),
            'info': ticker,
        };
    },

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['Time']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['Gold_Price'],
            'amount': trade['Gold_Amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTransactionsDay (params);
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'SymbolType';
        let response = await this[method] (this.extend ({
            'symbol': market['quoteId'].toLowerCase (),
            'type': type,
            'gld': amount,
            'price': price || 1,
        }, params));
        return {
            'info': response,
            'id': response['data']['Order_ID'],
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelId (this.extend ({
            'id': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api == 'public') {
            url += path;
        } else {
            let nonce = this.nonce ();
            url += this.version + '/' + this.implodeParams (path, params);
            let query = this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, this.omit (params, this.extractParams (path)));
            url += '?' + this.urlencode (query);
            headers = {
                'Content-Type': 'application/json',
                'X-Signature': this.hmac (this.encode (url), this.encode (this.secret))
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var vbtc = extend (blinktrade, {
    'id': 'vbtc',
    'name': 'VBTC',
    'countries': 'VN',
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
        'api': {
            'public': 'https://api.blinktrade.com/api',
            'private': 'https://api.blinktrade.com/tapi',
        },
        'www': 'https://vbtc.exchange',
        'doc': 'https://blinktrade.com/docs',
    },
    'comment': 'Blinktrade API',
    'markets': {
        'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC' },
    },
})


//-----------------------------------------------------------------------------

var virwox = {

    'id': 'virwox',
    'name': 'VirWoX',
    'countries': [ 'AT', 'EU' ],
    'rateLimit': 1000,
    'hasCORS': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg',
        'api': {
            'public': 'http://api.virwox.com/api/json.php',
            'private': 'https://www.virwox.com/api/trading.php',
        },
        'www': 'https://www.virwox.com',
        'doc': 'https://www.virwox.com/developers.php',
    },
    'api': {
        'public': {
            'get': [
                'getInstruments',
                'getBestPrices',
                'getMarketDepth',
                'estimateMarketOrder',
                'getTradedPriceVolume',
                'getRawTradeData',
                'getStatistics',
                'getTerminalList',
                'getGridList',
                'getGridStatistics',
            ],
            'post': [
                'getInstruments',
                'getBestPrices',
                'getMarketDepth',
                'estimateMarketOrder',
                'getTradedPriceVolume',
                'getRawTradeData',
                'getStatistics',
                'getTerminalList',
                'getGridList',
                'getGridStatistics',
            ],
        },
        'private': {
            'get': [
                'cancelOrder',
                'getBalances',
                'getCommissionDiscount',
                'getOrders',
                'getTransactions',
                'placeOrder',
            ],
            'post': [
                'cancelOrder',
                'getBalances',
                'getCommissionDiscount',
                'getOrders',
                'getTransactions',
                'placeOrder',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetInstruments ();
        let keys = Object.keys (markets['result']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let market = markets['result'][keys[p]];
            let id = market['instrumentID'];
            let symbol = market['symbol'];
            let base = market['longCurrency'];
            let quote = market['shortCurrency'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetBalances ();
        let balances = response['result']['accountList'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let total = balance['balance'];
            let account = {
                'free': total,
                'used': 0.0,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    },

    async fetchMarketPrice (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicPostGetBestPrices (this.extend ({
            'symbols': [ symbol ],
        }, params));
        let result = response['result'];
        return {
            'bid': this.safeFloat (result[0], 'bestBuyPrice'),
            'ask': this.safeFloat (result[0], 'bestSellPrice'),
        };
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicPostGetMarketDepth (this.extend ({
            'symbols': [ symbol ],
            'buyDepth': 100,
            'sellDepth': 100,
        }, params));
        let orderbook = response['result'][0];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'price', 'volume');
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let end = this.milliseconds ();
        let start = end - 86400000;
        let response = await this.publicGetTradedPriceVolume (this.extend ({
            'instrument': symbol,
            'endDate': this.YmdHMS (end),
            'startDate': this.YmdHMS (start),
            'HLOC': 1,
        }, params));
        let marketPrice = await this.fetchMarketPrice (symbol, params);
        let tickers = response['result']['priceVolumeList'];
        let keys = Object.keys (tickers);
        let length = keys.length;
        let lastKey = keys[length - 1];
        let ticker = tickers[lastKey];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': marketPrice['bid'],
            'ask': marketPrice['ask'],
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': parseFloat (ticker['close']),
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['longVolume']),
            'quoteVolume': parseFloat (ticker['shortVolume']),
            'info': ticker,
        };
    },

    async fetchTrades (market, params = {}) {
        await this.loadMarkets ();
        return await this.publicGetRawTradeData(this.extend ({
            'instrument': market,
            'timespan': 3600,
        }, params));
    },

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'instrument': this.symbol (market),
            'orderType': side.toUpperCase (),
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let response = await this.privatePostPlaceOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderID'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'orderID': id,
        }, params));
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let auth = {};
        if (api == 'private') {
            auth['key'] = this.apiKey;
            auth['user'] = this.login;
            auth['pass'] = this.password;
        }
        let nonce = this.nonce ();
        if (method == 'GET') {
            url += '?' + this.urlencode (this.extend ({
                'method': path,
                'id': nonce,
            }, auth, params));
        } else {
            headers = { 'Content-Type': 'application/json' };
            body = this.json ({
                'method': path,
                'params': this.extend (auth, params),
                'id': nonce,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            if (response['error'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

//-----------------------------------------------------------------------------

var wex = extend (btce, {

    'id': 'wex',
    'name': 'WEX',
    'countries': 'NZ', // New Zealand
    'version': '3',
    'hasFetchTickers': true,
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
        'api': {
            'public': 'https://wex.nz/api',
            'private': 'https://wex.nz/tapi',
        },
        'www': 'https://wex.nz',
        'doc': [
            'https://wex.nz/api/3/docs',
            'https://wex.nz/tapi/docs',
        ],
    },
    'api': {
        'public': {
            'get': [
                'info',
                'ticker/{pair}',
                'depth/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'getInfo',
                'Trade',
                'ActiveOrders',
                'OrderInfo',
                'CancelOrder',
                'TradeHistory',
                'TransHistory',
                'CoinDepositAddress',
                'WithdrawCoin',
                'CreateCoupon',
                'RedeemCoupon',
            ],
        }
    },
})

//-----------------------------------------------------------------------------

var xbtce = {

    'id': 'xbtce',
    'name': 'xBTCe',
    'countries': 'RU',
    'rateLimit': 2000, // responses are cached every 2 seconds
    'version': 'v1',
    'hasPublicAPI': false,
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg',
        'api': 'https://cryptottlivewebapi.xbtce.net:8443/api',
        'www': 'https://www.xbtce.com',
        'doc': [
            'https://www.xbtce.com/tradeapi',
            'https://support.xbtce.info/Knowledgebase/Article/View/52/25/xbtce-exchange-api',
        ],
    },
    'api': {
        'public': {
            'get': [
                'currency',
                'currency/{filter}',
                'level2',
                'level2/{filter}',
                'quotehistory/{symbol}/{periodicity}/bars/ask',
                'quotehistory/{symbol}/{periodicity}/bars/bid',
                'quotehistory/{symbol}/level2',
                'quotehistory/{symbol}/ticks',
                'symbol',
                'symbol/{filter}',
                'tick',
                'tick/{filter}',
                'ticker',
                'ticker/{filter}',
                'tradesession',
            ],
        },
        'private': {
            'get': [
                'tradeserverinfo',
                'tradesession',
                'currency',
                'currency/{filter}',
                'level2',
                'level2/{filter}',
                'symbol',
                'symbol/{filter}',
                'tick',
                'tick/{filter}',
                'account',
                'asset',
                'asset/{id}',
                'position',
                'position/{id}',
                'trade',
                'trade/{id}',
                'quotehistory/{symbol}/{periodicity}/bars/ask',
                'quotehistory/{symbol}/{periodicity}/bars/ask/info',
                'quotehistory/{symbol}/{periodicity}/bars/bid',
                'quotehistory/{symbol}/{periodicity}/bars/bid/info',
                'quotehistory/{symbol}/level2',
                'quotehistory/{symbol}/level2/info',
                'quotehistory/{symbol}/periodicities',
                'quotehistory/{symbol}/ticks',
                'quotehistory/{symbol}/ticks/info',
                'quotehistory/cache/{symbol}/{periodicity}/bars/ask',
                'quotehistory/cache/{symbol}/{periodicity}/bars/bid',
                'quotehistory/cache/{symbol}/level2',
                'quotehistory/cache/{symbol}/ticks',
                'quotehistory/symbols',
                'quotehistory/version',
            ],
            'post': [
                'trade',
                'tradehistory',
            ],
            'put': [
                'trade',
            ],
            'delete': [
                'trade',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.privateGetSymbol ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['Symbol'];
            let base = market['MarginCurrency'];
            let quote = market['ProfitCurrency'];
            if (base == 'DSH')
                base = 'DASH';
            let symbol = base + '/' + quote;
            symbol = market['IsTradeAllowed'] ? symbol : id;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAsset ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['Currency'];
            let uppercase = currency.toUpperCase ();
            // xbtce names DASH incorrectly as DSH
            if (uppercase == 'DSH')
                uppercase = 'DASH';
            let account = {
                'free': balance['FreeAmount'],
                'used': balance['LockedAmount'],
                'total': balance['Amount'],
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.privateGetLevel2Filter (this.extend ({
            'filter': market['id'],
        }, params));
        orderbook = orderbook[0];
        let timestamp = orderbook['Timestamp'];
        return this.parseOrderBook (orderbook, timestamp, 'Bids', 'Asks', 'Price', 'Volume');
    },

    parseTicker (ticker, market = undefined) {
        let timestamp = 0;
        let last = undefined;
        if ('LastBuyTimestamp' in ticker)
            if (timestamp < ticker['LastBuyTimestamp']) {
                timestamp = ticker['LastBuyTimestamp'];
                last = ticker['LastBuyPrice'];
            }
        if ('LastSellTimestamp' in ticker)
            if (timestamp < ticker['LastSellTimestamp']) {
                timestamp = ticker['LastSellTimestamp'];
                last = ticker['LastSellPrice'];
            }
        if (!timestamp)
            timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['DailyBestBuyPrice'],
            'low': ticker['DailyBestSellPrice'],
            'bid': ticker['BestBid'],
            'ask': ticker['BestAsk'],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': last,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['DailyTradedTotalVolume'],
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        tickers = this.indexBy (tickers, 'Symbol');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let base = id.slice (0, 3);
                let quote = id.slice (3, 6);
                if (base == 'DSH')
                    base = 'DASH';
                if (quote == 'DSH')
                    quote = 'DASH';
                symbol = base + '/' + quote;
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTickerFilter (this.extend ({
            'filter': market['id'],
        }, params));
        let length = tickers.length;
        if (length < 1)
            throw new ExchangeError (this.id + ' fetchTicker returned empty response, xBTCe public API error');
        tickers = this.indexBy (tickers, 'Symbol');
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        // no method for trades?
        return await this.privateGetTrade (params);
    },

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['Timestamp'],
            ohlcv['Open'],
            ohlcv['High'],
            ohlcv['Low'],
            ohlcv['Close'],
            ohlcv['Volume'],
        ];
    },

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOHLCV is disabled by the exchange');
        let minutes = parseInt (timeframe / 60); // 1 minute by default
        let periodicity = minutes.toString ();
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!since)
            since = this.seconds () - 86400 * 7; // last day by defulat
        if (!limit)
            limit = 1000; // default
        let response = await this.privateGetQuotehistorySymbolPeriodicityBarsBid (this.extend ({
            'symbol': market['id'],
            'periodicity': periodicity,
            'timestamp': since,
            'count': limit,
        }, params));
        return this.parseOHLCVs (response['Bars'], market, timeframe, since, limit);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let response = await this.tapiPostTrade (this.extend ({
            'pair': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['Id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privateDeleteTrade (this.extend ({
            'Type': 'Cancel',
            'Id': id,
        }, params));
    },

    nonce () {
        return this.milliseconds ();
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests, their public API is always busy');
        if (!this.uid)
            throw new AuthenticationError (this.id + ' requires uid property for authentication and trading');
        let url = this.urls['api'] + '/' + this.version;
        if (api == 'public')
            url += '/' + api;
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            headers = { 'Accept-Encoding': 'gzip, deflate' };
            let nonce = this.nonce ().toString ();
            if (method == 'POST') {
                if (Object.keys (query).length) {
                    headers['Content-Type'] = 'application/json';
                    body = this.json (query);
                }
                else
                    url += '?' + this.urlencode (query);
            }
            let auth = nonce + this.uid + this.apiKey + method + url;
            if (body)
                auth += body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            let credentials = this.uid + ':' + this.apiKey + ':' + nonce + ':' + this.binaryToString (signature);
            headers['Authorization'] = 'HMAC ' + credentials;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },
}

//-----------------------------------------------------------------------------

var yobit = extend (btce, {

    'id': 'yobit',
    'name': 'YoBit',
    'countries': 'RU',
    'rateLimit': 3000, // responses are cached every 2 seconds
    'version': '3',
    'hasCORS': false,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
        'api': {
            'public': 'https://yobit.net/api',
            'private': 'https://yobit.net/tapi',
        },
        'www': 'https://www.yobit.net',
        'doc': 'https://www.yobit.net/en/api/',
    },
    'api': {
        'public': {
            'get': [
                'depth/{pair}',
                'info',
                'ticker/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'ActiveOrders',
                'CancelOrder',
                'GetDepositAddress',
                'getInfo',
                'OrderInfo',
                'Trade',
                'TradeHistory',
                'WithdrawCoinsToAddress',
            ],
        },
    },
    'fees': {
        'trading': {
            'maker': 0.002,
            'taker': 0.002,
        },
        'funding': 0.0,
    },

    commonCurrencyCode (currency) {
        if (currency == 'PAY')
            return 'EPAY';
        if (currency == 'OMG')
            return 'OMGame';
        if (currency == 'REP')
            return 'Republicoin';
        if (currency == 'NAV')
            return 'NavajoCoin';
        if (currency == 'LIZI')
            return 'LiZi';
        if (currency == 'BCC')
            return 'BCH';
        if (currency == 'ANI')
            return 'ANICoin';
        if (currency == 'BTS')
            return 'Bitshares2';
        return currency;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let sides = { 'free': 'funds', 'total': 'funds_incl_orders' };
        let keys = Object.keys (sides);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let side = sides[key];
            if (side in balances) {
                let currencies = Object.keys (balances[side]);
                for (let j = 0; j < currencies.length; j++) {
                    let lowercase = currencies[j];
                    let uppercase = lowercase.toUpperCase ();
                    let currency = this.commonCurrencyCode (uppercase);
                    let account = undefined;
                    if (currency in result) {
                        account = result[currency];
                    } else {
                        account = this.account ();
                    }
                    account[key] = balances[side][lowercase];
                    if (account['total'] && account['free'])
                        account['used'] = account['total'] - account['free'];
                    result[currency] = account;
                }
            }
        }
        return this.parseBalance (result);
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoinsToAddress (this.extend ({
            'coinName': currency,
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    },
})

//-----------------------------------------------------------------------------

var yunbi = extend (acx, {

    'id': 'yunbi',
    'name': 'YUNBI',
    'countries': 'CN',
    'rateLimit': 1000,
    'version': 'v2',
    'hasCORS': false,
    'hasFetchTickers': true,
    'hasFetchOHLCV': true,
    'timeframes': {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '30m': '30',
        '1h': '60',
        '2h': '120',
        '4h': '240',
        '12h': '720',
        '1d': '1440',
        '3d': '4320',
        '1w': '10080',
    },
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg',
        'extension': '.json', // default extension appended to endpoint URLs
        'api': 'https://yunbi.com',
        'www': 'https://yunbi.com',
        'doc': [
            'https://yunbi.com/documents/api/guide',
            'https://yunbi.com/swagger/',
        ],
    },
    'api': {
        'public': {
            'get': [
                'tickers',
                'tickers/{market}',
                'markets',
                'order_book',
                'k',
                'depth',
                'trades',
                'k_with_pending_trades',
                'timestamp',
                'addresses/{address}',
                'partners/orders/{id}/trades',
            ],
        },
        'private': {
            'get': [
                'deposits',
                'members/me',
                'deposit',
                'deposit_address',
                'order',
                'orders',
                'trades/my',
            ],
            'post': [
                'order/delete',
                'orders',
                'orders/multi',
                'orders/clear',
            ],
        },
    },
})

//-----------------------------------------------------------------------------

var zaif = {

    'id': 'zaif',
    'name': 'Zaif',
    'countries': 'JP',
    'rateLimit': 2000,
    'version': '1',
    'hasCORS': false,
    'hasFetchOpenOrders': true,
    'hasFetchClosedOrders': true,
    'hasWithdraw': true,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
        'api': 'https://api.zaif.jp',
        'www': 'https://zaif.jp',
        'doc': [
            'http://techbureau-api-document.readthedocs.io/ja/latest/index.html',
            'https://corp.zaif.jp/api-docs',
            'https://corp.zaif.jp/api-docs/api_links',
            'https://www.npmjs.com/package/zaif.jp',
            'https://github.com/you21979/node-zaif',
        ],
    },
    'api': {
        'public': {
            'get': [
                'depth/{pair}',
                'currencies/{pair}',
                'currencies/all',
                'currency_pairs/{pair}',
                'currency_pairs/all',
                'last_price/{pair}',
                'ticker/{pair}',
                'trades/{pair}',
            ],
        },
        'private': {
            'post': [
                'active_orders',
                'cancel_order',
                'deposit_history',
                'get_id_info',
                'get_info',
                'get_info2',
                'get_personal_info',
                'trade',
                'trade_history',
                'withdraw',
                'withdraw_history',
            ],
        },
        'ecapi': {
            'post': [
                'createInvoice',
                'getInvoice',
                'getInvoiceIdsByOrderNumber',
                'cancelInvoice',
            ],
        },
    },

    async fetchMarkets () {
        let markets = await this.publicGetCurrencyPairsAll ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['currency_pair'];
            let symbol = market['name'];
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    },

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let currencies = Object.keys (balances['funds']);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let balance = balances['funds'][currency];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            if ('deposit' in balances) {
                if (currency in balances['deposit']) {
                    account['total'] = balances['deposit'][currency];
                    account['used'] = account['total'] - account['free'];
                }
            }
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    },

    async fetchOrderBook (market, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetDepthPair (this.extend ({
            'pair': this.marketId (market),
        }, params));
        return this.parseOrderBook (orderbook);
    },

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'],
            'ask': ticker['ask'],
            'vwap': ticker['vwap'],
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': ticker['last'],
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': ticker['volume'],
            'info': ticker,
        };
    },

    parseTrade (trade, market = undefined) {
        let side = (trade['trade_type'] == 'bid') ? 'buy' : 'sell';
        let timestamp = trade['date'] * 1000;
        let id = this.safeString (trade, 'id');
        id = this.safeString (trade, 'tid', id);
        if (!market)
            market = this.markets_by_id[trade['currency_pair']];
        return {
            'id': id.toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    },

    async fetchTrades (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesPair (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market);
    },

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type == 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let response = await this.privatePostTrade (this.extend ({
            'currency_pair': this.marketId (symbol),
            'action': (side == 'buy') ? 'bid' : 'ask',
            'amount': amount,
            'price': price,
        }, params));
        return {
            'info': response,
            'id': response['return']['order_id'].toString (),
        };
    },

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    parseOrder (order, market = undefined) {
        let side = (order['action'] == 'bid') ? 'buy' : 'sell';
        let timestamp = parseInt (order['timestamp']) * 1000;
        if (!market)
            market = this.markets_by_id[order['currency_pair']];
        let price = order['price'];
        let amount = order['amount'];
        return {
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    },

    parseOrders (orders, market = undefined) {
        let ids = Object.keys (orders);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = orders[id];
            let extended = this.extend (order, { 'id': id });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    },

    async fetchOpenOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            // 'is_token': false,
            // 'is_token_both': false,
        };
        if (symbol) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        let response = await this.privatePostActiveOrders (this.extend (request, params));
        return this.parseOrders (response['return'], market);
    },

    async fetchClosedOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            // 'from': 0,
            // 'count': 1000,
            // 'from_id': 0,
            // 'end_id': 1000,
            // 'order': 'DESC',
            // 'since': 1503821051,
            // 'end': 1503821051,
            // 'is_token': false,
        };
        if (symbol) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        let response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseOrders (response['return'], market);
    },

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        if (currency == 'JPY')
            throw new ExchangeError (this.id + ' does not allow ' + currency + ' withdrawals');
        let result = await this.privatePostWithdraw (this.extend ({
            'currency': currency,
            'amount': amount,
            'address': address,
            // 'message': 'Hi!', // XEM only
            // 'opt_fee': 0.003, // BTC and MONA only
        }, params));
        return {
            'info': result,
            'id': result['return']['txid'],
            'fee': result['return']['fee'],
        };
    },

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api == 'public') {
            url += 'api/' + this.version + '/' + this.implodeParams (path, params);
        } else {
            url += (api == 'ecapi') ? 'ecapi' : 'tapi';
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    },

    async request (path, api = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response)
            throw new ExchangeError (this.id + ' ' + response['error']);
        if ('success' in response)
            if (!response['success'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    },
}

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
            return new Exchange (extend (exchanges[id], params))
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

    // exceptions

    BaseError,
    ExchangeError,
    NotSupported,
    AuthenticationError,
    InsufficientFunds,
    InvalidOrder,
    NetworkError,
    DDoSProtection,
    RequestTimeout,
    ExchangeNotAvailable,

    // common utility functions

    sleep,
    timeout,
    capitalize,
    keysort,
    extend,
    deepExtend,
    omit,
    groupBy,
    indexBy,
    sortBy,
    flatten,
    unique,
    pluck,
    urlencode,
    rawencode,
    sum,
    decimal,
    safeFloat,
    safeString,
    safeInteger,
    safeValue,
    ordered,
    aggregate,
    truncate,

    // underscore aliases

    index_by: indexBy,
    sort_by: sortBy,
    safe_float: safeFloat,
    safe_string: safeString,
    safe_integer: safeInteger,
    safe_value: safeValue,

    // crypto functions

    binaryConcat,
    stringToBinary,
    binaryToString,
    stringToBase64,
    utf16ToBase64,
    base64ToBinary,
    base64ToString,
    urlencodeBase64,
    hash,
    hmac,
    jwt,

})

//-----------------------------------------------------------------------------

if (isCommonJS) {

    module.exports = ccxt

} else {

    window.ccxt = ccxt
}

//-----------------------------------------------------------------------------

}) () // end of namespace
