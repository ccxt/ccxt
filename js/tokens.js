'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, InvalidNonce, DDoSProtection } = require ('./base/errors');

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
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createMarketOrder': false,
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
                'fetchOpenOrders': true,
                'fetchOrder': true,
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
                'logo': 'https://user-images.githubusercontent.com/4224211/52278879-67fcea80-2958-11e9-9cec-94a7333a9d7e.png',
                'api': 'https://api.tokens.net/',
                'www': 'https://www.tokens.net',
                'doc': 'https://www.tokens.net/api/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'public/ticker/{pair}/',
                        'public/ticker/{time}/{pair}/',
                        'public/trades/{time}/{pair}/',
                        'public/trading-pairs/get/all/',
                        'public/order-book/{pair}/',
                    ],
                },
                'private': {
                    'get': [
                        'private/balance/{code}/',
                        'private/orders/get/all/',
                        'private/orders/get/{id}/',
                        'private/orders/get/{pair}/',
                        'private/orders/get/all/',
                    ],
                    'post': [
                        'private/orders/add/limit/',
                        'private/orders/cancel/{id}/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.0 / 100,
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
                        'ETH': 0.005,
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
                        'XRP': 0.05,
                    },
                },
            },
            'exceptions': {
                '100': ArgumentsRequired,
                '101': ArgumentsRequired,
                '102': ArgumentsRequired,
                '110': InvalidNonce,
                '111': InvalidNonce,
                '120': BadRequest,
                '121': BadRequest,
                '130': BadRequest,
                '140': BadRequest,
                '150': BadRequest,
                '160': BadRequest,
                '429': DDoSProtection,
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
            headers = {
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetPublicTradingPairsGetAll ();
        let result = [];
        let keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i += 1) {
            let market = markets[keys[i]];
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
            let active = true;
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
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetPublicOrderBookPair (this.extend ({
            'pair': market['id'],
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        let parsedOrderbook = this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 1, 0);
        parsedOrderbook['nonce'] = this.nonce ();
        return parsedOrderbook;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetPublicTickerPair (this.extend ({
            'pair': this.marketId (symbol),
            'time': 'hour',
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicTradesTimePair (this.extend ({
            'pair': market['id'],
            'time': 'hour',
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchBalanceByCode (code, params = {}) {
        await this.loadMarkets ();
        let result = {};
        let response = await this.privateGetPrivateBalanceCode ({ 'code': code });
        result['free'] = this.safeFloat (response, 'available');
        result['used'] = 0.0;
        result['total'] = this.safeFloat (response, 'total');
        result['info'] = response;
        return result;
    }

    async fetchBalance (params = {}) {
        let codes = this.safeValue (this.options, 'fetchBalanceCurrencies');
        if (codes === undefined)
            codes = this.safeValue (params, 'codes');
        if ((codes === undefined) || (!Array.isArray (codes))) {
            throw new ExchangeError (this.id + ' fetchBalance() requires a `codes` parameter (an array of currency codes)');
        }
        await this.loadMarkets ();
        let result = {};
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            result[code] = await this.fetchBalanceByCode (code);
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
        if (market !== undefined) {
            price = this.safeFloat (trade, market['symbolId'], price);
            amount = this.safeFloat (trade, market['baseId'], amount);
            cost = this.safeFloat (trade, market['quoteId'], cost);
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
            'amount': amount,
            'id': id,
            'info': trade,
            'order': undefined,
            'price': price,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': undefined,
            'side': side,
            'symbol': symbol,
            'cost': cost,
        };
    }

    parseOrderStatus (status) {
        let statuses = {
            'open': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    async parseOrder (order, market = undefined) {
        market = this.markets_by_id[order['currencyPair']];
        let status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        let id = this.safeString (order, 'id');
        let side = this.safeString (order, 'type');
        let timestamp = (order['created'] * 1000).toString ();
        let symbol = undefined;
        let feeCurrency = undefined;
        let fee = undefined;
        let cost = undefined;
        let filled = undefined;
        let amount = this.safeFloat (order, 'amount');
        let price = this.safeFloat (order, 'price');
        let remaining = this.safeFloat (order, 'remainingAmount');
        filled = amount - remaining;
        cost = price * filled;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        fee = {
            'cost': undefined,
            'currency': feeCurrency,
        };
        let trades = [];
        if (order['trades'] !== undefined) {
            let orderTrades = order['trades'];
            for (let i = 0; i < orderTrades.length; i++) {
                trades.push (this.parseTrade (orderTrades[i], market));
            }
        }
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
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tradingPair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'side': side,
            'price': this.priceToPrecision (symbol, price),
        };
        let response = await this.privatePostPrivateOrdersAddLimit (this.extend (request, params));
        let timestamp = (response['timestamp'] * 1000).toString ();
        return {
            'info': response,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'id': this.safeString (response, 'orderId'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostPrivateOrdersCancelId ({ 'id': id });
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        let order = await this.privateGetPrivateOrdersGetId ({ 'id': id });
        return this.parseOrderStatus (this.safeString (order, 'orderStatus'));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetPrivateOrdersGetId ({ 'id': id });
        let parsed = this.parseOrder (order);
        return parsed;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPrivateOrdersGetAll ();
        const result = [];
        for (let i = 0; i < response['openOrders'].length; i++) {
            let orderToBeParsed = response['openOrders'][i];
            this.extend (orderToBeParsed, {
                'status': 'open',
            });
            const order = await this.parseOrder (orderToBeParsed);
            result.push (order);
        }
        if (symbol === undefined) {
            return this.filterBySinceLimit (result, since, limit);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
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
        if (typeof body !== 'string')
            return;
        if (body.length < 2)
            return;
        if ((body[0] === '{') || (body[0] === '[')) {
            let error = this.safeString (response, 'errorCode');
            let reason = this.safeString (response, 'reason');
            let exceptions = this.exceptions;
            if (error in exceptions) {
                throw new exceptions[error] (reason);
            }
            let status = this.safeString (response, 'status');
            if (status === 'error') {
                throw new ExchangeError (reason);
            }
        }
    }
};

