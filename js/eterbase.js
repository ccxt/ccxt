'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------
module.exports = class eterbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'eterbase',
            'name': 'ETERBASE',
            'countries': [ 'SK' ],
            'rateLimit': 500,
            'certified': false,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBidsAsks': false,
                'fetchTrades': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
                '1w': '10080',
            },
            'urls': {
                'logo': 'https://www.eterbase.com/wp-content/uploads/2019/09/Eterbase-Logo-Horizontal-1024x208.png',
                'base': 'https://api.eterbase.exchange',
                'api': 'https://api.eterbase.exchange/api',
                'www': 'https://www.eterbase.com',
                'doc': 'https://developers.eterbase.exchange',
                'fees': 'https://www.eterbase.com/exchange/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'assets',
                        'markets',
                        'tickers',
                        'markets/{id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/balances',
                        'accounts/{id}/orders',
                        'accounts/{id}/fills',
                        'orders/{id}',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.09,
                    'maker': 0.09,
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    findMarket (id) {
        // need to pass identifier as string
        const idString = id.toString ();
        return super.findMarket (idString);
    }

    sign (path, api = 'public', method = 'GET', params = {}, httpHeaders = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            // construct signature
            const hasBody = (method === 'POST') || (method === 'PUT') || (method === 'PATCH');
            // const date = 'Mon, 30 Sep 2019 13:57:23 GMT';
            const date = this.rfc2616 (this.milliseconds ());
            const urlBaselength = this.urls['base'].length - 0;
            const urlPath = url.slice (urlBaselength);
            let headersCSV = 'date' + ' ' + 'request-line';
            // eslint-disable-next-line quotes
            let message = 'date' + ':' + ' ' + date + "\n" + method + ' ' + urlPath + ' HTTP/1.1';
            let digest = '';
            if (hasBody) {
                digest = 'SHA-256=' + this.hash (payload, 'sha256', 'base64');
                // eslint-disable-next-line quotes
                message = message + "\ndigest" + ':' + ' ' + digest;
                headersCSV = headersCSV + ' ' + 'digest';
            }
            const sig = this.hmac (message, this.secret, 'sha256', 'base64');
            // eslint-disable-next-line quotes
            const authorizationHeader = "hmac username=\"" + this.apiKey + "\",algorithm=\"hmac-sha256\",headers=\"" + headersCSV + "\",signature=\"" + sig + "\"";
            httpHeaders = {
                'Date': date,
                'Authorization': authorizationHeader,
                'Content-Type': 'application/json',
            };
            if (hasBody) {
                httpHeaders = this.extend (httpHeaders, { 'Digest': digest });
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': httpHeaders };
    }

    parseMarket (raw) {
        const baseId = this.safeString (raw, 'base');
        const quoteId = this.safeString (raw, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const state = this.safeString (raw, 'state');
        const active = state.toUpperCase () === 'TRADING';
        const rules = this.safeValue (raw, 'tradingRules');
        let qtyMin = undefined;
        let qtyMax = undefined;
        let costMin = undefined;
        let costMax = undefined;
        let rule = undefined;
        if (rules) {
            for (let i = 0; i < rules.length; i++) {
                rule = rules[i];
                const attribute = this.safeValue (rule, 'attribute');
                const condition = this.safeValue (rule, 'condition');
                const value = this.safeValue (rule, 'value');
                if ((attribute === 'Qty') && (condition === 'Min')) {
                    qtyMin = value;
                } else if ((attribute === 'Qty') && (condition === 'Max')) {
                    qtyMax = value;
                } else if ((attribute === 'Cost') && (condition === 'Min')) {
                    costMin = value;
                } else if ((attribute === 'Cost') && (condition === 'Max')) {
                    costMax = value;
                }
            }
        }
        const result = {
            'id': this.safeString (raw, 'id'),
            'baseId': baseId,
            'quoteId': quoteId,
            'base': base,
            'quote': quote,
            'symbol': symbol,
            'active': active,
            'limits': {
                'amount': {
                    'min': qtyMin,
                    'max': qtyMax,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': costMin,
                    'max': costMax,
                },
            },
            'precision': {
                'price': 8,
                'amount': 8,
                'cost': 8,
            },
            'info': raw,
        };
        return result;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        const result = [];
        if (markets) {
            for (let i = 0; i < markets.length; i++) {
                const market = this.parseMarket (markets[i]);
                result.push (market);
            }
        }
        return result;
    }

    parseTicker (raw) {
        const id = this.safeInteger (raw, 'marketId');
        const market = this.findMarket (id);
        const timestamp = this.safeInteger (raw, 'time');
        const price = this.safeFloat (raw, 'price');
        const result = {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'last': price,
            'high': this.safeFloat (raw, 'high'),
            'low': this.safeFloat (raw, 'low'),
            'change': this.safeFloat (raw, 'change'),
            'baseVolume': this.safeFloat (raw, 'volumeBase'),
            'quoteVolume': this.safeFloat (raw, 'volume'),
            'ask': undefined,
            'askVolume': undefined,
            'average': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'close': price,
            'open': undefined,
            'percentage': undefined,
            'previousClose': undefined,
            'vwap': undefined,
            'info': raw,
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const rawTickers = await this.publicGetTickers (params);
        let raw = undefined;
        if (rawTickers) {
            for (let i = 0; i < rawTickers.length; i++) {
                if (this.safeString (rawTickers[i], 'marketId') === market['id']) {
                    raw = rawTickers[i];
                    break;
                }
            }
        }
        const result = this.parseTicker (raw);
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.publicGetTickers (params);
        const result = [];
        if (rawTickers) {
            for (let i = 0; i < rawTickers.length; i++) {
                result.push (this.parseTicker (rawTickers[i]));
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (raw, market) {
        const price = this.safeFloat (raw, 'price');
        const qty = this.safeFloat (raw, 'qty');
        const fee = this.safeFloat (raw, 'fee');
        const feeAsset = this.safeString (raw, 'feeAsset');
        let cost = this.safeFloat (raw, 'qty');
        if (!cost) {
            cost = Math.round (price * qty, market.precision.cost);
        }
        let timestamp = this.safeInteger (raw, 'executedAt');
        if (!timestamp) {
            timestamp = this.safeInteger (raw, 'filledAt');
        }
        const rawSide = this.safeString (raw, 'side');
        const side = rawSide === '1' ? 'buy' : 'sell';
        const rawLiquidity = this.safeString (raw, 'liquidity');
        const liquidity = rawLiquidity === '1' ? 'maker' : 'taker';
        const orderId = this.safeString (raw, 'orderId');
        return {
            'symbol': market['symbol'],
            'id': this.safeString (raw, 'id'),
            'side': side,
            'price': price,
            'amount': qty,
            'cost': cost,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'takerOrMaker': liquidity,
            'order': orderId,
            'type': undefined,
            'fee': {
                'cost': fee,
                'currency': this.safeCurrencyCode (feeAsset),
            },
            'info': raw,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetMarketsIdTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.uid,
        };
        const rawBalances = await this.privateGetAccountsIdBalances (this.extend (request, params));
        const result = { 'info': rawBalances };
        if (rawBalances) {
            for (let i = 0; i < rawBalances.length; i++) {
                const rawBalance = rawBalances[i];
                const assetId = this.safeString (rawBalance, 'assetId');
                const assetCode = this.safeCurrencyCode (assetId);
                const account = {
                    'free': this.safeFloat (rawBalance, 'available'),
                    'used': this.safeFloat (rawBalance, 'reserved'),
                    'total': this.safeFloat (rawBalance, 'balance'),
                };
                result[assetCode] = account;
            }
        }
        return this.parseBalance (result);
    }

    parseOrder (raw, market = undefined) {
        if (market === undefined) {
            const marketId = this.safeInteger (raw, 'marketId');
            market = this.findMarket (marketId);
        }
        const id = this.safeString (raw, 'id');
        const timestamp = this.safeInteger (raw, 'placedAt');
        const rawSide = this.safeString (raw, 'side');
        const side = rawSide === '1' ? 'buy' : 'sell';
        const rawType = this.safeString (raw, 'type');
        let type = undefined;
        if (rawType === '1') {
            type = 'market';
        } else if (rawType === '2') {
            type = 'limit';
        } else if (rawType === '3') {
            type = 'market';
        } else {
            type = 'limit';
        }
        let price = this.safeFloat (raw, 'limitPrice');
        const amount = this.safeFloat (raw, 'qty');
        const remaining = this.safeFloat (raw, 'remainingQty');
        let filled = amount - remaining;
        if (filled > 0) {
            filled = Math.round (filled, market.precision.qty);
        }
        const cost = Math.round (price * filled, market.precision.cost);
        const rawState = this.safeString (raw, 'state');
        const state = rawState.toUpperCase () === '4' ? 'closed' : 'open';
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                    }
                }
            }
        }
        const fee = undefined;
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = Math.round (cost / filled, market.precision.qty);
            }
        }
        return {
            'info': raw,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market.symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': state,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        if (this.safeString (params, 'state') === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a state argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const yesterdayTimestamp = this.now () - 86400;
        const request = {
            'id': this.uid,
            'marketId': market['id'],
            'state': 'ACTIVE',
            'from': yesterdayTimestamp,
            'limit': 10,
            'offset': 0,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAccountsIdOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        }
        const orders = await this.fetchOrders (symbol, since, limit, this.extend ({ 'state': 'INACTIVE' }, params));
        return orders;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        const orders = await this.fetchOrders (symbol, since, limit, this.extend ({ 'state': 'ACTIVE' }, params));
        return orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const yesterdayTimestamp = this.now () - 86400;
        const request = {
            'id': this.uid,
            'marketId': market['id'],
            'from': yesterdayTimestamp,
            'limit': 10,
            'offset': 0,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAccountsIdFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        type = undefined;
        if (uppercaseType === 'MARKET') {
            type = 1;
        } else if (uppercaseType === 'LIMIT') {
            type = 2;
        } else if (uppercaseType === 'STOPMARKET') {
            type = 3;
        } else {
            type = 4;
        }
        const uppercaseSide = side.toUpperCase ();
        side = uppercaseSide === 'BUY' ? 1 : 2;
        const request = {
            'accountId': this.uid,
            'marketId': market['id'],
            'type': type,
            'side': side,
        };
        if ((uppercaseType === 'MARKET') && (uppercaseSide === 'BUY')) {
            // for market buy it requires the amount of quote currency to spend
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    amount = amount * price;
                }
            }
            request['cost'] = this.amountToPrecision (symbol, amount);
        } else {
            request['qty'] = this.amountToPrecision (symbol, amount);
        }
        if (uppercaseType === 'LIMIT') {
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        request['postOnly'] = false;
        request['timeInForce'] = 'GTC';
        const response = await this.privatePostOrders (this.extend (request, params));
        return {
            'id': this.safeString (response, 'id'),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = [];
        return this.parseOrderBook (response, this.safeInteger (response, 'timestamp'));
    }
};
