'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidOrder } = require ('./base/errors');

// ----------------------------------------------------------------------------
module.exports = class eterbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'eterbase',
            'name': 'ETERBASE',
            'countries': [ 'SK' ],
            'rateLimit': 500,
            'certified': false,
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
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
                'api': 'https://api.eterbase.exchange',
                'www': 'https://www.eterbase.com',
                'doc': 'https://developers.eterbase.exchange',
                'fees': 'https://www.eterbase.com/exchange/fees',
            },
            'api': {
                'markets': {
                    'get': [
                        'id/order-book',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'assets',
                        'markets',
                        'tickers',
                        'tickers/{id}/ticker',
                        'markets/{id}/trades',
                        'markets/{id}/ohlcv',
                        'wstoken',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/balances',
                        'accounts/{id}/withdrawals',
                        'accounts/{id}/orders',
                        'accounts/{id}/fills',
                        'orders/{id}/fills',
                        'orders/{id}',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
                'feed': {
                    'get': [
                        'feed',
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "id":33,
        //             "symbol":"ETHUSDT",
        //             "base":"ETH",
        //             "quote":"USDT",
        //             "priceSigDigs":5,
        //             "qtySigDigs":8,
        //             "costSigDigs":8,
        //             "verificationLevelUser":1,
        //             "verificationLevelCorporate":11,
        //             "group":"USD",
        //             "tradingRules":[
        //                 {"attribute":"Qty","condition":"Min","value":0.006},
        //                 {"attribute":"Qty","condition":"Max","value":1000},
        //                 {"attribute":"Cost","condition":"Min","value":1},
        //                 {"attribute":"Cost","condition":"Max","value":210000}
        //             ],
        //             "allowedOrderTypes":[1,2,3,4],
        //             "state":"Trading"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = this.parseMarket (response[i]);
            result.push (market);
        }
        return result;
    }

    findMarket (id) {
        // need to pass identifier as string
        const idString = id.toString ();
        return super.findMarket (idString);
    }

    parseMarket (market) {
        //
        //     {
        //         "id":33,
        //         "symbol":"ETHUSDT",
        //         "base":"ETH",
        //         "quote":"USDT",
        //         "priceSigDigs":5,
        //         "qtySigDigs":8,
        //         "costSigDigs":8,
        //         "verificationLevelUser":1,
        //         "verificationLevelCorporate":11,
        //         "group":"USD",
        //         "tradingRules":[
        //             {"attribute":"Qty","condition":"Min","value":0.006},
        //             {"attribute":"Qty","condition":"Max","value":1000},
        //             {"attribute":"Cost","condition":"Min","value":1},
        //             {"attribute":"Cost","condition":"Max","value":210000}
        //         ],
        //         "allowedOrderTypes":[1,2,3,4],
        //         "state":"Trading"
        //     }
        //
        const id = this.safeString (market, 'id');
        // const numericId = this.safeString (market, 'id');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const state = this.safeString (market, 'state');
        const active = (state === 'Trading');
        const precision = {
            'price': this.safeInteger (market, 'priceSigDigs'),
            'amount': this.safeInteger (market, 'qtySigDigs'),
            'cost': this.safeInteger (market, 'costSigDigs'),
        };
        const rules = this.safeValue (market, 'tradingRules', []);
        let minAmount = undefined;
        let maxAmount = undefined;
        let minCost = undefined;
        let maxCost = undefined;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const attribute = this.safeString (rule, 'attribute');
            const condition = this.safeString (rule, 'condition');
            const value = this.safeFloat (rule, 'value');
            if ((attribute === 'Qty') && (condition === 'Min')) {
                minAmount = value;
            } else if ((attribute === 'Qty') && (condition === 'Max')) {
                maxAmount = value;
            } else if ((attribute === 'Cost') && (condition === 'Min')) {
                minCost = value;
            } else if ((attribute === 'Cost') && (condition === 'Max')) {
                maxCost = value;
            }
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': maxCost,
                },
            },
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     [
        //         {
        //             "id":"LINK",
        //             "name":"ChainLink Token",
        //             "precisionDisplay":8,
        //             "precisionMax":18,
        //             "precisionBasis":1000000000000000000,
        //             "precisionStep":1,
        //             "verificationLevelMin":"null",
        //             "cmcId":"LINK",
        //             "txnUrl":"https://etherscan.io/tx/{txnId}",
        //             "state":"Active",
        //             "type":"Crypto",
        //             "isReference":false,
        //             "withdrawalMin":"0",
        //             "withdrawalMax":"50587",
        //             "withdrawalFee":"0.55",
        //             "depositEnabled":true,
        //             "withdrawalEnabled":true,
        //             "description":"",
        //             "coingeckoUrl":"https://www.coingecko.com/en/coins/chainlink",
        //             "coinmarketcapUrl":"https://coinmarketcap.com/currencies/chainlink",
        //             "eterbaseUrl":"https://www.eterbase.com/system-status/LINK",
        //             "explorerUrl":"https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca",
        //             "withdrawalMemoAllowed":false,
        //             "countries":[],
        //             "networks":[]
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const precision = this.safeInteger (currency, 'precisionDisplay');
            const code = this.safeCurrencyCode (id);
            const depositEnabled = this.safeValue (currency, 'depositEnabled');
            const withdrawalEnabled = this.safeValue (currency, 'withdrawalEnabled');
            const state = this.safeString (currency, 'state');
            const active = depositEnabled && withdrawalEnabled && (state === 'Active');
            const type = this.safeStringLower (currency, 'type');
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'type': type,
                'name': name,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawalFee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdrawalMin'),
                        'max': this.safeFloat (currency, 'withdrawalMax'),
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "time":1588778516608,
        //         "marketId":250,
        //         "price":0.0,
        //         "change":0.0,
        //         "volumeBase":0.0,
        //         "volume":0.0,
        //         "low":0.0,
        //         "high":0.0,
        //     }
        //
        const marketId = this.safeInteger (ticker, 'marketId');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'time');
        const last = this.safeFloat (ticker, 'price');
        const baseVolume = this.safeFloat (ticker, 'volumeBase');
        const quoteVolume = this.safeFloat (ticker, 'volume');
        let vwap = undefined;
        if ((quoteVolume !== undefined) && (baseVolume !== undefined) && (baseVolume > 0)) {
            vwap = quoteVolume / baseVolume;
        }
        const percentage = this.safeFloat (ticker, 'change');
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetTickersIdTicker (this.extend (request, params));
        //
        //     {
        //         "time":1588778516608,
        //         "marketId":250,
        //         "price":0.0,
        //         "change":0.0,
        //         "volumeBase":0.0,
        //         "volume":0.0,
        //         "low":0.0,
        //         "high":0.0,
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'quote': 'USDT', // identifier of a quote asset to filter the markets
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":1588831771698,
        //             "marketId":33,
        //             "price":204.54,
        //             "change":-1.03,
        //             "volumeBase":544.9801776699998,
        //             "volume":111550.433735,
        //             "low":200.33,
        //             "high":209.51
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":251199246,
        //         "side":2,
        //         "price":0.022044,
        //         "executedAt":1588830682664,
        //         "qty":0.13545846,
        //         "makerId":"67ed6ef3-33d8-4389-ba70-5c68d9db9f6c",
        //         "takerId":"229ef0d6-fe67-4b5d-9733-824142fab8f3"
        //     }
        //
        // fetchTrades (private)
        //
        //     ...
        //
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeAsset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let cost = this.safeFloat (trade, 'qty');
        if ((cost === undefined) && (price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const timestamp = this.safeInteger2 (trade, 'executedAt', 'filledAt');
        const tradeSide = this.safeString (trade, 'side');
        const side = (tradeSide === '1') ? 'buy' : 'sell';
        const liquidity = this.safeString (trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            takerOrMaker = (liquidity === '1') ? 'maker' : 'taker';
        }
        const orderId = this.safeString (trade, 'orderId');
        const id = this.safeString (trade, 'id');
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
            // 'offset': 0 // the number of records to skip
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsIdTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":251199246,
        //             "side":2,
        //             "price":0.022044,
        //             "executedAt":1588830682664,
        //             "qty":0.13545846,
        //             "makerId":"67ed6ef3-33d8-4389-ba70-5c68d9db9f6c",
        //             "takerId":"229ef0d6-fe67-4b5d-9733-824142fab8f3"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = [];
        return this.parseOrderBook (response, this.safeInteger (response, 'timestamp'));
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

    sign (path, api = 'public', method = 'GET', params = {}, httpHeaders = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let request = '/';
        if (api === 'public') {
            request += 'api/' + this.version;
        } else if (api === 'private') {
            request += 'api/' + this.version;
        } else if (api === 'markets') {
            request += api;
        }
        request += '/' + this.implodeParams (path, params);
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
};
