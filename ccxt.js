"use strict";

(function () {

//-----------------------------------------------------------------------------

var version = '1.1.101'
var isNode  = (typeof window === 'undefined')
var isReactNative = false

try {

    let reactNative = require ('react-native')
    isReactNative = reactNative != undefined

} catch (e) {

    isReactNative = false
}

//-----------------------------------------------------------------------------

class CCXTError extends Error {
    constructor (message) {
        super (message)
        // a workaround to make `instanceof CCXTError` work in ES5
        this.constructor = CCXTError 
        this.__proto__   = CCXTError.prototype
        this.message     = message
    }
}

class DDoSProtectionError extends CCXTError {
    constructor (message) {
        super (message)
        this.constructor = DDoSProtectionError 
        this.__proto__   = DDoSProtectionError.prototype
        this.message     = message
    }
}

class TimeoutError extends CCXTError {
    constructor (message) {
        super (message)
        this.constructor = TimeoutError 
        this.__proto__   = TimeoutError.prototype
        this.message     = message
    }
}

class AuthenticationError extends CCXTError {
    constructor (message) {
        super (message)
        this.constructor = AuthenticationError
        this.__proto__   = AuthenticationError.prototype
        this.message     = message
    }    
}

class NotAvailableError extends CCXTError {
    constructor (message) {
        super (message)
        this.constructor = NotAvailableError
        this.__proto__   = NotAvailableError.prototype
        this.message     = message
    }    
}

class MarketNotAvailableError extends NotAvailableError {
    constructor (message) {
        super (message)
        this.constructor = MarketNotAvailableError
        this.__proto__   = MarketNotAvailableError.prototype
        this.message     = message
    }    
}

class EndpointNotAvailableError extends NotAvailableError {
    constructor (message) {
        super (message)
        this.constructor = EndpointNotAvailableError
        this.__proto__   = EndpointNotAvailableError.prototype
        this.message     = message
    }       
}

class OrderBookNotAvailableError extends NotAvailableError {
    constructor (message) {
        super (message)
        this.constructor = OrderBookNotAvailableError
        this.__proto__   = OrderBookNotAvailableError.prototype
        this.message     = message
    }    
}

class TickerNotAvailableError extends NotAvailableError {
    constructor (message) {
        super (message)
        this.constructor = TickerNotAvailableError
        this.__proto__   = TickerNotAvailableError.prototype
        this.message     = message
    }    
}

//-----------------------------------------------------------------------------
// utility helpers

let sleep = ms => new Promise (resolve => setTimeout (resolve, ms));

var timeout = (ms, promise) =>
        Promise.race ([
            promise,
            sleep (ms).then (() => { throw new TimeoutError ('request timed out') })
        ])

var capitalize = function (string) {
    return string.length ? (string.charAt (0).toUpperCase () + string.slice (1)) : string
}

var keysort = function (object) {
    const result = {}
    Object.keys (object).sort ().forEach (key => result[key] = object[key])
    return result
}

var extend = function () {
    const result = {}
    for (var i = 0; i < arguments.length; i++)
        if (typeof arguments[i] === 'object')
            Object.keys (arguments[i]).forEach (key =>
                (result[key] = arguments[i][key]))
    return result
}

var omit = function (object) {
    var result = extend (object)
    for (var i = 1; i < arguments.length; i++)
        if (typeof arguments[i] === 'string')
            delete result[arguments[i]]
        else if (Array.isArray (arguments[i]))
            for (var k = 0; k < arguments[i].length; k++)
                delete result[arguments[i][k]]
    return result
}

var indexBy = function (array, key) {
    const result = {}
    for (var i = 0; i < array.length; i++) {
        let element = array[i]
        if (typeof element[key] != 'undefined') {
            result[element[key]] = element
        }
    }
    return result
}

var sortBy = function (array, key, descending = false) {
    descending = descending ? -1 : 1
    return array.sort ((a, b) => ((a[key] < b[key]) ? -descending : ((a[key] > b[key]) ? descending : 0)))
}

var flatten = function (array, result = []) {
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

var unique = function (array) {
    return array.filter ((value, index, self) => (self.indexOf (value) == index))
}

var pluck = function (array, key) {
    return (array
        .filter (element => (typeof element[key] != 'undefined'))
        .map (element => element[key]))
}

var urlencode = function (object) {
    // this is related to the Kraken workaround, see issues #52 and #23
    return qs.stringify (object)
}

var sum = function (... args) {
    let result = args.filter (arg => typeof arg != 'undefined')
    return (result.length > 0) ? 
        result.reduce ((sum, value) => sum + value, 0) : undefined
}

//-----------------------------------------------------------------------------
// platform-specific code (Node.js / Web Browsers)

if (isNode) {

    var crypto   = module.require ('crypto')
    var CryptoJS = module.require ('crypto-js')
    var fetch    = module.require ('node-fetch')
    var qs       = module.require ('qs')

} else if (isReactNative) {

    var crypto   = require ('crypto')
    var CryptoJS = require ('crypto-js')    
    var fetch    = window.fetch
    var qs       = require ('qs')

} else {

    // a quick fetch polyfill
    
    var fetch = function (url, options, verbose = false) {

        return new Promise ((resolve, reject) => {

            if (verbose)
                console.log (url, options)

            var xhr = new XMLHttpRequest ()
            var method = options.method || 'GET'

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
    }
}

//-----------------------------------------------------------------------------
// string ←→ binary ←→ base64 conversion routines

var stringToBinary = function (string) {
    return CryptoJS.enc.Latin1.parse (string)
}

var stringToBase64 = function (string) {
    return CryptoJS.enc.Latin1.parse (string).toString (CryptoJS.enc.Base64)
}

var utf16ToBase64  = function (string) {
    return CryptoJS.enc.Utf16.parse (string).toString (CryptoJS.enc.Base64)
}

var base64ToBinary = function (string) {
    return CryptoJS.enc.Base64.parse (string)
}

var base64ToString = function (string) {
    return CryptoJS.enc.Base64.parse (string).toString (CryptoJS.enc.Utf8)
}

// url-safe-base64 without equals signs, with + replaced by - and slashes replaced by underscores
var urlencodeBase64 = function (base64string) {
    return base64string.replace (/[=]+$/, '').replace (/\+/g, '-').replace (/\//g, '_')
}

//-----------------------------------------------------------------------------
// cryptography

var hash = function (request, hash = 'md5', digest = 'hex') {
    var encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
    return CryptoJS[hash.toUpperCase ()] (request).toString (CryptoJS.enc[encoding])
}

var hmac = function (request, secret, hash = 'sha256', digest = 'hex') {
    var encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
    return CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret).toString (CryptoJS.enc[capitalize (encoding)])
}

//-----------------------------------------------------------------------------
// a special case for Kraken, until we find a better workaround
// this breaks down the support for browsers, see issues #52 and #23

var signForKraken = function (path, request, secret, nonce) {
    const secret_buffer = new Buffer (secret, 'base64');
    const hash          = new crypto.createHash ('sha256');
    const hmac          = new crypto.createHmac ('sha512', secret_buffer);
    const hash_digest   = hash.update (nonce + request).digest ('binary');
    const hmac_digest   = hmac.update (path + hash_digest, 'binary').digest ('base64');
    return hmac_digest;
}

//-----------------------------------------------------------------------------
// a JSON Web Token authentication method

var jwt = function (request, secret, alg = 'HS256', hash = 'sha256') {
    var encodedHeader = urlencodeBase64 (stringToBase64 (JSON.stringify ({ 'alg': alg, 'typ': 'JWT' })))
    var encodedData = urlencodeBase64 (stringToBase64 (JSON.stringify (request)))
    var token = [ encodedHeader, encodedData ].join ('.')
    var signature = urlencodeBase64 (utf16ToBase64 (hmac (token, secret, hash, 'utf16')))
    return [ token, signature ].join ('.')
}

//-----------------------------------------------------------------------------
// the base class

var Market = function (config) {

    this.hash = hash
    this.hmac = hmac
    // a special case until we find a better workaround, see issues #52 and #23
    this.signForKraken = signForKraken 
    this.jwt = jwt // JSON Web Token
    this.stringToBinary = stringToBinary
    this.stringToBase64 = stringToBase64
    this.base64ToBinary = base64ToBinary
    this.base64ToString = base64ToString
    this.utf16ToBase64 = utf16ToBase64
    this.urlencode = urlencode
    this.omit = omit
    this.pluck = pluck
    this.unique = unique
    this.extend = extend
    this.flatten = flatten
    this.indexBy = indexBy
    this.sortBy = sortBy
    this.keysort = keysort
    this.capitalize = capitalize
    this.json = JSON.stringify
    this.sum = sum

    this.encode = string => string
    this.decode = string => string

    this.init = function () {

        if (isNode)
            this.nodeVersion = process.version.match (/\d+\.\d+.\d+/) [0]

        if (this.api)
            Object.keys (this.api).forEach (type => {
                Object.keys (this.api[type]).forEach (method => {
                    var urls = this.api[type][method]
                    for (var i = 0; i < urls.length; i++) {
                        let url = urls[i].trim ()
                        let splitPath = url.split (/[^a-zA-Z0-9]/)

                        let uppercaseMethod  = method.toUpperCase ()
                        let lowercaseMethod  = method.toLowerCase ()
                        let camelcaseMethod  = capitalize (lowercaseMethod)
                        let camelcaseSuffix  = splitPath.map (capitalize).join ('')
                        let underscoreSuffix = splitPath.map (x => x.trim ().toLowerCase ()).filter (x => x.length > 0).join ('_')

                        if (camelcaseSuffix.indexOf (camelcaseMethod) === 0)
                            camelcaseSuffix = camelcaseSuffix.slice (camelcaseMethod.length)

                        if (underscoreSuffix.indexOf (lowercaseMethod) === 0)
                            underscoreSuffix = underscoreSuffix.slice (lowercaseMethod.length)

                        let camelcase  = type + camelcaseMethod + capitalize (camelcaseSuffix)
                        let underscore = type + '_' + lowercaseMethod + '_' + underscoreSuffix

                        let f = (params => this.request (url, type, uppercaseMethod, params))

                        this[camelcase]  = f
                        this[underscore] = f
                    }
                })
            })
    }

    this.fetch = function (url, method = 'GET', headers = undefined, body = undefined) {

        if (isNode) {
            headers = extend ({
                'User-Agent': 'ccxt/' + version + 
                    ' (+https://github.com/kroitor/ccxt)' + 
                    ' Node.js/' + this.nodeVersion + ' (JavaScript)'
            }, headers)
        }

        if (this.proxy.length)
            headers = extend ({ 'Origin': '*' }, headers)

        let options = { 'method': method, 'headers': headers, 'body': body }

        url = this.proxy + url

        if (this.verbose)
            console.log (this.id, url, options)

        return timeout (this.timeout, fetch (url, options)
            .catch (e => {
                if (isNode) {
                    throw new MarketNotAvailableError ([ this.id, method, url, e.type, e.message ].join (' '))
                }
                throw e // rethrow all unknown errors
            })
            .then (response => {
                if (typeof response == 'string')
                    return response
                return response.text ().then (text => {
                    if (response.status == 200)
                        return text
                    let error = undefined
                    let details = undefined
                    if ([ 429 ].indexOf (response.status) >= 0) {
                        error = DDoSProtectionError
                    } else if ([ 500, 501, 502, 404, 525 ].indexOf (response.status) >= 0) {
                        error = MarketNotAvailableError
                    } else if ([ 400, 403, 405, 503 ].indexOf (response.status) >= 0) {
                        let ddosProtection = text.match (/cloudflare|incapsula/i)
                        if (ddosProtection) {
                            error = DDoSProtectionError
                        } else {
                            error = MarketNotAvailableError
                            details = '(possible reasons: ' + [
                                'invalid API keys',
                                'bad or old nonce',
                                'market down or offline', 
                                'on maintenance',
                                'DDoS protection',
                                'rate-limiting in effect',
                            ].join (', ') + ')'                       
                        }
                    } else if ([ 408, 504 ].indexOf (response.status) >= 0) {
                        error = TimeoutError
                    } else if ([ 401, 422, 511 ].indexOf (response.status) >= 0) {
                        error = AuthenticationError
                        details = text
                    } else {
                        error = Error
                        details = 'Unknown Error'
                    }
                    throw new error ([ this.id, method, url, response.status, response.statusText, details ].join (' '))
                })                
            }).then (response => this.handleResponse (url, method, headers, response)))
    }

    this.handleResponse = function (url, method = 'GET', headers = undefined, body = undefined) {

        try {

            return JSON.parse (body)

        } catch (e) {

            let maintenance = body.match (/offline|unavailable|maintain|maintenance|maintenancing/i)
            let ddosProtection = body.match (/cloudflare|incapsula|overload/i)

            if (e instanceof SyntaxError) {

                let error = MarketNotAvailableError
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance or unreachable from this location at the moment'
                if (ddosProtection)
                    error = DDoSProtectionError
                throw new error ([ this.id, method, url, details ].join (' '))
            }

            if (this.verbose)
                console.log (this.id, method, url, 'error', e, "response body:\n'" + body + "'")

            throw e
        }
    }

    this.set_products =
    this.setProducts = function (products) {
        let values = Object.values (products)
        this.products = indexBy (values, 'symbol')
        this.productsById = indexBy (products, 'id')
        this.products_by_id = this.productsById
        this.symbols = Object.keys (this.products)
        let base = this.pluck (values.filter (product => 'base' in product), 'base')
        let quote = this.pluck (values.filter (product => 'quote' in product), 'quote')
        this.currencies = this.unique (base.concat (quote))
        return this.products
    }

    this.load_products =
    this.loadProducts = function (reload = false) {
        if (!reload && this.products) {
            if (!this.productsById) {
                return new Promise ((resolve, reject) => resolve (this.setProducts (this.products)))
            }
            return new Promise ((resolve, reject) => resolve (this.products))             
        }
        return this.fetchProducts ().then (products => {
            return this.setProducts (products)
        })
    }

    this.fetch_products =
    this.fetchProducts = function () {
        return new Promise ((resolve, reject) => resolve (this.products))
    }

    this.commonCurrencyCode = function (currency) {
        return (currency === 'XBT') ? 'BTC' : currency
    }

    this.product = function (product) {
        return (((typeof product === 'string') &&
            (typeof this.products != 'undefined') &&
            (typeof this.products[product] != 'undefined')) ? 
                this.products[product] :
                product)
    }

    this.product_id =
    this.productId = function (product) {
        return this.product (product).id || product
    }

    this.symbol = function (product) {
        return this.product (product).symbol || product
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

    this.create_limit_buy_order =
    this.createLimitBuyOrder = function (product, amount, price, params = {}) {
        return this.createOrder  (product, 'limit', 'buy', amount, price, params)
    }

    this.create_limit_sell_order =
    this.createLimitSellOrder = function (product, amount, price, params = {}) {
        return this.createOrder (product, 'limit', 'sell', amount, price, params)
    }

    this.create_market_buy_order =
    this.createMarketBuyOrder = function (product, amount, params = {}) {
        return this.createOrder (product, 'market', 'buy', amount, undefined, params)
    }

    this.create_market_sell_order =
    this.createMarketSellOrder = function (product, amount, params = {}) {
        return this.createOrder (product, 'market', 'sell', amount, undefined, params)
    }

    this.iso8601        = timestamp => new Date (timestamp).toISOString ()
    this.parse8601      = Date.parse
    this.seconds        = () => Math.floor (this.milliseconds () / 1000)
    this.microseconds   = () => Math.floor (this.milliseconds () * 1000)
    this.milliseconds   = Date.now
    this.nonce          = this.seconds
    this.id             = undefined
    this.rateLimit      = 2000  // milliseconds = seconds * 1000
    this.timeout        = 10000 // milliseconds = seconds * 1000
    this.verbose        = false
    this.twofa          = false // two-factor authentication
    this.yyyymmddhhmmss = timestamp => {
        let date = new Date (timestamp)
        let yyyy = date.getUTCFullYear ()
        let MM = date.getUTCMonth ()
        let dd = date.getUTCDay ()
        let hh = date.getUTCHours ()
        let mm = date.getUTCMinutes ()
        let ss = date.getUTCSeconds ()
        MM = MM < 10 ? ('0' + MM) : MM
        dd = dd < 10 ? ('0' + dd) : dd
        hh = hh < 10 ? ('0' + hh) : hh
        mm = mm < 10 ? ('0' + mm) : mm
        ss = ss < 10 ? ('0' + ss) : ss
        return yyyy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss
    }

    // prepended to URL, like https://proxy.com/https://exchange.com/api...
    this.proxy = '' 

    for (var property in config)
        this[property] = config[property]

    this.fetch_balance    = this.fetchBalance
    this.fetch_order_book = this.fetchOrderBook
    this.fetch_ticker     = this.fetchTicker
    this.fetch_trades     = this.fetchTrades

    this.init ()
}

//=============================================================================

var _1broker = {

    'id': '_1broker',
    'name': '1Broker',
    'countries': 'US',
    'rateLimit': 1500,
    'version': 'v2',
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
        let categories = await this.privateGetMarketCategories ();
        return categories['response'];
    },

    async fetchProducts () {
        let this_ = this; // workaround for Babel bug (not passing `this` to _recursive() call)
        let categories = await this.fetchCategories ();
        let result = [];
        for (let c = 0; c < categories.length; c++) {
            let category = categories[c];
            let products = await this_.privateGetMarketList ({
                'category': category.toLowerCase (),
            });
            for (let p = 0; p < products['response'].length; p++) {
                let product = products['response'][p];
                let id = product['symbol'];
                let symbol = undefined;
                let base = undefined;
                let quote = undefined;
                if ((category == 'FOREX') || (category == 'CRYPTO')) {
                    symbol = product['name'];
                    let parts = symbol.split ('/');
                    base = parts[0];
                    quote = parts[1];
                } else {
                    base = id;
                    quote = 'USD';
                    symbol = base + '/' + quote;
                }
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': product,
                });
            }
        }
        return result;
    },

    async fetchBalance () {
        let balance = await this.privateGetUserOverview ();
        let response = balance['response'];
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            result[currency] = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
        }
        result['BTC']['free'] = parseFloat (response['balance']);
        result['BTC']['total'] = result['BTC']['free'];
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.privateGetMarketQuotes ({
            'symbols': this.productId (product),
        });
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

    async fetchTicker (product) {
        let result = await this.privateGetMarketBars ({
            'symbol': this.productId (product),
            'resolution': 60,
            'limit': 1,
        });
        let orderbook = await this.fetchOrderBook (product);
        let ticker = result['response'][0];
        let timestamp = this.parse8601 (ticker['date']);
        return {
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

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'symbol': this.productId (product),
            'margin': amount,
            'direction': (side == 'sell') ? 'short' : 'long',
            'leverage': 1,
            'type': side,
        };
        if (type == 'limit')
            order['price'] = price;
        else
            order['type'] += '_market';
        return this.privateGetOrderCreate (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrderCancel ({ 'order_id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        let url = this.urls['api'] + '/' + this.version + '/' + path + '.php';
        let query = this.extend ({ 'token': this.apiKey }, params);
        url += '?' + this.urlencode (query);
        return this.fetch (url, method);        
    },
}

//-----------------------------------------------------------------------------

var cryptocapital = {

    'id': 'cryptocapital',
    'name': 'Crypto Capital',
    'comment': 'Crypto Capital API',
    'countries': 'PA', // Panama
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
    'products': {
    },

    async fetchBalance () {
        let response = await this.privatePostBalancesAndInfo ();
        let balance = response['balances-and-info'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance['available'])
                account['free'] = parseFloat (balance['available'][currency]);
            if (currency in balance['on_hold'])
                account['used'] = parseFloat (balance['on_hold'][currency]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderBook ({
            'currency': this.productId (product),
        });
        let orderbook = response['order-book'];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'bid', 'asks': 'ask' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let timestamp = parseInt (order['timestamp']) * 1000;
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['order_amount']);
                result[key].push ([ price, amount, timestamp ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetStats ({
            'currency': this.productId (product),
        });
        let ticker = response['stats'];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTransactions ({
            'currency': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'side': side,
            'type': type,
            'currency': this.productId (product),
            'amount': amount,
        };
        if (type == 'limit')
            order['limit_price'] = price;
        return this.privatePostOrdersNew (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrdersCancel ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id == 'cryptocapital')
            throw new Error (this.id + ' is an abstract base API for _1btcxe');
        let url = this.urls['api'] + '/' + path;
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var _1btcxe = extend (cryptocapital, {

    'id': '_1btcxe',
    'name': '1BTCXE',
    'countries': 'PA', // Panama
    'comment': 'Crypto Capital API',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
        'api': 'https://1btcxe.com/api',
        'www': 'https://1btcxe.com',
        'doc': 'https://1btcxe.com/api-docs.php',
    },
    'products': {
        'BTC/USD': { 'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', },
        'BTC/EUR': { 'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', },
        'BTC/CNY': { 'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', },
        'BTC/RUB': { 'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB', },
        'BTC/CHF': { 'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF', },
        'BTC/JPY': { 'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', },
        'BTC/GBP': { 'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', },
        'BTC/CAD': { 'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', },
        'BTC/AUD': { 'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', },
        'BTC/AED': { 'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED', },
        'BTC/BGN': { 'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN', },
        'BTC/CZK': { 'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK', },
        'BTC/DKK': { 'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK', },
        'BTC/HKD': { 'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD', },
        'BTC/HRK': { 'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK', },
        'BTC/HUF': { 'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF', },
        'BTC/ILS': { 'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS', },
        'BTC/INR': { 'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR', },
        'BTC/MUR': { 'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR', },
        'BTC/MXN': { 'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN', },
        'BTC/NOK': { 'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK', },
        'BTC/NZD': { 'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD', },
        'BTC/PLN': { 'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN', },
        'BTC/RON': { 'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON', },
        'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK', },
        'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', },
        'BTC/THB': { 'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB', },
        'BTC/TRY': { 'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY', },
        'BTC/ZAR': { 'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR', },
    },
})

//-----------------------------------------------------------------------------

var anxpro = {

    'id': 'anxpro',
    'name': 'ANXPro',
    'countries': [ 'JP', 'SG', 'HK', 'NZ', ],
    'version': '2',
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
        'api': 'https://anxpro.com/api',
        'www': 'https://anxpro.com',
        'doc': 'https://anxpro.com/pages/api',
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
    'products': {
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

    async fetchBalance () {
        let response = await this.privatePostMoneyInfo ();
        let balance = response['data'];
        let currencies = Object.keys (balance['Wallets']);
        let result = { 'info': balance };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance['Wallets']) {
                let wallet = balance['Wallets'][currency];
                account['free'] = parseFloat (wallet['Available_Balance']['value']);
                account['total'] = parseFloat (wallet['Balance']['value']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetCurrencyPairMoneyDepthFull ({
            'currency_pair': this.productId (product),
        });
        let orderbook = response['data'];
        let t = parseInt (orderbook['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['amount']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetCurrencyPairMoneyTicker ({
            'currency_pair': this.productId (product),
        });
        let ticker = response['data'];
        let t = parseInt (ticker['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']['value']),
            'low': parseFloat (ticker['low']['value']),
            'bid': parseFloat (ticker['buy']['value']),
            'ask': parseFloat (ticker['sell']['value']),
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

    fetchTrades (product) {
        let error = this.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled';
        throw new EndpointNotAvailableError (error);
        return this.publicGetCurrencyPairMoneyTradeFetch ({
            'currency_pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'currency_pair': this.productId (product),
            'amount_int': amount,
            'type': side,
        };
        if (type == 'limit')
            order['price_int'] = price;
        return this.privatePostCurrencyPairOrderAdd (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCurrencyPairOrderCancel ({ 'oid': id });
    },

    nonce () {
        return this.milliseconds ();
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            let auth = request + "\0" + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.hmac (this.encode (auth), secret, 'sha512', 'base64'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bit2c = {

    'id': 'bit2c',
    'name': 'Bit2C',
    'countries': 'IL', // Israel
    'rateLimit': 3000,
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
    'products': {
        'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS' },
        'LTC/BTC': { 'id': 'LtcBtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS' },
    },

    async fetchBalance () {
        let balance = await this.privatePostAccountBalanceV2 ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance) {
                let available = 'AVAILABLE_' + currency;
                account['free'] = balance[available];
                account['total'] = balance[currency];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetExchangesPairOrderbook ({
            'pair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order[0];
                let amount = order[1];
                let timestamp = order[2] * 1000;
                result[side].push ([ price, amount, timestamp ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetExchangesPairTicker ({
            'pair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h']),
            'low': parseFloat (ticker['l']),
            'bid': undefined,
            'ask': undefined,
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

    fetchTrades (product) {
        return this.publicGetExchangesPairTrades ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostOrderAddOrder';
        let order = {
            'Amount': amount,
            'Pair': this.productId (product),
        };
        if (type == 'market') {
            method += 'MarketPrice' + this.capitalize (side);
        } else {
            order['Price'] = price;
            order['Total'] = amount * price;
            order['IsBid'] = (side == 'buy');
        }
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrderCancelOrder ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (type == 'public') {
            url += '.json';
        } else {
            let nonce = this.nonce ();
            let query = this.extend ({ 'nonce': nonce }, params);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitbay = {

    'id': 'bitbay',
    'name': 'BitBay',
    'countries': [ 'PL', 'EU', ], // Poland
    'rateLimit': 1000,
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
    'products': {
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

    async fetchBalance () {
        let response = await this.privatePostInfo ();
        let balance = response['balances'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance) {
                account['free'] = parseFloat (balance[currency]['available']);
                account['used'] = parseFloat (balance[currency]['locked']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetIdOrderbook ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetIdTicker ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetIdTrades ({
            'id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        return this.privatePostTrade (this.extend ({
            'type': side,
            'currency': p['base'],
            'amount': amount,
            'payment_currency': p['quote'],
            'rate': price,
        }, params));
    },

    cancelOrder (id) {
        return this.privatePostCancel ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        if (type == 'public') {
            url += '/' + this.implodeParams (path, params) + '.json';
        } else {
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitbays = {

    'id': 'bitbays',
    'name': 'BitBays',
    'countries': [ 'CN', 'GB', 'HK', 'AU', 'CA' ],
    'rateLimit': 1500,
    'version': 'v1',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27808599-983687d2-6051-11e7-8d95-80dfcbe5cbb4.jpg',
        'api': 'https://bitbays.com/api',
        'www': 'https://bitbays.com',
        'doc': 'https://bitbays.com/help/api/',
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
    'products': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
        'ODS/BTC': { 'id': 'ods_btc', 'symbol': 'ODS/BTC', 'base': 'ODS', 'quote': 'BTC' },
        'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
        'LSK/CNY': { 'id': 'lsk_cny', 'symbol': 'LSK/CNY', 'base': 'LSK', 'quote': 'CNY' },
    },

    async fetchBalance () {
        let response = await this.privatePostInfo ();
        let balance = response['result']['wallet'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (lowercase in balance) {
                account['free'] = parseFloat (balance[lowercase]['avail']);
                account['used'] = parseFloat (balance[lowercase]['lock']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetDepth ({
            'market': this.productId (product),
        });
        let orderbook = response['result'];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTicker ({
            'market': this.productId (product),
        });
        let ticker = response['result'];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'market': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'market': this.productId (product),
            'op': side,
            'amount': amount,
        };
        if (type == 'market') {
            order['order_type'] = 1;
            order['price'] = price;
        } else {
            order['order_type'] = 0;
        }
        return this.privatePostTrade (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancel ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.secret, 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitcoincoid = {

    'id': 'bitcoincoid',
    'name': 'Bitcoin.co.id',
    'countries': 'ID', // Indonesia
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
    'products': {
        'BTC/IDR':  { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
        'BTS/BTC':  { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc' },
        'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc' },
        'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
        'ETH/BTC':  { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
        'LTC/BTC':  { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
        'NXT/BTC':  { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc' },
        'STR/BTC':  { 'id': 'str_btc', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc' },
        'NEM/BTC':  { 'id': 'nem_btc', 'symbol': 'NEM/BTC', 'base': 'NEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc' },
        'XRP/BTC':  { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
    },

    async fetchBalance () {
        let response = await this.privatePostGetInfo ();
        let balance = response['return']['balance'];
        let frozen = response['return']['balance_hold'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (lowercase in balance) {
                account['free'] = parseFloat (balance[lowercase]);
            }
            if (lowercase in frozen) {
                account['used'] = parseFloat (frozen[lowercase]);
            }
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetPairDepth ({
            'pair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buy', 'asks': 'sell' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let pair = this.product (product);
        let response = await this.publicGetPairTicker ({
            'pair': pair['id'],
        });
        let ticker = response['ticker'];
        let timestamp = parseFloat (ticker['server_time']) * 1000;
        let baseVolume = 'vol_' + pair['baseId'].toLowerCase ();
        let quoteVolume = 'vol_' + pair['quoteId'].toLowerCase ();
        return {
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

    fetchTrades (product) {
        return this.publicGetPairTrades ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let order = {
            'pair': p['id'],
            'type': side,
            'price': price,
        };
        let base = p['base'].toLowerCase ();
        order[base] = amount;
        return this.privatePostTrade (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        if (type == 'public') {
            url += '/' + this.implodeParams (path, params);
        } else {
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitfinex = {

    'id': 'bitfinex',
    'name': 'Bitfinex',
    'countries': 'US',
    'version': 'v1',
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
        'api': 'https://api.bitfinex.com',
        'www': 'https://www.bitfinex.com',
        'doc': [
            'https://bitfinex.readme.io/v1/docs',
            'https://bitfinex.readme.io/v2/docs',
            'https://github.com/bitfinexcom/bitfinex-api-node',
        ],
    },
    'api': {
        'public': {
            'get': [
                'book/{symbol}',
                'candles/{symbol}',
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
                'offer/cancel',
                'offer/new',
                'offer/status',
                'offers',
                'order/cancel',
                'order/cancel/all',
                'order/cancel/multi',
                'order/cancel/replace',
                'order/new',
                'order/new/multi',
                'order/status',
                'orders',
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

    async fetchProducts () {
        let products = await this.publicGetSymbolsDetails ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['pair'].toUpperCase ();
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
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privatePostBalances ();
        let balances = {};
        for (let b = 0; b < response.length; b++) {
            let account = response[b];
            if (account['type'] == 'exchange') {
                let currency = account['currency'];
                // issue #4 Bitfinex names Dash as DSH, instead of DASH
                if (currency == 'DSH')
                    currency = 'DASH';
                let uppercase = currency.toUpperCase ();
                balances[uppercase] = account;
            }
        }
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balances) {
                account['free'] = parseFloat (balances[currency]['available']);
                account['total'] = parseFloat (balances[currency]['amount']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetBookSymbol ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['amount']);
                let timestamp = parseInt (parseFloat (order['timestamp']));
                result[side].push ([ price, amount, timestamp ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetPubtickerSymbol ({
            'symbol': this.productId (product),
        });
        let timestamp = parseFloat (ticker['timestamp']) * 1000;
        return {
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
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTradesSymbol ({
            'symbol': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'symbol': this.productId (product),
            'amount': amount.toString (),
            'side': side,
            'type': 'exchange ' + type,
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type == 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            order['price'] = price;
        }
        return this.privatePostOrderNew (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrderCancel ({ 'order_id': id });
    },

    nonce () {
        return this.milliseconds ();
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (type == 'public') {
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
            headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': payload,
                'X-BFX-SIGNATURE': this.hmac (payload, secret, 'sha384'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitflyer = {

    'id': 'bitflyer',
    'name': 'bitFlyer',
    'countries': 'JP',
    'version': 'v1',
    'rateLimit': 500,
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

    async fetchProducts () {
        let products = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['product_code'];
            let currencies = id.split ('_');
            let base = undefined;
            let quote = undefined;
            let symbol = id;
            let numCurrencies = currencies.length;
            if (numCurrencies == 2) {
                base = currencies[0];
                quote = currencies[1];
                symbol = base + '/' + quote;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
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
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balances) {
                account['total'] = balances[currency]['amount'];
                account['free'] = balances[currency]['available'];                
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetBoard ({
            'product_code': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['size']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ({
            'product_code': this.productId (product),
        });
        let timestamp = this.parse8601 (ticker['timestamp']);
        return {
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

    fetchTrades (product) {
        return this.publicGetExecutions ({
            'product_code': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'product_code': this.productId (product),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        return this.privatePostSendparentorder (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelparentorder (this.extend ({
            'parent_order_id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + path;
        if (type == 'private')
            request = '/me' + request;
        let url = this.urls['api'] + request;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitlish = {

    'id': 'bitlish',
    'name': 'bitlish',
    'countries': [ 'GB', 'EU', 'RU', ],
    'rateLimit': 1500,
    'version': 'v1',
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

    async fetchProducts () {
        let products = await this.publicGetPairs ();
        let result = [];
        let keys = Object.keys (products);
        for (let p = 0; p < keys.length; p++) {
            let product = products[keys[p]];
            let id = product['id'];
            let symbol = product['name'];
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
                'info': product,
            });
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.publicGetTickers ();
        let ticker = tickers[p['id']];
        let timestamp = this.milliseconds ();
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['max']),
            'low': parseFloat (ticker['min']),
            'bid': undefined,
            'ask': undefined,
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

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetTradesDepth ({
            'pair_id': this.productId (product),
        });
        let timestamp = parseInt (parseInt (orderbook['last']) / 1000);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'bid', 'asks': 'ask' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['volume']);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    fetchTrades (product) {
        return this.publicGetTradesHistory ({
            'pair_id': this.productId (product),
        });
    },

    async fetchBalance () {
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
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance) {
                account['free'] = parseFloat (balance[currency]['funds']);
                account['used'] = parseFloat (balance[currency]['holded']);                
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return result;
    },

    signIn () {
        return this.privatePostSignin ({
            'login': this.login,
            'passwd': this.password,
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'pair_id': this.productId (product),
            'dir': (side == 'buy') ? 'bid' : 'ask',
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostCreateTrade (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelTrade ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            body = this.json (this.extend ({ 'token': this.apiKey }, params));
            headers = { 'Content-Type': 'application/json' };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitmarket = {

    'id': 'bitmarket',
    'name': 'BitMarket',
    'countries': [ 'PL', 'EU', ],
    'rateLimit': 1500,
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
    'products': {
        'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
        'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'LiteMineX/BTC': { 'id': 'LiteMineXBTC', 'symbol': 'LiteMineX/BTC', 'base': 'LiteMineX', 'quote': 'BTC' },
        'PlnX/BTC': { 'id': 'PlnxBTC', 'symbol': 'PlnX/BTC', 'base': 'PlnX', 'quote': 'BTC' },
    },

    async fetchBalance () {
        let response = await this.privatePostInfo ();
        let data = response['data'];
        let balance = data['balances'];
        let result = { 'info': data };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balance['available'])
                account['free'] = balance['available'][currency];
            if (currency in balance['blocked'])
                account['used'] = balance['blocked'][currency];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetJsonMarketOrderbook ({
            'market': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;

    },

    async fetchTicker (product) {
        let ticker = await this.publicGetJsonMarketTicker ({
            'market': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetJsonMarketTrades ({
            'market': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTrade (this.extend ({
            'market': this.productId (product),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
    },

    cancelOrder (id) {
        return this.privatePostCancel ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitmex = {

    'id': 'bitmex',
    'name': 'BitMEX',
    'countries': 'SC', // Seychelles
    'version': 'v1',
    'rateLimit': 1500,
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

    async fetchProducts () {
        let products = await this.publicGetInstrumentActive ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['symbol'];
            let base = product['underlying'];
            let quote = product['quoteCurrency'];
            let isFuturesContract = id != (base + quote);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = isFuturesContract ? id : (base + '/' + quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privateGetUserMargin ({ 'currency': 'all' });
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let currency = balance['currency'].toUpperCase ();
            currency = this.commonCurrencyCode (currency);
            let account = {
                'free': balance['availableMargin'],
                'used': undefined,
                'total': balance['amount'],
            };
            if (currency == 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderBookL2 ({
            'symbol': this.productId (product),
        });
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

    async fetchTicker (product) {
        let request = {
            'symbol': this.productId (product),
            'binSize': '1d',
            'partial': true,
            'count': 1,
            'reverse': true,
        };
        let quotes = await this.publicGetQuoteBucketed (request);
        let quotesLength = quotes.length;
        let quote = quotes[quotesLength - 1];
        let tickers = await this.publicGetTradeBucketed (request);
        let ticker = tickers[0];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTrade ({
            'symbol': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'symbol': this.productId (product),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (type == 'limit')
            order['rate'] = price;
        return this.privatePostOrder (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privateDeleteOrder ({ 'orderID': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api/' + this.version + '/' + path;
        if (Object.keys (params).length)
            query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (type == 'private') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitso = {

    'id': 'bitso',
    'name': 'Bitso',
    'countries': 'MX', // Mexico
    'rateLimit': 2000, // 30 requests per minute
    'version': 'v3',
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

    async fetchProducts () {
        let products = await this.publicGetAvailableBooks ();
        let result = [];
        for (let p = 0; p < products['payload'].length; p++) {
            let product = products['payload'][p];
            let id = product['book'];
            let symbol = id.toUpperCase ().replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
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
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderBook ({
            'book': this.productId (product),
        });
        let orderbook = response['payload'];
        let timestamp = this.parse8601 (orderbook['updated_at']);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['amount']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },


    async fetchTicker (product) {
        let response = await this.publicGetTicker ({
            'book': this.productId (product),
        });
        let ticker = response['payload'];
        let timestamp = this.parse8601 (ticker['created_at']);
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'book': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'book': this.productId (product),
            'side': side,
            'type': type,
            'major': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostOrders (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privateDeleteOrders ({ 'oid': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + query;
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bitstamp = {

    'id': 'bitstamp',
    'name': 'Bitstamp',
    'countries': 'GB',
    'rateLimit': 1000,
    'version': 'v2',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
        'api': 'https://www.bitstamp.net/api',
        'www': 'https://www.bitstamp.net',
        'doc': 'https://www.bitstamp.net/api',
    },
    'api': {
        'public': {
            'get': [
                'order_book/{id}/',
                'ticker_hour/{id}/',
                'ticker/{id}/',
                'transactions/{id}/',
            ],
        },
        'private': {
            'post': [
                'balance/',
                'balance/{id}/',
                'buy/{id}/',
                'buy/market/{id}/',
                'cancel_order/',
                'liquidation_address/info/',
                'liquidation_address/new/',
                'open_orders/all/',
                'open_orders/{id}/',
                'sell/{id}/',
                'sell/market/{id}/',
                'transfer-from-main/',
                'transfer-to-main/',
                'user_transactions/',
                'user_transactions/{id}/',
                'withdrawal/cancel/',
                'withdrawal/open/',
                'withdrawal/status/',
                'xrp_address/',
                'xrp_withdrawal/',
            ],
        },
    },
    'products': {
        'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD' },
        'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
        'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR' },
        'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
        'LTC/USD': { 'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
        'LTC/EUR': { 'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
        'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderBookId ({
            'id': this.productId (product),
        });
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTickerId ({
            'id': this.productId (product),
        });
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTransactionsId ({
            'id': this.productId (product),
        });
    },

    async fetchBalance () {
        let balance = await this.privatePostBalance ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let total = lowercase + '_balance';
            let free = lowercase + '_available';
            let used = lowercase + '_reserved';
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (free in balance)
                account['free'] = parseFloat (balance[free]);
            if (used in balance)
                account['used'] = parseFloat (balance[used]);
            if (total in balance)
                account['total'] = parseFloat (balance[total]);
            result[currency] = account;
        }
        return result;
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'id': this.productId (product),
            'amount': amount,
        };
        if (type == 'market')
            method += 'Market';
        else
            order['price'] = price;
        method += 'Id';
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bittrex = {

    'id': 'bittrex',
    'name': 'Bittrex',
    'countries': 'US',
    'version': 'v1.1',
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
        'api': 'https://bittrex.com/api',
        'www': 'https://bittrex.com',
        'doc': [
            'https://bittrex.com/Home/Api',
            'https://www.npmjs.org/package/node.bittrex.api',
        ],
    },
    'api': {
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

    async fetchProducts () {
        let products = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < products['result'].length; p++) {
            let product = products['result'][p];
            let id = product['MarketName'];
            let base = product['MarketCurrency'];
            let quote = product['BaseCurrency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.accountGetBalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'Currency');
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in indexed) {
                let balance = indexed[currency];
                account['free'] = balance['Available'];
                account['used'] = balance['Pending'];
                account['total'] = balance['Balance'];
            }
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderbook ({
            'market': this.productId (product),
            'type': 'both',
            'depth': 50,
        });
        let orderbook = response['result'];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buy', 'asks': 'sell' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['Rate']);
                let amount = parseFloat (order['Quantity']);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetMarketsummary ({
            'market': this.productId (product),
        });
        let ticker = response['result'][0];
        let timestamp = this.parse8601 (ticker['TimeStamp']);
        return {
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
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['Volume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetMarkethistory ({
            'market': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': this.productId (product),
            'quantity': amount,
        };
        if (type == 'limit')
            order['rate'] = price;
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.marketGetCancel ({ 'uuid': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/';
        if (type == 'public') {
            url += type + '/' + method.toLowerCase () + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            url += type + '/';
            if (((type == 'account') && (path != 'withdraw')) || (path == 'openorders'))
                url += method.toLowerCase ();
            url += path + '?' + this.urlencode (this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, params));
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return this.fetch (url, method, headers, body);
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
    'products': {
        'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin', },
        'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC', },
        'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit', },
        'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit', },
        'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit', },
    },

    fetchBalance () {
        return this.privatePostU2 ({
            'BalanceReqID': this.nonce (),
        });
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.publicGetCurrencyOrderbook ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let ticker = await this.publicGetCurrencyTicker ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        });
        let timestamp = this.milliseconds ();
        let lowercaseQuote = p['quote'].toLowerCase ();
        let quoteVolume = 'vol_' + lowercaseQuote;
        return {
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

    fetchTrades (product) {
        let p = this.product (product);
        return this.publicGetCurrencyTrades ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let p = this.product (product);
        let order = {
            'ClOrdID': this.nonce (),
            'Symbol': p['id'],
            'Side': this.capitalize (side),
            'OrdType': 2,
            'Price': price,
            'OrderQty': amount,
            'BrokerID': p['brokerId'],
        };
        return this.privatePostD (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostF (this.extend ({
            'ClOrdID': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
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
    'products': {
        'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
        'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
    },

    async fetchBalance () {        
        let response = await this.privatePostGENMKTMoneyInfo ();
        let data = response['data'];
        let balance = data['wallets'];
        let result = { 'info': data };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
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
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let response = await this.publicGetMarketOrderbook ({
            'market': p['id'],
        });
        let orderbook = response['data'];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['price_int'] / 100000;
                let amount = order['amount_int'] / 100000000;
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetMarketTicker ({
            'market': this.productId (product),
        });        
        let timestamp = ticker['timestamp'] * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetMarketTrades ({
            'market': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let order = {
            'market': p['id'],
            'amount_int': amount,
            'fee_currency': p['quote'],
            'type': (side == 'buy') ? 'bid' : 'ask',
        };
        if (type == 'limit')
            order['price_int'] = price;
        return this.privatePostMarketMoneyOrderAdd (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostMarketMoneyOrderCancel ({ 'order_id': id });
    },

    async request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
                'Content-Length': body.length,
                'Rest-Key': this.apiKey,
                'Rest-Sign': signature,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var btcchina = {

    'id': 'btcchina',
    'name': 'BTCChina',
    'countries': 'CN',
    'rateLimit': 1500,
    'version': 'v1',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
        'api': {
            'public': 'https://data.btcchina.com/data',
            'private': 'https://api.btcchina.com/api_trade_v1.php',
        },
        'www': 'https://www.btcchina.com',
        'doc': 'https://www.btcchina.com/apidocs'
    },
    'api': {
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

    async fetchProducts () {
        let products = await this.publicGetTicker ({
            'market': 'all',
        });
        let result = [];
        let keys = Object.keys (products);
        for (let p = 0; p < keys.length; p++) {
            let key = keys[p];
            let product = products[key];
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
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };

        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (lowercase in balances['balance'])
                account['total'] = parseFloat (balances['balance'][lowercase]['amount']);
            if (lowercase in balances['frozen'])
                account['used'] = parseFloat (balances['frozen'][lowercase]['amount']);
            account['free'] = account['total'] - account['used'];
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderbook ({
            'market': this.productId (product),
        });
        let timestamp = orderbook['date'] * 1000;;
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.publicGetTicker ({
            'market': p['id'],
        });
        let ticker = tickers['ticker'];
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
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTrades ({
            'market': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let method = 'privatePost' + this.capitalize (side) + 'Order2';
        let order = {};
        let id = p['id'].toUpperCase ();
        if (type == 'market') {
            order['params'] = [ undefined, amount, id ];
        } else {
            order['params'] = [ price, amount, id ];
        }
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        let market = params['market']; // TODO fixme
        return this.privatePostCancelOrder (this.extend ({
            'params': [ id, market ], 
        }, params));
    },

    nonce () {
        return this.microseconds ();
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type] + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
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
                'Content-Length': body.length,
                'Authorization': 'Basic ' + this.stringToBase64 (auth),
                'Json-Rpc-Tonce': nonce,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------

var btce = {

    'id': 'btce',
    'name': 'BTC-e',
    'countries': [ 'BG', 'RU' ], // Bulgaria, Russia
    'version': '3',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27843225-1b571514-611a-11e7-9208-2641a560b561.jpg',
        'api': {
            'public': 'https://btc-e.com/api',
            'private': 'https://btc-e.com/tapi',
        },
        'www': 'https://btc-e.com',
        'doc': [
            'https://btc-e.com/api/3/docs',
            'https://btc-e.com/tapi/docs',
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

    async fetchProducts () {
        let response = await this.publicGetInfo ();
        let products = response['pairs'];
        let keys = Object.keys (products);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products[id];
            let [ base, quote ] = id.split ('_');
            base = base.toUpperCase ();
            quote = quote.toUpperCase ();
            if (base == 'DSH')
                base = 'DASH';
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let funds = balances['funds'];
        let currencies = Object.keys (funds);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            // they misspell DASH as dsh :/
            if (uppercase == 'DSH')
                uppercase = 'DASH';
            let account = {
                'free': funds[currency],
                'used': undefined,
                'total': funds[currency],
            };
            result[uppercase] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let response = await this.publicGetDepthPair ({
            'pair': p['id'],
        });
        if (p['id'] in response) {
            let orderbook = response[p['id']];
            let timestamp = this.milliseconds ();
            let result = {
                'bids': orderbook['bids'],
                'asks': orderbook['asks'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            };
            result['bids'] = this.sortBy (result['bids'], 0, true);
            result['asks'] = this.sortBy (result['asks'], 0);
            return result;
        }
        throw new OrderBookNotAvailableError (this.id + ' ' + p['symbol'] + ' order book not available');
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.publicGetTickerPair ({
            'pair': p['id'],
        });
        let ticker = tickers[p['id']];
        let timestamp = ticker['updated'] * 1000;
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'] ? ticker['high'] : undefined,
            'low': ticker['low'] ? ticker['low'] : undefined,
            'bid': ticker['sell'] ? ticker['sell'] : undefined,
            'ask': ticker['buy'] ? ticker['buy'] : undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': ticker['last'] ? ticker['last'] : undefined,
            'change': undefined,
            'percentage': undefined,
            'average': ticker['avg'] ? ticker['avg'] : undefined,
            'baseVolume': ticker['vol_cur'] ? ticker['vol_cur'] : undefined,
            'quoteVolume': ticker['vol'] ? ticker['vol'] : undefined,
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTradesPair ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'pair': this.productId (product),
            'type': side,
            'amount': amount,
            'rate': price,
        };
        return this.privatePostTrade (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'order_id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var btctrader = {

    'id': 'btctrader',
    'name': 'BTCTrader',
    'countries': [ 'TR', 'GR', 'PH' ], // Turkey, Greece, Philippines
    'rateLimit': 1000,
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
    'products': {
    },

    async fetchBalance () {
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
        let product = this.products[symbol];
        result[product['base']] = base;
        result[product['quote']] = quote;
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderbook ();
        let timestamp = parseInt (orderbook['timestamp'] * 1000);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ();
        let timestamp = parseInt (ticker['timestamp'] * 1000);
        return {
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

    fetchTrades (product) {
        let maxCount = 50;
        return this.publicGetTrades ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
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
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id == 'btctrader')
            throw new Error (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        let url = this.urls['api'] + '/' + path;
        if (type == 'public') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var btcexchange = extend (btctrader, {

    'id': 'btcexchange',
    'name': 'BTCExchange',
    'countries': 'PH', // Philippines
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
        'api': 'https://www.btcexchange.ph/api',
        'www': 'https://www.btcexchange.ph',
        'doc': 'https://github.com/BTCTrader/broker-api-docs',
    },
    'products': {
        'BTC/PHP': { 'id': 'BTC/PHP', 'symbol': 'BTC/PHP', 'base': 'BTC', 'quote': 'PHP' },
    },
})

//-----------------------------------------------------------------------------

var btctradeua = {

    'id': 'btctradeua',
    'name': 'BTC Trade UA',
    'countries': 'UA', // Ukraine,
    'rateLimit': 3000,
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
    'products': {
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

    async fetchBalance () {
        let response = await this.privatePostBalance ();
        let accounts = response['accounts'];
        let result = { 'info': response };
        for (let b = 0; b < accounts.length; b++) {
            let account = accounts[b];
            let currency = account['currency'];
            let balance = parseFloat (account['balance']);
            result[currency] = {
                'free': balance,
                'used': undefined,
                'total': balance,
            };
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let bids = await this.publicGetTradesBuySymbol ({
            'symbol': p['id'],
        });
        let asks = await this.publicGetTradesSellSymbol ({
            'symbol': p['id'],
        });
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
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['currency_trade']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetJapanStatHighSymbol ({
            'symbol': this.productId (product),
        });
        let ticker = response['trades'];
        let timestamp = this.milliseconds ();
        let result = {
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

    fetchTrades (product) {
        return this.publicGetDealsSymbol ({
            'symbol': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let p = this.product (product);
        let method = 'privatePost' + this.capitalize (side) + 'Id';
        let order = {
            'count': amount,
            'currency1': p['quote'],
            'currency': p['base'],
            'price': price,
        };
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostRemoveOrderId ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var btcturk = extend (btctrader, {

    'id': 'btcturk',
    'name': 'BTCTurk',
    'countries': 'TR', // Turkey
    'rateLimit': 1000,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
        'api': 'https://www.btcturk.com/api',
        'www': 'https://www.btcturk.com',
        'doc': 'https://github.com/BTCTrader/broker-api-docs',
    },
    'products': {
        'BTC/TRY': { 'id': 'BTC/TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
    },
})

//-----------------------------------------------------------------------------

var btcx = {

    'id': 'btcx',
    'name': 'BTCX',
    'countries': [ 'IS', 'US', 'EU', ],
    'rateLimit': 1500, // support in english is very poor, unable to tell rate limits
    'version': 'v1',
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
    'products': {
        'BTC/USD': { 'id': 'btc/usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/EUR': { 'id': 'btc/eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    async fetchBalance () {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': balances[currency],
                'used': undefined,
                'total': balances[currency],
            };
            result[uppercase] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetDepthIdLimit ({
            'id': this.productId (product),
            'limit': 1000,
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['price'];
                let amount = order['amount'];
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTickerId ({
            'id': this.productId (product),
        });
        let timestamp = ticker['time'] * 1000;
        return {
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
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTradeIdLimit ({
            'id': this.productId (product),
            'limit': 100,
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTrade (this.extend ({
            'type': side.toUpperCase (),
            'market': this.productId (product),
            'amount': amount,
            'price': price,
        }, params));
    },

    cancelOrder (id) {
        return this.privatePostCancel ({ 'order': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/';
        if (type == 'public') {
            url += this.implodeParams (path, params);
        } else {
            let nonce = this.nonce ();
            url += type;
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bter = {
    'id': 'bter',
    'name': 'Bter',
    'countries': [ 'VG', 'CN' ], // British Virgin Islands, China
    'version': '2',
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

    async fetchProducts () {
        let response = await this.publicGetMarketlist ();
        let products = response['data'];
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['pair'];
            let base = product['curr_a'];
            let quote = product['curr_b'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let balance = await this.privatePostBalances ();
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
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
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderBookId ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTickerId ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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
            'baseVolume': parseFloat (ticker['baseVolume']),
            'quoteVolume': parseFloat (ticker['quoteVolume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTradeHistoryId ({
            'id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'currencyPair': this.symbol (product),
            'rate': price,
            'amount': amount,
        };
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'orderNumber': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let prefix = (type == 'private') ? (type + '/') : '';
        let url = this.urls['api'][type] + this.version + '/1/' + prefix + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = { 'nonce': nonce };
            body = this.urlencode (this.extend (request, query));
            headers = {
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var bxinth = {

    'id': 'bxinth',
    'name': 'BX.in.th',
    'countries': 'TH', // Thailand
    'rateLimit': 1500,
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

    async fetchProducts () {
        let products = await this.publicGetPairing ();
        let keys = Object.keys (products);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let product = products[keys[p]];
            let id = product['pairing_id'];
            let base = product['primary_currency'];
            let quote = product['secondary_currency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
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

    async fetchBalance () {
        let response = await this.privatePostBalance ();
        let balance = response['balance'];
        let result = { 'info': balance };
        let currencies = Object.keys (balance);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let code = this.commonCurrencyCode (currency);
            let account = {
                'free': parseFloat (balance[currency]['available']),
                'used': undefined,
                'total': parseFloat (balance[currency]['total']),
            };
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderbook ({
            'pairing': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let id = this.productId (product);
        let tickers = await this.publicGet ({ 'pairing': id });
        let key = id.toString ();
        let ticker = tickers[key];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTrade ({
            'pairing': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrder (this.extend ({
            'pairing': this.productId (product),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
    },

    cancelOrder (id) {
        let pairing = undefined; // TODO fixme
        return this.privatePostCancel ({
            'order_id': id,
            'pairing': pairing,
        });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path + '/';
        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);
        if (type == 'private') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var ccex = {

    'id': 'ccex',
    'name': 'C-CEX',
    'countries': [ 'DE', 'EU', ],
    'rateLimit': 1500,
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

    async fetchProducts () {
        let products = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < products['result'].length; p++) {
            let product = products['result'][p];
            let id = product['MarketName'];
            let base = product['MarketCurrency'];
            let quote = product['BaseCurrency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privateGetBalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['Currency'];
            let account = {
                'free': balance['Available'],
                'used': balance['Pending'],
                'total': balance['Balance'],
            };
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderbook ({
            'market': this.productId (product),
            'type': 'both',
            'depth': 100,
        });
        let orderbook = response['result'];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buy', 'asks': 'sell' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['Rate']);
                let amount = parseFloat (order['Quantity']);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.tickersGetMarket ({
            'market': this.productId (product).toLowerCase (),
        });
        let ticker = response['ticker'];
        let timestamp = ticker['updated'] * 1000;
        return {
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
            'quoteVolume': parseFloat (ticker['buysupport']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetMarkethistory ({
            'market': this.productId (product),
            'type': 'both',
            'depth': 100,
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privateGet' + this.capitalize (side) + type;
        return this[method] (this.extend ({
            'market': this.productId (product),
            'quantity': amount,
            'rate': price,
        }, params));
    },

    cancelOrder (id) {
        return this.privateGetCancel ({ 'uuid': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        if (type == 'private') {
            let nonce = this.nonce ().toString ();
            let query = this.keysort (this.extend ({
                'a': path,
                'apikey': this.apiKey,
                'nonce': nonce,
            }, params));
            url += '?' + this.urlencode (query);
            headers = { 'apisign': this.hmac (this.encode (url), this.encode (this.secret), 'sha512') };
        } else if (type == 'public') {
            url += '?' + this.urlencode (this.extend ({
                'a': 'get' + path,
            }, params));
        } else {
            url += '/' + this.implodeParams (path, params) + '.json';
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var cex = {

    'id': 'cex',
    'name': 'CEX.IO',
    'countries': [ 'GB', 'EU', 'CY', 'RU', ],
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
        'api': 'https://cex.io/api',
        'www': 'https://cex.io',
        'doc': 'https://cex.io/cex-api',
    },
    'api': {
        'public': {
            'get': [
                'currency_limits',
                'last_price/{pair}',
                'last_prices/{currencies}',
                'ohlcv/hd/{yyyymmdd}/{pair}',
                'order_book/{pair}',
                'ticker/{pair}',
                'tickers/{currencies}',
                'trade_history/{pair}',
            ],
            'post': [
                'convert/{pair}',
                'price_stats/{pair}',
            ],
        },
        'private': {
            'post': [
                'active_orders_status/',
                'archived_orders/{pair}',
                'balance/',
                'cancel_order/',
                'cancel_orders/{pair}',
                'cancel_replace_order/{pair}',
                'close_position/{pair}',
                'get_address/',
                'get_myfee/',
                'get_order/',
                'get_order_tx/',
                'open_orders/{pair}',
                'open_orders/',
                'open_position/{pair}',
                'open_positions/{pair}',
                'place_order/{pair}',
                'place_order/{pair}',
            ],
        }
    },

    async fetchProducts () {
        let products = await this.publicGetCurrencyLimits ();
        let result = [];
        for (let p = 0; p < products['data']['pairs'].length; p++) {
            let product = products['data']['pairs'][p];
            let id = product['symbol1'] + '/' + product['symbol2'];
            let symbol = id;
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': parseFloat (balances[currency]['available']),
                'used': parseFloat (balances[currency]['orders']),
                'total': undefined,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await  this.publicGetOrderBookPair ({
            'pair': this.productId (product),
        });
        let timestamp = orderbook['timestamp'] * 1000;
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTickerPair ({
            'pair': this.productId (product),
        });
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTradeHistoryPair ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'pair': this.productId (product),
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        else
            order['order_type'] = type;
        return this.privatePostPlaceOrderPair (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var chbtc = {
    'id': 'chbtc',
    'name': 'CHBTC',
    'countries': 'CN',
    'rateLimit': 1000,
    'version': 'v1',
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
    'products': {
        'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', },
        'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', },
        'ETH/CNY': { 'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', },
        'ETC/CNY': { 'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY', },
        'BTS/CNY': { 'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY', },
        'EOS/CNY': { 'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY', },
    },

    async fetchProducts () {
        let products = await this.publicGetPairSettings ();
        let keys = Object.keys (products);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products[id];
            let symbol = id.replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balances['balance'])
                account['free'] = balances['balance'][currency]['amount'];
            if (currency in balances['frozen'])
                account['used'] = balances['frozen'][currency]['amount'];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.publicGetDepth ({
            'currency': p['id'],
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTicker ({
            'currency': this.productId (product),
        });
        let ticker = response['ticker'];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'currency': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let paramString = 'price=' + price;
        paramString += '&amount=' + amount;
        paramString += '&tradeType=' + (side == 'buy') ? '1' : '0';
        paramString += '&currency=' + this.productId (product);
        return this.privatePostOrder (paramString);
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({ 'id': id }, params));
    },

    nonce () {
        return this.milliseconds ();
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type]; 
        if (type == 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let paramsLength = params.length; // params should be a string here!
            let nonce = this.nonce ();            
            let auth = 'method=' + path;            
            auth += '&accesskey=' + this.apiKey;            
            auth += paramsLength ? params : '';
            let secret = this.hash (this.encode (this.secret), 'sha1');
            let signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            let suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var chilebit = extend (blinktrade, {
    'id': 'chilebit',
    'name': 'ChileBit',
    'countries': 'CL',
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
    'products': {
        'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit', },
    },
})

//-----------------------------------------------------------------------------

var coincheck = {

    'id': 'coincheck',
    'name': 'coincheck',
    'countries': [ 'JP', 'ID', ],
    'rateLimit': 1500,
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
    'products': {
        'BTC/JPY':  { 'id': 'btc_jpy',  'symbol': 'BTC/JPY',  'base': 'BTC',  'quote': 'JPY' }, // the only real pair
        'ETH/JPY':  { 'id': 'eth_jpy',  'symbol': 'ETH/JPY',  'base': 'ETH',  'quote': 'JPY' },
        'ETC/JPY':  { 'id': 'etc_jpy',  'symbol': 'ETC/JPY',  'base': 'ETC',  'quote': 'JPY' },
        'DAO/JPY':  { 'id': 'dao_jpy',  'symbol': 'DAO/JPY',  'base': 'DAO',  'quote': 'JPY' },
        'LSK/JPY':  { 'id': 'lsk_jpy',  'symbol': 'LSK/JPY',  'base': 'LSK',  'quote': 'JPY' },
        'FCT/JPY':  { 'id': 'fct_jpy',  'symbol': 'FCT/JPY',  'base': 'FCT',  'quote': 'JPY' },
        'XMR/JPY':  { 'id': 'xmr_jpy',  'symbol': 'XMR/JPY',  'base': 'XMR',  'quote': 'JPY' },
        'REP/JPY':  { 'id': 'rep_jpy',  'symbol': 'REP/JPY',  'base': 'REP',  'quote': 'JPY' },
        'XRP/JPY':  { 'id': 'xrp_jpy',  'symbol': 'XRP/JPY',  'base': 'XRP',  'quote': 'JPY' },
        'ZEC/JPY':  { 'id': 'zec_jpy',  'symbol': 'ZEC/JPY',  'base': 'ZEC',  'quote': 'JPY' },
        'XEM/JPY':  { 'id': 'xem_jpy',  'symbol': 'XEM/JPY',  'base': 'XEM',  'quote': 'JPY' },
        'LTC/JPY':  { 'id': 'ltc_jpy',  'symbol': 'LTC/JPY',  'base': 'LTC',  'quote': 'JPY' },
        'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY' },
        'ETH/BTC':  { 'id': 'eth_btc',  'symbol': 'ETH/BTC',  'base': 'ETH',  'quote': 'BTC' },
        'ETC/BTC':  { 'id': 'etc_btc',  'symbol': 'ETC/BTC',  'base': 'ETC',  'quote': 'BTC' },
        'LSK/BTC':  { 'id': 'lsk_btc',  'symbol': 'LSK/BTC',  'base': 'LSK',  'quote': 'BTC' },
        'FCT/BTC':  { 'id': 'fct_btc',  'symbol': 'FCT/BTC',  'base': 'FCT',  'quote': 'BTC' },
        'XMR/BTC':  { 'id': 'xmr_btc',  'symbol': 'XMR/BTC',  'base': 'XMR',  'quote': 'BTC' },
        'REP/BTC':  { 'id': 'rep_btc',  'symbol': 'REP/BTC',  'base': 'REP',  'quote': 'BTC' },
        'XRP/BTC':  { 'id': 'xrp_btc',  'symbol': 'XRP/BTC',  'base': 'XRP',  'quote': 'BTC' },
        'ZEC/BTC':  { 'id': 'zec_btc',  'symbol': 'ZEC/BTC',  'base': 'ZEC',  'quote': 'BTC' },
        'XEM/BTC':  { 'id': 'xem_btc',  'symbol': 'XEM/BTC',  'base': 'XEM',  'quote': 'BTC' },
        'LTC/BTC':  { 'id': 'ltc_btc',  'symbol': 'LTC/BTC',  'base': 'LTC',  'quote': 'BTC' },
        'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
    },

    async fetchBalance () {
        let balances = await this.privateGetAccountsBalance ();
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let lowercase = currency.toLowerCase ();
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (lowercase in balances)
                account['free'] = parseFloat (balances[lowercase]);
            let reserved = lowercase + '_reserved';
            if (reserved in balances)
                account['used'] = parseFloat (balances[reserved]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await  this.publicGetOrderBooks ();
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ();
        let timestamp = ticker['timestamp'] * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let prefix = '';
        let order = {
            'pair': this.productId (product),
        };
        if (type == 'market') {
            let order_type = type + '_' + side;
            order['order_type'] = order_type;
            let prefix = (side == buy) ? (order_type + '_') : '';
            order[prefix + 'amount'] = amount;
        } else {
            order['order_type'] = side;
            order['rate'] = price;
            order['amount'] = amount;
        }
        return this.privatePostExchangeOrders (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privateDeleteExchangeOrdersId ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            let length = 0;
            if (Object.keys (query).length) {
                body = this.urlencode (this.keysort (query));
                length = body.length;
            }
            let auth = nonce + url + (body || '');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': length,
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var coingi = {

    'id': 'coingi',
    'name': 'Coingi',
    'rateLimit': 1000,
    'countries': [ 'PA', 'BG', 'CN', 'US' ], // Panama, Bulgaria, China, US
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
    'products': {
        'LTC/BTC': { 'id': 'ltc-btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
        'PPC/BTC': { 'id': 'ppc-btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC' },
        'DOGE/BTC': { 'id': 'doge-btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
        'VTC/BTC': { 'id': 'vtc-btc', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC' },
        'FTC/BTC': { 'id': 'ftc-btc', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC' },
        'NMC/BTC': { 'id': 'nmc-btc', 'symbol': 'NMC/BTC', 'base': 'NMC', 'quote': 'BTC' },
        'DASH/BTC': { 'id': 'dash-btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
    },

    async fetchBalance () {
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
                'total': undefined,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.currentGetOrderBookPairAskCountBidCountDepth ({
            'pair': p['id'],
            'askCount': 512, // maximum returned number of asks 1-512
            'bidCount': 512, // maximum returned number of bids 1-512
            'depth': 32, // maximum number of depth range steps 1-32
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['price'];
                let amount = order['baseAmount'];
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.currentGet24hourRollingAggregation ();
        let tickers = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let base = ticker['currencyPair']['base'].toUpperCase ();
            let quote = ticker['currencyPair']['counter'].toUpperCase ();
            let symbol = base + '/' + quote;
            tickers[symbol] = ticker;
        }
        let timestamp = this.milliseconds ();
        let p = this.product (product);
        let ticker = {
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
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': undefined,
        };
        if (p['symbol'] in tickers) {
            let aggregation = tickers[p['symbol']];
            ticker['high'] = aggregation['high'];
            ticker['low'] = aggregation['low'];
            ticker['bid'] = aggregation['highestBid'];
            ticker['ask'] = aggregation['lowestAsk'];
            ticker['baseVolume'] = aggregation['baseVolume'];
            ticker['quoteVolume'] = aggregation['counterVolume'];
            ticker['high'] = aggregation['high'];
            ticker['info'] = aggregation;
        }
        return ticker;
    },

    fetchTrades (product) {
        return this.publicGetTransactionsPairMaxCount ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'currencyPair': this.productId (product),
            'volume': amount,
            'price': price,
            'orderType': (side == 'buy') ? 0 : 1,
        };
        return this.userPostAddOrder (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.userPostCancelOrder ({ 'orderId': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + type + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'current') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var coinmarketcap = {

    'id': 'coinmarketcap',
    'name': 'CoinMarketCap',
    'rateLimit': 10000,
    'version': 'v1',
    'countries': 'US',
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

    async fetchOrderBook () {
        throw new Error ('Fetching order books is not supported by the API of ' + this.id);
    },

    async fetchProducts () {
        let products = await this.publicGetTicker ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            for (let c = 0; c < this.currencies.length; c++) {
                let base = product['symbol'];                
                let baseId = product['id'];
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
                    'info': product,
                });
            }
        }
        return result;
    },

    fetchGlobal (currency = 'USD') {
        let request = {};
        if (currency)
            request['convert'] = currency;
        return this.publicGetGlobal (request);
    },

    parseTicker (ticker, product) {
        let timestamp = parseInt (ticker['last_updated']) * 1000;
        let volume = undefined;
        let volumeKey = '24h_volume_' + product['quoteId'];
        if (ticker[volumeKey])
            volume = parseFloat (ticker[volumeKey]);
        let price = 'price_' + product['quoteId'];
        let change = undefined;
        let changeKey = 'percent_change_24h';
        if (ticker[changeKey])
            change = parseFloat (ticker[changeKey]);
        return {
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
            'last': parseFloat (ticker[price]),
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    },

    async fetchTickers (currency = 'USD') { 
        let request = {};
        if (currency) 
            request['convert'] = currency;
        let response = await this.publicGetTicker (request);
        let tickers = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let id = ticker['id'] + '/' + currency;
            let product = this.products_by_id[id];
            let symbol = product['symbol'];
            tickers[symbol] = this.parseTicker (ticker, product);
        }
        return tickers;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let request = {
            'convert': p['quote'],
            'id': p['baseId'],
        };
        let response = await this.publicGetTickerId (request);
        let ticker = response[0];
        return this.parseTicker (ticker, p);
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
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
    'products': {
        'BTC/EUR': { 'id': 'BTC_EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'  },
        'BTC/CZK': { 'id': 'BTC_CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK'  },
    },

    async fetchBalance () {
        let response = await this.privatePostBalances ();
        let balances = response['data'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in balances) {
                account['free'] = balances[currency]['available'];
                account['used'] = balances[currency]['reserved'];
                account['total'] = balances[currency]['balance'];
            }            
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderBook ({
            'currencyPair': this.productId (product),
            'groupByPriceLimit': 'False',
        });
        let orderbook = response['data'];
        let timestamp = orderbook['timestamp'] * 1000;
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['price'];
                let amount = order['amount'];
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTicker ({
            'currencyPair': this.productId (product),
        });
        let ticker = response['data'];
        let timestamp = ticker['timestamp'] * 1000;
        return {
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
            'quoteVolume': parseFloat (ticker['amount']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTransactions ({
            'currencyPair': this.productId (product),
            'minutesIntoHistory': 10,
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'currencyPair': this.productId (product),
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
        return this[method] (self.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'orderId': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (type == 'public') {
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
                'Content-Type':  'application/x-www-form-urlencoded',
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var coinsecure = {

    'id': 'coinsecure',
    'name': 'Coinsecure',
    'countries': 'IN', // India
    'rateLimit': 1000,
    'version': 'v1',
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
    'products': {
        'BTC/INR': { 'id': 'BTC/INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
    },

    async fetchBalance () {
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
        return result;
    },

    async fetchOrderBook (product) {
        let bids = await this.publicGetExchangeBidOrders ();
        let asks = await this.publicGetExchangeAskOrders ();
        let orderbook = {
            'bids': bids['message'],
            'asks': asks['message'],
        };
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['rate'];
                let amount = order['vol'];
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetExchangeTicker ();
        let ticker = response['message'];
        let timestamp = ticker['timestamp'];
        return {
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

    fetchTrades (product) {
        return this.publicGetExchangeTrades ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
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
        return this[method] (self.extend (order, params));
    },

    cancelOrder (id) {
        throw new Error (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        return this[method] ({ 'orderID': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'private') {
            headers = { 'Authorization': this.apiKey };
            if (Object.keys (query).length) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var coinspot = {

    'id': 'coinspot',
    'name': 'CoinSpot',
    'countries': 'AU', // Australia
    'rateLimit': 1000,
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
    'products': {
        'BTC/AUD': { 'id': 'BTC', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', },
        'LTC/AUD': { 'id': 'LTC', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', },
        'DOGE/AUD': { 'id': 'DOGE', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD', },
    },

    async fetchBalance () {
        let response = await this.privatePostMyBalances ();
        let balances = response['balance'];
        let currencies = Object.keys (balances)
        let result = { 'info': balances };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let uppercase = currency.toUpperCase ();
            let account = {
                'free': balances[currency],
                'used': undefined,
                'total': balances[currency],
            };
            if (uppercase == 'DRK')
                uppercase = 'DASH';
            result[uppercase] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.privatePostOrders ({
            'cointype': p['id'],
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buyorders', 'asks': 'sellorders' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['rate']);
                let amount = parseFloat (order['amount']);
                result[key].push ([ price, amount ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetLatest ();
        let id = this.productId (product);
        id = id.toLowerCase ();
        let ticker = response['prices'][id];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.privatePostOrdersHistory ({
            'cointype': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostMy' + this.capitalize (side);
        if (type =='market')
            throw new Error (this.id + ' allows limit orders only');
        let order = {
            'cointype': this.productId (product),
            'amount': amount,
            'rate': price,
        };
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        throw new Error (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privatePostMyBuy';
        return this[method] ({ 'id': id });
    },

    async request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        let url = this.urls['api'][type] + '/' + path;
        if (type == 'private') {
            let nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var dsx = {

    'id': 'dsx',
    'name': 'DSX',
    'countries': 'UK',
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
        'api': {
            'mapi': 'https://dsx.uk/mapi',  // market data
            'tapi': 'https://dsx.uk/tapi',  // trading
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
        'mapi': { // market data (public)
            'get': [
                'barsFromMoment/{id}/{period}/{start}', // empty reply :\
                'depth/{id}',
                'info',
                'lastBars/{id}/{period}/{amount}', // period is (m, h or d)
                'periodBars/{id}/{period}/{start}/{end}',
                'ticker/{id}',
                'trades/{id}',
            ],
        },
        'tapi': { // trading (private)
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
        'dwapi': { // deposit / withdraw (private)
            'post': [
                'getCryptoDepositAddress',
                'cryptoWithdraw',
                'fiatWithdraw',
                'getTransactionStatus',
                'getTransactions',
            ],
        },
    },

    async fetchProducts () {
        let response = await this.mapiGetInfo ();
        let keys = Object.keys (response['pairs']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = response['pairs'][id];
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
                'info': product,
            });
        }
        return result;
    },
  
    async fetchBalance () {
        let response = await this.tapiPostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let currencies = Object.keys (balances['total']);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = {
                'free': balances['funds'][currency],
                'used': undefined,
                'total': balances['total'][currency],
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let response = await this.mapiGetDepthId ({
            'id': p['id'],
        });
        let orderbook = response[p['id']];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order[0];
                let amount = order[1];
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let response = await this.mapiGetTickerId ({
            'id': p['id'],
        });
        let ticker = response[p['id']];
        let timestamp = ticker['updated'] * 1000;
        return {
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
            'average': parseFloat (ticker['avg']),
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': parseFloat (ticker['vol_cur']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.mapiGetTradesId ({
            'id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let order = {
            'pair': this.productId (product),
            'type': side,
            'rate': price,
            'amount': amount,
        };
        return this.tapiPostTrade (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.tapiPostCancelOrder ({ 'orderId': id });
    },

    request (path, type = 'mapi', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        if ((type == 'mapi') || (type == 'dwapi'))
            url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'mapi') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let method = path;
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': nonce,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var exmo = {

    'id': 'exmo',
    'name': 'EXMO',
    'countries': [ 'ES', 'RU', ], // Spain, Russia
    'rateLimit': 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
    'version': 'v1',
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

    async fetchProducts () {
        let products = await this.publicGetPairSettings ();
        let keys = Object.keys (products);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products[id];
            let symbol = id.replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
        let response = await this.privatePostUserInfo ();
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = {
                'free': undefined,
                'used': undefined,
                'total': undefined,
            };
            if (currency in response['balances'])
                account['free'] = parseFloat (response['balances'][currency]);
            if (currency in response['reserved'])
                account['used'] = parseFloat (response['reserved'][currency]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let response = await this.publicGetOrderBook ({
            'pair': p['id'],
        });
        let orderbook = response[p['id']];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'bid', 'asks': 'ask' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTicker ();
        let p = this.product (product);
        let ticker = response[p['id']];
        let timestamp = ticker['updated'] * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let prefix = '';
        if (type =='market')
            prefix = 'market_';
        let order = {
            'pair': this.productId (product),
            'quantity': amount,
            'price': price || 0,
            'type': prefix + side,
        };
        return this.privatePostOrderCreate (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrderCancel ({ 'order_id': id });
    },

    async request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        let result = await this.fetch (url, method, headers, body);
        if ('result' in result) {
            if (!result['result']) {
                throw new MarketNotAvailableError ('[Market Not Available] ' + this.id + ' ' + result['error']);
            }
        }
        return result;
    },
}

//-----------------------------------------------------------------------------

var flowbtc = {

    'id': 'flowbtc',
    'name': 'flowBTC',
    'countries': 'BR', // Brazil
    'version': 'v1',
    'rateLimit': 1000,
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

    async fetchProducts () {
        let response = await this.publicPostGetProductPairs ();
        let products = response['productPairs'];
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['name'];
            let base = product['product1Label'];
            let quote = product['product2Label'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privatePostUserInfo ();
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.publicPostGetOrderBook ({
            'productPair': p['id'],
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['px']);
                let amount = parseFloat (order['qty']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let ticker = await this.publicPostGetTicker ({
            'productPair': p['id'],
        });
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicPostGetTrades ({
            'productPair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let orderType = (type == 'market') ? 1 : 0;
        let order = {
            'ins': this.productId (product),
            'side': side,
            'orderType': orderType,
            'qty': amount,
            'px': price,
        };
        return this.privatePostCreateOrder (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'serverOrderId': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length) {
                body = this.json (params);
            }
        } else {
            if (!this.uid)
                throw new AuthenticationError (this.id + ' requires `' + this.id + '.uid` property for authentication');
            let nonce = this.nonce ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.hmac (this.encode (auth), this.secret);
            body = this.urlencode (this.extend ({
                'apiKey': this.apiKey,
                'apiNonce': nonce,
                'apiSig': signature.toUpperCase (),
            }, params));
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var foxbit = extend (blinktrade, {
    'id': 'foxbit',
    'name': 'FoxBit',
    'countries': 'BR',
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
    'products': {
        'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit', },
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

    fetchBalance () {
        return this.privatePostGetaccinfo ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderbook ();
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTickerdetailed ();
        let timestamp = this.milliseconds ();
        let last = undefined;
        let volume = undefined;
        if ('last' in ticker)
            last = parseFloat (ticker['last']);
        if ('vol' in ticker)
            volume = parseFloat (ticker['vol']);
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostPlaceorder (this.extend ({
            'qty': amount,
            'price': price,
            'type': side[0].toUpperCase ()
        }, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelpendingorder ({ 'orderNo': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (type == 'public') {
            url += '.json';
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            headers = {
                'Content-type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sig': this.hmac (this.encode (body), this.encode (this.secret), 'sha1')
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var fybse = extend (fyb, {
    'id': 'fybse',
    'name': 'FYB-SE',
    'countries': 'SE', // Sweden
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
        'api': 'https://www.fybse.se/api/SEK',
        'www': 'https://www.fybse.se',
        'doc': 'http://docs.fyb.apiary.io',
    },
    'products': {
        'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
    },
})

//-----------------------------------------------------------------------------

var fybsg = extend (fyb, {
    'id': 'fybsg',
    'name': 'FYB-SG',
    'countries': 'SG', // Singapore
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
        'api': 'https://www.fybsg.com/api/SGD',
        'www': 'https://www.fybsg.com',
        'doc': 'http://docs.fyb.apiary.io',
    },
    'products': {
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

    async fetchProducts () {
        let response = await this.publicGetPublicLiveTickers ();
        let products = response['tickers'];
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['currencyPair'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
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
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.publicGetPublicMarketDepthCurrencyPair ({
            'CurrencyPair': p['id'],
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['volume']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let response = await this.publicGetPublicLiveTickerCurrencyPair ({
            'CurrencyPair': p['id'],
        });
        let ticker = response['ticker'];
        let timestamp = parseInt (ticker['createDateTime']) * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetPublicTransactionsCurrencyPair ({
            'CurrencyPair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'Code': this.productId (product),
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
        return this.privatePostTradeOrders (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privateDeleteTradeOrdersOrderID ({ 'OrderID': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {

            let nonce = this.nonce ();
            let contentType = (method == 'GET') ? '' : 'application/json';
            let auth = method + url + contentType + nonce.toString ();
            auth = auth.toLowerCase ();

            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'API_PUBLIC_KEY': this.apiKey,
                'API_REQUEST_SIGNATURE': signature,
                'API_REQUEST_DATE': nonce,
            };
            if (method != 'GET')
                headers['Content-Type'] = contentType;
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var gdax = {
    'id': 'gdax',
    'name': 'GDAX',
    'countries': 'US',
    'rateLimit': 1000,
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

    async fetchProducts () {
        let products = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['id'];
            let base = product['base_currency'];
            let quote = product['quote_currency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetAccounts ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetProductsIdBook ({
            'id': this.productId (product),
            'level': 2, // 1 best bidask, 2 aggregated, 3 full
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let ticker = await this.publicGetProductsIdTicker ({
            'id': p['id'],
        });
        let quote = await this.publicGetProductsIdStats ({
            'id': p['id'],
        });
        let timestamp = this.parse8601 (ticker['time']);
        let bid = undefined;
        let ask = undefined;
        if ('bid' in ticker)
            bid = parseFloat (ticker['bid']);
        if ('ask' in ticker)
            ask = parseFloat (ticker['ask']);
        return {
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

    fetchTrades (product) {
        return this.publicGetProductsIdTrades ({
            'id': this.productId (product), // fixes issue #2
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let oid = this.nonce ().toString ();
        let order = {
            'product_id': this.productId (product),
            'side': side,
            'size': amount,
            'type': type,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostOrders (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privateDeleteOrdersId ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + request;
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            if (!this.apiKey)
                throw new AuthenticationError (this.id + ' requires apiKey property for authentication and trading');
            if (!this.secret)
                throw new AuthenticationError (this.id + ' requires secret property for authentication and trading');
            if (!this.password)
                throw new AuthenticationError (this.id + ' requires password property for authentication and trading');
            let nonce = this.nonce ().toString ();
            if (Object.keys (query).length)
                body = this.json (query);
            let what = nonce + method + request + (body || '');
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (this.encode (what), secret, 'sha256', 'base64');
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------
// TBD REQUIRES 2FA VIA AUTHY, A BANK ACCOUNT, IDENTITY VERIFICATION TO START

var gemini = {
    'id': 'gemini',
    'name': 'Gemini',
    'countries': 'US',
    'rateLimit': 1500, // 200 for private API
    'version': 'v1',
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

    async fetchProducts () {
        let products = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product;
            let uppercaseProduct = product.toUpperCase ();
            let base = uppercaseProduct.slice (0, 3);
            let quote = uppercaseProduct.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetBookSymbol ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['amount']);
                let timestamp = parseInt (order['timestamp']) * 1000;
                result[side].push ([ price, amount, timestamp ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let ticker = await this.publicGetPubtickerSymbol ({
            'symbol': p['id'],
        });
        let timestamp = ticker['volume']['timestamp'];
        let baseVolume = p['base'];
        let quoteVolume = p['quote'];
        return {
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

    fetchTrades (product) {
        return this.publicGetTradesSymbol ({
            'symbol': this.productId (product),
        });
    },

    fetchBalance () {
        return this.privatePostBalances ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let order = {
            'client_order_id': this.nonce (),
            'symbol': this.productId (product),
            'amount': amount.toString (),
            'price': price.toString (),
            'side': side,
            'type': 'exchange limit', // gemini allows limit orders only
        };
        return this.privatePostOrderNew (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'order_id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let request = this.extend ({
                'request': url,
                'nonce': nonce,
            }, query);
            let payload = this.json (request);
            payload = this.encode (payload);
            payload = this.stringToBase64 (payload);
            let signature = this.hmac (payload, this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'text/plain',
                'Content-Length': 0,
                'X-GEMINI-APIKEY': this.apiKey,
                'X-GEMINI-PAYLOAD': payload,
                'X-GEMINI-SIGNATURE': signature,
            };
        }
        url = this.urls['api'] + url;
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var hitbtc = {

    'id': 'hitbtc',
    'name': 'HitBTC',
    'countries': 'HK', // Hong Kong
    'rateLimit': 1500,
    'version': '1',
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

    async fetchProducts () {
        let products = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < products['symbols'].length; p++) {
            let product = products['symbols'][p];
            let id = product['symbol'];
            let base = product['commodity'];
            let quote = product['currency'];
            // looks like they now have it correct
            // if (base == 'DSH')
                // base = 'DASH';
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.tradingGetBalance ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetSymbolOrderbook ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetSymbolTicker ({
            'symbol': this.productId (product),
        });
        if ('message' in ticker)
            throw new Error (this.id + ' ' + ticker['message']);
        let timestamp = ticker['timestamp'];
        return {
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
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': parseFloat (ticker['volume_quote']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetSymbolTrades ({
            'symbol': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'clientOrderId': this.nonce (),
            'symbol': this.productId (product),
            'side': side,
            'quantity': amount,
            'type': type,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.tradingPostNewOrder (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.tradingPostCancelOrder ({ 'clientOrderId': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api/' + this.version + '/' + type + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            query = this.extend ({ 'nonce': nonce, 'apikey': this.apiKey }, query);
            if (method == 'POST')
                if (Object.keys (query).length)
                    body = this.urlencode (query);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
            let auth = url + (body || '');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512').toLowerCase (),
            };
        }
        url = this.urls['api'] + url;
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var huobi = {

    'id': 'huobi',
    'name': 'Huobi',
    'countries': 'CN',
    'rateLimit': 2000,
    'version': 'v3',
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
    'products': {
        'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1, },
        'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2, },
        'BTC/USD': { 'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket',    'coinType': 1, },
    },

    fetchBalance () {
        return this.tradePostGetAccountInfo ();
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let method = p['type'] + 'GetDepthId';
        let orderbook = await this[method] ({ 'id': p['id'] });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let method = p['type'] + 'GetTickerId';
        let response = await this[method] ({ 'id': p['id'] });
        let ticker = response['ticker'];
        let timestamp = parseInt (response['time']) * 1000;
        return {
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

    fetchTrades (product) {
        let p = this.product (product);
        let method = p['type'] + 'GetDetailId';
        return this[method] ({ 'id': p['id'] });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let method = 'tradePost' + this.capitalize (side);
        let order = {
            'coin_type': p['coinType'],
            'amount': amount,
            'market': p['quote'].toLowerCase (),
        };
        if (type == 'limit')
            order['price'] = price;
        else
            method += this.capitalize (type);
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.tradePostCancelOrder ({ 'id': id });
    },

    request (path, type = 'trade', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (type == 'trade') {
            url += '/api' + this.version;
            let query = this.keysort (this.extend ({
                'method': path,
                'access_key': this.apiKey,
                'created': this.nonce (),
            }, params));
            let queryString = this.urlencode (this.omit (query, 'market'));
            // secret key must be at the end of query to be signed
            queryString += '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
            };
        } else {
            url += '/' + type + '/' + this.implodeParams (path, params) + '_json.js';
            let query = this.omit (params, this.extractParams (path));
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var itbit = {

    'id': 'itbit',
    'name': 'itBit',
    'countries': 'US',
    'rateLimit': 2000,
    'version': 'v1',
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
    'products': {
        'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
        'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetMarketsSymbolOrderBook ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetMarketsSymbolTicker ({
            'symbol': this.productId (product),
        });
        let timestamp = this.parse8601 (ticker['serverTimeUTC']);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high24h']),
            'low': parseFloat (ticker['low24h']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
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

    fetchTrades (product) {
        return this.publicGetMarketsSymbolTrades ({
            'symbol': this.productId (product),
        });
    },

    fetchBalance () {
        return this.privateGetWallets ();
    },

    nonce () {
        return this.milliseconds ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        amount = amount.toString ();
        price = price.toString ();
        let p = this.product (product);
        let order = {
            'side': side,
            'type': type,
            'currency': p['base'],
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': p['id'],
        };
        return this.privatePostTradeAdd (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privateDeleteWalletsWalletIdOrdersId (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
            let hashedMessage = this.hash (message, 'sha256', 'binary');
            let signature = this.hmac (this.encode (url + hashedMessage), this.secret, 'sha512', 'base64');
            headers = {
                'Authorization': self.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var jubi = {

    'id': 'jubi',
    'name': 'jubi.com',
    'countries': 'CN',
    'rateLimit': 1500,
    'version': 'v1',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
        'api': 'https://www.jubi.com/api',
        'www': 'https://www.jubi.com',
        'doc': 'https://www.jubi.com/help/api.html',
    },
    'api': {
        'public': {
            'get': [
                'depth',
                'orders',
                'ticker',
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
    'products': {
        'BTC/CNY':  { 'id': 'btc',  'symbol': 'BTC/CNY',  'base': 'BTC',  'quote': 'CNY' },
        'ETH/CNY':  { 'id': 'eth',  'symbol': 'ETH/CNY',  'base': 'ETH',  'quote': 'CNY' },
        'ANS/CNY':  { 'id': 'ans',  'symbol': 'ANS/CNY',  'base': 'ANS',  'quote': 'CNY' },
        'BLK/CNY':  { 'id': 'blk',  'symbol': 'BLK/CNY',  'base': 'BLK',  'quote': 'CNY' },
        'DNC/CNY':  { 'id': 'dnc',  'symbol': 'DNC/CNY',  'base': 'DNC',  'quote': 'CNY' },
        'DOGE/CNY': { 'id': 'doge', 'symbol': 'DOGE/CNY', 'base': 'DOGE', 'quote': 'CNY' },
        'EAC/CNY':  { 'id': 'eac',  'symbol': 'EAC/CNY',  'base': 'EAC',  'quote': 'CNY' },
        'ETC/CNY':  { 'id': 'etc',  'symbol': 'ETC/CNY',  'base': 'ETC',  'quote': 'CNY' },
        'FZ/CNY':   { 'id': 'fz',   'symbol': 'FZ/CNY',   'base': 'FZ',   'quote': 'CNY' },
        'GOOC/CNY': { 'id': 'gooc', 'symbol': 'GOOC/CNY', 'base': 'GOOC', 'quote': 'CNY' },
        'GAME/CNY': { 'id': 'game', 'symbol': 'GAME/CNY', 'base': 'GAME', 'quote': 'CNY' },
        'HLB/CNY':  { 'id': 'hlb',  'symbol': 'HLB/CNY',  'base': 'HLB',  'quote': 'CNY' },
        'IFC/CNY':  { 'id': 'ifc',  'symbol': 'IFC/CNY',  'base': 'IFC',  'quote': 'CNY' },
        'JBC/CNY':  { 'id': 'jbc',  'symbol': 'JBC/CNY',  'base': 'JBC',  'quote': 'CNY' },
        'KTC/CNY':  { 'id': 'ktc',  'symbol': 'KTC/CNY',  'base': 'KTC',  'quote': 'CNY' },
        'LKC/CNY':  { 'id': 'lkc',  'symbol': 'LKC/CNY',  'base': 'LKC',  'quote': 'CNY' },
        'LSK/CNY':  { 'id': 'lsk',  'symbol': 'LSK/CNY',  'base': 'LSK',  'quote': 'CNY' },
        'LTC/CNY':  { 'id': 'ltc',  'symbol': 'LTC/CNY',  'base': 'LTC',  'quote': 'CNY' },
        'MAX/CNY':  { 'id': 'max',  'symbol': 'MAX/CNY',  'base': 'MAX',  'quote': 'CNY' },
        'MET/CNY':  { 'id': 'met',  'symbol': 'MET/CNY',  'base': 'MET',  'quote': 'CNY' },
        'MRYC/CNY': { 'id': 'mryc', 'symbol': 'MRYC/CNY', 'base': 'MRYC', 'quote': 'CNY' },
        'MTC/CNY':  { 'id': 'mtc',  'symbol': 'MTC/CNY',  'base': 'MTC',  'quote': 'CNY' },
        'NXT/CNY':  { 'id': 'nxt',  'symbol': 'NXT/CNY',  'base': 'NXT',  'quote': 'CNY' },
        'PEB/CNY':  { 'id': 'peb',  'symbol': 'PEB/CNY',  'base': 'PEB',  'quote': 'CNY' },
        'PGC/CNY':  { 'id': 'pgc',  'symbol': 'PGC/CNY',  'base': 'PGC',  'quote': 'CNY' },
        'PLC/CNY':  { 'id': 'plc',  'symbol': 'PLC/CNY',  'base': 'PLC',  'quote': 'CNY' },
        'PPC/CNY':  { 'id': 'ppc',  'symbol': 'PPC/CNY',  'base': 'PPC',  'quote': 'CNY' },
        'QEC/CNY':  { 'id': 'qec',  'symbol': 'QEC/CNY',  'base': 'QEC',  'quote': 'CNY' },
        'RIO/CNY':  { 'id': 'rio',  'symbol': 'RIO/CNY',  'base': 'RIO',  'quote': 'CNY' },
        'RSS/CNY':  { 'id': 'rss',  'symbol': 'RSS/CNY',  'base': 'RSS',  'quote': 'CNY' },
        'SKT/CNY':  { 'id': 'skt',  'symbol': 'SKT/CNY',  'base': 'SKT',  'quote': 'CNY' },
        'TFC/CNY':  { 'id': 'tfc',  'symbol': 'TFC/CNY',  'base': 'TFC',  'quote': 'CNY' },
        'VRC/CNY':  { 'id': 'vrc',  'symbol': 'VRC/CNY',  'base': 'VRC',  'quote': 'CNY' },
        'VTC/CNY':  { 'id': 'vtc',  'symbol': 'VTC/CNY',  'base': 'VTC',  'quote': 'CNY' },
        'WDC/CNY':  { 'id': 'wdc',  'symbol': 'WDC/CNY',  'base': 'WDC',  'quote': 'CNY' },
        'XAS/CNY':  { 'id': 'xas',  'symbol': 'XAS/CNY',  'base': 'XAS',  'quote': 'CNY' },
        'XPM/CNY':  { 'id': 'xpm',  'symbol': 'XPM/CNY',  'base': 'XPM',  'quote': 'CNY' },
        'XRP/CNY':  { 'id': 'xrp',  'symbol': 'XRP/CNY',  'base': 'XRP',  'quote': 'CNY' },
        'XSGS/CNY': { 'id': 'xsgs', 'symbol': 'XSGS/CNY', 'base': 'XSGS', 'quote': 'CNY' },
        'YTC/CNY':  { 'id': 'ytc',  'symbol': 'YTC/CNY',  'base': 'YTC',  'quote': 'CNY' },
        'ZET/CNY':  { 'id': 'zet',  'symbol': 'ZET/CNY',  'base': 'ZET',  'quote': 'CNY' },
        'ZCC/CNY':  { 'id': 'zcc',  'symbol': 'ZCC/CNY',  'base': 'ZCC',  'quote': 'CNY' },
    },

    fetchBalance () {
        return this.privatePostBalance ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetDepth ({
            'coin': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ({
            'coin': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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
            'quoteVolume': parseFloat (ticker['volume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetOrders ({
            'coin': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTradeAdd (this.extend ({
            'amount': amount,
            'price': price,
            'type': side,
            'coin': this.productId (product),
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privateDeleteWalletsWalletIdOrdersId (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
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
            query['signature'] = this.hmac (this.encode (request), secret);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------
// kraken is also owner of ex. Coinsetter / CaVirtEx / Clevercoin

var kraken = {

    'id': 'kraken',
    'name': 'Kraken',
    'countries': 'US',
    'version': '0',
    'rateLimit': 1500,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
        'api': 'https://api.kraken.com',
        'www': 'https://www.kraken.com',
        'doc': [
            'https://www.kraken.com/en-us/help/api',
            'https://github.com/nothingisdead/npm-kraken-api',
        ],
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

    async fetchProducts () {
        let products = await this.publicGetAssetPairs ();
        let keys = Object.keys (products['result']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products['result'][id];
            let base = product['base'];
            let quote = product['quote'];
            if ((base[0] == 'X') || (base[0] == 'Z'))
                base = base.slice (1);
            if ((quote[0] == 'X') || (quote[0] == 'Z'))
                quote = quote.slice (1);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let darkpool = id.indexOf ('.d') >= 0;
            let symbol = darkpool ? product['altname'] : (base + '/' + quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchOrderBook (product) {
        let darkpool = product.indexOf ('.d') >= 0;
        if (darkpool)
            throw new OrderBookNotAvailableError (this.id + ' does not provide an order book for darkpool symbol ' + product);
        let p = this.product (product);
        let response = await this.publicGetDepth  ({
            'pair': p['id'],
        });
        let orderbook = response['result'][p['id']];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                let timestamp = order[2] * 1000;
                result[side].push ([ price, amount, timestamp ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let darkpool = product.indexOf ('.d') >= 0;
        if (darkpool)
            throw new TickerNotAvailableError (this.id + ' does not provide a ticker for darkpool symbol ' + product);
        let p = this.product (product);
        let response = await this.publicGetTicker ({
            'pair': p['id'],
        });
        let ticker = response['result'][p['id']];
        let timestamp = this.milliseconds ();
        return {
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
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['v'][1]),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTrades ({
            'pair': this.productId (product),
        });
    },

    async fetchBalance () {
        let response = await this.privatePostBalance ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let xcode = 'X' + currency; // X-ISO4217-A3 standard currency codes
            let zcode = 'Z' + currency;
            let balance = undefined;
            if (xcode in balances)
                balance = parseFloat (balances[xcode]);
            if (zcode in balances)
                balance = parseFloat (balances[zcode]);
            if (currency in balances)
                balance = parseFloat (balances[currency]);
            let account = {
                'free': balance,
                'used': undefined,
                'total': balance,
            };
            result[currency] = account;
        }
        return result;
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'pair': this.productId (product),
            'type': side,
            'ordertype': type,
            'volume': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostAddOrder (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'txid': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + type + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            // a workaround for Kraken to replace the old CryptoJS block below, see issues #52 and #23
            let signature = this.signForKraken (url, body, this.secret, nonce);
            // an old CryptoJS block that does not want to work properly under Node
            // let auth = this.encode (nonce + body);
            // let query = this.encode (url) + this.hash (auth, 'sha256', 'binary');
            // let secret = this.base64ToBinary (this.secret);
            // let signature = this.hmac (query, secret, 'sha512', 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': signature,
                'Content-type': 'application/x-www-form-urlencoded',
            };
        }
        url = this.urls['api'] + url;
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var lakebtc = {

    'id': 'lakebtc',
    'name': 'LakeBTC',
    'countries': 'US',
    'version': 'api_v2',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
        'api': 'https://api.lakebtc.com',
        'www': 'https://www.lakebtc.com',
        'doc': [
            'https://www.lakebtc.com/s/api',
            'https://www.lakebtc.com/s/api_v2',
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

    async fetchProducts () {
        let products = await this.publicGetTicker ();
        let result = [];
        let keys = Object.keys (products);
        for (let k = 0; k < keys.length; k++) {
            let id = keys[k];
            let product = products[id];
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
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privatePostGetAccountInfo ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetBcorderbook ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.publicGetTicker ({
            'symbol': p['id'],
        });
        let ticker = tickers[p['id']];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetBctrades ({
            'symbol': this.productId (product)
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let method = 'privatePost' + this.capitalize (side) + 'Order';
        let productId = this.productId (product);
        let order = {
            'params': [ price, amount, productId ],
        };
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostCancelOrder ({ 'params': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (type == 'public') {
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
                'Content-Length': body.length,
                'Content-Type': 'application/json',
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var livecoin = {

    'id': 'livecoin',
    'name': 'LiveCoin',
    'countries': [ 'US', 'UK', 'RU' ],
    'rateLimit': 1000,
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

    async fetchProducts () {
        let products = await this.publicGetExchangeTicker ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['symbol'];
            let symbol = id;
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetPaymentBalances ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetExchangeOrderBook ({
            'currencyPair': this.productId (product),
            'groupByPrice': 'false',
            'depth': 100,
        });
        let timestamp = orderbook['timestamp'];
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetExchangeTicker ({
            'currencyPair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetExchangeLastTrades ({
            'currencyPair': this.productId (product)
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side) + type;
        let order = {
            'currencyPair': this.productId (product),
            'quantity': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostExchangeCancellimit (this.extend ({
            'orderId': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let length = 0;
            if (Object.keys (params).length) {
                let query = this.keysort (params);
                body = this.urlencode (query);
                length = body.length;
            }
            body = this.encode (body || '');
            let signature = this.hmac (body, this.encode (this.secret), 'sha256');
            headers = {
                'Api-Key': this.apiKey,
                'Sign': signature.toUpperCase (),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var liqui = extend (btce, {
    'id': 'liqui',
    'name': 'Liqui',
    'countries': [ 'UA', ],
    'rateLimit': 1000,
    'version': '3',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
        'api': {
            'public': 'https://api.liqui.io/api',
            'private': 'https://api.liqui.io/tapi',
        },
        'www': 'https://liqui.io',
        'doc': 'https://liqui.io/api',
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            url +=  '/' + this.version + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
})

//-----------------------------------------------------------------------------

var luno = {

    'id': 'luno',
    'name': 'luno',
    'countries': [ 'GB', 'SG', 'ZA', ],
    'rateLimit': 3000,
    'version': '1',
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

    async fetchProducts () {
        let products = await this.publicGetTickers ();
        let result = [];
        for (let p = 0; p < products['tickers'].length; p++) {
            let product = products['tickers'][p];
            let id = product['pair'];
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
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetBalance ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderbook ({
            'pair': this.productId (product),
        });
        let timestamp = orderbook['timestamp'];
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['volume']);
                // let timestamp = order[2] * 1000;
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ({
            'pair': this.productId (product),
        });
        let timestamp = ticker['timestamp'];
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'pair': this.productId (product)
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost';
        let order = { 'pair': this.productId (product) };
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
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostStoporder ({ 'order_id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        if (type == 'private') {
            let auth = this.encode (this.apiKey + ':' + this.secret);
            auth = this.stringToBase64 (auth);
            headers = { 'Authorization': 'Basic ' + this.decode (auth) };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var mercado = {

    'id': 'mercado',
    'name': 'Mercado Bitcoin',
    'countries': 'BR', // Brazil
    'rateLimit': 1000,
    'version': 'v3',
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
            'get': [ // last slash critical
                'orderbook/',
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
    'products': {
        'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': '' },
        'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' },
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let method = 'publicGetOrderbook' + this.capitalize (p['suffix']);
        let orderbook = await this[method] ();
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let method = 'publicGetV2Ticker' + this.capitalize (p['suffix']);
        let response = await this[method] ();
        let ticker = response['ticker'];
        let timestamp = parseInt (ticker['date']) * 1000;
        return {
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

    fetchTrades (product) {
        let p = this.product (product);
        let method = 'publicGetTrades' + this.capitalize (p['suffix']);
        return this[method] ();
    },

    fetchBalance () {
        return this.privatePostGetAccountInfo ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        let method = 'privatePostPlace' + this.capitalize (side) + 'Order';
        let order = {
            'coin_pair': this.productId (product),
            'quantity': amount,
            'limit_price': price,
        };
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type] + '/';
        if (type == 'public') {
            url += path;
        } else {
            url += this.version + '/';
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params));
            let auth = '/tapi/' + this.version  + '/' + '?' + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': this.apiKey,
                'TAPI-MAC': this.hmac (this.encode (auth), this.secret, 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
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

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetDepth ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': this.sortBy (orderbook['asks'], 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTicker ({
            'symbol': this.productId (product),
        });
        let ticker = response['ticker'];
        let timestamp = parseInt (response['date']) * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'symbol': this.productId (product),
        });
    },

    fetchBalance () {
        return this.privatePostUserinfo ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'symbol': this.productId (product),
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        else
            order['type'] += '_market';
        return this.privatePostTrade (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api/' + this.version + '/' + path + '.do';
        if (type == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            // secret key must be at the end of query
            let queryString = this.urlencode (query) + '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString)).toUpperCase ();
            body = this.urlencode (query);
            headers = { 'Content-type': 'application/x-www-form-urlencoded' };
        }
        url = this.urls['api'] + url;
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var okcoincny = extend (okcoin, {
    'id': 'okcoincny',
    'name': 'OKCoin CNY',
    'countries': 'CN',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
        'api': 'https://www.okcoin.cn',
        'www': 'https://www.okcoin.cn',
        'doc': 'https://www.okcoin.cn/rest_getStarted.html',
    },
    'products': {
        'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
        'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' },
    },
})

//-----------------------------------------------------------------------------

var okcoinusd = extend (okcoin, {
    'id': 'okcoinusd',
    'name': 'OKCoin USD',
    'countries': [ 'CN', 'US' ],
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
        'api': 'https://www.okcoin.com',
        'www': 'https://www.okcoin.com',
        'doc': [
            'https://www.okcoin.com/rest_getStarted.html',
            'https://www.npmjs.com/package/okcoin.com',
        ],
    },
    'products': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
    },
})

//-----------------------------------------------------------------------------

var paymium = {

    'id': 'paymium',
    'name': 'Paymium',
    'countries': [ 'FR', 'EU', ],
    'rateLimit': 2000,
    'version': 'v1',
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
    'products': {
        'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
    },

    fetchBalance () {
        return this.privateGetUser ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetDataIdDepth  ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['price'];
                let amount = order['amount'];
                let timestamp = order['timestamp'] * 1000;
                result[side].push ([ price, amount, timestamp ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetDataIdTicker ({
            'id': this.productId (product),
        });
        let timestamp = ticker['at'] * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetDataIdTrades ({
            'id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'type': this.capitalize (type) + 'Order',
            'currency': this.productId (product),
            'direction': side,
            'amount': amount,
        };
        if (type == 'market')
            order['price'] = price;
        return this.privatePostUserOrders (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'orderNumber': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var poloniex = {

    'id': 'poloniex',
    'name': 'Poloniex',
    'countries': 'US',
    'rateLimit': 500, // 6 calls per second
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

    async fetchProducts () {
        let products = await this.publicGetReturnTicker ();
        let keys = Object.keys (products);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products[id];
            let [ quote, base ] = id.split ('_');
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privatePostReturnCompleteBalances ({
            'account': 'all',
        });
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetReturnOrderBook ({
            'currencyPair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.publicGetReturnTicker ();
        let ticker = tickers[p['id']];
        let timestamp = this.milliseconds ();
        return {
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
            'last': undefined,
            'change': parseFloat (ticker['percentChange']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['baseVolume']),
            'quoteVolume': parseFloat (ticker['quoteVolume']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetReturnTradeHistory ({
            'currencyPair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        return this[method] (this.extend ({
            'currencyPair': this.productId (product),
            'rate': price,
            'amount': amount,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'orderNumber': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        let query = this.extend ({ 'command': path }, params);
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var quadrigacx = {

    'id': 'quadrigacx',
    'name': 'QuadrigaCX',
    'countries': 'CA',
    'rateLimit': 1000,
    'version': 'v2',
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
    'products': {
        'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
        'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD' },
    },

    async fetchBalance () {
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
        return result;
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetOrderBook ({
            'book': this.productId (product),
        });
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetTicker ({
            'book': this.productId (product),
        });
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTransactions ({
            'book': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'amount': amount,
            'book': this.productId (product),
        };
        if (type == 'limit')
            order['price'] = price;
        return this[method] (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (type == 'public') {
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
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var quoine = {

    'id': 'quoine',
    'name': 'QUOINE',
    'countries': [ 'JP', 'SG', 'VN' ],
    'version': '2',
    'rateLimit': 1000,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
        'api': 'https://api.quoine.com',
        'www': 'https://www.quoine.com',
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

    async fetchProducts () {
        let products = await this.publicGetProducts ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['id'];
            let base = product['base_currency'];
            let quote = product['quoted_currency'];
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetAccountsBalance ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetProductsIdPriceLevels ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buy_price_levels', 'asks': 'sell_price_levels' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetProductsId ({
            'id': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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
            'last': parseFloat (ticker['last_traded_price']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_24h']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetExecutions ({
            'product_id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'order_type': type,
            'product_id': this.productId (product),
            'side': side,
            'quantity': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostOrders (this.extend ({
            'order': order,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-type': 'application/json',
        };
        if (type == 'public') {
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
        return this.fetch (this.urls['api'] + url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var southxchange = {

    'id': 'southxchange',
    'name': 'SouthXchange',
    'countries': 'AR', // Argentina
    'rateLimit': 1000,
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

    async fetchProducts () {
        let products = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let base = product[0];
            let quote = product[1];
            let symbol = base + '/' + quote;
            let id = symbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privatePostListBalances ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetBookSymbol ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'BuyOrders', 'asks': 'SellOrders' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['Price']);
                let amount = parseFloat (order['Amount']);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetPriceSymbol ({
            'symbol': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['Bid']),
            'ask': parseFloat (ticker['Ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['Last']),
            'change': parseFloat (ticker['Variation24Hr']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['Volume24Hr']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.publicGetTradesSymbol ({
            'symbol': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let order = {
            'listingCurrency': p['base'],
            'referenceCurrency': p['quote'],
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['limitPrice'] = price;
        return this.privatePostPlaceOrder (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'orderCode': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'private') {
            let nonce = this.nonce ();
            query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, query);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
                'Hash': this.hmac (this.encode (body), this.secret, 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var surbitcoin = extend (blinktrade, {
    'id': 'surbitcoin',
    'name': 'SurBitcoin',
    'countries': 'VE',
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
    'products': {
        'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin', },
    },
})

//-----------------------------------------------------------------------------

var therock = {

    'id': 'therock',
    'name': 'TheRockTrading',
    'countries': 'MT',
    'rateLimit': 1000,
    'version': 'v1',
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

    async fetchProducts () {
        let products = await this.publicGetFundsTickers ();
        let result = [];
        for (let p = 0; p < products['tickers'].length; p++) {
            let product = products['tickers'][p];
            let id = product['fund_id'];
            let base = id.slice (0, 3);
            let quote = id.slice (3, 6);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetBalances ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.publicGetFundsIdOrderbook ({
            'id': this.productId (product),
        });
        let timestamp = this.parse8601 (orderbook['date']);
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['amount']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.publicGetFundsIdTicker ({
            'id': this.productId (product),
        });
        let timestamp = this.parse8601 (ticker['date']);
        return {
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

    fetchTrades (product) {
        return this.publicGetFundsIdTrades ({
            'id': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        return this.privatePostFundsFundIdOrders (this.extend ({
            'fund_id': this.productId (product),
            'side': side,
            'amount': amount,
            'price': price,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privateDeleteFundsFundIdOrdersId (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'private') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var urdubit = extend (blinktrade, {
    'id': 'urdubit',
    'name': 'UrduBit',
    'countries': 'PK',
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
    'products': {
        'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit', },
    },
})

//-----------------------------------------------------------------------------

var vaultoro = {

    'id': 'vaultoro',
    'name': 'Vaultoro',
    'countries': 'CH',
    'rateLimit': 1000,
    'version': '1',
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

    async fetchProducts () {
        let result = [];
        let products = await this.publicGetMarkets ();
        let product = products['data'];
        let base = product['BaseCurrency'];
        let quote = product['MarketCurrency'];
        let symbol = base + '/' + quote;
        let baseId = base;
        let quoteId = quote;
        let id = product['MarketName'];
        result.push ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': product,
        });
        return result;
    },

    fetchBalance () {
        return this.privateGetBalance ();
    },

    async fetchOrderBook (product) {
        let response = await this.publicGetOrderbook ();
        let orderbook = {
            'bids': response['data'][0]['b'],
            'asks': response['data'][1]['s'],
        };
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = order['Gold_Price'];
                let amount = order['Gold_Amount'];
                result[side].push ([ price, amount ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        return result;
    },

    async fetchTicker (product) {
        let quote = await this.publicGetBidandask ();
        let bidsLength = quote['bids'].length;
        let bid = quote['bids'][bidsLength - 1];
        let ask = quote['asks'][0];
        let response = await this.publicGetMarkets ();
        let ticker = response['data'];
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.publicGetTransactionsDay ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product);
        let method = 'privatePost' + this.capitalize (side) + 'SymbolType';
        return this[method] (this.extend ({
            'symbol': p['quoteId'].toLowerCase (),
            'type': type,
            'gld': amount,
            'price': price || 1,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelId (this.extend ({
            'id': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (type == 'public') {
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
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var vbtc = extend (blinktrade, {
    'id': 'vbtc',
    'name': 'VBTC',
    'countries': 'VN',
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
    'products': {
        'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC', },
    },
})


//-----------------------------------------------------------------------------

var virwox = {

    'id': 'virwox',
    'name': 'VirWoX',
    'countries': 'AT',
    'rateLimit': 1000,
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

    async fetchProducts () {
        let products = await this.publicGetInstruments ();
        let keys = Object.keys (products['result']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let product = products['result'][keys[p]];
            let id = product['instrumentID'];
            let symbol = product['symbol'];
            let base = product['longCurrency'];
            let quote = product['shortCurrency'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privatePostGetBalances ();
    },

    fetchBestPrices (product) {
        return this.publicPostGetBestPrices ({
            'symbols': [ this.symbol (product) ],
        });
    },

    async fetchOrderBook (product) {
        let response = await this.publicPostGetMarketDepth ({
            'symbols': [ this.symbol (product) ],
            'buyDepth': 100,
            'sellDepth': 100,
        });
        let orderbook = response['result'][0];
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = { 'bids': 'buy', 'asks': 'sell' };
        let keys = Object.keys (sides);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let side = sides[key];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['price']);
                let amount = parseFloat (order['volume']);
                result[key].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let end = this.milliseconds ();
        let start = end - 86400000;
        let response = await this.publicGetTradedPriceVolume ({
            'instrument': this.symbol (product),
            'endDate': this.yyyymmddhhmmss (end),
            'startDate': this.yyyymmddhhmmss (start),
            'HLOC': 1,
        });
        let tickers = response['result']['priceVolumeList'];
        let keys = Object.keys (tickers);
        let length = keys.length;
        let lastKey = keys[length - 1];
        let ticker = tickers[lastKey];
        let timestamp = this.milliseconds ();
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': undefined,
            'ask': undefined,
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

    fetchTrades (product) {
        return this.publicGetRawTradeData ({
            'instrument': this.symbol (product),
            'timespan': 3600,
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'instrument': this.symbol (product),
            'orderType': side.toUpperCase (),
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        return this.privatePostPlaceOrder (this.extend (order, params));
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (this.extend ({
            'orderID': id,
        }, params));
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][type];
        let auth = {};
        if (type == 'public') {
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
            headers = { 'Content-type': 'application/json' };
            body = this.json ({
                'method': path,
                'params': this.extend (auth, params),
                'id': nonce,
            });
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var xbtce = {

    'id': 'xbtce',
    'name': 'xBTCe',
    'countries': 'RU',
    'rateLimit': 2000, // responses are cached every 2 seconds
    'version': 'v1',
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

    async fetchProducts () {
        let products = await this.privateGetSymbol ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['Symbol'];
            let base = product['MarginCurrency'];
            let quote = product['ProfitCurrency'];
            if (base == 'DSH')
                base = 'DASH';
            let symbol = base + '/' + quote;
            symbol = product['IsTradeAllowed'] ? symbol : id;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.privateGetAsset ();
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.privateGetLevel2Filter ({
            'filter': p['id'],
        });
        orderbook = orderbook[0];
        let timestamp = orderbook['Timestamp'];
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let Side = this.capitalize (side);
            let orders = orderbook[Side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order['Price']);
                let amount = parseFloat (order['Volume']);
                result[side].push ([ price, amount ]);
            }
        }
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.privateGetTickFilter ({
            'filter': p['id'],
        });
        tickers = this.indexBy (tickers, 'Symbol');
        let ticker = tickers[p['id']];
        let timestamp = ticker['Timestamp'];
        let bid = undefined;
        let ask = undefined;
        if ('BestBid' in ticker)
            bid = ticker['BestBid']['Price'];
        if ('BestAsk' in ticker)
            ask = ticker['BestAsk']['Price'];
        return {
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
    },

    fetchTrades (product) {
        // no method for trades?
        return this.privateGetTrade ();
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        return this.tapiPostTrade (this.extend ({
            'pair': this.productId (product),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.privateDeleteTrade (this.extend ({
            'Type': 'Cancel',
            'Id': id,
        }, params));
    },

    nonce () {
        return this.milliseconds ();
    },

    request (path, type = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey)
            throw new AuthenticationError (this.id + ' requires apiKey for all requests, their public API is always busy');
        if (!this.uid)
            throw new AuthenticationError (this.id + ' requires uid property for authentication and trading');
        let url = this.urls['api'] + '/' + this.version;
        if (type == 'public')
            url += '/' + type;
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (type == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ().toString ();
            if (Object.keys (query).length)
                body = this.json (query);
            else
                body = '';
            let auth = nonce + this.uid + this.apiKey + method + url + body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            let credentials = [ this.uid, this.apiKey, nonce, signature ].join (':');
            headers = {
                'Accept-Encoding': 'gzip, deflate',
                'Authorization': 'HMAC ' + credentials,
                'Content-Type': 'application/json',
                'Content-Length': body.length,
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var yobit = {

    'id': 'yobit',
    'name': 'YoBit',
    'countries': 'RU',
    'rateLimit': 2000, // responses are cached every 2 seconds
    'version': '3',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
        'api': 'https://yobit.net',
        'www': 'https://www.yobit.net',
        'doc': 'https://www.yobit.net/en/api/',
    },
    'api': {
        'api': {
            'get': [
                'depth/{pairs}',
                'info',
                'ticker/{pairs}',
                'trades/{pairs}',
            ],
        },
        'tapi': {
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

    async fetchProducts () {
        let products = await this.apiGetInfo ();
        let keys = Object.keys (products['pairs']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let product = products['pairs'][id];
            let symbol = id.toUpperCase ().replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.tapiPostGetInfo ();
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let response = await this.apiGetDepthPairs ({
            'pairs': p['id'],
        });
        let orderbook = response[p['id']];
        let timestamp = this.milliseconds ();
        let bids = ('bids' in orderbook) ? orderbook['bids'] : [];
        let asks = ('asks' in orderbook) ? orderbook['asks'] : [];
        let result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let p = this.product (product);
        let tickers = await this.apiGetTickerPairs ({
            'pairs': p['id'],
        });
        let ticker = tickers[p['id']];
        let timestamp = ticker['updated'] * 1000;
        return {
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
            'average': parseFloat (ticker['avg']),
            'baseVolume': parseFloat (ticker['vol_cur']),
            'quoteVolume': parseFloat (ticker['vol']),
            'info': ticker,
        };
    },

    fetchTrades (product) {
        return this.apiGetTradesPairs ({
            'pairs': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        return this.tapiPostTrade (this.extend ({
            'pair': this.productId (product),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.tapiPostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    request (path, type = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + type;
        if (type == 'api') {
            url += '/' + this.version + '/' + this.implodeParams (path, params);
            let query = this.omit (params, this.extractParams (path));
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            let nonce = this.nonce ();
            let query = this.extend ({ 'method': path, 'nonce': nonce }, params);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var yunbi = {

    'id': 'yunbi',
    'name': 'YUNBI',
    'countries': 'CN',
    'rateLimit': 1000,
    'version': 'v2',
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg',
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

    async fetchProducts () {
        let products = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['id'];
            let symbol = product['name'];
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    async fetchBalance () {
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
                'total': undefined,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[uppercase] = account;
        }
        return result;
    },

    async fetchOrderBook (product) {
        let p = this.product (product);
        let orderbook = await this.publicGetDepth ({
            'market': p['id'],
        });
        let timestamp = orderbook['timestamp'] * 1000;
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        let sides = [ 'bids', 'asks' ];
        for (let s = 0; s < sides.length; s++) {
            let side = sides[s];
            let orders = orderbook[side];
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                let price = parseFloat (order[0]);
                let amount = parseFloat (order[1]);
                result[side].push ([ price, amount ]);
            }
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    },

    async fetchTicker (product) {
        let response = await this.publicGetTickersMarket ({
            'market': this.productId (product),
        });
        let ticker = response['ticker'];
        let timestamp = response['at'] * 1000;
        return {
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

    fetchTrades (product) {
        return this.publicGetTrades ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let order = {
            'market': this.productId (product),
            'side': side,
            'volume': amount,
            'ord_type': type,
        };
        if (type == 'market') {
            order['price'] = price;
        }
        return this.privatePostOrders (this.extend (order, params));
    },

    cancelOrder (id) {
        return this.privatePostOrderDelete ({ 'id': id });
    },

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params) + '.json';
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (type == 'public') {
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
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length,
                };
            }
        }
        return this.fetch (url, method, headers, body);
    },
}

//-----------------------------------------------------------------------------

var zaif = {

    'id': 'zaif',
    'name': 'Zaif',
    'countries': 'JP',
    'rateLimit': 2000,
    'version': '1',
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
        'api': {
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
        'tapi': {
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

    async fetchProducts () {
        let products = await this.apiGetCurrencyPairsAll ();
        let result = [];
        for (let p = 0; p < products.length; p++) {
            let product = products[p];
            let id = product['currency_pair'];
            let symbol = product['name'];
            let [ base, quote ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': product,
            });
        }
        return result;
    },

    fetchBalance () {
        return this.tapiPostGetInfo ();
    },

    async fetchOrderBook (product) {
        let orderbook = await this.apiGetDepthPair  ({
            'pair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        let result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        return result;
    },

    async fetchTicker (product) {
        let ticker = await this.apiGetTickerPair ({
            'pair': this.productId (product),
        });
        let timestamp = this.milliseconds ();
        return {
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

    fetchTrades (product) {
        return this.apiGetTradesPair ({
            'pair': this.productId (product),
        });
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        if (type == 'market')
            throw new Error (this.id + ' allows limit orders only');
        return this.tapiPostTrade (this.extend ({
            'currency_pair': this.productId (product),
            'action': (side == 'buy') ? 'bid' : 'ask',
            'amount': amount,
            'price': price,
        }, params));
    },

    cancelOrder (id, params = {}) {
        return this.tapiPostCancelOrder (this.extend ({
            'order_id': id,
        }, params));
    },

    request (path, type = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + type;
        if (type == 'api') {
            url += '/' + this.version + '/' + this.implodeParams (path, params);
        } else {
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length,
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return this.fetch (url, method, headers, body);
    },
}

//=============================================================================

var markets = {

    '_1broker':      _1broker,
    '_1btcxe':       _1btcxe,
    'anxpro':        anxpro,
    'bit2c':         bit2c,
    'bitbay':        bitbay,
    'bitbays':       bitbays,
    'bitcoincoid':   bitcoincoid,
    'bitfinex':      bitfinex,
    'bitflyer':      bitflyer,
    'bitlish':       bitlish,
    'bitmarket':     bitmarket,
    'bitmex':        bitmex,
    'bitso':         bitso,
    'bitstamp':      bitstamp,
    'bittrex':       bittrex,
    'bl3p':          bl3p,
    'btcchina':      btcchina,
    'btce':          btce,
    'btcexchange':   btcexchange,
    'btctradeua':    btctradeua,
    'btcturk':       btcturk,
    'btcx':          btcx,
    'bter':          bter,
    'bxinth':        bxinth,
    'ccex':          ccex,
    'cex':           cex,
    'chbtc':         chbtc,
    'chilebit':      chilebit,
    'coincheck':     coincheck,
    'coingi':        coingi,
    'coinmarketcap': coinmarketcap,
    'coinmate':      coinmate,
    'coinsecure':    coinsecure,
    'coinspot':      coinspot,
    'dsx':           dsx,
    'exmo':          exmo,
    'flowbtc':       flowbtc,
    'foxbit':        foxbit,
    'fybse':         fybse,
    'fybsg':         fybsg,
    'gatecoin':      gatecoin,
    'gdax':          gdax,
    'gemini':        gemini,
    'hitbtc':        hitbtc,
    'huobi':         huobi,
    'itbit':         itbit,
    'jubi':          jubi,
    'kraken':        kraken,
    'lakebtc':       lakebtc,
    'livecoin':      livecoin,
    'liqui':         liqui,
    'luno':          luno,
    'mercado':       mercado,
    'okcoincny':     okcoincny,
    'okcoinusd':     okcoinusd,
    'paymium':       paymium,
    'poloniex':      poloniex,
    'quadrigacx':    quadrigacx,
    'quoine':        quoine,
    'southxchange':  southxchange,
    'surbitcoin':    surbitcoin,
    'therock':       therock,
    'urdubit':       urdubit,
    'vaultoro':      vaultoro,
    'vbtc':          vbtc,
    'virwox':        virwox,
    'xbtce':         xbtce,
    'yobit':         yobit,
    'yunbi':         yunbi,
    'zaif':          zaif,
}

let defineAllMarkets = function (markets) {
    let result = {}
    for (let id in markets)
        result[id] = function (params) {
            return new Market (extend (markets[id], params))
        }
    result.markets = Object.keys (markets)
    return result
}

if (isNode || isReactNative) {
    
    Object.assign (module.exports = defineAllMarkets (markets), {

        version,

        // exceptions

        CCXTError,
        DDoSProtectionError,
        TimeoutError,
        AuthenticationError,
        NotAvailableError,
        MarketNotAvailableError,
        EndpointNotAvailableError,
        OrderBookNotAvailableError,
        TickerNotAvailableError,

        // common utility functions

        sleep,
        timeout,
        capitalize,
        keysort,
        extend,
        omit,
        indexBy,
        sortBy,
        flatten,
        unique,
        pluck,
        urlencode,
        sum,

        // underscore aliases

        index_by: indexBy, 
        sort_by: sortBy,

        // crypto functions

        stringToBinary,
        stringToBase64,
        utf16ToBase64,
        base64ToBinary,
        base64ToString,
        urlencodeBase64,
        hash,
        hmac,
        jwt,

    })

} else

    window.ccxt = defineAllMarkets (markets)

}) ()
