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
                        'public/trading-pairs/get/all/',
                        'public/order-book/{pair}/'
                    ],
                },
                'private': {
                    'get': [
                       'private/balance/{currency}/',
                       'private/orders/get/all/',
                       'private/orders/get/{id}/',
                       'private/orders/get/{trading_pair}/'  
                    ],
                    'post' : [
                        'private/orders/add/limit/',
                        'private/orders/cancel/{id}/'
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
            body = this.urlencode (query);
            console.log(body)
            headers = {
                'key' : this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
                'Content-Type': 'application/x-www-form-urlencoded'
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);

        let orderbook = await this.publicGetPublicOrderBookPair (this.extend({
            'pair': market['id'],
        }, params));

        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        let parsedOrderbook = this.parseOrderBook (orderbook, timestamp);
        parsedOrderbook['nonce'] = this.nonce()
        return parsedOrderbook;
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

    nonce () {
        return this.milliseconds ();
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined) {
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
        return this.parseBalance (result);
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

    parseOrderStatus (status) {
        let statuses = {
            'open': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'canceled'
        };
        return (status in statuses) ? statuses[status] : status;
    }

    wait (ms) {return new Promise((r, j)=>setTimeout(r, ms))}

    async parseOrder (order, market = undefined) {
        
        // This wait is unreilable, often the orderId is not avaiuable on privateGetPrivateOrdersGetId when we call this immideately after createOrder.
        // TO DO: remove, return only id; leave to user to get order details in a separate call

        await this.wait(500)
        
        let fullOrder = await this.privateGetPrivateOrdersGetId({id : order.orderId})
        let status = this.parseOrderStatus (this.safeString (fullOrder, 'orderStatus'));
        let id = this.safeString (fullOrder, 'id');
        let side = this.safeString (fullOrder, 'type');
        let timestamp = (fullOrder['created'] * 1000).toString();
        //let timestamp = this.safeString (fullOrder, 'created');
        
        let symbol = undefined
        let feeCurrency = undefined
        let fee = undefined;
        let cost = undefined;
        let filled = undefined
        let amount = this.safeFloat (fullOrder, 'amount');
        let price = this.safeFloat(fullOrder, 'price')
        let remaining = this.safeFloat (fullOrder, 'remainingAmount');
        filled = amount - remaining;
        cost = price * filled

        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        fee = {
            'cost': undefined,
            'currency': feeCurrency,
        }
        let trades = []
        for (var i = 0; i < fullOrder.trades.length; i++) {
            fullOrder.trades[i]
            trades.push(this.parseTrade(fullOrder.trades[i]))
        };
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': fullOrder,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tradingPair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'side' : side,
            'price' : this.priceToPrecision (symbol, price)
        };

        let response = await this.privatePostPrivateOrdersAddLimit(this.extend (request, params))
        let order = this.parseOrder (response, market);
        return order
    }

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

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        //console.log(httpCode, reason, url, method, headers, body, response)
        //console.log(body, response)
    }

};

