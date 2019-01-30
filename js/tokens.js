'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, NotSupported, PermissionDenied, InvalidNonce, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------



module.exports = class tokens extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokens',
            'name': 'Tokens',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'certified': false,
            //'version': 'v1',
            'has': {
                'fetchDepositAddress': false,
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createMarketOrder': true,
                'createLimitOrder': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': true,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'urls': {
                // 'logo': '',
                'api': 'https://api.tokens.net/',
                'www': 'https://www.tokens.net',
                'doc': 'https://www.tokens.net/api/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            },
            'api': {
                'public': {
                    'get': [
                        'public/ticker/{pair}/',
                        'public/ticker/{time}/{pair}/',
                        'public/trades/{time}/{pair}/',
                        // 'public/trades/minute/{pair}/',
                        // 'public/trades/hour/{pair}/',
                        // 'public/trades/day/{pair}/',
                        'public/trading-pairs/get/all/',
                        'public/order-book/{pair}/'
                    ],
                },
                'private': {
                    'get': [
                       'private/balance/',
                       'private/balance/{currency}/',
                       'private/orders/get/all/',
                       'private/orders/get/{id}/',
                       'private/orders/get/{trading_pair}/'  
                    ],
                    'post' : [
                        '/private/orders/add/limit/',
                        '/private/orders/cancel/{id}/'
                    ]
                }
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.0 / 100
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ADA': 15,
                        'BAT': 2,
                        'BCH': 0.0001,
                        'BIT': 30,
                        'BSV': 0.0001,
                        'BTC': 0.0002,
                        'DAI': 1,
                        'DPP': 100,
                        'DTR': 30,
                        'ELI': 100,
                        'ETH':0.005,
                        'EURS': 1.5,
                        'GUSD': 1,
                        'LANA': 5000,
                        'LTC': 0.002,
                        'MRP': 100,
                        'PAX': 1,
                        'TAJ': 300,
                        'TUSD': 1,
                        'USDC': 1,
                        'USDT-ERC': 1,
                        'USDT-OMNI': 3,
                        'VTY': 300,
                        'XAUR': 15,
                        'XLM': 0.1,
                        'XRM': 0.0001,
                        'XRP' : 0.05
                    }
                },
            },
            'exceptions': {
                // 100 API Key is missing
                // 101 Nonce is missing
                // 102 Signature is missing
                // 110 Nonce has to be integer
                // 111 Provided nonce is less or equal to the last nonce
                // 120 Invalid API key
                // 121 Signature is invalid
                // 130 Invalid trading pair
                // 131 Invalid order id
                // 140 Only opened orders can be canceled
                // 150 Parameter {parameter} is invalid with error: {error}
                // 160 Invalid currency code
                // 429 API rate limit exceeded
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.apiKey;
            let signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            headers = {
                'key' : this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetPublicTradingPairsGetAll ();
        let result = [];
        for(var key in markets) {
            let market = markets[key];
            let symbol = market['title'];
            let [ base, quote ] = symbol.split ('/');
            let baseId = base.toLowerCase ();
            let quoteId = quote.toLowerCase ();
            let symbolId = baseId + '_' + quoteId;
            let id = baseId + quoteId;

            let precision = {
                'amount': market['priceDecimals'],
                'price': market['amountDecimals'],
            };
            let parts = market['minAmount'].split (' ');
            let cost = parts[0];
            // let [ cost, currency ] = market['minimum_order'].split (' ');
            let active = (market['trading'] === 'Enabled');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'symbolId': symbolId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
            });
        }
        return result
    }

    async parseOrderBook(orderbook, market) {

        orderbook.asks = orderbook.asks.map((item) => {
            return [parseFloat(item[1]), parseFloat(item[0])];
        });

        orderbook.bids = orderbook.bids.map((item) => {
            return [parseFloat(item[1]), parseFloat(item[0])];
        });

        return {
            asks: orderbook.asks,
            bids: orderbook.bids,
            datetime: this.iso8601(orderbook.timestamp),
            timestamp: orderbook.timestamp * 1000,
            nonce: parseInt((Math.floor(Math.random() * 9999) + 1000).toString() + orderbook.timestamp.toString(), 10),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetPublicOrderBookPair (this.extend({
            'pair': market['id'],
        }, params));

        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTicker (symbol, params = { time: 'hour'}) {
         await this.loadMarkets ();
        let ticker = await this.publicGetPublicTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let vwap = this.safeFloat (ticker, 'vwap');
        let baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined)
            quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }


    parseTrade (trade, market = undefined) {
        let side = this.safeString (trade, 'type');
        let symbol = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let id = this.safeString2 (trade, 'tid', 'id');
        let timestamp = parseInt (trade['datetime']) * 1000;
        let cost = this.safeFloat (trade, 'cost');
        let feeCurrency = undefined;
        if (market !== undefined) {
            price = this.safeFloat (trade, market['symbolId'], price);
            amount = this.safeFloat (trade, market['baseId'], amount);
            cost = this.safeFloat (trade, market['quoteId'], cost);
            feeCurrency = market['quote'];
            symbol = market['symbol'];
        }
        if (cost === undefined) {
            if (price !== undefined) {
                if (amount !== undefined) {
                    cost = price * amount;
                }
            }
        }
        if (cost !== undefined) {
            cost = Math.abs (cost);
        }
        return {
            amount: amount,
            id: id,
            info: trade,
            order: undefined,
            price: price,
            timestamp: timestamp,
            datetime: this.iso8601 (timestamp),
            type: undefined,
            side: side,
            symbol: symbol,
            cost: cost
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined) {
        //this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (trades.trades)) {
        //     throw new ExchangeError (this.id + ' parseTrades expected an array in the trades argument, but got ' + typeof trades);
        // }
        // console.log(trades)
        if (trades.trades.length === 0) {
            return [];
        }
        let result = Object.values (trades.trades).map (trade => this.parseTrade (trade, market))
        result = this.sortBy (result, 'timestamp')
        let symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = { time : 'hour'}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicTradesTimePair (this.extend ({
            'pair': market['id']
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (currency = undefined) {
        await this.loadMarkets ();
        //let results = []
        let result = {};
        if (typeof currency === 'undefined' ) {
            result['info'] = []
            for (var key in this.currencies) {
                let res = await this.privateGetPrivateBalanceCurrency({'currency' : key})
                let account = this.account ();
                account['free'] =  parseFloat (res.available)
                account['used'] =  0.0
                account['total'] = parseFloat (res.total) 
                result[key] = account
                result['info'].push(res)
            }
        } else {
            let res = await this.privateGetPrivateBalanceCurrency({'currency' : currency})
            let account = this.account ();
            account['free'] =  parseFloat (res.available)
            account['used'] =  0.0
            account['total'] = parseFloat (res.total) 
            result[res.currency] = account
            result['info'] = res
        }
        //let res = await this.privateGetPrivateOrdersGetAll()
        return this.parseBalance (result);
        //return result
    }

    // async createOrder (symbol, type, side, amount, price = undefined, params = {}) {}

    // async cancelOrder (id, symbol = undefined, params = {}) {}

    // async fetchOrderStatus (id, symbol = undefined, params = {}) {}

    // async fetchOrder (id, symbol = undefined, params = {}) {}

    // async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {}

    // async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {}

    // async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {}

    // async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {}

    // async fetchDepositAddress (code, params = {}) {}

    // async withdraw (code, amount, address, tag = undefined, params = {}) {}

    // error example:
    // {
    // "timestamp": 1234567890,
    // "status": error,
    // "errorCode": 100,
    // "reason": API Key is missing
    // }

    // handleErrors (httpCode, reason, url, method, headers, body, response) {
    //     //console.log(httpCode, reason, url, method, headers)
    // }

};

