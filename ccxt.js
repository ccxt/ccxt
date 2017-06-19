"use strict";

(function () {

var isNode = (typeof window === 'undefined')

//-----------------------------------------------------------------------------

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
            Object.keys (arguments[i]).forEach (key => (result[key] = arguments[i][key]))
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
    for (var i = 0; i < array.length; i++)
        result[array[i][key]] = array[i]
    return result
}

var flat = function (array) {
    return array.reduce ((acc, cur) => acc.concat (cur), [])
}

var querystring = function (object) {
    return Object.keys (object).map (key => encodeURIComponent (key) + '=' + encodeURIComponent (object[key])).join ('&')
}

var base64urlencode = function (base64string) {
    return base64string.replace (/[=]+$/, '').replace (/\+/g, '-').replace (/\//g, '_') 
}

//-----------------------------------------------------------------------------

if (isNode) {

    const crypto = require ('crypto')
    var   fetch  = require ('node-fetch')
    
    var stringToBinary = function (string) {
        return Buffer.from (string, 'binary')
    }
    
    var stringToBase64 = function (string) {
        return new Buffer  (string).toString ('base64')
    }
    
    var utf16ToBase64 = function (string) {
        return stringToBase64 (string)
    }
    
    var base64ToBinary = function (string) {
        return Buffer.from (string, 'base64')
    }
    var base64ToString = function (string) {
        return Buffer.from (string, 'base64').toString ()
    }
    
    var hash = function (request, hash = 'md5', digest = 'hex') {
        return crypto.createHash (hash).update (request).digest (digest)
    }
    var hmac = function (request, secret, hash = 'sha256', digest = 'hex') {
        return crypto.createHmac (hash, secret).update (request).digest (digest)
    }

} else {

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
                    else 
                        throw new Error (method, url, xhr.status, xhr.responseText)
                }
            }
            
            if (typeof options.headers != 'undefined')
                for (var header in options.headers)
                    xhr.setRequestHeader (header, options.headers[header])

            xhr.send (options.body)
        })
    }

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
    
    var hash = function (request, hash = 'md5', digest = 'hex') {
        var encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
        return CryptoJS[hash.toUpperCase ()] (request).toString (CryptoJS.enc[encoding])
    }
    var hmac = function (request, secret, hash = 'sha256', digest = 'hex') {
        var encoding = (digest === 'binary') ? 'Latin1' : capitalize (digest)
        return CryptoJS['Hmac' + hash.toUpperCase ()] (request, secret).toString (CryptoJS.enc[capitalize (encoding)])
    }
}

var jwt = function (request, secret, alg = 'HS256', hash = 'sha256') {
    var encodedHeader = base64urlencode (stringToBase64 (JSON.stringify ({ alg, typ: 'JWT' })))
    var encodedData   = base64urlencode (stringToBase64 (JSON.stringify (request)))
    var token         = [ encodedHeader, encodedData ].join ('.')
    var signature     = base64urlencode (utf16ToBase64 (hmac (token, secret, hash, 'utf16')))
    return [ token, signature ].join ('.')
}

//-----------------------------------------------------------------------------

var Market = function (config) {

    this.hash = hash
    this.hmac = hmac
    this.jwt  = jwt
    this.stringToBinary = stringToBinary
    this.stringToBase64 = stringToBase64
    this.base64ToBinary = base64ToBinary

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
                        let underscoreSuffix = splitPath.map (x => x.toLowerCase ()).join ('_')

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

    this.fetch = function (url, options) {

        if (isNode)
            options.headers = extend ({
                'User-Agent': 'ccxt/0.1.0 (+https://github.com/kroitor/ccxt) Node.js/' + this.nodeVersion + ' (JavaScript)'
            }, options.headers)

        if (this.verbose)
            console.log (this.id, url, options)

        return (fetch ((this.cors ? this.cors : '') + url, options)
            .then (response => (typeof response === 'string') ? response : response.text ())
            .then (response => {
                try {
                    return JSON.parse (response)
                } catch (e) {
                    var cloudflareProtection = response.match (/cloudflare/i) ? 'DDoS protection by Cloudflare' : ''
                    if (this.verbose)
                        console.log (this.id, response, cloudflareProtection, e)
                    throw e
                }
            }))
    }

    this.load_products = 
    this.loadProducts = function () {
        if (this.products)
            return new Promise ((resolve, reject) => resolve (this.products))
        return this.fetchProducts ().then (products => {
            return this.products = indexBy (products, 'symbol')
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
            (typeof this.products[product] != 'undefined')) ? this.products[product] : product)        
    }

    this.product_id = 
    this.productId  = function (product) { 
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

    this.buy = function (product, amount, price = undefined, params = {}) {
        return this.order (product, 'buy', amount, price, params)
    }

    this.sell = function (product, amount, price = undefined, params = {}) {
        return this.order (product, 'sell', amount, price, params)
    }

    this.trade =
    this.order = function (product, side, amount, price = undefined, params = {}) {
        let type = (typeof price == 'undefined') ? 'market' : 'limit'
        return this.createOrder (product, type, side, amount, price, params)
    }

    this.create_buy_order =
    this.createBuyOrder = function (product, type, amount, price = undefined, params = {}) { 
        return this.createOrder (product, type, 'buy',  amount, price, params)
    }

    this.create_sell_order =
    this.createSellOrder = function (product, type, amount, price = undefined, params = {}) {
        return this.createOrder (product, type, 'sell', amount, price, params)
    }

    this.create_limit_buy_order =
    this.createLimitBuyOrder = function (product, amount, price, params = {}) {
        return this.createLimitOrder  (product, 'buy',  amount, price, params)
    }

    this.create_limit_sell_order = 
    this.createLimitSellOrder = function (product, amount, price, params = {}) {
        return this.createLimitOrder (product, 'sell', amount, price, params)
    }

    this.create_market_buy_order =
    this.createMarketBuyOrder = function (product, amount, params = {}) {
        return this.createMarketOrder (product, 'buy',  amount, params)
    }

    this.create_market_sell_order =
    this.createMarketSellOrder = function (product, amount, params = {}) {
        return this.createMarketOrder (product, 'sell', amount, params)
    }

    this.create_limit_order = 
    this.createLimitOrder = function (product, side, amount, price, params = {}) {
        return this.createOrder (product, 'limit',  side, amount, price, params)
    }

    this.create_market_order =
    this.createMarketOrder = function (product, side, amount, params = {}) {
        return this.createOrder (product, 'market', side, amount, undefined, params)
    },

    this.seconds      = () => Math.floor (this.milliseconds () / 1000)
    this.microseconds = () => Math.floor (this.milliseconds () * 1000)
    this.milliseconds = Date.now
    this.nonce        = this.seconds
    this.id           = undefined
    this.rateLimit    = 2000
    this.timeout      = undefined

    for (var property in config)
        this[property] = config[property]

    this.fetch_balance    = this.fetchBalance
    this.fetch_order_book = this.fetchOrderBook
    this.fetch_ticker     = this.fetchTicker
    this.fetch_trades     = this.fetchTrades
  
    this.verbose =
        this.log              ||
        this.debug            ||
        (this.verbosity == 1) ||
        this.verbose

    if (typeof this.nonce === 'string') {
        let f = this.nonce.toLowerCase () 
        this.nonce = this[f]
    }

    this.init ()
}

//=============================================================================

var _1broker = {

    name: '1Broker',
    countries: [ 'US' ],
    rateLimit: 2000,

    version: 'v2',
    
    urls: {

        api: 'https://1broker.com/api',        
        www: 'https://1broker.com',
        doc: 'https://1broker.com/?c=en/content/api-documentation',
    },

    api: {

        private: {

            get: [

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
        }
    },

    fetchCategories () { return this.privateGetMarketCategories () },
    fetchProducts () { // fetch products from all categories
        return this.fetchCategories ().then (categories => 
            Promise.all (categories.response.map (category => 
                this.privateGetMarketList ({ category: category.toLowerCase () })
                    .then (products => products.response))).then (result => 
                        flat (result).map (product => {

                            if ((product.category == 'FOREX') ||
                                (product.category == 'CRYPTO')) {
                                var id = product.symbol
                                var symbol = product.name
                                var [ base, quote ] = symbol.split ('/')
                                return {
                                    id,
                                    symbol,
                                    base,
                                    quote,
                                    info: product,
                                }
                            } 

                            var id = product.symbol
                            var symbol = product.symbol
                            var name = product.name
                            var type = product.type.toLowerCase ()
                            return { id, symbol, name, type, info: product }
                            
                        })))
    },
    
    fetchBalance () { return this.privateGetUserOverview () },
    fetchOrderBook (product) {
        return this.privateGetMarketQuotes ({
            symbols: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privateGetOrderCreate (extend ({
            symbol: this.productId (product),
            margin: amount,
            direction: (side == 'sell') ? 'short' : 'long',
            leverage: 1,
            type: side + ((type == 'market') ? '_market' : ''),
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {
        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + path + '.php'
        var query = extend ({ token: (this.apiKey || this.token) }, params)
        url += '?' + querystring (query)
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var cryptocapital = {

    comment: 'Crypto Capital API',
    api: {

        public: {

            get: [

                'stats',
                'historical-prices',
                'order-book',
                'transactions',
            ],
        },

        private: {
            
            post: [

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

    fetchBalance () {return this.privatePostBalancesAndInfo () },
    
    fetchOrderBook (product) { 
        return this.publicGetOrderBook ({
            currency: this.productId (product),
        })
    },

    fetchTicker (product) {
        return this.publicGetStats ({
            currency: this.productId (product),
        })
    },

    fetchTrades (product) {
        return this.publicGetTransactions ({
            currency: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrdersNew (extend ({
            side,
            type,
            currency: this.productId (product),
            amount
        }, (type == 'limit') ? { limit_price: price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + path

        if (type === 'public') {

            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var query = extend ({
                api_key: this.apiKey,
                nonce: this.nonce (),
            }, params)

            query.signature = this.hmac (JSON.stringify (query), this.secret)
            options.body = JSON.stringify (query)
            options.headers = {
                'Content-Type': 'application/json',
            }
        }
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var _1btcxe = extend (cryptocapital, {

    name: '1BTCXE',
    countries: [ 'PA' ], // Panama
    urls: { 
        api:  'https://1btcxe.com/api',
        www:  'https://1btcxe.com',
        docs: 'https://1btcxe.com/api-docs.php',
    },
    comment: 'Crypto Capital API',
    products: {
        'BTC/USD': { id: 'USD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD', },
        'BTC/EUR': { id: 'EUR', symbol: 'BTC/EUR', base: 'BTC', quote: 'EUR', },
        'BTC/CNY': { id: 'CNY', symbol: 'BTC/CNY', base: 'BTC', quote: 'CNY', },
        'BTC/RUB': { id: 'RUB', symbol: 'BTC/RUB', base: 'BTC', quote: 'RUB', },
        'BTC/CHF': { id: 'CHF', symbol: 'BTC/CHF', base: 'BTC', quote: 'CHF', },
        'BTC/JPY': { id: 'JPY', symbol: 'BTC/JPY', base: 'BTC', quote: 'JPY', },
        'BTC/GBP': { id: 'GBP', symbol: 'BTC/GBP', base: 'BTC', quote: 'GBP', },
        'BTC/CAD': { id: 'CAD', symbol: 'BTC/CAD', base: 'BTC', quote: 'CAD', },
        'BTC/AUD': { id: 'AUD', symbol: 'BTC/AUD', base: 'BTC', quote: 'AUD', },
        'BTC/AED': { id: 'AED', symbol: 'BTC/AED', base: 'BTC', quote: 'AED', },
        'BTC/BGN': { id: 'BGN', symbol: 'BTC/BGN', base: 'BTC', quote: 'BGN', },
        'BTC/CZK': { id: 'CZK', symbol: 'BTC/CZK', base: 'BTC', quote: 'CZK', },
        'BTC/DKK': { id: 'DKK', symbol: 'BTC/DKK', base: 'BTC', quote: 'DKK', },
        'BTC/HKD': { id: 'HKD', symbol: 'BTC/HKD', base: 'BTC', quote: 'HKD', },
        'BTC/HRK': { id: 'HRK', symbol: 'BTC/HRK', base: 'BTC', quote: 'HRK', },
        'BTC/HUF': { id: 'HUF', symbol: 'BTC/HUF', base: 'BTC', quote: 'HUF', },
        'BTC/ILS': { id: 'ILS', symbol: 'BTC/ILS', base: 'BTC', quote: 'ILS', },
        'BTC/INR': { id: 'INR', symbol: 'BTC/INR', base: 'BTC', quote: 'INR', },
        'BTC/MUR': { id: 'MUR', symbol: 'BTC/MUR', base: 'BTC', quote: 'MUR', },
        'BTC/MXN': { id: 'MXN', symbol: 'BTC/MXN', base: 'BTC', quote: 'MXN', },
        'BTC/NOK': { id: 'NOK', symbol: 'BTC/NOK', base: 'BTC', quote: 'NOK', },
        'BTC/NZD': { id: 'NZD', symbol: 'BTC/NZD', base: 'BTC', quote: 'NZD', },
        'BTC/PLN': { id: 'PLN', symbol: 'BTC/PLN', base: 'BTC', quote: 'PLN', },
        'BTC/RON': { id: 'RON', symbol: 'BTC/RON', base: 'BTC', quote: 'RON', },
        'BTC/SEK': { id: 'SEK', symbol: 'BTC/SEK', base: 'BTC', quote: 'SEK', },
        'BTC/SGD': { id: 'SGD', symbol: 'BTC/SGD', base: 'BTC', quote: 'SGD', },
        'BTC/THB': { id: 'THB', symbol: 'BTC/THB', base: 'BTC', quote: 'THB', },
        'BTC/TRY': { id: 'TRY', symbol: 'BTC/TRY', base: 'BTC', quote: 'TRY', },
        'BTC/ZAR': { id: 'ZAR', symbol: 'BTC/ZAR', base: 'BTC', quote: 'ZAR', },
    },
})

//-----------------------------------------------------------------------------

var bit2c = {

    name: 'Bit2C',
    countries: 'IL', // Israel
    rateLimit: 3000,
    
    urls: {

        api: 'https://www.bit2c.co.il',
        www: 'https://www.bit2c.co.il',
        doc: [
            'https://www.bit2c.co.il/home/api',
            'https://github.com/OferE/bit2c',
        ],
    },
        
    api: {

        public: {

            get: [

                'Exchanges/{pair}/Ticker',
                'Exchanges/{pair}/orderbook',
                'Exchanges/{pair}/trades',
            ],
        },

        private: {

            post: [

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

    products: {
        'BTC/NIS': { id: 'BtcNis', symbol: 'BTC/NIS', base: 'BTC', quote: 'NIS' },
        'LTC/BTC': { id: 'LtcBtc', symbol: 'LTC/BTC', base: 'LTC', quote: 'BTC' },
        'LTC/NIS': { id: 'LtcNis', symbol: 'LTC/NIS', base: 'LTC', quote: 'NIS' },
    },

    fetchBalance () { return this.privatePostAccountBalanceV2 () },

    fetchOrderBook (product) {
        return this.publicGetExchangesPairOrderbook ({
            pair: this.productId (product),
        })
    },

    fetchTicker (product) {
        return this.publicGetExchangesPairTicker ({
            pair: this.productId (product),
        })
    },

    fetchTrades (product) {
        return this.publicGetExchangesPairTrades ({
            pair: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let method = 'privatePostOrderAddOrder'

        if (type == 'market')
            method += 'MarketPrice' + capitalize (side) 

        return this[method] (extend ({
            Amount: amount,
            Pair: this.productId (product),
        }, (type == 'limit') ? {
            Price: price,
            Total: amount * price,
            IsBid: (side == 'buy'),
        } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.implodeParams (path, params)

        if (type === 'public') {

            url += '.json'

        } else {

            var nonce = this.nonce ()
            options.body = querystring (extend ({ nonce }, params))
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                key: this.apiKey,
                sign: this.hmac (options.body, this.secret, 'sha512', 'base64'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitbay = {

    name:      'BitBay',
    countries: [ 'PL', 'EU', ], // Poland
    rateLimit: 1000,

    urls: {
        www: 'https://bitbay.net',
        api: {
            public:  'https://bitbay.net/API/Public',
            private: 'https://bitbay.net/API/Trading/tradingApi.php',
        },
        doc: [
            'https://bitbay.net/public-api',
            'https://bitbay.net/account/tab-api',
            'https://github.com/BitBayNet/API'
        ], 
    },
    
    api: {

        public: {

            get: [

                '{id}/all',
                '{id}/market',
                '{id}/orderbook',
                '{id}/ticker',
                '{id}/trades',
            ],
        },

        private: {

            post: [

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

    products: {
        
        'BTC/USD': { id: 'BTCUSD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
        'BTC/EUR': { id: 'BTCEUR', symbol: 'BTC/EUR', base: 'BTC', quote: 'EUR' },
        'BTC/PLN': { id: 'BTCPLN', symbol: 'BTC/PLN', base: 'BTC', quote: 'PLN' },
        'LTC/USD': { id: 'LTCUSD', symbol: 'LTC/USD', base: 'LTC', quote: 'USD' },
        'LTC/EUR': { id: 'LTCEUR', symbol: 'LTC/EUR', base: 'LTC', quote: 'EUR' },
        'LTC/PLN': { id: 'LTCPLN', symbol: 'LTC/PLN', base: 'LTC', quote: 'PLN' },
        'LTC/BTC': { id: 'LTCBTC', symbol: 'LTC/BTC', base: 'LTC', quote: 'BTC' },
        'ETH/USD': { id: 'ETHUSD', symbol: 'ETH/USD', base: 'ETH', quote: 'USD' },
        'ETH/EUR': { id: 'ETHEUR', symbol: 'ETH/EUR', base: 'ETH', quote: 'EUR' },
        'ETH/PLN': { id: 'ETHPLN', symbol: 'ETH/PLN', base: 'ETH', quote: 'PLN' },
        'ETH/BTC': { id: 'ETHBTC', symbol: 'ETH/BTC', base: 'ETH', quote: 'BTC' },
        'LSK/USD': { id: 'LSKUSD', symbol: 'LSK/USD', base: 'LSK', quote: 'USD' },
        'LSK/EUR': { id: 'LSKEUR', symbol: 'LSK/EUR', base: 'LSK', quote: 'EUR' },
        'LSK/PLN': { id: 'LSKPLN', symbol: 'LSK/PLN', base: 'LSK', quote: 'PLN' },
        'LSK/BTC': { id: 'LSKBTC', symbol: 'LSK/BTC', base: 'LSK', quote: 'BTC' },
    },

    fetchBalance () { return this.privatePostInfo () },
    
    fetchOrderBook (product) {
        return this.publicGetIdOrderbook ({
            id: this.productId (product),
        })
    },

    fetchTicker (product) {
        return this.publicGetIdTicker ({ id: this.productId (product) })
    },

    fetchTrades (product) { 
        return this.publicGetIdTrades ({ id: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let p = this.product (product)
        return this.privatePostTrade (extend ({
            type: side,
            currency: p.base,
            amount: amount,
            payment_currency: p.quote,
            rate: price,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]

        if (type === 'public') {

            url += '/' + this.implodeParams (path, params) + '.json'

        } else {
            
            options.body = querystring (extend ({
                method: path,
                moment: this.nonce (),
            }, params))

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitcoid = {
    
    name:      'Bitcoin.co.id',
    countries: 'ID', // Indonesia
    nonce:     'seconds',

    urls: {
        api: {
            public:  'https://vip.bitcoin.co.id/api',
            private: 'https://vip.bitcoin.co.id/tapi',
        },
        www: 'https://www.bitcoin.co.id',
        docs: [
            'https://vip.bitcoin.co.id/trade_api',
            'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
        ],
    },

    api: {

        public: {

            get: [

                '{pair}/ticker',
                '{pair}/trades',
                '{pair}/depth',
            ],
        },

        private: {

            post: [

                'getInfo',
                'transHistory',
                'trade',
                'tradeHistory',
                'openOrders',
                'cancelOrder',
            ],
        },
    },

    products: {

        'BTC/IDR':  { id: 'btc_idr',  symbol: 'BTC/IDR',  base: 'BTC',  quote: 'IDR' },
        'BTS/BTC':  { id: 'bts_btc',  symbol: 'BTS/BTC',  base: 'BTS',  quote: 'BTC' },
        'DASH/BTC': { id: 'drk_btc', symbol: 'DASH/BTC', base: 'DASH', quote: 'BTC' },
        'DOGE/BTC': { id: 'doge_btc', symbol: 'DOGE/BTC', base: 'DOGE', quote: 'BTC' },
        'ETH/BTC':  { id: 'eth_btc',  symbol: 'ETH/BTC',  base: 'ETH',  quote: 'BTC' },
        'LTC/BTC':  { id: 'ltc_btc',  symbol: 'LTC/BTC',  base: 'LTC',  quote: 'BTC' },
        'NXT/BTC':  { id: 'nxt_btc',  symbol: 'NXT/BTC',  base: 'NXT',  quote: 'BTC' },
        'STR/BTC':  { id: 'str_btc',  symbol: 'STR/BTC',  base: 'STR',  quote: 'BTC' },
        'NEM/BTC':  { id: 'nem_btc',  symbol: 'NEM/BTC',  base: 'NEM',  quote: 'BTC' },
        'XRP/BTC':  { id: 'xrp_btc',  symbol: 'XRP/BTC',  base: 'XRP',  quote: 'BTC' },
    },

    fetchBalance () { return this.privatePostGetInfo () },
    
    fetchOrderBook (product) {
        return this.publicGetPairDepth ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetPairTicker ({ pair: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetPairTrades ({ pair: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let p = this.product (product)

        let order = {
            pair: p.id,
            type: side,
            price: price,
        }

        order[p.base.toLowerCase ()] = amount
        return this.privatePostTrade (extend (order, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]

        if (type === 'public') {

            url += '/' + this.implodeParams (path, params)

        } else {
            
            options.body = querystring (extend ({
                method: path,
                nonce: this.nonce (),
            }, params))

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                Key: this.apiKey,
                Sign: this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitfinex = {

    name: 'Bitfinex',
    countries: 'US',

    urls: {
    
        api: 'https://api.bitfinex.com',
        www: 'https://www.bitfinex.com',
        docs: [
            'https://bitfinex.readme.io/v1/docs',
            'https://bitfinex.readme.io/v2/docs',
            'https://github.com/bitfinexcom/bitfinex-api-node',
        ],
    },

    version: 'v1',
    rateLimit: 2000,

    api: {

        public: {

            get: [

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

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetSymbolsDetails ().then (products => 
            products.map (product => { 
                var id = product.pair.toUpperCase ()
                var base = id.slice (0, 3)
                var quote = id.slice (3, 6)
                var symbol = base + '/' + quote                                
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privatePostBalances () },
    
    fetchOrderBook (product) {
        return this.publicGetBookSymbol ({ 
            symbol: this.productId (product)
        })
    },
    
    fetchTicker (product) {
        return this.publicGetPubtickerSymbol ({
            symbol: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetTradesSymbol ({
            symbol: this.productId (product)
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrderNew (extend ({
            symbol: this.productId (product),
            amount: amount.toString (),
            price: price.toString (),
            side: side,
            type: 'exchange ' + type,
            ocoorder: false,
            buy_price_oco: 0,
            sell_price_oco: 0,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var request = '/' + this.version + '/' + this.implodeParams (path, params)
        var url = this.urls.api + request

        if (type === 'public') {

            url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ()
            var query = extend ({ nonce: nonce.toString (), request }, params)
            console.log (query)
            var payload = new Buffer (JSON.stringify (query)).toString ('base64')
            options.headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': payload,
                'X-BFX-SIGNATURE': this.hmac (payload, this.secret, 'sha384'),                
            }
        }
        
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitlish = {

    name: 'bitlish',
    countries: [ 'UK', 'EU', 'RU', ],
    rateLimit: 2000,
    
    version: 'v1',

    urls: {
        api: 'https://bitlish.com/api',
        www: 'https://bitlish.com',
        docs: [
            'https://bitlish.com/api',
        ],
    },
    
    api: {

        public: {

            get: [

                'instruments',
                'ohlcv',
                'pairs',
                'tickers',
                'trades_depth',
                'trades_history',
            ],
        },

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetPairs ().then (products =>
            Object.values (products).map (product => {
                var id = product.id
                var symbol = product.name
                var [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product)
            }))
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostCreateTrade (extend ({
            pair_id: this.productId (product),
            dir: (side == 'buy') ? 'bid' : 'ask',
            amount: amount,
        }, (type == 'limit') ? { price } : {}, params))
    },
    
    fetchTicker (product) { return this.publicGetTickers () },
    
    fetchOrderBook (product) {
        return this.publicGetTradesDepth ({
            pair_id: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetTradesHistory ({
            pair_id: this.productId (product),
        })
    },

    fetchBalance () { return this.privatePostBalance () },

    signIn () {
        return this.privatePostSignin ({
            login:  this.login,
            passwd: this.password,
        })
    },    
    
    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + path

        if (type === 'public') {

            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            options.body = JSON.stringify (extend ({ 
                token: this.apiKey,
            }, params))

            options.headers = { 'Content-Type': 'application/json' }
        }
        
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitmarket = {

    name: 'BitMarket',
    countries: [ 'PL', 'EU', ],
    rateLimit: 3000,

    urls: {
        api: {
            public:  'https://www.bitmarket.net',
            private: 'https://www.bitmarket.pl/api2/', // last slash is critical
        },
        www: [
            'https://www.bitmarket.pl',
            'https://www.bitmarket.net',
        ],
        docs: [
            'https://www.bitmarket.net/docs.php?file=api_public.html',
            'https://www.bitmarket.net/docs.php?file=api_private.html',
            'https://github.com/bitmarket-net/api',
        ],
    },

    api: {

        public: {

            get: [

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

        private: {

            post: [

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

    products: {
        'BTC/PLN': { id: 'BTCPLN',       symbol: 'BTC/PLN', base: 'BTC', quote: 'PLN' },
        'BTC/EUR': { id: 'BTCEUR',       symbol: 'BTC/EUR', base: 'BTC', quote: 'EUR' },
        'LTC/PLN': { id: 'LTCPLN',       symbol: 'LTC/PLN', base: 'LTC', quote: 'PLN' },
        'LTC/BTC': { id: 'LTCBTC',       symbol: 'LTC/BTC', base: 'LTC', quote: 'BTC' },
        'LMX/BTC': { id: 'LiteMineXBTC', symbol: 'LMX/BTC', base: 'LMX', quote: 'BTC' },
    },

    fetchBalance () { return this.privatePostInfo () },
    
    fetchOrderBook (product) { 
        return this.publicGetJsonMarketOrderbook ({
            market: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this.publicGetJsonMarketTicker ({
            market: this.productId (product),
        })
    },

    fetchTrades (product) {
        return this.publicGetJsonMarketTrades ({
            market: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTrade (extend ({
            market: this.productId (product),
            type: side,
            amount: amount,
            rate: price,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]

        if (type === 'public') {

            url += '/' + this.implodeParams (path + '.json', params)

        } else {

            var tonce = this.nonce ()
            var query = extend ({ tonce, method: path }, params)

            options.body = querystring (query)
            options.headers = {
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitmex = {

    name: 'BitMEX',
    countries: 'SC', // Seychelles
    version: 'v1',
    urls: {
        api: 'https://www.bitmex.com',
        www: 'https://www.bitmex.com',
        docs: [
            'https://www.bitmex.com/app/apiOverview',
            'https://github.com/BitMEX/api-connectors/tree/master/official-http',
        ],
    },

    rateLimit: 2000,

    api: {

        public: {

            get: [

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

        private: {

            get: [

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

            post: [

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

            put: [

                'order',
                'order/bulk',
                'user',
            ],

            delete: [

                'apiKey',
                'order',
                'order/all',
            ],
        }
    }, 

    fetchProducts () {
        return this.publicGetInstrumentActive ().then (products => 
            products.map (product => {
                let id = product.symbol
                let base = product.underlying
                let quote = product.quoteCurrency
                let isFuturesContract = id != (base + quote)
                base = this.commonCurrencyCode (base)
                quote = this.commonCurrencyCode (quote)
                let symbol = isFuturesContract ? id : (base + '/' + quote)
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetUserMargin ({ currency: 'all' }) },
    
    fetchOrderBook (product) {
        return this.publicGetOrderBookL2 ({
            symbol: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this.publicGetQuote ({ symbol: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrade ({ symbol: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrder (extend ({
            symbol:   this.productId (product),
            side:     capitalize (side),
            orderQty: amount,
            ordType:  capitalize (type),
        }, (type == 'limit') ? { rate: price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var query = '/api/' + this.version + '/' + path

        if (Object.keys (params).length)
            query += '?' + querystring (params)

        var url = this.urls.api + query

        if (type === 'private') {

            var nonce = this.nonce ()

            if (method === 'POST')
                options.body = Object.keys (params).length ? JSON.stringify (params) : undefined

            let request = [ method, query, nonce, options.body ].join ('')

            options.headers = {
                'Content-Type':     'application/json',
                'api-nonce':        nonce,
                'api-key':          this.apiKey,
                'api-signature':    this.hmac (request, this.secret),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bitso = {

    name: 'Bitso',
    countries: 'MX', // Mexico
    rateLimit: 2000, // 30 requests per minute

    urls: {
        api:  'https://api.bitso.com',
        www:  'https://bitso.com',
        docs: 'https://bitso.com/api_info',
    },
    version: 'v3',

    api: {

        public: {

            get: [
                'available_books',
                'ticker',
                'order_book',
                'trades',
            ],
        },

        private: {

            get: [

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

            post: [

                'bitcoin_withdrawal',
                'debit_card_withdrawal',
                'ether_withdrawal',
                'orders',
                'phone_number',
                'phone_verification',
                'phone_withdrawal',
                'spei_withdrawal',
            ],

            delete: [

                'orders/{oid}',
                'orders/all',
            ],
        }
    },

    fetchProducts () {
        return this.publicGetAvailableBooks ().then (products => 
            products.payload.map (product => { 
                let id = product.book
                let symbol = id.toUpperCase ().replace ('_', '/')
                let [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetBalance () },
    
    fetchOrderBook (product) { 
        return this.publicGetOrderBook ({ book: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ book: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrades ({ book: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let order = extend ({
            book:  this.productId (product),
            side:  side,
            type:  type,
            major: amount,
        }, (type == 'limit') ? { price } : {})

        return this.privatePostOrders (extend (order, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var query = '/' + this.version + '/' + this.implodeParams (path, params)
        var url = this.urls.api + query

        if (type === 'public') {

            url += '?' + querystring (params)

        } else {

            if (Object.keys (params).length)
                options.body = JSON.stringify (params)

            var nonce = this.nonce ()
            var request = [ nonce, method, query, options.body ].join ('')
            var signature = this.hmac (request, this.secret)

            let auth = [ this.apiKey, nonce, signature ].join (':')
            options.headers = { 'Authorization': "Bitso " + auth }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bittrex = {

    name: 'Bittrex',
    countries: 'US',
    rateLimit: 2000,

    urls: {
        api: 'https://bittrex.com/api',
        www: 'https://bittrex.com',
        docs: [ 
            'https://bittrex.com/Home/Api',
            'https://www.npmjs.org/package/node.bittrex.api',
        ],
    },

    version: 'v1.1',

    api: {

        public: {

            get: [
            
                'currencies',
                'markethistory',
                'markets',
                'marketsummaries',
                'marketsummary',
                'orderbook',
                'ticker',            
            ],
        },

        account: {

            get: [

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

        market: {

            get: [

                'buylimit',
                'buymarket',
                'cancel',
                'openorders',
                'selllimit',
                'sellmarket',
            ],
        },
    },

    fetchProducts () {
        return this.publicGetMarkets ().then (products => 
            products.result.map (product => {
                let id = product.MarketName
                let base = product.BaseCurrency
                let quote = product.MarketCurrency
                let symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.accountGetBalances () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderbook ({
            market: this.productId (product),
            type:   'both',
            depth:  50,
        })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({
            market: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetMarkethistory ({ 
            market: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this['marketGet' + capitalize (side) + type] (extend ({
            market:  this.productId (product),
            quantity: amount,
        }, (type == 'limit') ? { rate: price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' 

        if (type === 'public') {

            url += type + '/' + method.toLowerCase () + path

            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ()

            url += type + '/'

            if (((type === 'account') && (path !== 'withdraw')) || (path === 'openorders'))
                url += method.toLowerCase ()

            url += path + '?' + querystring (extend ({
                nonce,
                apikey: this.apiKey
            }, params))

            options.headers = {
                apisign: this.hmac (url, this.secret, 'sha512'),                
            }
        }
        
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var btcx = {

    name: 'BTCX',
    countries: [ 'IS', 'US', 'EU', ],
    rateLimit: 3000, // support in english is very poor, unable to tell rate limits

    urls: {
        api:  'https://btc-x.is/api',
        www:  'https://btc-x.is',
        docs: 'https://btc-x.is/custom/api-document.html',
    },

    version: 'v1',


    api: {

        public: {

            get: [

                'depth/{base}/{quote}/{limit}',
                'ticker/{base}/{quote}',         
                'trade/{base}/{quote}/{limit}',
            ],
        },

        private: {

            post: [

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

    products: {
        'BTC/USD': { id: 'BTC-USD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
        'BTC/EUR': { id: 'BTC-EUR', symbol: 'BTC/EUR', base: 'BTC', quote: 'EUR' },
    },

    fetchBalance () { return this.privatePostBalance () },

    fetchOrderBook (product) { 
        let p = this.product (product)
        return this.publicGetDepthIdLimit ({ 
            base:  p.base,
            quote: p.quote,
            limit: 1000
        })
    },

    fetchTicker (product) { 
        let p = this.product (product)
        return this.publicGetTickerId ({
            base:  p.base,
            quote: p.quote,
        })
    },

    fetchTrades (product) {
        let p = this.product (product)
        return this.publicGetTradeIdLimit ({
            base:  p.base,
            quote: p.quote,
            limit: 100,
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        return this.privatePostTrade (extend ({
            type: side.toUpperCase (),
            market: this.productId (product),
            amount,
            price,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' 

        if (type === 'public') {

            url += this.implodeParams (path, params)

        } else {

            var nonce = this.nonce ()

            url += 'private'

            options.body = querystring (extend ({
                Method: path.toUpperCase (),
                Nonce: nonce,
            }, params))

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                Key: this.apiKey,
                Signature: this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var bxinth = {

    name: 'BX.in.th',
    countries: 'TH', // Thailand
    rateLimit: 2000,

    urls: {
        api:  'https://bx.in.th/api',
        www:  'https://bx.in.th',
        docs: 'https://bx.in.th/info/api',
    },

    api: {

        public: {

            get: [
                '', // ticker
                'options',
                'optionbook',
                'orderbook',
                'pairing',
                'trade',
                'tradehistory',


            ],
        },

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetPairing ().then (products => 
            Object.values (products).map (product => {
                let id = product.pairing_id
                let base = product.primary_currency
                let quote = product.secondary_currency
                let symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privatePostBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderbook ({ pairing: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGet ({ pairing: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrade ({ pairing: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrder (extend ({
            pairing: this.productId (product),
            type:    side,
            amount:  amount,
            rate:    price,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + path + '/'

        if (Object.keys (params).length)
            url += '?' + querystring (params)

        if (type === 'public') {

        } else {

            var nonce = this.nonce ()
            var signature = this.hash (this.apiKey + nonce + this.secret, 'sha256')
            // var twofa = this.twofa

            options.body = querystring (extend ({
                key: this.apiKey,
                nonce,
                signature,
            }, params))

            // options.body = querystring ({
            //     key: this.apiKey,
            //     nonce,
            //     signature: this.hash (this.apiKey + nonce + this.secret, 'sha256'),
            //     twofa: this.twofa,
            // })

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var ccex = {

    name: 'C-CEX',
    countries: [ 'DE', 'EU', ],
    rateLimit: 2000, 

    urls: {
        api: {
            tickers: 'https://c-cex.com/t',
            public:  'https://c-cex.com/t/api_pub.html',
            private: 'https://c-cex.com/t/api.html',
        },
        www:  'https://c-cex.com',
        docs: 'https://c-cex.com/?id=api',
    },

    api: {

        tickers: {

            get: [

                'coinnames',
                '{market}',
                'pairs',
                'prices',
                'volume_{coin}',
            ],
        },

        public: {

            get: [

                
                'balancedistribution',
                'markethistory',
                'markets',
                'marketsummaries',
                'orderbook',
                
            ],
        },

        private: {
            
            get: [

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

    fetchProducts () {
        return this.publicGetMarkets ().then (products => 
            products.result.map (product => {
                let id = product.MarketName
                let base = product.MarketCurrency
                let quote = product.BaseCurrency
                let symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetBalances () },
    fetchOrderBook (product) {
        return this.publicGetOrderbook ({
            market: this.productId (product),
            type: 'both',
            depth: 100,
        })
    },
    
    fetchTicker (product) {
        return this.tickersGetMarket ({
            market: this.productId (product).toLowerCase ()
        })
    },
    
    fetchTrades (product) {
        return this.publicGetMarkethistory ({
            market: this.productId (product),
            type: 'both',
            depth: 100,
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this['privateGet' + capitalize (side) + type] (extend ({
            market: this.productId (product),
            quantity: amount,
            rate: price,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]

        if (type === 'private') {

            var nonce = this.nonce ().toString ()

            url += '?' + querystring (extend ({ a: path }, {
                apikey: this.apiKey,
                nonce,
            }, params))

            options.headers = { 
                apisign: this.hmac (url, this.secret, 'sha512'),
            }

        } else if (type === 'public') {

            url += '?' + querystring (extend ({ a: 'get' + path, }, params))

        } else {

            url += '/' + this.implodeParams (path, params) + '.json'
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var cex = {

    name: 'CEX.IO',
    countries: [ 'UK', 'EU', 'CY', 'RU', ],
    rateLimit: 2000,

    urls: {
        api:  'https://cex.io/api',
        www:  'https://cex.io',
        docs: 'https://cex.io/cex-api',
    },

    api: {

        public: {

            get: [

                'currency_limits',
                'last_price/{pair}',
                'last_prices/{currencies}',
                'ohlcv/hd/{yyyymmdd}/{pair}',
                'order_book/{pair}',
                'ticker/{pair}',
                'tickers/{currencies}',
                'trade_history/{pair}',
            ],

            post: [

                'convert/{pair}',
                'price_stats/{pair}',
            ],
        },

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetCurrencyLimits ().then (products => 
            products.data.pairs.map (product => { 
                let id = product.symbol1 + '/' + product.symbol2
                let symbol = id
                let [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },
    
    fetchBalance () { return this.privatePostBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderBookPair ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTickerPair ({ pair: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTradeHistoryPair ({
            pair: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostPlaceOrderPair (extend ({
            pair: this.productId (product),
            type: side,
            amount,
        }, (type == 'limit') ? { price } : { order_type: type }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))

        if (type === 'public') {
    
            if (Object.keys (query).length)
                url += '?' + querystring (query)

        } else {

            var nonce = this.nonce ().toString ()

            options.body = querystring (extend ({
                key: this.apiKey,
                signature: this.hmac (nonce + this.uid + this.apiKey, this.secret).toUpperCase (),
                nonce,
            }, query))

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var coincheck = {

    name: 'coincheck',
    countries: [ 'JP', 'ID', ],
    rateLimit: 2000,

    urls: {
        api:  'https://coincheck.com/api',
        www:  'https://coincheck.com',
        docs: 'https://coincheck.com/documents/exchange/api',
    },

    api: {

        public: {

            get: [

                'exchange/orders/rate',
                'order_books',
                'rate/{pair}',
                'ticker',
                'trades',
            ],
        },

        private: {

            get: [

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
            
            post: [

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

            delete: [

                'bank_accounts/{id}',
                'exchange/orders/{id}',
                'withdraws/{id}',
            ],
        },
    },

    products: {
        'BTC/JPY':  { id: 'btc_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' }, // the only real pair
        'ETH/JPY':  { id: 'eth_jpy',  symbol: 'ETH/JPY',  base: 'ETH',  quote: 'JPY' },
        'ETC/JPY':  { id: 'etc_jpy',  symbol: 'ETC/JPY',  base: 'ETC',  quote: 'JPY' },
        'DAO/JPY':  { id: 'dao_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'LSK/JPY':  { id: 'lsk_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'FCT/JPY':  { id: 'fct_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'XMR/JPY':  { id: 'xmr_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'REP/JPY':  { id: 'rep_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'XRP/JPY':  { id: 'xrp_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'ZEC/JPY':  { id: 'zec_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'XEM/JPY':  { id: 'xem_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'LTC/JPY':  { id: 'ltc_jpy',  symbol: 'BTC/JPY',  base: 'BTC',  quote: 'JPY' },
        'DASH/JPY': { id: 'dash_jpy', symbol: 'DASH/JPY', base: 'DASH', quote: 'JPY' },
        'ETH/JPY':  { id: 'eth_btc',  symbol: 'ETH/BTC',  base: 'ETH',  quote: 'BTC' },
        'ETC/JPY':  { id: 'etc_btc',  symbol: 'ETC/BTC',  base: 'ETC',  quote: 'BTC' },
        'LSK/JPY':  { id: 'lsk_btc',  symbol: 'LSK/BTC',  base: 'LSK',  quote: 'BTC' },
        'FCT/JPY':  { id: 'fct_btc',  symbol: 'FCT/BTC',  base: 'FCT',  quote: 'BTC' },
        'XMR/JPY':  { id: 'xmr_btc',  symbol: 'XMR/BTC',  base: 'XMR',  quote: 'BTC' },
        'REP/JPY':  { id: 'rep_btc',  symbol: 'REP/BTC',  base: 'REP',  quote: 'BTC' },
        'XRP/JPY':  { id: 'xrp_btc',  symbol: 'XRP/BTC',  base: 'XRP',  quote: 'BTC' },
        'ZEC/JPY':  { id: 'zec_btc',  symbol: 'ZEC/BTC',  base: 'ZEC',  quote: 'BTC' },
        'XEM/JPY':  { id: 'xem_btc',  symbol: 'XEM/BTC',  base: 'XEM',  quote: 'BTC' },
        'LTC/JPY':  { id: 'ltc_btc',  symbol: 'LTC/BTC',  base: 'LTC',  quote: 'BTC' },
        'DASH/JPY': { id: 'dash_btc', symbol: 'DASH/BTC', base: 'DASH', quote: 'BTC' },
    },

    fetchBalance   ()        { return this.privateGetAccountsBalance () },
    fetchOrderBook (product) { return this.publicGetOrderBooks () },
    fetchTicker    (product) { return this.publicGetTicker () },
    fetchTrades    (product) { return this.publicGetTrades () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        
        let isMarket = (type == 'market')
        let isBuy = (side == 'buy')
        let order_type = (isMarket ? (type + '_') : '') + side

        let order = {
            pair: this.productId (product),
            order_type,
        }

        if (!isMarket)
            order['rate'] = price

        order[((isMarket && isBuy) ? (type + '_' + side + '_') : '') + 'amount'] = amount

        return this.privatePostExchangeOrders (extend (order, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))

        if (type === 'public') {

            if (Object.keys (query).length)
                url += '?' + querystring (query)

        } else {

            var nonce = this.nonce ()

            options.body = querystring (query)

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                'ACCESS-KEY': this.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': this.hmac (nonce + url + options.body, this.secret)
            } 
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var coinsecure = {

    name: 'Coinsecure',
    countries: 'IN', // India
    rateLimit: 1000,

    urls: {

        api:  'https://api.coinsecure.in',
        www:  'https://coinsecure.in',
        docs: [
            'https://api.coinsecure.in',
            'https://github.com/coinsecure/plugins',
        ],
    },

    version: 'v1',
    api: {

        public: {

            get: [

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

        private: {

            get: [

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

            post: [

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

            put: [

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

            delete: [

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

    products: {
        'BTC/INR': { id: 'BTC/INR', symbol: 'BTC/INR', base: 'BTC', quote: 'INR' },
    },

    fetchBalance () { return this.privateGetUserExchangeBankSummary () },
    fetchOrderBook (product) { return this.publicGetExchangeAskOrders () },
    fetchTicker    (product) { return this.publicGetExchangeTicker () },
    fetchTrades    (product) { return this.publicGetExchangeTrades () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let method = 'privatePutUserExchange'

        if (type == 'market') {
        
            method += 'Instant' + capitalize (side)
            
            let order = (side == 'buy') ? { maxFiat: amount } : { maxVol: amount }

            return this[method] (order)
        } 
            
        method += ((side == 'buy') ? 'Bid' : 'Ask') + 'New'

        return this[method] ({ rate: price, vol: amount })
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }

        var url = this.urls.api + '/' + this.version + '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))

        if (type === 'private') {

            options.headers = {
                Authorization: this.apiKey,
            }

            if (Object.keys (query).length) {
                options.body = JSON.stringify (query)
                options.headers['Content-Type'] = 'application/json'
            }

        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var exmo = {

    name: 'EXMO',
    countries: [ 'ES', 'RU', ], // Spain, Russia
    rateLimit: 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second

    version: 'v1',

    urls: {

        api:  'https://api.exmo.com',
        www:  'https://exmo.me',
        docs: [
            'https://exmo.me/ru/api_doc',
            'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
        ],
    },

    
    api: {

        public: {

            get: [

                'currency',
                'order_book',
                'pair_settings',
                'ticker',
                'trades',
            ],
        },

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetPairSettings ().then (products => 
            Object.keys (products).map (id => {
                var product = products[id]
                let symbol = id.replace ('_', '/')
                let [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })    
            }))
    },

    fetchBalance () { return this.privatePostUserInfo () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderBook ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) { return this.publicGetTicker () },
    
    fetchTrades (product) {
        return this.publicGetTrades ({ pair: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrderCreate (extend ({
            pair:  this.productId (product),
            quantity: amount,
            price: price || 0,
            type: ((type == 'market') ? 'market_' : '') + side,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + path

        if (type === 'public') {

            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ()
            options.body = querystring (extend ({ nonce }, params))
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                Key: this.apiKey,
                Sign: this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var fyb = {

    rateLimit: 2000,

    api: {

        public: {

            get: [

                'ticker',
                'tickerdetailed',
                'orderbook',
                'trades',
            ],
        },

        private: {

            post: [

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

    fetchBalance () { return this.privatePostGetaccinfo () },
    fetchOrderBook (product) { return this.publicGetOrderbook () },
    fetchTicker    (product) { return this.publicGetTickerdetailed () },
    fetchTrades    (product) { return this.publicGetTrades () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostPlaceorder (extend ({
            qty: amount,
            price,
            type: side[0].toUpperCase ()
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + path

        if (type === 'public') {
            
            url += '.json'

        } else {

            var timestamp = this.nonce ()
            options.body = querystring (extend ({ timestamp }, params))

            options.headers = {
                'Content-type': 'application/x-www-form-urlencoded',
                key: this.apiKey,
                sig: this.hmac (options.body, this.secret, 'sha1')
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var fybse = extend (fyb, {
    name: 'FYB-SE',
    countries: [ 'SE', ],
    urls: {

        api:  'https://www.fybse.se/api/SEK',
        www:  'https://www.fybse.se',
        docs: 'http://docs.fyb.apiary.io',
    },
    products: {
        'BTC/SEK': { id: 'SEK', symbol: 'BTC/SEK', base: 'BTC', quote: 'SEK' },
    },
})

//-----------------------------------------------------------------------------

var fybsg = extend (fyb, {
    name: 'FYB-SG',
    countries: [ 'SG', ],
    urls: {

        api:  'https://www.fybsg.com/api/SGD',
        www:  'https://www.fybsg.com',
        docs: 'http://docs.fyb.apiary.io',
    },
    products: {
        'BTC/SGD': { id: 'SGD', symbol: 'BTC/SGD', base: 'BTC', quote: 'SGD' },
    },
})

//-----------------------------------------------------------------------------

var hitbtc = {

    name: 'HitBTC',
    countries: 'HK',
    rateLimit: 2000,

    version: 1,
    urls: {

        api:  'http://api.hitbtc.com',
        www:  'https://hitbtc.com',
        docs: [
            'https://hitbtc.com/api',
            'http://hitbtc-com.github.io/hitbtc-api',
            'http://jsfiddle.net/bmknight/RqbYB',
        ],
    },

    api: {

        public: {

            get: [

                '{symbol}/orderbook',
                '{symbol}/ticker',
                '{symbol}/trades',
                '{symbol}/trades/recent',
                'symbols',
                'ticker',
                'time,'
            ],
        },

        trading: {

            get: [

                'balance',
                'orders/active',
                'orders/recent',
                'order',
                'trades/by/order',
                'trades',
            ],

            post: [

                'new_order',
                'cancel_order',
                'cancel_orders',
            ],
        },

        payment: {

            get: [

                'balance',
                'address/{currency}',
                'transactions',
                'transactions/{transaction}',
            ],

            post: [

               'transfer_to_trading',
                'transfer_to_main',
                'address/{currency}',
                'payout',
            ],
        }
    },

    fetchProducts () {
        return this.publicGetSymbols ().then (products => 
            products.symbols.map (product => {
                let id = product.symbol
                let base = product.commodity
                let quote = product.currency
                let symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.tradingGetBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetSymbolOrderbook ({
            symbol: this.productId (product),
        })
    },

    fetchTicker (product) {
        return this.publicGetSymbolTicker ({
            symbol: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetSymbolTrades ({
            symbol: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.tradingPostNewOrder (extend ({
            clientOrderId: this.nonce (),
            symbol: this.productId (product),
            side,
            quantity: amount,
            type,            
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = '/api/' + this.version + '/' + type + '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))

        if (type === 'public') {

            if (Object.keys (query).length)
                url += '?' + querystring (query)

        } else {

            var nonce = this.nonce ()
            query = extend ({ nonce, apikey: this.apiKey }, query)

            if (method === 'POST')
                if (Object.keys (query).length)
                    options.body = querystring (query)

            if (Object.keys (query).length)
                url += '?' + querystring (query)

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature':  this.hmac (url + (options.body ? options.body : ''), this.secret, 'sha512').toLowerCase (),
            }
        }

        url = this.urls.api + url
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var huobi = {

    name: 'Huobi',
    countries: 'CN',
    rateLimit: 5000,

    version: 'v3',
    urls: {

        api:  'http://api.huobi.com',
        www:  'https://www.huobi.com',
        docs: 'https://github.com/huobiapi/API_Docs_en/wiki',
    },
    
    api: {

        staticmarket: {

            get: [

                '{id}_kline_{period}',
                'ticker_{id}',
                'depth_{id}',
                'depth_{id}_{length}',
                'detail_{id}',
            ],
        },

        usdmarket: {

            get: [

                '{id}_kline_{period}',
                'ticker_{id}',
                'depth_{id}',
                'depth_{id}_{length}',
                'detail_{id}',
            ],
        },

        trade: {

            post: [

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

    products: {

        'BTC/CNY': { id: 'btc', symbol: 'BTC/CNY', base: 'BTC', quote: 'CNY', type: 'staticmarket', coinType: 1, },
        'LTC/CNY': { id: 'ltc', symbol: 'LTC/CNY', base: 'LTC', quote: 'CNY', type: 'staticmarket', coinType: 2, },
        'BTC/USD': { id: 'btc', symbol: 'BTC/USD', base: 'BTC', quote: 'USD', type: 'usdmarket',    coinType: 1, },
    },

    fetchBalance () { return this.tradePostGetAccountInfo () },
    
    fetchOrderBook (product) {
        return this[this.product (product).type + 'GetDepthId'] ({
            id: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this[this.product (product).type + 'GetTickerId'] ({
            id: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this[this.product (product).type + 'GetDetailId'] ({
            id: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        let p = this.product (product)
        let method = capitalize (side) + ((type == 'market') ? capitalize (type) : '')
        let coin_type = p.coinType
        let market = p.quote.toLowerCase ()

        let order = extend ({
            coin_type,
            amount,
            market,
        }, (type == 'limit') ? { price } : {}, params)

        return this['tradePost' + method] (order)
    },

    request (path, type = 'trade', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api

        if (type === 'trade') {

            url += '/api' + this.version

            var query = keysort (extend ({
                method: path,
                access_key: this.apiKey,
                created: this.nonce (),
            }, params))

            query.sign = this.hash (querystring (extend (omit (query, 'market'), { secret_key: this.secret })))
            options.body = querystring (query)

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
            }

        } else {

            url += '/' + type + '/' + this.implodeParams (path, params) + '_json.js'
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var jubi = {

    name: 'jubi.com',
    countries: 'CN',
    rateLimit: 2000,

    version: 'v1',
    urls: {

        api:  'https://www.jubi.com/api',
        www:  'https://www.jubi.com',
        docs: 'https://www.jubi.com/help/api.html',
    },

    api: {

        public: {

            get: [

                'depth',
                'orders',
                'ticker',
            ],
        },

        private: {

            post: [

                'balance',
                'trade_add',
                'trade_cancel',
                'trade_list',
                'trade_view',
                'wallet',
            ],
        },
    },

    products: {

        'BTC/CNY':  { id: 'btc',  symbol: 'BTC/CNY',  base: 'BTC',  quote: 'CNY' },
        'ETH/CNY':  { id: 'eth',  symbol: 'ETH/CNY',  base: 'ETH',  quote: 'CNY' },
        'ANS/CNY':  { id: 'ans',  symbol: 'ANS/CNY',  base: 'ANS',  quote: 'CNY' },
        'BLK/CNY':  { id: 'blk',  symbol: 'BLK/CNY',  base: 'BLK',  quote: 'CNY' },
        'DNC/CNY':  { id: 'dnc',  symbol: 'DNC/CNY',  base: 'DNC',  quote: 'CNY' },
        'DOGE/CNY': { id: 'doge', symbol: 'DOGE/CNY', base: 'DOGE', quote: 'CNY' },
        'EAC/CNY':  { id: 'eac',  symbol: 'EAC/CNY',  base: 'EAC',  quote: 'CNY' },
        'ETC/CNY':  { id: 'etc',  symbol: 'ETC/CNY',  base: 'ETC',  quote: 'CNY' },
        'FZ/CNY':   { id: 'fz',   symbol: 'FZ/CNY',   base: 'FZ',   quote: 'CNY' },
        'GOOC/CNY': { id: 'gooc', symbol: 'GOOC/CNY', base: 'GOOC', quote: 'CNY' },
        'GAME/CNY': { id: 'game', symbol: 'GAME/CNY', base: 'GAME', quote: 'CNY' },
        'HLB/CNY':  { id: 'hlb',  symbol: 'HLB/CNY',  base: 'HLB',  quote: 'CNY' },
        'IFC/CNY':  { id: 'ifc',  symbol: 'IFC/CNY',  base: 'IFC',  quote: 'CNY' },
        'JBC/CNY':  { id: 'jbc',  symbol: 'JBC/CNY',  base: 'JBC',  quote: 'CNY' },
        'KTC/CNY':  { id: 'ktc',  symbol: 'KTC/CNY',  base: 'KTC',  quote: 'CNY' },
        'LKC/CNY':  { id: 'lkc',  symbol: 'LKC/CNY',  base: 'LKC',  quote: 'CNY' },
        'LSK/CNY':  { id: 'lsk',  symbol: 'LSK/CNY',  base: 'LSK',  quote: 'CNY' },
        'LTC/CNY':  { id: 'ltc',  symbol: 'LTC/CNY',  base: 'LTC',  quote: 'CNY' },
        'MAX/CNY':  { id: 'max',  symbol: 'MAX/CNY',  base: 'MAX',  quote: 'CNY' },
        'MET/CNY':  { id: 'met',  symbol: 'MET/CNY',  base: 'MET',  quote: 'CNY' },
        'MRYC/CNY': { id: 'mryc', symbol: 'MRYC/CNY', base: 'MRYC', quote: 'CNY' },        
        'MTC/CNY':  { id: 'mtc',  symbol: 'MTC/CNY',  base: 'MTC',  quote: 'CNY' },
        'NXT/CNY':  { id: 'nxt',  symbol: 'NXT/CNY',  base: 'NXT',  quote: 'CNY' },
        'PEB/CNY':  { id: 'peb',  symbol: 'PEB/CNY',  base: 'PEB',  quote: 'CNY' },
        'PGC/CNY':  { id: 'pgc',  symbol: 'PGC/CNY',  base: 'PGC',  quote: 'CNY' },
        'PLC/CNY':  { id: 'plc',  symbol: 'PLC/CNY',  base: 'PLC',  quote: 'CNY' },
        'PPC/CNY':  { id: 'ppc',  symbol: 'PPC/CNY',  base: 'PPC',  quote: 'CNY' },
        'QEC/CNY':  { id: 'qec',  symbol: 'QEC/CNY',  base: 'QEC',  quote: 'CNY' },
        'RIO/CNY':  { id: 'rio',  symbol: 'RIO/CNY',  base: 'RIO',  quote: 'CNY' },
        'RSS/CNY':  { id: 'rss',  symbol: 'RSS/CNY',  base: 'RSS',  quote: 'CNY' },
        'SKT/CNY':  { id: 'skt',  symbol: 'SKT/CNY',  base: 'SKT',  quote: 'CNY' },
        'TFC/CNY':  { id: 'tfc',  symbol: 'TFC/CNY',  base: 'TFC',  quote: 'CNY' },
        'VRC/CNY':  { id: 'vrc',  symbol: 'VRC/CNY',  base: 'VRC',  quote: 'CNY' },
        'VTC/CNY':  { id: 'vtc',  symbol: 'VTC/CNY',  base: 'VTC',  quote: 'CNY' },
        'WDC/CNY':  { id: 'wdc',  symbol: 'WDC/CNY',  base: 'WDC',  quote: 'CNY' },
        'XAS/CNY':  { id: 'xas',  symbol: 'XAS/CNY',  base: 'XAS',  quote: 'CNY' },
        'XPM/CNY':  { id: 'xpm',  symbol: 'XPM/CNY',  base: 'XPM',  quote: 'CNY' },
        'XRP/CNY':  { id: 'xrp',  symbol: 'XRP/CNY',  base: 'XRP',  quote: 'CNY' },
        'XSGS/CNY': { id: 'xsgs', symbol: 'XSGS/CNY', base: 'XSGS', quote: 'CNY' },
        'YTC/CNY':  { id: 'ytc',  symbol: 'YTC/CNY',  base: 'YTC',  quote: 'CNY' },
        'ZET/CNY':  { id: 'zet',  symbol: 'ZET/CNY',  base: 'ZET',  quote: 'CNY' },
        'ZCC/CNY':  { id: 'zcc',  symbol: 'ZCC/CNY',  base: 'ZCC',  quote: 'CNY' },        
    },
    
    fetchBalance () { return this.privatePostBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetDepth ({ coin: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ coin: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetOrders ({ coin: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTradeAdd (extend ({
            amount,
            price,
            type: side,
            coin: this.productId (product),
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + path

        if (type === 'public') {
    
            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ().toString ()
            var query = extend ({
                key: this.apiKey,
                nonce,
            }, params)

            console.log (this.hash (this.secret))
            query.signature = this.hmac (querystring (query), this.hash (this.secret))
            options.body = querystring (query)

            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------
// kraken is also owner of ex. Coinsetter / CaVirtEx / Clevercoin

var kraken = {

    name: 'Kraken',
    countries: 'US',

    urls: {

        api:  'https://api.kraken.com',
        www:  'https://www.kraken.com',
        docs: [
            'https://www.kraken.com/en-us/help/api',
            'https://github.com/nothingisdead/npm-kraken-api',
        ],
    },
    version: 0,
    rateLimit: 3000,

    api: {

        public: {

            get: [

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

        private: {

            post: [

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

    fetchProducts () {

        return this.publicGetAssetPairs ().then (products => 
            Object.keys (products.result).map (id => {
                var product = products.result[id]
                var base  = product.base
                var quote = product.quote
                base  = (base[0]  != 'X' && base[0]  != 'Z') ? base  : base.slice (1)
                quote = (quote[0] != 'X' && quote[0] != 'Z') ? quote : quote.slice (1)
                base  = this.commonCurrencyCode (base)
                quote = this.commonCurrencyCode (quote)
                var symbol = (id.indexOf ('.d') >= 0) ? product.altname : (base + '/' + quote)
                return extend ({ id, symbol, base, quote}, product, { id, symbol, base, quote })
            }))
    },

    fetchOrderBook (product) {
        return this.publicGetDepth  ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ pair: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrades ({ pair: this.productId (product) })
    },
    
    fetchBalance () { return this.privatePostBalance () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostAddOrder (extend ({
            pair: this.productId (product),
            type: side,
            ordertype: type,
            volume: amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {
    
        var options = { method }
        var url = '/' + this.version + '/' + type + '/' + path

        if (type === 'public') {

            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ()
            // let query = extend ({ nonce }, params)
            // params.nonce = params.nonce || this.nonce ()
            options.body = querystring (extend ({ nonce }, params))

            var hashed = this.hash (nonce + options.body, 'sha256', 'binary')
            var query  = stringToBinary (url + hashed) // typed array from binary string
            var secret = base64ToBinary (this.secret)  // typed array from base64 string
            var hmac   = this.hmac (query, secret, 'sha512', 'base64')
            options.headers = {
                'API-Key':  this.apiKey,
                'API-Sign': hmac,
                'Content-type': 'application/x-www-form-urlencoded',
            }
        }

        url = this.urls.api + url
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var luno = {

    name: 'luno',
    countries: [ 'UK', 'SG', 'ZA', ],
    rateLimit: 5000,

    urls: {

        api:  'https://api.mybitx.com/api',
        www:  'https://www.luno.com',
        docs: [
            'https://npmjs.org/package/bitx',
            'https://github.com/bausmeier/node-bitx',
        ],
    },

    version: '1',

    api: {
    
        public: {

            get: [

                'orderbook',
                'ticker',
                'tickers',
                'trades',
            ],
        },

        private: {

            get: [

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

            post: [

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

            put: [

                'quotes/{id}',
            ],

            delete: [

                'quotes/{id}',
                'withdrawals/{id}',
            ],
        },
    },

    fetchProducts () {
        return  this.publicGetTickers ().then (products => 
            products.tickers.map (product => {
                var id = product.pair
                var base =  this.commonCurrencyCode (id.slice (0, 3))
                var quote = this.commonCurrencyCode (id.slice (3, 6))
                var symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderbook ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ pair: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrades ({ pair: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        if (type == 'market') {

            let order = {
                pair: this.productId (product),
                type: side.toUpperCase ()
            }

            volume = ((side == 'buy') ? 'counter' : 'base') + '_volume'
            order[volume] = amount

            return this.privatePostMarketorder (extend (order, params))

        }

        let order = {
            pair: this.productId (product),
            type: (side == 'buy') ? 'BID' : 'ASK',
            volume: amount,
            price,
        }

        return this.privatePostOrder (extend (order, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))

        if (Object.keys (query).length)
                url += '?' + querystring (query)

        if (type === 'public') {

        } else {

            options.headers = {
                Authorization: 'Basic ' + stringToBase64 (this.apiKey + ':' + this.secret),
            }            
        }

        return this.fetch (url, options)
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

    version: 'v1',
    rateLimit: 2000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms

    api: {

        public: {

            get: [

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

        private: {

            post: [

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

    fetchOrderBook (product) {
        return this.publicGetDepth ({ symbol: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ symbol: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTrades ({ symbol: this.productId (product) })
    },
    
    fetchBalance () { return this.privatePostUserinfo () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostTrade (extend ({
            symbol: this.productId (product),
            type: side + ((type == 'market') ? '_market' : ''),
            amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = '/api/' + this.version + '/' + path + '.do'
        
        if (type == 'public') {
            
            if (Object.keys (params).length)
                url += '?' + querystring (params)

        } else {

            var query = keysort (extend ({
                api_key: this.apiKey,
            }, params))

            // secret key must be at the end of querystring
            var queryString = querystring (query) + '&secret_key=' + this.secret
            query['sign'] = this.hash (queryString).toUpperCase ()
            options.body = querystring (query)
            options.headers = { 'Content-type': 'application/x-www-form-urlencoded' }
        }

        url = this.urls.api + url
        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var okcoincny = extend (okcoin, {

    name: 'OKCoin CNY',
    countries: [ 'CN', ],
    urls: {

        api:  'https://www.okcoin.cn',
        www:  'https://www.okcoin.cn',
        docs: 'https://www.okcoin.cn/rest_getStarted.html',
    },
    products: {
        'BTC/CNY': { id: 'btc_cny', symbol: 'BTC/CNY', base: 'BTC', quote: 'CNY' },
        'LTC/CNY': { id: 'ltc_cny', symbol: 'LTC/CNY', base: 'LTC', quote: 'CNY' },
    },
})

//-----------------------------------------------------------------------------

var okcoinusd = extend (okcoin, {

    name: 'OKCoin USD',
    countries: [ 'CN', 'US' ],
    urls: {

        api:  'https://www.okcoin.com',
        www:  'https://www.okcoin.com',
        docs: [
            'https://www.okcoin.com/rest_getStarted.html',
            'https://www.npmjs.com/package/okcoin.com',
        ],
    },
    products: {
        'BTC/USD': { id: 'btc_usd', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
        'LTC/USD': { id: 'ltc_usd', symbol: 'LTC/USD', base: 'LTC', quote: 'USD' },
    },
})

//-----------------------------------------------------------------------------

var poloniex = {

    name: 'Poloniex',
    countries: 'US',
    rateLimit: 1000, // 6 calls per second

    urls: {
        api: {
            public:  'https://poloniex.com/public',
            private: 'https://poloniex.com/tradingApi',
        },
        www: 'https://poloniex.com',
        docs: [
            'https://poloniex.com/support/api/',
            'http://pastebin.com/dMX7mZE0',
        ],
    },

    api: {

        public: {

            get: [

                'return24hVolume',
                'returnChartData',
                'returnCurrencies',
                'returnLoanOrders',
                'returnOrderBook',
                'returnTicker',
                'returnTradeHistory',
            ],
        },

        private: {

            post: [

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

    fetchProducts () {
        return this.publicGetReturnTicker ().then (products => 
            Object.keys (products).map (id => {
                var product = products[id]
                let symbol = id.replace ('_', '/')
                let [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () {
        return this.privatePostReturnCompleteBalances ({ account: 'all' })
    },
    
    fetchOrderBook (product) {
        return this.publicGetReturnOrderBook ({
            currencyPair: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this.publicGetReturnTicker ()
    },
    
    fetchTrades (product) {
        return this.publicGetReturnTradeHistory ({
            currencyPair: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this['privatePost' + capitalize (side)] (extend ({
            currencyPair: this.productId (product),
            rate: price,
            amount,
        }, params))

        return this.privatePostOrders (extend (order, params))
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (extend ({
            orderNumber: id,
        }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]

        var query = extend ({ command: path }, params)

        if (type === 'public') {

            url += '?' + querystring (query)

        } else {

            query.nonce = this.nonce ()
            options.body = querystring (query)
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var quadrigacx = {

    name: 'QuadrigaCX',
    countries: 'CA',
    rateLimit: 2000,

    version: 'v2',
    urls: {

        api:  'https://api.quadrigacx.com',
        www:  'https://www.quadrigacx.com',
        docs: 'https://www.quadrigacx.com/api_info',
    },

    api: {

        public: {

            get: [

                'order_book',
                'ticker',                
                'transactions',
            ],
        },

        private: {

            post: [

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

    products: {

        'BTC/CAD': { id: 'btc_cad', symbol: 'BTC/CAD', base: 'BTC', quote: 'CAD' },
        'BTC/USD': { id: 'btc_usd', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
        'ETH/BTC': { id: 'eth_btc', symbol: 'ETH/BTC', base: 'ETH', quote: 'BTC' },
        'ETH/CAD': { id: 'eth_cad', symbol: 'ETH/CAD', base: 'ETH', quote: 'CAD' },
    },

    fetchBalance () { return this.privatePostBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetOrderBook ({ book: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.publicGetTicker ({ book: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.publicGetTransactions ({ book: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this['privatePost' + capitalize (side)] (extend ({
            amount,
            book: this.productId (product),
        }, (type == 'limit') ? { price } : {}, params))
    },

    cancelOrder (id, params = {}) {
        return this.privatePostCancelOrder (extend ({ id }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + path

        if (type === 'public') {

            url += '?' + querystring (params)

        } else {

            var nonce = this.nonce ()
            let request = [ nonce, this.uid, this.apiKey ].join ('')
            var signature = this.hmac (request, this.secret)

            var query = extend ({ 
                key: this.apiKey,
                nonce,
                signature,
            }, params)

            options.body = JSON.stringify (query)
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': options.body.length,
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var quoine = {

    name: 'QUOINE',
    countries: [ 'JP', 'SG', 'VN' ],
    timeout: 10000,

    urls: {

        api:  'https://api.quoine.com',
        www:  'https://www.quoine.com',
        docs: 'https://developers.quoine.com',
    },
    
    version: 2,
    rateLimit: 2000,

    api: {

        public: {

            get: [

                'products',
                'products/{id}',
                'products/{id}/price_levels',
                'executions',
                'ir_ladders/{currency}',
            ],
        },

        private: {

            get: [

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

            post: [

                'fiat_accounts',
                'loan_bids',
                'orders',
            ],

            put: [

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

    fetchProducts () {
        return this.publicGetProducts ().then (products => 
            products.map (product => {
                let id = product.id
                let base = product.base_currency
                let quote = product.quoted_currency
                let symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetAccountsBalance () },
    
    fetchOrderBook (product) {
        return this.publicGetProductsIdPriceLevels ({
            id: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this.publicGetProductsId ({
            id: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetExecutions ({
            product_id: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostOrders (extend ({
                order: extend ({
                    order_type: type,
                    product_id: this.productId (product),
                    side: side,
                    quantity: amount,
                }, (type == 'limit') ? { price } : {}),
            }, params))
    },

    cancelOrder (id, params = {}) {
        return this.privatePutOrdersIdCancel (extend ({ id }, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = {
            method,
            headers: {
                'X-Quoine-API-Version': this.version,
                'Content-type': 'application/json',
            },
        }

        var url = '/' + this.implodeParams (path, params)
        var query = omit (params, this.extractParams (path))
        
        if (type === 'public') {

            if (Object.keys (query).length)
                url += '?' + querystring (query)

        } else {

            var nonce = this.nonce ()

            var signature = this.jwt ({
                path: url, 
                nonce, 
                token_id: this.apiKey,
                iat: Math.floor (nonce / 1000),
            }, this.secret)

            options.body = Object.keys (query).length ? JSON.stringify (query) : undefined
            options.headers['X-Quoine-Auth'] = signature
        }
        
        return this.fetch (this.urls.api + url, options)
    },
}

//-----------------------------------------------------------------------------

var therock = {

    name: 'TheRockTrading',
    countries: 'MT',
    rateLimit: 1000,

    version: 'v1',
    urls: {

        api:  'https://api.therocktrading.com',
        www:  'https://therocktrading.com',
        docs: 'https://api.therocktrading.com/doc/',
    },
    api: {

        public: {

            get: [

                'funds/{id}/orderbook',
                'funds/{id}/ticker',
                'funds/{id}/trades',
                'funds/tickers',
            ],
        },

        private: {

            get: [

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

            post: [
                'atms/withdraw',
                'funds/{fund_id}/orders',
            ],

            'delete': [
                'funds/{fund_id}/orders/{id}',
                'funds/{fund_id}/orders/remove_all',
            ],
        },
    },

    fetchProducts () {
        return this.publicGetFundsTickers ().then (products => 
            products.tickers.map (product => {
                var id = product.fund_id
                var base = id.slice (0, 3)
                var quote = id.slice (3, 6)
                var symbol = base + '/' + quote
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privateGetBalances () },
    
    fetchOrderBook (product) {
        return this.publicGetFundsIdOrderbook ({
            id: this.productId (product),
        })
    },
    
    fetchTicker (product) {
        return this.publicGetFundsIdTicker ({
            id: this.productId (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetFundsIdTrades ({
            id: this.productId (product),
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostFundsFundIdOrders (extend ({
            fund_id:  this.productId (product),
            side,
            amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/' + this.version + '/' + this.implodeParams (path, params)

        if (type === 'private') {

            var nonce = this.nonce ().toString ()
            options.body = JSON.stringify (params)
            options.headers = {
                'Content-Type': 'application/json',
                'X-TRT-KEY':    this.apiKey,
                'X-TRT-NONCE':  nonce,
                'X-TRT-SIGN':   this.hmac (nonce + url, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var vaultoro = {

    name: 'Vaultoro',
    countries: 'CH',
    rateLimit: 1000,

    version: 1,
    urls: {

        api:  'https://api.vaultoro.com',
        www:  'https://www.vaultoro.com',
        docs: 'https://api.vaultoro.com',
    },

    api: {

        public: {

            get: [

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

        private: {

            get: [

                'balance',
                'mytrades',
                'orders',
            ],

            post: [

                'buy/{symbol}/{type}',
                'cancel/{orderid',
                'sell/{symbol}/{type}',
                'withdraw',
            ],
        },
    },

    fetchProducts () {
        return this.publicGetMarkets ().then (result => {
            var base = result.data.BaseCurrency
            var quote = result.data.MarketCurrency
            var symbol = base + '/' + quote
            var baseId = base
            var quoteId = quote
            var id = result.data.MarketName
            return [extend ({ id, symbol, base, quote, baseId, quoteId }, result.data, { id, symbol, base, quote, baseId, quoteId })]
        })
    },

    fetchBalance () { return this.privateGetBalance () },
    fetchOrderBook (product) { return this.publicGetOrderbook () },
    fetchTicker    (product) { return this.publicGetMarkets () },
    fetchTrades    (product) { return this.publicGetTransactionsDay () },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        let p = this.product (product)
        return this['privatePost' + capitalize (side) + 'SymbolType'] (extend ({
            symbol: p.quoteId.toLowerCase (),
            type,
            gld: amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api + '/'

        if (type === 'public') {

            url += path

        } else {

            var nonce = this.nonce ()
            url += this.version + '/' + this.implodeParams (path, params)
            var query = extend ({
                nonce,
                apikey: this.apiKey,
            }, omit (params, this.extractParams (path)))

            url += '?' + querystring (query)

            options.headers = {
                'Content-Type': 'application/json',
                'X-Signature': this.hmac (url, this.secret)
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var virwox = {

    name: 'VirWoX',
    countries: [ 'AT', ],
    rateLimit: 1000,

    urls: {
        api: {
            public:  'http://api.virwox.com/api/json.php',
            private: 'https://www.virwox.com/api/trading.php',
        },
        www:  'https://www.virwox.com',
        docs: 'https://www.virwox.com/developers.php',
    },

    api: {

        public: {

            get: [

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

            post: [

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

        private: {

            get: [

                'cancelOrder',
                'getBalances',
                'getCommissionDiscount',
                'getOrders',
                'getTransactions',
                'placeOrder',
            ],

            post: [

                'cancelOrder',
                'getBalances',
                'getCommissionDiscount',
                'getOrders',
                'getTransactions',
                'placeOrder',
            ],
        },
    },

    fetchProducts () {
        return this.publicGetInstruments ().then (products => 
            Object.values (products.result).map (product => {
                var id = product.instrumentID
                var symbol = product.symbol
                var base = product.longCurrency
                var quote = product.shortCurrency
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.privatePostGetBalances () },
    
    fetchBestPrices (product) {
        return this.publicPostGetBestPrices ({
            symbols: [ this.symbol (product) ],
        })
    }, 
    
    fetchOrderBook (product) {
        return this.publicPostGetMarketDepth ({
            symbols: [ this.symbol (product) ],
            buyDepth:  100,
            sellDepth: 100,
        }) 
    },
    
    fetchTicker (product) {
        return this.publicGetTradedPriceVolume ({
        instrument: this.symbol (product),
        })
    },
    
    fetchTrades (product) {
        return this.publicGetRawTradeData ({
            instrument: this.symbol (product),
            timespan:   3600,
        })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.privatePostPlaceOrder (extend ({
            instrument: this.symbol (product),
            orderType:  side.toUpperCase (),
            amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    request (path, type = 'public', method = 'GET', params = {}) {

        var options = { method }
        var url = this.urls.api[type]
        var auth = (type === 'public') ? {} : {
            key: this.apiKey,
            user: this.login,
            pass: this.password,   
        }

        if (method === 'GET') {

            url += '?' + querystring (extend ({ 
                method: path, 
                id: this.nonce (),
            }, auth, params))

        } else {

            options.headers = {
                'Content-type': 'application/json',
            }

            options.body = JSON.stringify ({ 
                method: path, 
                params: extend (auth, params),
                id: this.nonce (),
            })
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var yobit = {

    name: 'YoBit',
    countries: [ 'RU', ],
    rateLimit: 2000, // responses are cached every 2 seconds

    version: 3,
    urls: {

        api:  'https://yobit.net',
        www:  'https://www.yobit.net',
        docs: 'https://www.yobit.net/en/api/',
    },
    api: {

        api: {

            get: [

                'depth/{pairs}',
                'info',
                'ticker/{pairs}',
                'trades/{pairs}',
            ],
        },

        tapi: {

            post: [

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

    fetchProducts () {
        return this.apiGetInfo ().then (products =>
            Object.keys (products.pairs).map (id => {
                var product = products.pairs[id]
                var symbol = id.toUpperCase ().replace ('_', '/')
                var [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance   (product) { return this.tapiPostGetInfo () },
   
    fetchOrderBook (product) {
        return this.apiGetDepthPairs ({ pairs: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.apiGetTickerPairs ({ pairs: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.apiGetTradesPairs ({ pairs: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {

        return this.tapiPostTrade (extend ({
            pair: this.productId (product),
            type: side,
            amount,
        }, (type == 'limit') ? { rate: price } : {}, params))
    },

    cancelOrder (id, params = {}) {
        return this.tapiPostCancelOrder (extend ({ order_id: id }, params))
    },

    request (path, type = 'api', method = 'GET', params = {}) {

        var options = { method }

        var url = this.urls.api + '/' + type

        if (type === 'api') {

            url += '/' + this.version + '/' + this.implodeParams (path, params)
            var query = omit (params, this.extractParams (path))

            if (Object.keys (query).length)
                url += '?' + querystring (query)

        } else {

            var nonce = this.nonce ()
            var query = extend ({ method: path, nonce }, params)

            options.body = querystring (query)
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                key: this.apiKey,
                sign: this.hmac (options.body, this.secret, 'sha512')
            }
        }

        return this.fetch (url, options)
    },
}

//-----------------------------------------------------------------------------

var zaif = {

    name: 'Zaif',
    countries: [ 'JP', ],
    rateLimit: 3000,

    version: 1,
    urls: {

        api:  'https://api.zaif.jp',
        www:  'https://zaif.jp',
        docs: [
            'https://corp.zaif.jp/api-docs',
            'https://corp.zaif.jp/api-docs/api_links',
            'https://www.npmjs.com/package/zaif.jp',
            'https://github.com/you21979/node-zaif',
        ],
    },

    api: {

        api: {

            get: [

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

        tapi: {

            post: [

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

        ecapi: {

            post: [

                'createInvoice',
                'getInvoice',
                'getInvoiceIdsByOrderNumber',
                'cancelInvoice',
            ],
        },
    },

    fetchProducts () {
        return this.apiGetCurrencyPairsAll ().then (products => 
            products.map (product => {
                let id = product.currency_pair
                let symbol = product.name
                let [ base, quote ] = symbol.split ('/')
                return extend ({ id, symbol, base, quote }, product, { id, symbol, base, quote })
            }))
    },

    fetchBalance () { return this.tapiPostGetInfo () },
    
    fetchOrderBook (product) {
        return this.apiGetDepthPair  ({ pair: this.productId (product) })
    },
    
    fetchTicker (product) {
        return this.apiGetTickerPair ({ pair: this.productId (product) })
    },
    
    fetchTrades (product) {
        return this.apiGetTradesPair ({ pair: this.productId (product) })
    },

    createOrder (product, type, side, amount, price = undefined, params = {}) {
        return this.tapiPostTrade (extend ({
            currency_pair: this.productId (product),
            action: (side == 'buy') ? 'bid' : 'ask',
            amount,
        }, (type == 'limit') ? { price } : {}, params))
    },

    cancelOrder (id, params = {}) {
        return this.tapiPostCancelOrder (extend ({ order_id: id }, params))
    },

    request (path, type = 'api', method = 'GET', params = {}) {
        
        var options = { method }
        var url = this.urls.api + '/' + type

        if (type === 'api') {

            url += '/' + this.version + '/' + this.implodeParams (path, params)

        } else {

            var nonce = this.nonce ()
            options.body = querystring (extend ({ method: path, nonce }, params))
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': options.body.length,
                Key: this.apiKey,
                Sign: this.hmac (options.body, this.secret, 'sha512'),
            }
        }

        return this.fetch (url, options)
    },
}

//=============================================================================

var markets = {

    _1broker,
    _1btcxe,
    bit2c,
    bitbay,
    bitcoid,
    bitfinex,
    bitlish,
    bitmarket,
    bitmex,
    bitso, 
    bittrex,
    btcx,
    bxinth,
    ccex,
    cex,
    coincheck,
    coinsecure,
    exmo,
    fybse,
    fybsg,
    hitbtc,
    huobi,
    jubi,
    kraken,
    luno,
    okcoincny,
    okcoinusd,
    poloniex,
    quadrigacx,
    quoine,
    therock,
    vaultoro,
    virwox,
    yobit,
    zaif,
}

var defineAllMarkets = function (markets) {
    var result = {}
    for (let id in markets)
        result[id] = function (params) {
            return new Market (extend ({
                id,
                name: id,
            }, markets[id], { id }, params))
        }
    return result
}

if (isNode)
    module.exports = defineAllMarkets (markets)
else
    window.ccxt = defineAllMarkets (markets)

}) ()