'use strict';

// ----------------------------------------------------------------------------
/* eslint-disable */

const functions = require ('./functions');

const {
    isNode
    , clone
    , unCamelCase
    , throttle
    , timeout
    , TimedOut
    , defaultFetch
} = functions

const { // eslint-disable-line object-curly-newline
    ExchangeError
    , BadSymbol
    , NullResponse
    , InvalidAddress
    , InvalidOrder
    , NotSupported
    , AuthenticationError
    , DDoSProtection
    , RequestTimeout
    , ExchangeNotAvailable
    , RateLimitExceeded
    , ArgumentsRequired } = require ('./errors')

const { TRUNCATE, ROUND, DECIMAL_PLACES, NO_PADDING, TICK_SIZE } = functions.precisionConstants

const BN = require ('../static_dependencies/BN/bn')
const Precise = require ('./Precise')

// ----------------------------------------------------------------------------

module.exports = class Exchange {

    describe () {
        return {
            'id': undefined,
            'name': undefined,
            'countries': undefined,
            'enableRateLimit': true,
            'rateLimit': 2000, // milliseconds = seconds * 1000
            'certified': false, // if certified by the CCXT dev team
            'pro': false, // if it is integrated with CCXT Pro for WebSocket support
            'alias': false, // whether this exchange is an alias to another exchange
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'CORS': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': undefined,
                'createReduceOnlyOrder': undefined,
                'createStopOrder': undefined,
                'createStopLimitOrder': undefined,
                'createStopMarketOrder': undefined,
                'editOrder': 'emulated',
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchBorrowRates': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': 'emulated',
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': true,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': 'emulated',
                'fetchOpenInterest': undefined,
                'fetchOpenInterestHistory': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPermissions': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawAddresses': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMargin': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'urls': {
                'logo': undefined,
                'api': undefined,
                'www': undefined,
                'doc': undefined,
                'fees': undefined,
            },
            'api': undefined,
            'requiredCredentials': {
                'apiKey':     true,
                'secret':     true,
                'uid':        false,
                'login':      false,
                'password':   false,
                'twofa':      false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
                'token':      false, // reserved for HTTP auth in some cases
            },
            'markets': undefined, // to be filled manually or by fetchMarkets
            'currencies': {}, // to be filled manually or by fetchMarkets
            'timeframes': undefined, // redefine if the exchange has.fetchOHLCV
            'fees': {
                'trading': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'taker': undefined,
                    'maker': undefined,
                },
                'funding': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'status': {
                'status': 'ok',
                'updated': undefined,
                'eta': undefined,
                'url': undefined,
            },
            'exceptions': undefined,
            'httpExceptions': {
                '422': ExchangeError,
                '418': DDoSProtection,
                '429': RateLimitExceeded,
                '404': ExchangeNotAvailable,
                '409': ExchangeNotAvailable,
                '410': ExchangeNotAvailable,
                '451': ExchangeNotAvailable,
                '500': ExchangeNotAvailable,
                '501': ExchangeNotAvailable,
                '502': ExchangeNotAvailable,
                '520': ExchangeNotAvailable,
                '521': ExchangeNotAvailable,
                '522': ExchangeNotAvailable,
                '525': ExchangeNotAvailable,
                '526': ExchangeNotAvailable,
                '400': ExchangeNotAvailable,
                '403': ExchangeNotAvailable,
                '405': ExchangeNotAvailable,
                '503': ExchangeNotAvailable,
                '530': ExchangeNotAvailable,
                '408': RequestTimeout,
                '504': RequestTimeout,
                '401': AuthenticationError,
                '407': AuthenticationError,
                '511': AuthenticationError,
            },
            'commonCurrencies': { // gets extended/overwritten in subclasses
                'XBT': 'BTC',
                'BCC': 'BCH',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
            },
            'precisionMode': DECIMAL_PLACES,
            'paddingMode': NO_PADDING,
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
        } // return
    } // describe ()

    constructor (userConfig = {}) {
        Object.assign (this, functions)
        //
        //     if (isNode) {
        //         this.nodeVersion = process.version.match (/\d+\.\d+\.\d+/)[0]
        //         this.userAgent = {
        //             'User-Agent': 'ccxt/' + Exchange.ccxtVersion +
        //                 ' (+https://github.com/ccxt/ccxt)' +
        //                 ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        //         }
        //     }
        //
        this.options = this.getDefaultOptions(); // exchange-specific options, if any
        // fetch implementation options (JS only)
        this.fetchOptions = {
            // keepalive: true, // does not work in Chrome, https://github.com/ccxt/ccxt/issues/6368
        }
        // http properties
        this.userAgents = {
            'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
            'chrome100': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
        }
        this.headers = {}
        // prepended to URL, like https://proxy.com/https://exchange.com/api...
        this.proxy = ''
        this.origin = '*' // CORS origin
        // underlying properties
        this.minFundingAddressLength = 1 // used in checkAddress
        this.substituteCommonCurrencyCodes = true  // reserved
        this.quoteJsonNumbers = true // treat numbers in json as quoted precise strings
        this.number = Number // or String (a pointer to a function)
        this.handleContentTypeApplicationZip = false
        // whether fees should be summed by currency code
        this.reduceFees = true
        // do not delete this line, it is needed for users to be able to define their own fetchImplementation
        this.fetchImplementation = defaultFetch
        this.validateServerSsl = true
        this.validateClientSsl = false
        // default property values
        this.timeout       = 10000 // milliseconds
        this.verbose       = false
        this.debug         = false
        this.userAgent     = undefined
        this.twofa         = undefined // two-factor authentication (2FA)
        // default credentials
        this.apiKey        = undefined
        this.secret        = undefined
        this.uid           = undefined
        this.login         = undefined
        this.password      = undefined
        this.privateKey    = undefined // a "0x"-prefixed hexstring private key for a wallet
        this.walletAddress = undefined // a wallet address "0x"-prefixed hexstring
        this.token         = undefined // reserved for HTTP auth in some cases
        // placeholders for cached data
        this.balance      = {}
        this.orderbooks   = {}
        this.tickers      = {}
        this.orders       = undefined
        this.trades       = {}
        this.transactions = {}
        this.ohlcvs       = {}
        this.myTrades     = undefined
        this.positions    = {}
        // web3 and cryptography flags
        this.requiresWeb3 = false
        this.requiresEddsa = false
        this.precision = {}
        // response handling flags and properties
        this.lastRestRequestTimestamp = 0
        this.enableLastJsonResponse = true
        this.enableLastHttpResponse = true
        this.enableLastResponseHeaders = true
        this.last_http_response    = undefined
        this.last_json_response    = undefined
        this.last_response_headers = undefined
        // camelCase and snake_notation support
        const unCamelCaseProperties = (obj = this) => {
            if (obj !== null) {
                const ownPropertyNames = Object.getOwnPropertyNames (obj)
                for (let i = 0; i < ownPropertyNames.length; i++) {
                    const k = ownPropertyNames[i]
                    this[unCamelCase (k)] = this[k]
                }
                unCamelCaseProperties (Object.getPrototypeOf (obj))
            }
        }
        unCamelCaseProperties ()
        // merge constructor overrides to this instance
        const configEntries = Object.entries (this.describe ()).concat (Object.entries (userConfig))
        for (let i = 0; i < configEntries.length; i++) {
            const [property, value] = configEntries[i]
            if (value && Object.getPrototypeOf (value) === Object.prototype) {
                this[property] = this.deepExtend (this[property], value)
            } else {
                this[property] = value
            }
        }
        // http client options
        const agentOptions = {
            'keepAlive': true,
        }
        // ssl options
        if (!this.validateServerSsl) {
            agentOptions['rejectUnauthorized'] = false;
        }
        // js-specific http options
        if (!this.httpAgent && defaultFetch.http && isNode) {
            this.httpAgent = new defaultFetch.http.Agent (agentOptions)
        }
        if (!this.httpsAgent && defaultFetch.https && isNode) {
            this.httpsAgent = new defaultFetch.https.Agent (agentOptions)
        }
        // generate old metainfo interface
        const hasKeys = Object.keys (this.has)
        for (let i = 0; i < hasKeys.length; i++) {
            const k = hasKeys[i]
            this['has' + this.capitalize (k)] = !!this.has[k] // converts 'emulated' to true
        }
        // generate implicit api
        if (this.api) {
            this.defineRestApi (this.api, 'request')
        }
        // init the request rate limiter
        this.initRestRateLimiter ()
        // init predefined markets if any
        if (this.markets) {
            this.setMarkets (this.markets)
        }
    }

    encodeURIComponent (...args) {
        return encodeURIComponent (...args)
    }

    checkRequiredVersion (requiredVersion, error = true) {
        let result = true
        const [ major1, minor1, patch1 ] = requiredVersion.split ('.')
            , [ major2, minor2, patch2 ] = Exchange.ccxtVersion.split ('.')
            , intMajor1 = parseInt (major1)
            , intMinor1 = parseInt (minor1)
            , intPatch1 = parseInt (patch1)
            , intMajor2 = parseInt (major2)
            , intMinor2 = parseInt (minor2)
            , intPatch2 = parseInt (patch2)
        if (intMajor1 > intMajor2) {
            result = false
        }
        if (intMajor1 === intMajor2) {
            if (intMinor1 > intMinor2) {
                result = false
            } else if (intMinor1 === intMinor2 && intPatch1 > intPatch2) {
                result = false
            }
        }
        if (!result) {
            if (error) {
                throw new NotSupported ('Your current version of CCXT is ' + Exchange.ccxtVersion + ', a newer version ' + requiredVersion + ' is required, please, upgrade your version of CCXT')
            } else {
                return error
            }
        }
        return result
    }

    checkAddress (address) {
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' address is undefined')
        }
        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        if ((this.unique (address).length === 1) || address.length < this.minFundingAddressLength || address.includes (' ')) {
            throw new InvalidAddress (this.id + ' address is invalid or has less than ' + this.minFundingAddressLength.toString () + ' characters: "' + this.json (address) + '"')
        }
        return address
    }

    initRestRateLimiter () {
        if (this.rateLimit === undefined) {
            throw new Error (this.id + '.rateLimit property is not configured');
        }
        this.tokenBucket = this.extend ({
            delay: 0.001,
            capacity: 1,
            cost: 1,
            maxCapacity: 1000,
            refillRate: (this.rateLimit > 0) ? 1 / this.rateLimit : Number.MAX_VALUE,
        }, this.tokenBucket);
        this.throttle = throttle (this.tokenBucket);
        this.executeRestRequest = (url, method = 'GET', headers = undefined, body = undefined) => {
            // fetchImplementation cannot be called on this. in browsers:
            // TypeError Failed to execute 'fetch' on 'Window': Illegal invocation
            const fetchImplementation = this.fetchImplementation;
            const params = { method, headers, body, timeout: this.timeout };
            if (this.agent) {
                params['agent'] = this.agent;
            } else if (this.httpAgent && url.indexOf ('http://') === 0) {
                params['agent'] = this.httpAgent;
            } else if (this.httpsAgent && url.indexOf ('https://') === 0) {
                params['agent'] = this.httpsAgent;
            }
            const promise =
                fetchImplementation (url, this.extend (params, this.fetchOptions))
                    .catch ((e) => {
                        if (isNode) {
                            throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '));
                        }
                        throw e; // rethrow all unknown errors
                    })
                    .then ((response) => this.handleRestResponse (response, url, method, headers, body));
            return timeout (this.timeout, promise).catch ((e) => {
                if (e instanceof TimedOut) {
                    throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' request timed out (' + this.timeout + ' ms)');
                }
                throw e;
            })
        };
    }

    setSandboxMode (enabled) {
        if (!!enabled) { // eslint-disable-line no-extra-boolean-cast
            if ('test' in this.urls) {
                if (typeof this.urls['api'] === 'string') {
                    this.urls['apiBackup'] = this.urls['api']
                    this.urls['api'] = this.urls['test']
                } else {
                    this.urls['apiBackup'] = clone (this.urls['api'])
                    this.urls['api'] = clone (this.urls['test'])
                }
            } else {
                throw new NotSupported (this.id + ' does not have a sandbox URL')
            }
        } else if ('apiBackup' in this.urls) {
            if (typeof this.urls['api'] === 'string') {
                this.urls['api'] = this.urls['apiBackup']
            } else {
                this.urls['api'] = clone (this.urls['apiBackup'])
            }
        }
    }

    defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config = {}) {
        const splitPath = path.split (/[^a-zA-Z0-9]/)
        const camelcaseSuffix  = splitPath.map (this.capitalize).join ('')
        const underscoreSuffix = splitPath.map ((x) => x.trim ().toLowerCase ()).filter ((x) => x.length > 0).join ('_')
        const camelcasePrefix = [ paths[0] ].concat (paths.slice (1).map (this.capitalize)).join ('')
        const underscorePrefix = [ paths[0] ].concat (paths.slice (1).map ((x) => x.trim ()).filter ((x) => x.length > 0)).join ('_')
        const camelcase  = camelcasePrefix + camelcaseMethod + this.capitalize (camelcaseSuffix)
        const underscore = underscorePrefix + '_' + lowercaseMethod + '_' + underscoreSuffix
        const typeArgument = (paths.length > 1) ? paths : paths[0]
        // handle call costs here
        const partial = async (params = {}, context = {}) => this[methodName] (path, typeArgument, uppercaseMethod, params, undefined, undefined, config, context)
        // const partial = async (params) => this[methodName] (path, typeArgument, uppercaseMethod, params || {})
        this[camelcase]  = partial
        this[underscore] = partial
    }

    defineRestApi (api, methodName, paths = []) {
        const keys = Object.keys (api)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = api[key]
            const uppercaseMethod = key.toUpperCase ()
            const lowercaseMethod = key.toLowerCase ()
            const camelcaseMethod = this.capitalize (lowercaseMethod)
            if (Array.isArray (value)) {
                for (let k = 0; k < value.length; k++) {
                    const path = value[k].trim ()
                    this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths)
                }
            // the options HTTP method conflicts with the 'options' API url path
            // } else if (key.match (/^(?:get|post|put|delete|options|head|patch)$/i)) {
            } else if (key.match (/^(?:get|post|put|delete|head|patch)$/i)) {
                const endpoints = Object.keys (value);
                for (let j = 0; j < endpoints.length; j++) {
                    const endpoint = endpoints[j]
                    const path = endpoint.trim ()
                    const config = value[endpoint]
                    if (typeof config === 'object') {
                        this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config)
                    } else if (typeof config === 'number') {
                        this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, { cost: config })
                    } else {
                        throw new NotSupported (this.id + ' defineRestApi() API format is not supported, API leafs must strings, objects or numbers');
                    }
                }
            } else {
                this.defineRestApi (value, methodName, paths.concat ([ key ]))
            }
        }
    }

    log (... args) {
        console.log (... args)
    }

    fetch (url, method = 'GET', headers = undefined, body = undefined) {
        if (isNode && this.userAgent) {
            if (typeof this.userAgent === 'string') {
                headers = this.extend ({ 'User-Agent': this.userAgent }, headers)
            } else if ((typeof this.userAgent === 'object') && ('User-Agent' in this.userAgent)) {
                headers = this.extend (this.userAgent, headers)
            }
        }
        if (typeof this.proxy === 'function') {
            url = this.proxy (url)
            if (isNode) {
                headers = this.extend ({ 'Origin': this.origin }, headers)
            }
        } else if (typeof this.proxy === 'string') {
            if (this.proxy.length && isNode) {
                headers = this.extend ({ 'Origin': this.origin }, headers)
            }
            url = this.proxy + url
        }
        headers = this.extend (this.headers, headers)
        headers = this.setHeaders (headers)
        if (this.verbose) {
            this.log ("fetch Request:\n", this.id, method, url, "\nRequestHeaders:\n", headers, "\nRequestBody:\n", body, "\n")
        }
        return this.executeRestRequest (url, method, headers, body)
    }

    parseJson (jsonString) {
        try {
            if (this.isJsonEncodedObject (jsonString)) {
                return JSON.parse (this.onJsonResponse (jsonString))
            }
        } catch (e) {
            // SyntaxError
            return undefined
        }
    }

    getResponseHeaders (response) {
        const result = {}
        response.headers.forEach ((value, key) => {
            key = key.split ('-').map ((word) => this.capitalize (word)).join ('-')
            result[key] = value
        })
        return result
    }

    handleRestResponse (response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {
        const responseHeaders = this.getResponseHeaders (response)
        if (this.handleContentTypeApplicationZip && (responseHeaders['Content-Type'] === 'application/zip')) {
            const responseBuffer = response.buffer ();
            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders
            }
            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBuffer
            }
            if (this.verbose) {
                this.log ("handleRestResponse:\n", this.id, method, url, response.status, response.statusText, "\nResponseHeaders:\n", responseHeaders, "ZIP redacted", "\n")
            }
            // no error handler needed, because it would not be a zip response in case of an error
            return responseBuffer;
        }
        return response.text ().then ((responseBody) => {
            const bodyText = this.onRestResponse (response.status, response.statusText, url, method, responseHeaders, responseBody, requestHeaders, requestBody);
            const json = this.parseJson (bodyText)
            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders
            }
            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBody
            }
            if (this.enableLastJsonResponse) {
                this.last_json_response = json
            }
            if (this.verbose) {
                this.log ("handleRestResponse:\n", this.id, method, url, response.status, response.statusText, "\nResponseHeaders:\n", responseHeaders, "\nResponseBody:\n", responseBody, "\n")
            }
            const skipFurtherErrorHandling = this.handleErrors (response.status, response.statusText, url, method, responseHeaders, responseBody, json, requestHeaders, requestBody)
            if (!skipFurtherErrorHandling) {
                this.handleHttpStatusCode (response.status, response.statusText, url, method, responseBody)
            }
            return json || responseBody
        })
    }

    onRestResponse (statusCode, statusText, url, method, responseHeaders, responseBody, requestHeaders, requestBody) {
        return responseBody.trim ()
    }

    onJsonResponse (responseBody) {
        return this.quoteJsonNumbers ? responseBody.replace (/":([+.0-9eE-]+)([,}])/g, '":"$1"$2') : responseBody;
    }

    async loadMarketsHelper (reload = false, params = {}) {
        if (!reload && this.markets) {
            if (!this.markets_by_id) {
                return this.setMarkets (this.markets)
            }
            return this.markets
        }
        let currencies = undefined
        // only call if exchange API provides endpoint (true), thus avoid emulated versions ('emulated')
        if (this.has.fetchCurrencies === true) {
            currencies = await this.fetchCurrencies ()
        }
        const markets = await this.fetchMarkets (params)
        return this.setMarkets (markets, currencies)
    }

    loadMarkets (reload = false, params = {}) {
        // this method is async, it returns a promise
        if ((reload && !this.reloadingMarkets) || !this.marketsLoading) {
            this.reloadingMarkets = true
            this.marketsLoading = this.loadMarketsHelper (reload, params).then ((resolved) => {
                this.reloadingMarkets = false
                return resolved
            }, (error) => {
                this.reloadingMarkets = false
                throw error
            })
        }
        return this.marketsLoading
    }

    fetchCurrencies (params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => resolve (this.currencies));
    }

    fetchMarkets (params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => resolve (Object.values (this.markets)))
    }

    filterBySinceLimit (array, since = undefined, limit = undefined, key = 'timestamp', tail = false) {
        const sinceIsDefined = (since !== undefined && since !== null)
        if (sinceIsDefined) {
            array = array.filter ((entry) => entry[key] >= since)
        }
        if (limit !== undefined && limit !== null) {
            array = tail ? array.slice (-limit) : array.slice (0, limit)
        }
        return array
    }

    filterByValueSinceLimit (array, field, value = undefined, since = undefined, limit = undefined, key = 'timestamp', tail = false) {
        const valueIsDefined = value !== undefined && value !== null
        const sinceIsDefined = since !== undefined && since !== null
        // single-pass filter for both symbol and since
        if (valueIsDefined || sinceIsDefined) {
            array = array.filter ((entry) =>
                ((valueIsDefined ? (entry[field] === value) : true) &&
                 (sinceIsDefined ? (entry[key] >= since) : true)))
        }
        if (limit !== undefined && limit !== null) {
            array = tail ? array.slice (-limit) : array.slice (0, limit)
        }
        return array
    }

    checkRequiredDependencies () {
        return
    }

    remove0xPrefix (hexData) {
        if (hexData.slice (0, 2) === '0x') {
            return hexData.slice (2)
        } else {
            return hexData
        }
    }

    hashMessage (message) {
        // takes a hex encoded message
        const binaryMessage = this.base16ToBinary (this.remove0xPrefix (message))
        const prefix = this.stringToBinary ('\x19Ethereum Signed Message:\n' + binaryMessage.sigBytes)
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), 'keccak', 'hex')
    }

    signHash (hash, privateKey) {
        const signature = this.ecdsa (hash.slice (-64), privateKey.slice (-64), 'secp256k1', undefined)
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        }
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64))
    }

    signMessageString (message, privateKey) {
        // still takes the input as a hex string
        // same as above but returns a string instead of an object
        const signature = this.signMessage (message, privateKey)
        return signature['r'] + this.remove0xPrefix (signature['s']) + this.binaryToBase16 (this.numberToBE (signature['v']))
    }

    parseNumber (value, d = undefined) {
        if (value === undefined) {
            return d
        } else {
            try {
                return this.number (value)
            } catch (e) {
                return d
            }
        }
    }

    checkOrderArguments (market, type, side, amount, price, params) {
        if (price === undefined) {
            if (type === 'limit') {
                  throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a limit order');
            }
        }
        if (amount <= 0) {
            throw new ArgumentsRequired (this.id + ' createOrder() amount should be above 0');
        }
    }

    handleHttpStatusCode (code, reason, url, method, body) {
        const codeAsString = code.toString ();
        if (codeAsString in this.httpExceptions) {
            const ErrorClass = this.httpExceptions[codeAsString];
            throw new ErrorClass (this.id + ' ' + method + ' ' + url + ' ' + codeAsString + ' ' + reason + ' ' + body);
        }
    }

    /* eslint-enable */
    // ------------------------------------------------------------------------

    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################

    // ------------------------------------------------------------------------
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    getDefaultOptions () {
        return {
            'defaultNetworkCodeReplacements': {
                'ETH': { 'ERC20': 'ETH' },
                'TRX': { 'TRC20': 'TRX' },
                'CRO': { 'CRC20': 'CRONOS' },
            },
        };
    }

    safeLedgerEntry (entry, currency = undefined) {
        currency = this.safeCurrency (undefined, currency);
        let direction = this.safeString (entry, 'direction');
        let before = this.safeString (entry, 'before');
        let after = this.safeString (entry, 'after');
        const amount = this.safeString (entry, 'amount');
        if (amount !== undefined) {
            if (before === undefined && after !== undefined) {
                before = Precise.stringSub (after, amount);
            } else if (before !== undefined && after === undefined) {
                after = Precise.stringAdd (before, amount);
            }
        }
        if (before !== undefined && after !== undefined) {
            if (direction === undefined) {
                if (Precise.stringGt (before, after)) {
                    direction = 'out';
                }
                if (Precise.stringGt (after, before)) {
                    direction = 'in';
                }
            }
        }
        const fee = this.safeValue (entry, 'fee');
        if (fee !== undefined) {
            fee['cost'] = this.safeNumber (fee, 'cost');
        }
        const timestamp = this.safeInteger (entry, 'timestamp');
        return {
            'id': this.safeString (entry, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': this.safeString (entry, 'account'),
            'referenceId': this.safeString (entry, 'referenceId'),
            'referenceAccount': this.safeString (entry, 'referenceAccount'),
            'type': this.safeString (entry, 'type'),
            'currency': currency['code'],
            'amount': this.parseNumber (amount),
            'before': this.parseNumber (before),
            'after': this.parseNumber (after),
            'status': this.safeString (entry, 'status'),
            'fee': fee,
            'info': entry,
        };
    }

    setMarkets (markets, currencies = undefined) {
        const values = [];
        this.markets_by_id = {};
        // handle marketId conflicts
        // we insert spot markets first
        const marketValues = this.sortBy (this.toArray (markets), 'spot', true);
        for (let i = 0; i < marketValues.length; i++) {
            const value = marketValues[i];
            if (value['id'] in this.markets_by_id) {
                this.markets_by_id[value['id']].push (value);
            } else {
                this.markets_by_id[value['id']] = [ value ];
            }
            const market = this.deepExtend (this.safeMarket (), {
                'precision': this.precision,
                'limits': this.limits,
            }, this.fees['trading'], value);
            values.push (market);
        }
        this.markets = this.indexBy (values, 'symbol');
        const marketsSortedBySymbol = this.keysort (this.markets);
        const marketsSortedById = this.keysort (this.markets_by_id);
        this.symbols = Object.keys (marketsSortedBySymbol);
        this.ids = Object.keys (marketsSortedById);
        if (currencies !== undefined) {
            this.currencies = this.deepExtend (this.currencies, currencies);
        } else {
            let baseCurrencies = [];
            let quoteCurrencies = [];
            for (let i = 0; i < values.length; i++) {
                const market = values[i];
                const defaultCurrencyPrecision = (this.precisionMode === DECIMAL_PLACES) ? 8 : this.parseNumber ('1e-8');
                const marketPrecision = this.safeValue (market, 'precision', {});
                if ('base' in market) {
                    const currencyPrecision = this.safeValue2 (marketPrecision, 'base', 'amount', defaultCurrencyPrecision);
                    const currency = {
                        'id': this.safeString2 (market, 'baseId', 'base'),
                        'numericId': this.safeString (market, 'baseNumericId'),
                        'code': this.safeString (market, 'base'),
                        'precision': currencyPrecision,
                    };
                    baseCurrencies.push (currency);
                }
                if ('quote' in market) {
                    const currencyPrecision = this.safeValue2 (marketPrecision, 'quote', 'price', defaultCurrencyPrecision);
                    const currency = {
                        'id': this.safeString2 (market, 'quoteId', 'quote'),
                        'numericId': this.safeString (market, 'quoteNumericId'),
                        'code': this.safeString (market, 'quote'),
                        'precision': currencyPrecision,
                    };
                    quoteCurrencies.push (currency);
                }
            }
            baseCurrencies = this.sortBy (baseCurrencies, 'code');
            quoteCurrencies = this.sortBy (quoteCurrencies, 'code');
            this.baseCurrencies = this.indexBy (baseCurrencies, 'code');
            this.quoteCurrencies = this.indexBy (quoteCurrencies, 'code');
            const allCurrencies = this.arrayConcat (baseCurrencies, quoteCurrencies);
            const groupedCurrencies = this.groupBy (allCurrencies, 'code');
            const codes = Object.keys (groupedCurrencies);
            const resultingCurrencies = [];
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i];
                const groupedCurrenciesCode = this.safeValue (groupedCurrencies, code, []);
                let highestPrecisionCurrency = this.safeValue (groupedCurrenciesCode, 0);
                for (let j = 1; j < groupedCurrenciesCode.length; j++) {
                    const currentCurrency = groupedCurrenciesCode[j];
                    if (this.precisionMode === TICK_SIZE) {
                        highestPrecisionCurrency = (currentCurrency['precision'] < highestPrecisionCurrency['precision']) ? currentCurrency : highestPrecisionCurrency;
                    } else {
                        highestPrecisionCurrency = (currentCurrency['precision'] > highestPrecisionCurrency['precision']) ? currentCurrency : highestPrecisionCurrency;
                    }
                }
                resultingCurrencies.push (highestPrecisionCurrency);
            }
            const sortedCurrencies = this.sortBy (resultingCurrencies, 'code');
            this.currencies = this.deepExtend (this.currencies, this.indexBy (sortedCurrencies, 'code'));
        }
        this.currencies_by_id = this.indexBy (this.currencies, 'id');
        const currenciesSortedByCode = this.keysort (this.currencies);
        this.codes = Object.keys (currenciesSortedByCode);
        return this.markets;
    }

    safeBalance (balance) {
        const balances = this.omit (balance, [ 'info', 'timestamp', 'datetime', 'free', 'used', 'total' ]);
        const codes = Object.keys (balances);
        balance['free'] = {};
        balance['used'] = {};
        balance['total'] = {};
        const debtBalance = {};
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            let total = this.safeString (balance[code], 'total');
            let free = this.safeString (balance[code], 'free');
            let used = this.safeString (balance[code], 'used');
            const debt = this.safeString (balance[code], 'debt');
            if ((total === undefined) && (free !== undefined) && (used !== undefined)) {
                total = Precise.stringAdd (free, used);
            }
            if ((free === undefined) && (total !== undefined) && (used !== undefined)) {
                free = Precise.stringSub (total, used);
            }
            if ((used === undefined) && (total !== undefined) && (free !== undefined)) {
                used = Precise.stringSub (total, free);
            }
            balance[code]['free'] = this.parseNumber (free);
            balance[code]['used'] = this.parseNumber (used);
            balance[code]['total'] = this.parseNumber (total);
            balance['free'][code] = balance[code]['free'];
            balance['used'][code] = balance[code]['used'];
            balance['total'][code] = balance[code]['total'];
            if (debt !== undefined) {
                balance[code]['debt'] = this.parseNumber (debt);
                debtBalance[code] = balance[code]['debt'];
            }
        }
        const debtBalanceArray = Object.keys (debtBalance);
        const length = debtBalanceArray.length;
        if (length) {
            balance['debt'] = debtBalance;
        }
        return balance;
    }

    safeOrder (order, market = undefined) {
        // parses numbers as strings
        // it is important pass the trades as unparsed rawTrades
        let amount = this.omitZero (this.safeString (order, 'amount'));
        let remaining = this.safeString (order, 'remaining');
        let filled = this.safeString (order, 'filled');
        let cost = this.safeString (order, 'cost');
        let average = this.omitZero (this.safeString (order, 'average'));
        let price = this.omitZero (this.safeString (order, 'price'));
        let lastTradeTimeTimestamp = this.safeInteger (order, 'lastTradeTimestamp');
        let symbol = this.safeString (order, 'symbol');
        let side = this.safeString (order, 'side');
        const parseFilled = (filled === undefined);
        const parseCost = (cost === undefined);
        const parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp === undefined);
        const fee = this.safeValue (order, 'fee');
        const parseFee = (fee === undefined);
        const parseFees = this.safeValue (order, 'fees') === undefined;
        const parseSymbol = symbol === undefined;
        const parseSide = side === undefined;
        const shouldParseFees = parseFee || parseFees;
        const fees = this.safeValue (order, 'fees', []);
        let trades = [];
        if (parseFilled || parseCost || shouldParseFees) {
            const rawTrades = this.safeValue (order, 'trades', trades);
            const oldNumber = this.number;
            // we parse trades as strings here!
            this.number = String;
            trades = this.parseTrades (rawTrades, market);
            this.number = oldNumber;
            let tradesLength = 0;
            const isArray = Array.isArray (trades);
            if (isArray) {
                tradesLength = trades.length;
            }
            if (isArray && (tradesLength > 0)) {
                // move properties that are defined in trades up into the order
                if (order['symbol'] === undefined) {
                    order['symbol'] = trades[0]['symbol'];
                }
                if (order['side'] === undefined) {
                    order['side'] = trades[0]['side'];
                }
                if (order['type'] === undefined) {
                    order['type'] = trades[0]['type'];
                }
                if (order['id'] === undefined) {
                    order['id'] = trades[0]['order'];
                }
                if (parseFilled) {
                    filled = '0';
                }
                if (parseCost) {
                    cost = '0';
                }
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    const tradeAmount = this.safeString (trade, 'amount');
                    if (parseFilled && (tradeAmount !== undefined)) {
                        filled = Precise.stringAdd (filled, tradeAmount);
                    }
                    const tradeCost = this.safeString (trade, 'cost');
                    if (parseCost && (tradeCost !== undefined)) {
                        cost = Precise.stringAdd (cost, tradeCost);
                    }
                    if (parseSymbol) {
                        symbol = this.safeString (trade, 'symbol');
                    }
                    if (parseSide) {
                        side = this.safeString (trade, 'side');
                    }
                    const tradeTimestamp = this.safeValue (trade, 'timestamp');
                    if (parseLastTradeTimeTimestamp && (tradeTimestamp !== undefined)) {
                        if (lastTradeTimeTimestamp === undefined) {
                            lastTradeTimeTimestamp = tradeTimestamp;
                        } else {
                            lastTradeTimeTimestamp = Math.max (lastTradeTimeTimestamp, tradeTimestamp);
                        }
                    }
                    if (shouldParseFees) {
                        const tradeFees = this.safeValue (trade, 'fees');
                        if (tradeFees !== undefined) {
                            for (let j = 0; j < tradeFees.length; j++) {
                                const tradeFee = tradeFees[j];
                                fees.push (this.extend ({}, tradeFee));
                            }
                        } else {
                            const tradeFee = this.safeValue (trade, 'fee');
                            if (tradeFee !== undefined) {
                                fees.push (this.extend ({}, tradeFee));
                            }
                        }
                    }
                }
            }
        }
        if (shouldParseFees) {
            const reducedFees = this.reduceFees ? this.reduceFeesByCurrency (fees) : fees;
            const reducedLength = reducedFees.length;
            for (let i = 0; i < reducedLength; i++) {
                reducedFees[i]['cost'] = this.safeNumber (reducedFees[i], 'cost');
                if ('rate' in reducedFees[i]) {
                    reducedFees[i]['rate'] = this.safeNumber (reducedFees[i], 'rate');
                }
            }
            if (!parseFee && (reducedLength === 0)) {
                fee['cost'] = this.safeNumber (fee, 'cost');
                if ('rate' in fee) {
                    fee['rate'] = this.safeNumber (fee, 'rate');
                }
                reducedFees.push (fee);
            }
            order['fees'] = reducedFees;
            if (parseFee && (reducedLength === 1)) {
                order['fee'] = reducedFees[0];
            }
        }
        if (amount === undefined) {
            // ensure amount = filled + remaining
            if (filled !== undefined && remaining !== undefined) {
                amount = Precise.stringAdd (filled, remaining);
            } else if (this.safeString (order, 'status') === 'closed') {
                amount = filled;
            }
        }
        if (filled === undefined) {
            if (amount !== undefined && remaining !== undefined) {
                filled = Precise.stringSub (amount, remaining);
            }
        }
        if (remaining === undefined) {
            if (amount !== undefined && filled !== undefined) {
                remaining = Precise.stringSub (amount, filled);
            }
        }
        // ensure that the average field is calculated correctly
        const inverse = this.safeValue (market, 'inverse', false);
        const contractSize = this.numberToString (this.safeValue (market, 'contractSize', 1));
        // inverse
        // price = filled * contract size / cost
        //
        // linear
        // price = cost / (filled * contract size)
        if (average === undefined) {
            if ((filled !== undefined) && (cost !== undefined) && Precise.stringGt (filled, '0')) {
                const filledTimesContractSize = Precise.stringMul (filled, contractSize);
                if (inverse) {
                    average = Precise.stringDiv (filledTimesContractSize, cost);
                } else {
                    average = Precise.stringDiv (cost, filledTimesContractSize);
                }
            }
        }
        // similarly
        // inverse
        // cost = filled * contract size / price
        //
        // linear
        // cost = filled * contract size * price
        const costPriceExists = (average !== undefined) || (price !== undefined);
        if (parseCost && (filled !== undefined) && costPriceExists) {
            let multiplyPrice = undefined;
            if (average === undefined) {
                multiplyPrice = price;
            } else {
                multiplyPrice = average;
            }
            // contract trading
            const filledTimesContractSize = Precise.stringMul (filled, contractSize);
            if (inverse) {
                cost = Precise.stringDiv (filledTimesContractSize, multiplyPrice);
            } else {
                cost = Precise.stringMul (filledTimesContractSize, multiplyPrice);
            }
        }
        // support for market orders
        const orderType = this.safeValue (order, 'type');
        const emptyPrice = (price === undefined) || Precise.stringEquals (price, '0');
        if (emptyPrice && (orderType === 'market')) {
            price = average;
        }
        // we have trades with string values at this point so we will mutate them
        for (let i = 0; i < trades.length; i++) {
            const entry = trades[i];
            entry['amount'] = this.safeNumber (entry, 'amount');
            entry['price'] = this.safeNumber (entry, 'price');
            entry['cost'] = this.safeNumber (entry, 'cost');
            const fee = this.safeValue (entry, 'fee', {});
            fee['cost'] = this.safeNumber (fee, 'cost');
            if ('rate' in fee) {
                fee['rate'] = this.safeNumber (fee, 'rate');
            }
            entry['fee'] = fee;
        }
        let timeInForce = this.safeString (order, 'timeInForce');
        let postOnly = this.safeValue (order, 'postOnly');
        // timeInForceHandling
        if (timeInForce === undefined) {
            if (this.safeString (order, 'type') === 'market') {
                timeInForce = 'IOC';
            }
            // allow postOnly override
            if (postOnly) {
                timeInForce = 'PO';
            }
        } else if (postOnly === undefined) {
            // timeInForce is not undefined here
            postOnly = timeInForce === 'PO';
        }
        return this.extend (order, {
            'symbol': symbol,
            'side': side,
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'cost': this.parseNumber (cost),
            'average': this.parseNumber (average),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'trades': trades,
        });
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // the value of orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1': { ... },
        //         'id2': { ... },
        //         'id3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'id': 'id1', ... },
        //         { 'id': 'id2', ... },
        //         { 'id': 'id3', ... },
        //         ...
        //     ]
        //
        let results = [];
        if (Array.isArray (orders)) {
            for (let i = 0; i < orders.length; i++) {
                const order = this.extend (this.parseOrder (orders[i], market), params);
                results.push (order);
            }
        } else {
            const ids = Object.keys (orders);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const order = this.extend (this.parseOrder (this.extend ({ 'id': id }, orders[id]), market), params);
                results.push (order);
            }
        }
        results = this.sortBy (results, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const tail = since === undefined;
        return this.filterBySymbolSinceLimit (results, symbol, since, limit, tail);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        if (type === 'market' && takerOrMaker === 'maker') {
            throw new ArgumentsRequired (this.id + ' calculateFee() - you have provided incompatible arguments - "market" type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.');
        }
        const market = this.markets[symbol];
        const feeSide = this.safeString (market, 'feeSide', 'quote');
        let key = 'quote';
        let cost = undefined;
        const amountString = this.numberToString (amount);
        const priceString = this.numberToString (price);
        if (feeSide === 'quote') {
            // the fee is always in quote currency
            cost = Precise.stringMul (amountString, priceString);
        } else if (feeSide === 'base') {
            // the fee is always in base currency
            cost = amountString;
        } else if (feeSide === 'get') {
            // the fee is always in the currency you get
            cost = amountString;
            if (side === 'sell') {
                cost = Precise.stringMul (cost, priceString);
            } else {
                key = 'base';
            }
        } else if (feeSide === 'give') {
            // the fee is always in the currency you give
            cost = amountString;
            if (side === 'buy') {
                cost = Precise.stringMul (cost, priceString);
            } else {
                key = 'base';
            }
        }
        // for derivatives, the fee is in 'settle' currency
        if (!market['spot']) {
            key = 'settle';
        }
        // even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if (type === 'market') {
            takerOrMaker = 'taker';
        }
        const rate = this.safeString (market, takerOrMaker);
        if (cost !== undefined) {
            cost = Precise.stringMul (cost, rate);
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': this.parseNumber (rate),
            'cost': this.parseNumber (cost),
        };
    }

    safeTrade (trade, market = undefined) {
        const amount = this.safeString (trade, 'amount');
        const price = this.safeString (trade, 'price');
        let cost = this.safeString (trade, 'cost');
        if (cost === undefined) {
            // contract trading
            const contractSize = this.safeString (market, 'contractSize');
            let multiplyPrice = price;
            if (contractSize !== undefined) {
                const inverse = this.safeValue (market, 'inverse', false);
                if (inverse) {
                    multiplyPrice = Precise.stringDiv ('1', price);
                }
                multiplyPrice = Precise.stringMul (multiplyPrice, contractSize);
            }
            cost = Precise.stringMul (multiplyPrice, amount);
        }
        const parseFee = this.safeValue (trade, 'fee') === undefined;
        const parseFees = this.safeValue (trade, 'fees') === undefined;
        const shouldParseFees = parseFee || parseFees;
        const fees = [];
        const fee = this.safeValue (trade, 'fee');
        if (shouldParseFees) {
            const reducedFees = this.reduceFees ? this.reduceFeesByCurrency (fees) : fees;
            const reducedLength = reducedFees.length;
            for (let i = 0; i < reducedLength; i++) {
                reducedFees[i]['cost'] = this.safeNumber (reducedFees[i], 'cost');
                if ('rate' in reducedFees[i]) {
                    reducedFees[i]['rate'] = this.safeNumber (reducedFees[i], 'rate');
                }
            }
            if (!parseFee && (reducedLength === 0)) {
                fee['cost'] = this.safeNumber (fee, 'cost');
                if ('rate' in fee) {
                    fee['rate'] = this.safeNumber (fee, 'rate');
                }
                reducedFees.push (fee);
            }
            if (parseFees) {
                trade['fees'] = reducedFees;
            }
            if (parseFee && (reducedLength === 1)) {
                trade['fee'] = reducedFees[0];
            }
            const tradeFee = this.safeValue (trade, 'fee');
            if (tradeFee !== undefined) {
                tradeFee['cost'] = this.safeNumber (tradeFee, 'cost');
                if ('rate' in tradeFee) {
                    tradeFee['rate'] = this.safeNumber (tradeFee, 'rate');
                }
                trade['fee'] = tradeFee;
            }
        }
        trade['amount'] = this.parseNumber (amount);
        trade['price'] = this.parseNumber (price);
        trade['cost'] = this.parseNumber (cost);
        return trade;
    }

    reduceFeesByCurrency (fees) {
        //
        // this function takes a list of fee structures having the following format
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.1' },
        //         { 'currency': 'BTC', 'cost': '0.2'  },
        //         { 'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.1 },
        //         { 'currency': 'BTC', 'cost': 0.2 },
        //         { 'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        // and returns a reduced fee list, where fees are summed per currency and rate (if any)
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.3'  },
        //         { 'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string  = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.3  },
        //         { 'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        const reduced = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const feeCurrencyCode = this.safeString (fee, 'currency');
            if (feeCurrencyCode !== undefined) {
                const rate = this.safeString (fee, 'rate');
                const cost = this.safeValue (fee, 'cost');
                if (Precise.stringEq (cost, '0')) {
                    // omit zero cost fees
                    continue;
                }
                if (!(feeCurrencyCode in reduced)) {
                    reduced[feeCurrencyCode] = {};
                }
                const rateKey = (rate === undefined) ? '' : rate;
                if (rateKey in reduced[feeCurrencyCode]) {
                    reduced[feeCurrencyCode][rateKey]['cost'] = Precise.stringAdd (reduced[feeCurrencyCode][rateKey]['cost'], cost);
                } else {
                    reduced[feeCurrencyCode][rateKey] = {
                        'currency': feeCurrencyCode,
                        'cost': cost,
                    };
                    if (rate !== undefined) {
                        reduced[feeCurrencyCode][rateKey]['rate'] = rate;
                    }
                }
            }
        }
        let result = [];
        const feeValues = Object.values (reduced);
        for (let i = 0; i < feeValues.length; i++) {
            const reducedFeeValues = Object.values (feeValues[i]);
            result = this.arrayConcat (result, reducedFeeValues);
        }
        return result;
    }

    safeTicker (ticker, market = undefined) {
        let open = this.safeValue (ticker, 'open');
        let close = this.safeValue (ticker, 'close');
        let last = this.safeValue (ticker, 'last');
        let change = this.safeValue (ticker, 'change');
        let percentage = this.safeValue (ticker, 'percentage');
        let average = this.safeValue (ticker, 'average');
        let vwap = this.safeValue (ticker, 'vwap');
        const baseVolume = this.safeValue (ticker, 'baseVolume');
        const quoteVolume = this.safeValue (ticker, 'quoteVolume');
        if (vwap === undefined) {
            vwap = Precise.stringDiv (quoteVolume, baseVolume);
        }
        if ((last !== undefined) && (close === undefined)) {
            close = last;
        } else if ((last === undefined) && (close !== undefined)) {
            last = close;
        }
        if ((last !== undefined) && (open !== undefined)) {
            if (change === undefined) {
                change = Precise.stringSub (last, open);
            }
            if (average === undefined) {
                average = Precise.stringDiv (Precise.stringAdd (last, open), '2');
            }
        }
        if ((percentage === undefined) && (change !== undefined) && (open !== undefined) && Precise.stringGt (open, '0')) {
            percentage = Precise.stringMul (Precise.stringDiv (change, open), '100');
        }
        if ((change === undefined) && (percentage !== undefined) && (open !== undefined)) {
            change = Precise.stringDiv (Precise.stringMul (percentage, open), '100');
        }
        if ((open === undefined) && (last !== undefined) && (change !== undefined)) {
            open = Precise.stringSub (last, change);
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        return this.extend (ticker, {
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': this.safeNumber (ticker, 'bidVolume'),
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': this.safeNumber (ticker, 'askVolume'),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'open': this.parseNumber (open),
            'close': this.parseNumber (close),
            'last': this.parseNumber (last),
            'change': this.parseNumber (change),
            'percentage': this.parseNumber (percentage),
            'average': this.parseNumber (average),
            'vwap': this.parseNumber (vwap),
            'baseVolume': this.parseNumber (baseVolume),
            'quoteVolume': this.parseNumber (quoteVolume),
            'previousClose': this.safeNumber (ticker, 'previousClose'),
        });
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (!this.has['fetchTrades']) {
            throw new NotSupported (this.id + ' fetchOHLCV() is not supported yet');
        }
        await this.loadMarkets ();
        const trades = await this.fetchTrades (symbol, since, limit, params);
        const ohlcvc = this.buildOHLCVC (trades, timeframe, since, limit);
        const result = [];
        for (let i = 0; i < ohlcvc.length; i++) {
            result.push ([
                this.safeInteger (ohlcvc[i], 0),
                this.safeNumber (ohlcvc[i], 1),
                this.safeNumber (ohlcvc[i], 2),
                this.safeNumber (ohlcvc[i], 3),
                this.safeNumber (ohlcvc[i], 4),
                this.safeNumber (ohlcvc[i], 5),
            ]);
        }
        return result;
    }

    convertTradingViewToOHLCV (ohlcvs, timestamp = 't', open = 'o', high = 'h', low = 'l', close = 'c', volume = 'v', ms = false) {
        const result = [];
        const timestamps = this.safeValue (ohlcvs, timestamp, []);
        const opens = this.safeValue (ohlcvs, open, []);
        const highs = this.safeValue (ohlcvs, high, []);
        const lows = this.safeValue (ohlcvs, low, []);
        const closes = this.safeValue (ohlcvs, close, []);
        const volumes = this.safeValue (ohlcvs, volume, []);
        for (let i = 0; i < timestamps.length; i++) {
            result.push ([
                ms ? this.safeInteger (timestamps, i) : this.safeTimestamp (timestamps, i),
                this.safeValue (opens, i),
                this.safeValue (highs, i),
                this.safeValue (lows, i),
                this.safeValue (closes, i),
                this.safeValue (volumes, i),
            ]);
        }
        return result;
    }

    convertOHLCVToTradingView (ohlcvs, timestamp = 't', open = 'o', high = 'h', low = 'l', close = 'c', volume = 'v', ms = false) {
        const result = {};
        result[timestamp] = [];
        result[open] = [];
        result[high] = [];
        result[low] = [];
        result[close] = [];
        result[volume] = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            const ts = ms ? ohlcvs[i][0] : parseInt (ohlcvs[i][0] / 1000);
            result[timestamp].push (ts);
            result[open].push (ohlcvs[i][1]);
            result[high].push (ohlcvs[i][2]);
            result[low].push (ohlcvs[i][3]);
            result[close].push (ohlcvs[i][4]);
            result[volume].push (ohlcvs[i][5]);
        }
        return result;
    }

    marketIds (symbols) {
        if (symbols === undefined) {
            return symbols;
        }
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            result.push (this.marketId (symbols[i]));
        }
        return result;
    }

    marketSymbols (symbols) {
        if (symbols === undefined) {
            return symbols;
        }
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            result.push (this.symbol (symbols[i]));
        }
        return result;
    }

    marketCodes (codes) {
        if (codes === undefined) {
            return codes;
        }
        const result = [];
        for (let i = 0; i < codes.length; i++) {
            result.push (this.commonCurrencyCode (codes[i]));
        }
        return result;
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        bidasks = this.toArray (bidasks);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push (this.parseBidAsk (bidasks[i], priceKey, amountKey));
        }
        return result;
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        const orderbook = await this.fetchOrderBook (symbol, limit, params);
        return this.extend (orderbook, {
            'asks': this.sortBy (this.aggregate (orderbook['asks']), 0),
            'bids': this.sortBy (this.aggregate (orderbook['bids']), 0, true),
        });
    }

    filterBySymbol (objects, symbol = undefined) {
        if (symbol === undefined) {
            return objects;
        }
        const result = [];
        for (let i = 0; i < objects.length; i++) {
            const objectSymbol = this.safeString (objects[i], 'symbol');
            if (objectSymbol === symbol) {
                result.push (objects[i]);
            }
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        if (Array.isArray (ohlcv)) {
            return [
                this.safeInteger (ohlcv, 0), // timestamp
                this.safeNumber (ohlcv, 1), // open
                this.safeNumber (ohlcv, 2), // high
                this.safeNumber (ohlcv, 3), // low
                this.safeNumber (ohlcv, 4), // close
                this.safeNumber (ohlcv, 5), // volume
            ];
        }
        return ohlcv;
    }

    getNetwork (network, code) {
        network = network.toUpperCase ();
        const aliases = {
            'ETHEREUM': 'ETH',
            'ETHER': 'ETH',
            'ERC20': 'ETH',
            'ETH': 'ETH',
            'TRC20': 'TRX',
            'TRON': 'TRX',
            'TRX': 'TRX',
            'BEP20': 'BSC',
            'BSC': 'BSC',
            'HRC20': 'HT',
            'HECO': 'HT',
            'SPL': 'SOL',
            'SOL': 'SOL',
            'TERRA': 'LUNA',
            'LUNA': 'LUNA',
            'POLYGON': 'MATIC',
            'MATIC': 'MATIC',
            'EOS': 'EOS',
            'WAVES': 'WAVES',
            'AVALANCHE': 'AVAX',
            'AVAX': 'AVAX',
            'QTUM': 'QTUM',
            'CHZ': 'CHZ',
            'NEO': 'NEO',
            'ONT': 'ONT',
            'RON': 'RON',
        };
        if (network === code) {
            return network;
        } else if (network in aliases) {
            return aliases[network];
        } else {
            throw new NotSupported (this.id + ' network ' + network + ' is not yet supported');
        }
    }

    networkCodeToId (networkCode, currencyCode = undefined) {
        /**
         * @ignore
         * @method
         * @name exchange#networkCodeToId
         * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} networkCode unified network code
         * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {[string|undefined]} exchange-specific network id
         */
        const networkIdsByCodes = this.safeValue (this.options, 'networks', {});
        let networkId = this.safeString (networkIdsByCodes, networkCode);
        // for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if (networkId === undefined) {
            if (currencyCode === undefined) {
                // if currencyCode was not provided, then we just set passed value to networkId
                networkId = networkCode;
            } else {
                // if currencyCode was provided, then we try to find if that currencyCode has a replacement (i.e. ERC20 for ETH)
                const defaultNetworkCodeReplacements = this.safeValue (this.options, 'defaultNetworkCodeReplacements', {});
                if (currencyCode in defaultNetworkCodeReplacements) {
                    // if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    const replacementObject = defaultNetworkCodeReplacements[currencyCode]; // i.e. { 'ERC20': 'ETH' }
                    const keys = Object.keys (replacementObject);
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        const value = replacementObject[key];
                        // if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if (value === networkCode) {
                            networkId = this.safeString (networkIdsByCodes, key);
                            break;
                        }
                    }
                }
                // if it wasn't found, we just set the provided value to network-id
                if (networkId === undefined) {
                    networkId = networkCode;
                }
            }
        }
        return networkId;
    }

    networkIdToCode (networkId, currencyCode = undefined) {
        /**
         * @ignore
         * @method
         * @name exchange#networkIdToCode
         * @description tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve this, derived class needs to have 'options->networksById' defined.
         * @param {string} networkId unified network code
         * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {[string|undefined]} unified network code
         */
        const networkCodesByIds = this.safeValue (this.options, 'networksById', {});
        let networkCode = this.safeString (networkCodesByIds, networkId, networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if (currencyCode !== undefined) {
            const defaultNetworkCodeReplacements = this.safeValue (this.options, 'defaultNetworkCodeReplacements', {});
            if (currencyCode in defaultNetworkCodeReplacements) {
                const replacementObject = this.safeValue (defaultNetworkCodeReplacements, currencyCode, {});
                networkCode = this.safeString (replacementObject, networkCode, networkCode);
            }
        }
        return networkCode;
    }

    networkCodesToIds (networkCodes = undefined) {
        /**
         * @ignore
         * @method
         * @name exchange#networkCodesToIds
         * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {[string]|undefined} networkCodes unified network codes
         * @returns {[string|undefined]} exchange-specific network ids
         */
        if (networkCodes === undefined) {
            return undefined;
        }
        const ids = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCode = networkCodes[i];
            ids.push (this.networkCodeToId (networkCode));
        }
        return ids;
    }

    handleNetworkCodeAndParams (params) {
        const networkCodeInParams = this.safeString2 (params, 'networkCode', 'network');
        if (networkCodeInParams !== undefined) {
            params = this.omit (params, [ 'networkCode', 'network' ]);
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return [ networkCodeInParams, params ];
    }

    defaultNetworkCode (currencyCode) {
        let defaultNetworkCode = undefined;
        const defaultNetworks = this.safeValue (this.options, 'defaultNetworks', {});
        if (currencyCode in defaultNetworks) {
            // if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = defaultNetworks[currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            const defaultNetwork = this.safeValue (this.options, 'defaultNetwork');
            if (defaultNetwork !== undefined) {
                defaultNetworkCode = defaultNetwork;
            }
        }
        return defaultNetworkCode;
    }

    selectNetworkCodeFromUnifiedNetworks (currencyCode, networkCode, indexedNetworkEntries) {
        return this.selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, true);
    }

    selectNetworkIdFromRawNetworks (currencyCode, networkCode, indexedNetworkEntries) {
        return this.selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, false);
    }

    selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, isIndexedByUnifiedNetworkCode = false) {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        let chosenNetworkId = undefined;
        const availableNetworkIds = Object.keys (indexedNetworkEntries);
        const responseNetworksLength = availableNetworkIds.length;
        if (networkCode !== undefined) {
            if (responseNetworksLength === 0) {
                throw new NotSupported (this.id + ' - ' + networkCode + ' network did not return any result for ' + currencyCode);
            } else {
                // if networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
                const networkId = isIndexedByUnifiedNetworkCode ? networkCode : this.networkCodeToId (networkCode, currencyCode);
                if (networkId in indexedNetworkEntries) {
                    chosenNetworkId = networkId;
                } else {
                    throw new NotSupported (this.id + ' - ' + networkId + ' network was not found for ' + currencyCode + ', use one of ' + availableNetworkIds.join (', '));
                }
            }
        } else {
            if (responseNetworksLength === 0) {
                throw new NotSupported (this.id + ' - no networks were returned for ' + currencyCode);
            } else {
                // if networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                const defaultNetworkCode = this.defaultNetworkCode (currencyCode);
                const defaultNetworkId = isIndexedByUnifiedNetworkCode ? defaultNetworkCode : this.networkCodeToId (defaultNetworkCode, currencyCode);
                chosenNetworkId = (defaultNetworkId in indexedNetworkEntries) ? defaultNetworkId : availableNetworkIds[0];
            }
        }
        return chosenNetworkId;
    }

    safeNumber2 (dictionary, key1, key2, d = undefined) {
        const value = this.safeString2 (dictionary, key1, key2);
        return this.parseNumber (value, d);
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        const bids = this.parseBidsAsks (this.safeValue (orderbook, bidsKey, []), priceKey, amountKey);
        const asks = this.parseBidsAsks (this.safeValue (orderbook, asksKey, []), priceKey, amountKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const results = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            results.push (this.parseOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (results, 0);
        const tail = (since === undefined);
        return this.filterBySinceLimit (sorted, since, limit, 0, tail);
    }

    parseLeverageTiers (response, symbols = undefined, marketIdKey = undefined) {
        // marketIdKey should only be undefined when response is a dictionary
        symbols = this.marketSymbols (symbols);
        const tiers = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const id = this.safeString (item, marketIdKey);
            const market = this.safeMarket (id, undefined, undefined, this.safeString (this.options, 'defaultType'));
            const symbol = market['symbol'];
            const contract = this.safeValue (market, 'contract', false);
            if (contract && ((symbols === undefined) || this.inArray (symbol, symbols))) {
                tiers[symbol] = this.parseMarketLeverageTiers (item, market);
            }
        }
        return tiers;
    }

    async loadTradingLimits (symbols = undefined, reload = false, params = {}) {
        if (this.has['fetchTradingLimits']) {
            if (reload || !('limitsLoaded' in this.options)) {
                const response = await this.fetchTradingLimits (symbols);
                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];
                    this.markets[symbol] = this.deepExtend (this.markets[symbol], response[symbol]);
                }
                this.options['limitsLoaded'] = this.milliseconds ();
            }
        }
        return this.markets;
    }

    parsePositions (positions, symbols = undefined, params = {}) {
        symbols = this.marketSymbols (symbols);
        positions = this.toArray (positions);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = this.extend (this.parsePosition (positions[i], undefined), params);
            result.push (position);
        }
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    parseAccounts (accounts, params = {}) {
        accounts = this.toArray (accounts);
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = this.extend (this.parseAccount (accounts[i]), params);
            result.push (account);
        }
        return result;
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        trades = this.toArray (trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.extend (this.parseTrade (trades[i], market), params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const tail = (since === undefined);
        return this.filterBySymbolSinceLimit (result, symbol, since, limit, tail);
    }

    parseTransactions (transactions, currency = undefined, since = undefined, limit = undefined, params = {}) {
        transactions = this.toArray (transactions);
        let result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.extend (this.parseTransaction (transactions[i], currency), params);
            result.push (transaction);
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        const tail = (since === undefined);
        return this.filterByCurrencySinceLimit (result, code, since, limit, tail);
    }

    parseTransfers (transfers, currency = undefined, since = undefined, limit = undefined, params = {}) {
        transfers = this.toArray (transfers);
        let result = [];
        for (let i = 0; i < transfers.length; i++) {
            const transfer = this.extend (this.parseTransfer (transfers[i], currency), params);
            result.push (transfer);
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        const tail = (since === undefined);
        return this.filterByCurrencySinceLimit (result, code, since, limit, tail);
    }

    parseLedger (data, currency = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        const arrayData = this.toArray (data);
        for (let i = 0; i < arrayData.length; i++) {
            const itemOrItems = this.parseLedgerEntry (arrayData[i], currency);
            if (Array.isArray (itemOrItems)) {
                for (let j = 0; j < itemOrItems.length; j++) {
                    result.push (this.extend (itemOrItems[j], params));
                }
            } else {
                result.push (this.extend (itemOrItems, params));
            }
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        const tail = (since === undefined);
        return this.filterByCurrencySinceLimit (result, code, since, limit, tail);
    }

    nonce () {
        return this.seconds ();
    }

    setHeaders (headers) {
        return headers;
    }

    marketId (symbol) {
        const market = this.market (symbol);
        if (market !== undefined) {
            return market['id'];
        }
        return symbol;
    }

    symbol (symbol) {
        const market = this.market (symbol);
        return this.safeString (market, 'symbol', symbol);
    }

    resolvePath (path, params) {
        return [
            this.implodeParams (path, params),
            this.omit (params, this.extractParams (path)),
        ];
    }

    filterByArray (objects, key, values = undefined, indexed = true) {
        objects = this.toArray (objects);
        // return all of them if no values were passed
        if (values === undefined || !values) {
            return indexed ? this.indexBy (objects, key) : objects;
        }
        const results = [];
        for (let i = 0; i < objects.length; i++) {
            if (this.inArray (objects[i][key], values)) {
                results.push (objects[i]);
            }
        }
        return indexed ? this.indexBy (results, key) : results;
    }

    async fetch2 (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        if (this.enableRateLimit) {
            const cost = this.calculateRateLimiterCost (api, method, path, params, config, context);
            await this.throttle (cost);
        }
        this.lastRestRequestTimestamp = this.milliseconds ();
        const request = this.sign (path, api, method, params, headers, body);
        return await this.fetch (request['url'], request['method'], request['headers'], request['body']);
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        return await this.fetch2 (path, api, method, params, headers, body, config, context);
    }

    async loadAccounts (reload = false, params = {}) {
        if (reload) {
            this.accounts = await this.fetchAccounts (params);
        } else {
            if (this.accounts) {
                return this.accounts;
            } else {
                this.accounts = await this.fetchAccounts (params);
            }
        }
        this.accountsById = this.indexBy (this.accounts, 'id');
        return this.accounts;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTrades() is not supported yet');
    }

    async fetchOHLCVC (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (!this.has['fetchTrades']) {
            throw new NotSupported (this.id + ' fetchOHLCV() is not supported yet');
        }
        await this.loadMarkets ();
        const trades = await this.fetchTrades (symbol, since, limit, params);
        return this.buildOHLCVC (trades, timeframe, since, limit);
    }

    parseTradingViewOHLCV (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async editLimitBuyOrder (id, symbol, amount, price = undefined, params = {}) {
        return await this.editLimitOrder (id, symbol, 'buy', amount, price, params);
    }

    async editLimitSellOrder (id, symbol, amount, price = undefined, params = {}) {
        return await this.editLimitOrder (id, symbol, 'sell', amount, price, params);
    }

    async editLimitOrder (id, symbol, side, amount, price = undefined, params = {}) {
        return await this.editOrder (id, symbol, 'limit', side, amount, price, params);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.cancelOrder (id, symbol);
        return await this.createOrder (symbol, type, side, amount, price, params);
    }

    async fetchPermissions (params = {}) {
        throw new NotSupported (this.id + ' fetchPermissions() is not supported yet');
    }

    async fetchPosition (symbol, params = {}) {
        throw new NotSupported (this.id + ' fetchPosition() is not supported yet');
    }

    async fetchPositions (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchPositions() is not supported yet');
    }

    async fetchPositionsRisk (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchPositionsRisk() is not supported yet');
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchBidsAsks() is not supported yet');
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeNumber (bidask, priceKey);
        const amount = this.safeNumber (bidask, amountKey);
        return [ price, amount ];
    }

    safeCurrency (currencyId, currency = undefined) {
        if ((currencyId === undefined) && (currency !== undefined)) {
            return currency;
        }
        if ((this.currencies_by_id !== undefined) && (currencyId in this.currencies_by_id) && (this.currencies_by_id[currencyId] !== undefined)) {
            return this.currencies_by_id[currencyId];
        }
        let code = currencyId;
        if (currencyId !== undefined) {
            code = this.commonCurrencyCode (currencyId.toUpperCase ());
        }
        return {
            'id': currencyId,
            'code': code,
        };
    }

    safeMarket (marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const result = {
            'id': marketId,
            'symbol': marketId,
            'base': undefined,
            'quote': undefined,
            'baseId': undefined,
            'quoteId': undefined,
            'active': undefined,
            'type': undefined,
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': false,
            'margin': false,
            'contract': false,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'optionType': undefined,
            'strike': undefined,
            'settle': undefined,
            'settleId': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': undefined,
        };
        if (marketId !== undefined) {
            if ((this.markets_by_id !== undefined) && (marketId in this.markets_by_id)) {
                const markets = this.markets_by_id[marketId];
                const numMarkets = markets.length;
                if (numMarkets === 1) {
                    return markets[0];
                } else {
                    if (marketType === undefined) {
                        throw new ArgumentsRequired (this.id + ' safeMarket() requires a fourth argument for ' + marketId + ' to disambiguate between different markets with the same market id');
                    }
                    for (let i = 0; i < markets.length; i++) {
                        const market = markets[i];
                        if (market[marketType]) {
                            return market;
                        }
                    }
                }
            } else if (delimiter !== undefined) {
                const parts = marketId.split (delimiter);
                const partsLength = parts.length;
                if (partsLength === 2) {
                    result['baseId'] = this.safeString (parts, 0);
                    result['quoteId'] = this.safeString (parts, 1);
                    result['base'] = this.safeCurrencyCode (result['baseId']);
                    result['quote'] = this.safeCurrencyCode (result['quoteId']);
                    result['symbol'] = result['base'] + '/' + result['quote'];
                    return result;
                } else {
                    return result;
                }
            }
        }
        if (market !== undefined) {
            return market;
        }
        return result;
    }

    checkRequiredCredentials (error = true) {
        const keys = Object.keys (this.requiredCredentials);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.requiredCredentials[key] && !this[key]) {
                if (error) {
                    throw new AuthenticationError (this.id + ' requires "' + key + '" credential');
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    oath () {
        if (this.twofa !== undefined) {
            return this.totp (this.twofa);
        } else {
            throw new ExchangeError (this.id + ' exchange.twofa has not been set for 2FA Two-Factor Authentication');
        }
    }

    async fetchBalance (params = {}) {
        throw new NotSupported (this.id + ' fetchBalance() is not supported yet');
    }

    async fetchPartialBalance (part, params = {}) {
        const balance = await this.fetchBalance (params);
        return balance[part];
    }

    async fetchFreeBalance (params = {}) {
        return await this.fetchPartialBalance ('free', params);
    }

    async fetchUsedBalance (params = {}) {
        return await this.fetchPartialBalance ('used', params);
    }

    async fetchTotalBalance (params = {}) {
        return await this.fetchPartialBalance ('total', params);
    }

    async fetchStatus (params = {}) {
        if (this.has['fetchTime']) {
            const time = await this.fetchTime (params);
            this.status = this.extend (this.status, {
                'updated': time,
            });
        }
        return this.status;
    }

    async fetchFundingFee (code, params = {}) {
        const warnOnFetchFundingFee = this.safeValue (this.options, 'warnOnFetchFundingFee', true);
        if (warnOnFetchFundingFee) {
            throw new NotSupported (this.id + ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = false to suppress this warning');
        }
        return await this.fetchTransactionFee (code, params);
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        const warnOnFetchFundingFees = this.safeValue (this.options, 'warnOnFetchFundingFees', true);
        if (warnOnFetchFundingFees) {
            throw new NotSupported (this.id + ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = false to suppress this warning');
        }
        return await this.fetchTransactionFees (codes, params);
    }

    async fetchTransactionFee (code, params = {}) {
        if (!this.has['fetchTransactionFees']) {
            throw new NotSupported (this.id + ' fetchTransactionFee() is not supported yet');
        }
        return await this.fetchTransactionFees ([ code ], params);
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTransactionFees() is not supported yet');
    }

    async fetchDepositWithdrawFee (code, params = {}) {
        if (!this.has['fetchDepositWithdrawFees']) {
            throw new NotSupported (this.id + ' fetchDepositWithdrawFee() is not supported yet');
        }
        const fees = await this.fetchDepositWithdrawFees ([ code ], params);
        return this.safeValue (fees, code);
    }

    getSupportedMapping (key, mapping = {}) {
        if (key in mapping) {
            return mapping[key];
        } else {
            throw new NotSupported (this.id + ' ' + key + ' does not have a value in mapping');
        }
    }

    async fetchBorrowRate (code, params = {}) {
        await this.loadMarkets ();
        if (!this.has['fetchBorrowRates']) {
            throw new NotSupported (this.id + ' fetchBorrowRate() is not supported yet');
        }
        const borrowRates = await this.fetchBorrowRates (params);
        const rate = this.safeValue (borrowRates, code);
        if (rate === undefined) {
            throw new ExchangeError (this.id + ' fetchBorrowRate() could not find the borrow rate for currency code ' + code);
        }
        return rate;
    }

    handleOptionAndParams (params, methodName, optionName, defaultValue = undefined) {
        // This method can be used to obtain method specific properties, i.e: this.handleOptionAndParams (params, 'fetchPosition', 'marginMode', 'isolated')
        const defaultOptionName = 'default' + this.capitalize (optionName); // we also need to check the 'defaultXyzWhatever'
        // check if params contain the key
        let value = this.safeValue2 (params, optionName, defaultOptionName);
        if (value !== undefined) {
            params = this.omit (params, [ optionName, defaultOptionName ]);
        } else {
            // check if exchange has properties for this method
            const exchangeWideMethodOptions = this.safeValue (this.options, methodName);
            if (exchangeWideMethodOptions !== undefined) {
                // check if the option is defined in this method's props
                value = this.safeValue2 (exchangeWideMethodOptions, optionName, defaultOptionName);
            }
            if (value === undefined) {
                // if it's still undefined, check if global exchange-wide option exists
                value = this.safeValue2 (this.options, optionName, defaultOptionName);
            }
            // if it's still undefined, use the default value
            value = (value !== undefined) ? value : defaultValue;
        }
        return [ value, params ];
    }

    handleOption (methodName, optionName, defaultValue = undefined) {
        // eslint-disable-next-line no-unused-vars
        const [ result, empty ] = this.handleOptionAndParams ({}, methodName, optionName, defaultValue);
        return result;
    }

    handleMarketTypeAndParams (methodName, market = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'defaultType', 'type', 'spot');
        const methodOptions = this.safeValue (this.options, methodName);
        let methodType = defaultType;
        if (methodOptions !== undefined) {
            if (typeof methodOptions === 'string') {
                methodType = methodOptions;
            } else {
                methodType = this.safeString2 (methodOptions, 'defaultType', 'type', methodType);
            }
        }
        const marketType = (market === undefined) ? methodType : market['type'];
        const type = this.safeString2 (params, 'defaultType', 'type', marketType);
        params = this.omit (params, [ 'defaultType', 'type' ]);
        return [ type, params ];
    }

    handleSubTypeAndParams (methodName, market = undefined, params = {}, defaultValue = undefined) {
        let subType = undefined;
        // if set in params, it takes precedence
        const subTypeInParams = this.safeString2 (params, 'subType', 'defaultSubType');
        // avoid omitting if it's not present
        if (subTypeInParams !== undefined) {
            subType = subTypeInParams;
            params = this.omit (params, [ 'subType', 'defaultSubType' ]);
        } else {
            // at first, check from market object
            if (market !== undefined) {
                if (market['linear']) {
                    subType = 'linear';
                } else if (market['inverse']) {
                    subType = 'inverse';
                }
            }
            // if it was not defined in market object
            if (subType === undefined) {
                const values = this.handleOptionAndParams (undefined, methodName, 'subType', defaultValue); // no need to re-test params here
                subType = values[0];
            }
        }
        return [ subType, params ];
    }

    handleMarginModeAndParams (methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[string|undefined, object]} the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] this.options["marginMode"] or this.options["defaultMarginMode"]
         */
        return this.handleOptionAndParams (params, methodName, 'marginMode', defaultValue);
    }

    throwExactlyMatchedException (exact, string, message) {
        if (string in exact) {
            throw new exact[string] (message);
        }
    }

    throwBroadlyMatchedException (broad, string, message) {
        const broadKey = this.findBroadlyMatchedKey (broad, string);
        if (broadKey !== undefined) {
            throw new broad[broadKey] (message);
        }
    }

    findBroadlyMatchedKey (broad, string) {
        // a helper for matching error strings exactly vs broadly
        const keys = Object.keys (broad);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (string !== undefined) { // #issues/12698
                if (string.indexOf (key) >= 0) {
                    return key;
                }
            }
        }
        return undefined;
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        // it is a stub method that must be overrided in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        return this.safeValue (config, 'cost', 1);
    }

    async fetchTicker (symbol, params = {}) {
        if (this.has['fetchTickers']) {
            const tickers = await this.fetchTickers ([ symbol ], params);
            const ticker = this.safeValue (tickers, symbol);
            if (ticker === undefined) {
                throw new NullResponse (this.id + ' fetchTickers() could not find a ticker for ' + symbol);
            } else {
                return ticker;
            }
        } else {
            throw new NotSupported (this.id + ' fetchTicker() is not supported yet');
        }
    }

    async fetchTickers (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTickers() is not supported yet');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder() is not supported yet');
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        const order = await this.fetchOrder (id, symbol, params);
        return order['status'];
    }

    async fetchUnifiedOrder (order, params = {}) {
        return await this.fetchOrder (this.safeValue (order, 'id'), this.safeValue (order, 'symbol'), params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder() is not supported yet');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder() is not supported yet');
    }

    async cancelUnifiedOrder (order, params = {}) {
        return this.cancelOrder (this.safeValue (order, 'id'), this.safeValue (order, 'symbol'), params);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrders() is not supported yet');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOpenOrders() is not supported yet');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchClosedOrders() is not supported yet');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchMyTrades() is not supported yet');
    }

    async fetchTransactions (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTransactions() is not supported yet');
    }

    async fetchDeposits (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchDeposits() is not supported yet');
    }

    async fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchWithdrawals() is not supported yet');
    }

    async fetchDepositAddress (code, params = {}) {
        if (this.has['fetchDepositAddresses']) {
            const depositAddresses = await this.fetchDepositAddresses ([ code ], params);
            const depositAddress = this.safeValue (depositAddresses, code);
            if (depositAddress === undefined) {
                throw new InvalidAddress (this.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
            } else {
                return depositAddress;
            }
        } else {
            throw new NotSupported (this.id + ' fetchDepositAddress() is not supported yet');
        }
    }

    account () {
        return {
            'free': undefined,
            'used': undefined,
            'total': undefined,
        };
    }

    commonCurrencyCode (currency) {
        if (!this.substituteCommonCurrencyCodes) {
            return currency;
        }
        return this.safeString (this.commonCurrencies, currency, currency);
    }

    currency (code) {
        if (this.currencies === undefined) {
            throw new ExchangeError (this.id + ' currencies not loaded');
        }
        if (typeof code === 'string') {
            if (code in this.currencies) {
                return this.currencies[code];
            } else if (code in this.currencies_by_id) {
                return this.currencies_by_id[code];
            }
        }
        throw new ExchangeError (this.id + ' does not have currency code ' + code);
    }

    market (symbol) {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                return this.markets[symbol];
            } else if (symbol in this.markets_by_id) {
                const markets = this.markets_by_id[symbol];
                const defaultType = this.safeString2 (this.options, 'defaultType', 'defaultSubType', 'spot');
                for (let i = 0; i < markets.length; i++) {
                    const market = markets[i];
                    if (market[defaultType]) {
                        return market;
                    }
                }
                return markets[0];
            }
        }
        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol);
    }

    handleWithdrawTagAndParams (tag, params) {
        if (typeof tag === 'object') {
            params = this.extend (tag, params);
            tag = undefined;
        }
        if (tag === undefined) {
            tag = this.safeString (params, 'tag');
            if (tag !== undefined) {
                params = this.omit (params, 'tag');
            }
        }
        return [ tag, params ];
    }

    async createLimitOrder (symbol, side, amount, price, params = {}) {
        return await this.createOrder (symbol, 'limit', side, amount, price, params);
    }

    async createMarketOrder (symbol, side, amount, price = undefined, params = {}) {
        return await this.createOrder (symbol, 'market', side, amount, price, params);
    }

    async createLimitBuyOrder (symbol, amount, price, params = {}) {
        return await this.createOrder (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitSellOrder (symbol, amount, price, params = {}) {
        return await this.createOrder (symbol, 'limit', 'sell', amount, price, params);
    }

    async createMarketBuyOrder (symbol, amount, params = {}) {
        return await this.createOrder (symbol, 'market', 'buy', amount, undefined, params);
    }

    async createMarketSellOrder (symbol, amount, params = {}) {
        return await this.createOrder (symbol, 'market', 'sell', amount, undefined, params);
    }

    costToPrecision (symbol, cost) {
        const market = this.market (symbol);
        return this.decimalToPrecision (cost, TRUNCATE, market['precision']['price'], this.precisionMode, this.paddingMode);
    }

    priceToPrecision (symbol, price) {
        const market = this.market (symbol);
        const result = this.decimalToPrecision (price, ROUND, market['precision']['price'], this.precisionMode, this.paddingMode);
        if (result === '0') {
            throw new ArgumentsRequired (this.id + ' price of ' + market['symbol'] + ' must be greater than minimum price precision of ' + this.numberToString (market['precision']['price']));
        }
        return result;
    }

    amountToPrecision (symbol, amount) {
        const market = this.market (symbol);
        const result = this.decimalToPrecision (amount, TRUNCATE, market['precision']['amount'], this.precisionMode, this.paddingMode);
        if (result === '0') {
            throw new ArgumentsRequired (this.id + ' amount of ' + market['symbol'] + ' must be greater than minimum amount precision of ' + this.numberToString (market['precision']['amount']));
        }
        return result;
    }

    feeToPrecision (symbol, fee) {
        const market = this.market (symbol);
        return this.decimalToPrecision (fee, ROUND, market['precision']['price'], this.precisionMode, this.paddingMode);
    }

    currencyToPrecision (code, fee, networkCode = undefined) {
        const currency = this.currencies[code];
        let precision = this.safeValue (currency, 'precision');
        if (networkCode !== undefined) {
            const networks = this.safeValue (currency, 'networks', {});
            const networkItem = this.safeValue (networks, networkCode, {});
            precision = this.safeValue (networkItem, 'precision', precision);
        }
        if (precision === undefined) {
            return fee;
        } else {
            return this.decimalToPrecision (fee, ROUND, precision, this.precisionMode, this.paddingMode);
        }
    }

    safeNumber (object, key, d = undefined) {
        const value = this.safeString (object, key);
        return this.parseNumber (value, d);
    }

    safeNumberN (object, arr, d = undefined) {
        const value = this.safeStringN (object, arr);
        return this.parseNumber (value, d);
    }

    parsePrecision (precision) {
        if (precision === undefined) {
            return undefined;
        }
        return '1e' + Precise.stringNeg (precision);
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    implodeHostname (url) {
        return this.implodeParams (url, { 'hostname': this.hostname });
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        if (this.has['fetchLeverageTiers']) {
            const market = await this.market (symbol);
            if (!market['contract']) {
                throw new BadSymbol (this.id + ' fetchMarketLeverageTiers() supports contract markets only');
            }
            const tiers = await this.fetchLeverageTiers ([ symbol ]);
            return this.safeValue (tiers, symbol);
        } else {
            throw new NotSupported (this.id + ' fetchMarketLeverageTiers() is not supported yet');
        }
    }

    async createPostOnlyOrder (symbol, type, side, amount, price, params = {}) {
        if (!this.has['createPostOnlyOrder']) {
            throw new NotSupported (this.id + 'createPostOnlyOrder() is not supported yet');
        }
        const query = this.extend (params, { 'postOnly': true });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createReduceOnlyOrder (symbol, type, side, amount, price, params = {}) {
        if (!this.has['createReduceOnlyOrder']) {
            throw new NotSupported (this.id + 'createReduceOnlyOrder() is not supported yet');
        }
        const query = this.extend (params, { 'reduceOnly': true });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createStopOrder (symbol, type, side, amount, price = undefined, stopPrice = undefined, params = {}) {
        if (!this.has['createStopOrder']) {
            throw new NotSupported (this.id + ' createStopOrder() is not supported yet');
        }
        if (stopPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' create_stop_order() requires a stopPrice argument');
        }
        const query = this.extend (params, { 'stopPrice': stopPrice });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createStopLimitOrder (symbol, side, amount, price, stopPrice, params = {}) {
        if (!this.has['createStopLimitOrder']) {
            throw new NotSupported (this.id + ' createStopLimitOrder() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': stopPrice });
        return await this.createOrder (symbol, 'limit', side, amount, price, query);
    }

    async createStopMarketOrder (symbol, side, amount, stopPrice, params = {}) {
        if (!this.has['createStopMarketOrder']) {
            throw new NotSupported (this.id + ' createStopMarketOrder() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': stopPrice });
        return await this.createOrder (symbol, 'market', side, amount, undefined, query);
    }

    safeCurrencyCode (currencyId, currency = undefined) {
        currency = this.safeCurrency (currencyId, currency);
        return currency['code'];
    }

    filterBySymbolSinceLimit (array, symbol = undefined, since = undefined, limit = undefined, tail = false) {
        return this.filterByValueSinceLimit (array, 'symbol', symbol, since, limit, 'timestamp', tail);
    }

    filterByCurrencySinceLimit (array, code = undefined, since = undefined, limit = undefined, tail = false) {
        return this.filterByValueSinceLimit (array, 'currency', code, since, limit, 'timestamp', tail);
    }

    parseTickers (tickers, symbols = undefined, params = {}) {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         'marketId3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         { 'market': 'marketId3', ... },
        //         ...
        //     ]
        //
        const results = [];
        if (Array.isArray (tickers)) {
            for (let i = 0; i < tickers.length; i++) {
                const ticker = this.extend (this.parseTicker (tickers[i]), params);
                results.push (ticker);
            }
        } else {
            const marketIds = Object.keys (tickers);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket (marketId);
                const ticker = this.extend (this.parseTicker (tickers[marketId], market), params);
                results.push (ticker);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseDepositAddresses (addresses, codes = undefined, indexed = true, params = {}) {
        let result = [];
        for (let i = 0; i < addresses.length; i++) {
            const address = this.extend (this.parseDepositAddress (addresses[i]), params);
            result.push (address);
        }
        if (codes !== undefined) {
            result = this.filterByArray (result, 'currency', codes, false);
        }
        result = indexed ? this.indexBy (result, 'currency') : result;
        return result;
    }

    parseBorrowInterests (response, market = undefined) {
        const interests = [];
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            interests.push (this.parseBorrowInterest (row, market));
        }
        return interests;
    }

    parseFundingRateHistories (response, market = undefined, since = undefined, limit = undefined) {
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            rates.push (this.parseFundingRateHistory (entry, market));
        }
        const sorted = this.sortBy (rates, 'timestamp');
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    safeSymbol (marketId, market = undefined, delimiter = undefined, marketType = undefined) {
        market = this.safeMarket (marketId, market, delimiter, marketType);
        return market['symbol'];
    }

    parseFundingRate (contract, market = undefined) {
        throw new NotSupported (this.id + ' parseFundingRate() is not supported yet');
    }

    parseFundingRates (response, market = undefined) {
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const parsed = this.parseFundingRate (response[i], market);
            result[parsed['symbol']] = parsed;
        }
        return result;
    }

    isTriggerOrder (params) {
        const isTrigger = this.safeValue2 (params, 'trigger', 'stop');
        if (isTrigger) {
            params = this.omit (params, [ 'trigger', 'stop' ]);
        }
        return [ isTrigger, params ];
    }

    isPostOnly (isMarketOrder, exchangeSpecificParam, params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} type Order type
         * @param {boolean} exchangeSpecificParam exchange specific postOnly
         * @param {object} params exchange specific params
         * @returns {boolean} true if a post only order, false otherwise
         */
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        let postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
        // we assume timeInForce is uppercase from safeStringUpper (params, 'timeInForce')
        const ioc = timeInForce === 'IOC';
        const fok = timeInForce === 'FOK';
        const timeInForcePostOnly = timeInForce === 'PO';
        postOnly = postOnly || timeInForcePostOnly || exchangeSpecificParam;
        if (postOnly) {
            if (ioc || fok) {
                throw new InvalidOrder (this.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce);
            } else if (isMarketOrder) {
                throw new InvalidOrder (this.id + ' market orders cannot be postOnly');
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    async fetchTradingFees (params = {}) {
        throw new NotSupported (this.id + ' fetchTradingFees() is not supported yet');
    }

    async fetchTradingFee (symbol, params = {}) {
        if (!this.has['fetchTradingFees']) {
            throw new NotSupported (this.id + ' fetchTradingFee() is not supported yet');
        }
        return await this.fetchTradingFees (params);
    }

    parseOpenInterest (interest, market = undefined) {
        throw new NotSupported (this.id + ' parseOpenInterest () is not supported yet');
    }

    parseOpenInterests (response, market = undefined, since = undefined, limit = undefined) {
        const interests = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const interest = this.parseOpenInterest (entry, market);
            interests.push (interest);
        }
        const sorted = this.sortBy (interests, 'timestamp');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        if (this.has['fetchFundingRates']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            if (!market['contract']) {
                throw new BadSymbol (this.id + ' fetchFundingRate() supports contract markets only');
            }
            const rates = await this.fetchFundingRates ([ symbol ], params);
            const rate = this.safeValue (rates, symbol);
            if (rate === undefined) {
                throw new NullResponse (this.id + ' fetchFundingRate () returned no data for ' + symbol);
            } else {
                return rate;
            }
        } else {
            throw new NotSupported (this.id + ' fetchFundingRate () is not supported yet');
        }
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exchange#fetchMarkOHLCV
         * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchMarkOHLCV']) {
            const request = {
                'price': 'mark',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchMarkOHLCV () is not supported yet');
        }
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exchange#fetchIndexOHLCV
         * @description fetches historical index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchIndexOHLCV']) {
            const request = {
                'price': 'index',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchIndexOHLCV () is not supported yet');
        }
    }

    async fetchPremiumIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exchange#fetchPremiumIndexOHLCV
         * @description fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchPremiumIndexOHLCV']) {
            const request = {
                'price': 'premiumIndex',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchPremiumIndexOHLCV () is not supported yet');
        }
    }

    handleTimeInForce (params = {}) {
        /**
         * @ignore
         * @method
         * * Must add timeInForce to this.options to use this method
         * @return {string} returns the exchange specific value for timeInForce
         */
        const timeInForce = this.safeStringUpper (params, 'timeInForce'); // supported values GTC, IOC, PO
        if (timeInForce !== undefined) {
            const exchangeValue = this.safeString (this.options['timeInForce'], timeInForce);
            if (exchangeValue === undefined) {
                throw new ExchangeError (this.id + ' does not support timeInForce "' + timeInForce + '"');
            }
            return exchangeValue;
        }
        return undefined;
    }

    convertTypeToAccount (account) {
        /**
         * @ignore
         * @method
         * * Must add accountsByType to this.options to use this method
         * @param {string} account key for account name in this.options['accountsByType']
         * @returns the exchange specific account name or the isolated margin id for transfers
         */
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const lowercaseAccount = account.toLowerCase ();
        if (lowercaseAccount in accountsByType) {
            return accountsByType[lowercaseAccount];
        } else if ((account in this.markets) || (account in this.markets_by_id)) {
            const market = this.market (account);
            return market['id'];
        } else {
            return account;
        }
    }

    checkRequiredArgument (methodName, argument, argumentName, options = []) {
        /**
         * @ignore
         * @method
         * @param {string} argument the argument to check
         * @param {string} argumentName the name of the argument to check
         * @param {string} methodName the name of the method that the argument is being checked for
         * @param {[string]} options a list of options that the argument can be
         * @returns {undefined}
         */
        if ((argument === undefined) || ((options.length > 0) && (!(this.inArray (argument, options))))) {
            const messageOptions = options.join (', ');
            let message = this.id + ' ' + methodName + '() requires a ' + argumentName + ' argument';
            if (messageOptions !== '') {
                message += ', one of ' + '(' + messageOptions + ')';
            }
            throw new ArgumentsRequired (message);
        }
    }

    checkRequiredMarginArgument (methodName, symbol, marginMode) {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         * @param {string} marginMode is either 'isolated' or 'cross'
         */
        if ((marginMode === 'isolated') && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument for isolated margin');
        } else if ((marginMode === 'cross') && (symbol !== undefined)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() cannot have a symbol argument for cross margin');
        }
    }

    checkRequiredSymbol (methodName, symbol) {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         */
        this.checkRequiredArgument (methodName, symbol, 'symbol');
    }

    parseDepositWithdrawFees (response, codes = undefined, currencyIdKey = undefined) {
        /**
         * @ignore
         * @method
         * @param {[object]|object} response unparsed response from the exchange
         * @param {[string]|undefined} codes the unified currency codes to fetch transactions fees for, returns all currencies when undefined
         * @param {str|undefined} currencyIdKey *should only be undefined when response is a dictionary* the object key that corresponds to the currency id
         * @returns {object} objects with withdraw and deposit fees, indexed by currency codes
         */
        const depositWithdrawFees = {};
        codes = this.marketCodes (codes);
        const isArray = Array.isArray (response);
        let responseKeys = response;
        if (!isArray) {
            responseKeys = Object.keys (response);
        }
        for (let i = 0; i < responseKeys.length; i++) {
            const entry = responseKeys[i];
            const dictionary = isArray ? entry : response[entry];
            const currencyId = isArray ? this.safeString (dictionary, currencyIdKey) : entry;
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            const code = this.safeString (currency, 'code', currencyId);
            if ((codes === undefined) || (this.inArray (code, codes))) {
                depositWithdrawFees[code] = this.parseDepositWithdrawFee (dictionary, currency);
            }
        }
        return depositWithdrawFees;
    }

    depositWithdrawFee (info) {
        return {
            'info': info,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
    }

    assignDefaultDepositWithdrawFees (fee, currency = undefined) {
        /**
         * @ignore
         * @method
         * @description Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {object} fee A deposit withdraw fee structure
         * @param {object} currency A currency structure, the response from this.currency ()
         * @returns {object} A deposit withdraw fee structure
         */
        const networkKeys = Object.keys (fee['networks']);
        const numNetworks = networkKeys.length;
        if (numNetworks === 1) {
            fee['withdraw'] = fee['networks'][networkKeys[0]]['withdraw'];
            fee['deposit'] = fee['networks'][networkKeys[0]]['deposit'];
            return fee;
        }
        const currencyCode = this.safeString (currency, 'code');
        for (let i = 0; i < numNetworks; i++) {
            const network = networkKeys[i];
            if (network === currencyCode) {
                fee['withdraw'] = fee['networks'][networkKeys[i]]['withdraw'];
                fee['deposit'] = fee['networks'][networkKeys[i]]['deposit'];
            }
        }
        return fee;
    }
};
