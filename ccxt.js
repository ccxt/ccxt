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

const version = '1.9.282'

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

class OrderNotFound extends InvalidOrder {
    constructor (message) {
        super (message)
        this.constructor = OrderNotFound
        this.__proto__   = OrderNotFound.prototype
        this.message     = message
    }
}

class OrderNotCached extends InvalidOrder {
    constructor (message) {
        super (message)
        this.constructor = OrderNotCached
        this.__proto__   = OrderNotCached.prototype
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

    // if (args.length < 1)
    //     return args
    // else if (args.length < 2)
    //     return args[0]

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

const filterBy = (array, key, value = undefined) => {
    if (value) {
        let grouped = groupBy (array, key)
        if (value in grouped)
            return grouped[value]
        return []
    }
    return array
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

    this.handleErrors = function (statusCode, statusText, url, method, headers, body) {
        return;
    }

    this.defaultErrorHandler = function (code, reason, url, method, headers, body) {
        if (this.verbose)
            console.log (this.id, method, url, body ? ("\nResponse:\n" + body) : '')
        if ((code >= 200) && (code <= 300))
            return body
        let error = undefined
        this.last_http_response = body
        let details = body
        if ([ 429 ].includes (code)) {
            error = DDoSProtection
        } else if ([ 404, 409, 422, 500, 501, 502, 520, 521, 522, 525 ].includes (code)) {
            error = ExchangeNotAvailable
        } else if ([ 400, 403, 405, 503, 530 ].includes (code)) {
            let ddosProtection = body.match (/cloudflare|incapsula/i)
            if (ddosProtection) {
                error = DDoSProtection
            } else {
                error = ExchangeNotAvailable
                details = body + ' (possible reasons: ' + [
                    'invalid API keys',
                    'bad or old nonce',
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting',
                ].join (', ') + ')'
            }
        } else if ([ 408, 504 ].includes (code)) {
            error = RequestTimeout
        } else if ([ 401, 511 ].includes (code)) {
            error = AuthenticationError
        } else {
            error = ExchangeError
        }
        throw new error ([ this.id, method, url, code, reason, details ].join (' '))
    }

    this.handleRestErrors = function (response, url, method = 'GET', headers = undefined, body = undefined) {

        if (typeof response == 'string')
            return response

        return response.text ().then (text => {

            const args = [ response.status, response.statusText, url, method, headers, text ]

            this.handleErrors (...args)
            return this.defaultErrorHandler (...args)
        })
    }

    this.handleRestResponse = function (response, url, method = 'GET', headers = undefined, body = undefined) {

        try {

            this.last_http_response = response
            this.last_json_response =
                ((typeof response == 'string') && (response.length > 1)) ?
                    JSON.parse (response) : response
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
        let values = Object.values (markets).map (market => deepExtend ({
            'limits': this.limits,
            'precision': this.precision,
        }, this.fees['trading'], market))
        this.markets = deepExtend (this.markets, indexBy (values, 'symbol'))
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

    this.filterOrdersBySymbol = function (orders, symbol = undefined) {
        let grouped = this.groupBy (orders, 'symbol')
        if (symbol) {
            if (symbol in grouped)
                return grouped[symbol]
            return []
        }
        return orders
    }

    this.parseOHLCV = function (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return ohlcv
    }

    this.parseOHLCVs = function (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return Object.values (ohlcvs).map (ohlcv => this.parseOHLCV (ohlcv, market, timeframe, since, limit))
    }

    this.editLimitBuyOrder = function (id, symbol, ...args) {
        return this.editLimitOrder (id, symbol, 'buy', ...args)
    }

    this.editLimitSellOrder = function (id, symbol, ...args) {
        return this.editLimitOrder (id, symbol, 'sell', ...args)
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
        return this.truncate(amount, this.markets[symbol].precision.amount)
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
        this[property] = deepExtend (this[property], config[property])

    this.account                     = this.account
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

const _1broker           = require ('./exchanges/_1broker.js')
const _1btcxe            = require ('./exchanges/_1btcxe.js')
const acx                = require ('./exchanges/acx.js')
const allcoin            = require ('./exchanges/allcoin.js')
const anxpro             = require ('./exchanges/anxpro.js')
const binance            = require ('./exchanges/binance.js')
const bit2c              = require ('./exchanges/bit2c.js')
const bitbay             = require ('./exchanges/bitbay.js')
const bitcoincoid        = require ('./exchanges/bitcoincoid.js')
const bitfinex           = require ('./exchanges/bitfinex.js')
const bitfinex2          = require ('./exchanges/bitfinex2.js')
const bitflyer           = require ('./exchanges/bitflyer.js')
const bithumb            = require ('./exchanges/bithumb.js')
const bitlish            = require ('./exchanges/bitlish.js')
const bitmarket          = require ('./exchanges/bitmarket.js')
const bitmex             = require ('./exchanges/bitmex.js')
const bitso              = require ('./exchanges/bitso.js')
const bitstamp1          = require ('./exchanges/bitstamp1.js')
const bitstamp           = require ('./exchanges/bitstamp.js')
const bittrex            = require ('./exchanges/bittrex.js')
const blinktrade         = require ('./exchanges/blinktrade.js')
const bl3p               = require ('./exchanges/bl3p.js')
const bleutrade          = require ('./exchanges/bleutrade.js')
const btcbox             = require ('./exchanges/btcbox.js')
const btcchina           = require ('./exchanges/btcchina.js')
const btce               = require ('./exchanges/btce.js')
const btcmarkets         = require ('./exchanges/btcmarkets.js')
const btcexchange        = require ('./exchanges/btcexchange.js')
const btctradeua         = require ('./exchanges/btctradeua.js')
const btcturk            = require ('./exchanges/btcturk.js')
const btcx               = require ('./exchanges/btcx.js')
const bter               = require ('./exchanges/bter.js')
const bxinth             = require ('./exchanges/bxinth.js')
const ccex               = require ('./exchanges/ccex.js')
const cex                = require ('./exchanges/cex.js')
const chbtc              = require ('./exchanges/chbtc.js')
const chilebit           = require ('./exchanges/chilebit.js')
const coincheck          = require ('./exchanges/coincheck.js')
const coinfloor          = require ('./exchanges/coinfloor.js')
const coingi             = require ('./exchanges/coingi.js')
const coinmarketcap      = require ('./exchanges/coinmarketcap.js')
const coinmate           = require ('./exchanges/coinmate.js')
const coinsecure         = require ('./exchanges/coinsecure.js')
const coinspot           = require ('./exchanges/coinspot.js')
const cryptopia          = require ('./exchanges/cryptopia.js')
const dsx                = require ('./exchanges/dsx.js')
const exmo               = require ('./exchanges/exmo.js')
const flowbtc            = require ('./exchanges/flowbtc.js')
const foxbit             = require ('./exchanges/foxbit.js')
const fybse              = require ('./exchanges/fybse.js')
const fybsg              = require ('./exchanges/fybsg.js')
const gatecoin           = require ('./exchanges/gatecoin.js')
const gateio             = require ('./exchanges/gateio.js')
const gdax               = require ('./exchanges/gdax.js')
const gemini             = require ('./exchanges/gemini.js')
const hitbtc             = require ('./exchanges/hitbtc.js')
const hitbtc2            = require ('./exchanges/hitbtc2.js')
const huobi1             = require ('./exchanges/huobi1.js')
const huobicny           = require ('./exchanges/huobicny.js')
const huobipro           = require ('./exchanges/huobipro.js')
const huobi              = require ('./exchanges/huobi.js')
const independentreserve = require ('./exchanges/independentreserve.js')
const itbit              = require ('./exchanges/itbit.js')
const jubi               = require ('./exchanges/jubi.js')
const kraken             = require ('./exchanges/kraken.js')
const kuna               = require ('./exchanges/kuna.js')
const lakebtc            = require ('./exchanges/lakebtc.js')
const livecoin           = require ('./exchanges/livecoin.js')
const liqui              = require ('./exchanges/liqui.js')
const luno               = require ('./exchanges/luno.js')
const mercado            = require ('./exchanges/mercado.js')
const mixcoins           = require ('./exchanges/mixcoins.js')
const nova               = require ('./exchanges/nova.js')
const okcoincny          = require ('./exchanges/okcoincny.js')
const okcoinusd          = require ('./exchanges/okcoinusd.js')
const okex               = require ('./exchanges/okex.js')
const paymium            = require ('./exchanges/paymium.js')
const poloniex           = require ('./exchanges/poloniex.js')
const quadrigacx         = require ('./exchanges/quadrigacx.js')
const qryptos            = require ('./exchanges/qryptos.js')
const quoine             = require ('./exchanges/quoine.js')
const southxchange       = require ('./exchanges/southxchange.js')
const surbitcoin         = require ('./exchanges/surbitcoin.js')
const tidex              = require ('./exchanges/tidex.js')
const therock            = require ('./exchanges/therock.js')
const urdubit            = require ('./exchanges/urdubit.js')
const vaultoro           = require ('./exchanges/vaultoro.js')
const vbtc               = require ('./exchanges/vbtc.js')
const virwox             = require ('./exchanges/virwox.js')
const wex                = require ('./exchanges/wex.js')
const xbtce              = require ('./exchanges/xbtce.js')
const yobit              = require ('./exchanges/yobit.js')
const yunbi              = require ('./exchanges/yunbi.js')
const zaif               = require ('./exchanges/zaif.js')

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

    // exceptions

    BaseError,
    ExchangeError,
    NotSupported,
    AuthenticationError,
    InsufficientFunds,
    InvalidOrder,
    OrderNotCached,
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
    filterBy,
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
    group_by: groupBy,
    filter_by: filterBy,
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
