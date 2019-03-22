'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class latoken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'latoken',
            'name': 'Latoken',
            'countries': [ 'VG' ],
            'version': 'v1',
            'rateLimit': 1500,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'createDepositAddress': false,
                'deposit': false,
                'fetchClosedOrders': true,
                'fetchDepositAddress': false,
                'fetchTradingFees': false,
                'fetchFundingFees': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchTickers': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
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
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/6286552/54519214-0f693600-4977-11e9-9ff4-6ea2f62875b0.png',
                'api': {
                    'v1': 'https://api.latoken.com/v1',
                },
                'www': 'https://www.latoken.com',
                'doc': [
                    'https://docs.latoken.com/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'time',
                        'orderbook/l2/',
                        'symbols',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'account/trades',
                        'account/orders',
                    ],
                    'post': [
                        'account/order',
                    ],
                    'delete': [
                        'account/order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'options': {
                'timeframe': 5 * 1000, // 5 sec, default
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let baseId = market['baseAsset'];
            let quoteId = market['quoteAsset'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'price': market['pricePrecision'],
                'amount': market['volumePrecision'],
            };
            let limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minQty'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            };
            limits['cost'] = {
                'min': market['volumePrecision'],
                'max': undefined,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountBalances (params);
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['asset'];
            let account = this.account ();
            account['total'] = parseFloat (balance['amount']);
            account['used'] = this.sum (parseFloat (balance['blocked']), parseFloat (balance['pending']));
            account['free'] = account['total'] - account['used'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
        };
        let orderbook = await this.publicGetOrderbookL2 (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (parseFloat (trade['timestamp']));
        let side = this.safeString (trade, 'side');
        let orderId = this.safeString (trade, 'orderId');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'size');
        let cost = price * amount;
        let fee = undefined;
        let takerOrMaker = undefined;
        if ('isMaker' in trade)
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        return {
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
        };
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
        };
        if (since !== undefined)
            request['start'] = parseInt (since);
        let response = await this.privateGetAccountTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = type;
        amount = this.amountToPrecision (symbol, amount);
        let order = {
            'symbol': this.marketId (symbol),
            'quantity': amount,
            'side': side,
            'type': orderType,
        };
        if (type === 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        let result = await this.privatePostAccountOrder (this.extend (order, params));
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteAccountOrder (this.extend ({ 'orderId': id }, params));
    }

    parseOrderStatus (status) {
        let statuses = {
            'active': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = order['timestamp'];
        let side = this.safeString (order['side']);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'executedSize');
        let remaining = this.safeFloat (order, 'openSize');
        let id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'type');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchFilledOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus ('filled', symbol, since, limit, params);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            'status': status,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetAccountOrders (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        return orders;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['v1'];
        url += '/' + path;
        headers = {
            'Content-Type': 'application/json',
            'x-lat-timestamp': this.nonce (),
            'x-lat-timeframe': this.options['timeframe'],
        };
        let query = this.urlencode (params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let dataToSign = '/v1/' + path;
            if (query !== '') {
                dataToSign += '?' + query;
            }
            const signature = this.hmac (this.encode (dataToSign), this.encode (this.secret));
            headers = {
                'x-lat-apikey': this.apiKey,
                'x-lat-signature': signature,
            };
        }
        if (Object.keys (params).length) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        const msg = this.safeString (response, 'error');
        const success = this.safeValue (response, 'success', true);
        if (msg !== undefined) {
            throw new ExchangeError (msg);
        }
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
