'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { InvalidOrder, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btse extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btse',
            'name': 'BTSE',
            'countries': ['BVI'],
            'userAgent': 'sdk_ccxt/btse',
            'rateLimit': 3000,
            'certified': false,
            'has': {
                'CORS': true,
                'cancelAllOrders': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '9h': '720',
                '1d': '1440',
                '1M': '43800',
                '1w': '10080',
                '1Y': '525600',
            },
            'urls': {
                'test': 'https://testnet.btse.io',
                'logo': '',
                'api': {
                    'web': 'https://www.btse.com',
                    'api': 'https://api.btse.com',
                    'spotv2': 'https://api.btse.com/spot/api/v2',
                    'spotv3': 'https://api.btse.com/spot/api/v3.2',
                    'spotv3private': 'https://api.btse.com/spot/api/v3.2',
                    'futuresv2': 'https://api.btse.com/futures/api/v2.1',
                    'futuresv2private': 'https://api.btse.com/futures/api/v2.1',
                    'testnet': 'https://testapi.btse.io',
                },
                'www': 'https://www.btse.com',
                'doc': [
                    'https://www.btse.com/apiexplorer/futures/',
                    'https://www.btse.com/apiexplorer/spot/',
                ],
                'fees': 'https://support.btse.com/en/support/solutions/articles/43000064283-what-are-the-btse-trading-fees-',
                'referral': 'https://www.btse.com/ref?c=0Ze7BK',
            },
            'api': {
                'spotv2': {
                    'get': [
                        'time',
                        'market_summary',
                        'ticker/{id}/',
                        'orderbook/{id}',
                        'trades',
                        'account',
                        'ohlcv',
                    ],
                },
                'spotv3': {
                    'get': [
                        'time',
                        'market_summary',
                        'orderbook/L2',
                        'trades',
                        'account',
                        'ohlcv',
                    ],
                },
                'spotv3private': {
                    'get': [
                        'user/fees',
                        'user/open_orders',
                        'user/trade_history',
                        'user/wallet',
                        'user/wallet_history',
                        'user/wallet/address',
                    ],
                    'post': [
                        'order',
                        'order/peg',
                        'order/cancelAllAfter',
                        'user/wallet/address',
                        'user/wallet/withdraw',
                    ],
                    'delete': [
                        'order',
                    ],
                },
                'futuresv2': {
                    'get': [
                        'time',
                        'market_summary',
                        'orderbook/L2',
                        'ohlcv',
                        'trades',
                    ],
                },
                'futuresv2private': {
                    'get': [
                        'user/fees',
                        'user/open_orders',
                        'user/positions',
                        'user/trade_history',
                        'user/wallet',
                        'user/wallet_history',
                    ],
                    'post': [
                        'user/wallet_transfer',
                        'order',
                        'order/peg',
                        'order/close_position',
                        'order/cancelAllAfter',
                        'leverage',
                        'risk_limit',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'tradingSpot': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.05 / 100,
                    'taker': 0.10 / 100,
                },
                'tradingFutures': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.01 / 100,
                    'taker': 0.06 / 100,
                },
            },
            'exceptions': {},
            'precisionMode': TICK_SIZE,
            'options': {
                'timeDifference': 0,
                'adjustTimeDifference': true,
                'fetchTickerQuotes': true,
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const type = this.safeString2 (this.options, 'fetchTime', 'defaultType', 'spot');
        const method = (type === 'spot') ? 'spotv3GetTime' : 'futuresv2GetTime';
        const response = await this[method];
        const after = this.milliseconds ();
        const serverTime = parseInt (response['epoch'] * 1000);
        this.options['timeDifference'] = parseInt (after - serverTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const defaultType = this.safeString2 (this.options, 'GetMarketSummary', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'spotv3GetMarketSummary' : 'futuresv2GetMarketSummary';
        const response = await this[method] (query);
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let marketType = 'spot';
            const active = this.safeValue (market, 'active');
            const settleTime = this.safeInteger (market, 'contractEnd', 0);
            if (type !== 'spot') {
                marketType = (settleTime > 0) ? 'future' : 'swap';
            }
            let lotSize = this.safeFloat (market, 'contractSize', 0);
            if (!lotSize) {
                lotSize = 1;
            }
            const id = this.safeValue (market, 'symbol');
            const symbol = (marketType !== 'future') ? (base + '/' + quote) : id;
            results.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'spot': (marketType === 'spot'),
                'future': (marketType === 'future'),
                'swap': (marketType === 'swap'),
                'prediction': false,
                'type': marketType,
                'linear': true,
                'inverse': false,
                'active': active,
                'lotSize': lotSize,
                'precision': {
                    'price': this.safeFloat (market, 'minPriceIncrement'),
                    'amount': this.safeFloat (market, 'minSizeIncrement'),
                    'cost': undefined,
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minOrderSize'),
                        'max': this.safeFloat (market, 'maxOrderSize'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'minValidPrice'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return results;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'GetMarketSummary', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetMarketSummary' : 'futuresv2GetMarketSummary';
        const request = {
            'symbol': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseTicker (response[0]);
    }

    parseTicker (ticker) {
        const timestamp = this.safeTimestamp (ticker, 'time', this.milliseconds ());
        return {
            'symbol': this.safeString (ticker, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24Hr'),
            'low': this.safeFloat (ticker, 'low24Hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'percentageChange'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const defaultType = this.safeString2 (this.options, 'GetOrderBookL2', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetOrderbookL2' : 'futuresv2GetOrderbookL2';
        const response = await this[method] (this.extend (request, params));
        const timestamp = response['timestamp'];
        const orderbook = this.parseOrderBook (response, timestamp, 'buyQuote', 'sellQuote', 'price', 'size');
        orderbook['nonce'] = this.safeInteger (response, 'timestamp');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const defaultType = this.safeString2 (this.options, 'GetTrades', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetTrades' : 'futuresv2GetTrades';
        const response = await this[method] (this.extend (request, params));
        const trades = this.parseTrades (response, market, since, limit);
        for (let i = 0; i < trades.length; i++) {
            trades[i]['cost'] = undefined;
            trades[i]['takerOrMaker'] = undefined;
            trades[i]['side'] = trades[i]['info']['side'].toLowerCase ();
        }
        return trades;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
        }
        const defaultType = this.safeString2 (this.options, 'GetUserTradeHistory', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserTradeHistory' : 'futuresv2privateGetUserTradeHistory';
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeValue (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (price !== undefined && amount !== undefined) {
            cost = price * amount;
        }
        return {
            'id': this.safeString (trade, 'serialId'),
            'order': this.safeString (trade, 'orderId'),
            'symbol': market['symbol'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'size'),
            'cost': cost,
            'fee': this.safeFloat (trade, 'feeAmount'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'info': trade,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'GetWalletHistory', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserWalletHistory' : 'futuresv2privateGetUserWalletHistory';
        const response = await this[method] (this.extend (params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const deposit = response[i];
            if (deposit['type'] === 'Deposit') {
                result.push (deposit);
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'GetWallet', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserWallet' : 'futuresv2privateGetUserWallet';
        const response = await this[method] (this.extend (params));
        const result = {};
        if (type === 'spot') {
            for (let i = 0; i < response.length; i++) {
                const balance = response[i];
                const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
                const account = this.account ();
                account['total'] = this.safeFloat (balance, 'total');
                account['free'] = this.safeFloat (balance, 'available');
                account['used'] = account['total'] - this.safeFloat (balance, 'available');
                result[code] = account;
            }
        } else {
            for (let i = 0; i < response[0]['assets'].length; i++) {
                const balance = response[0]['assets'][i];
                const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
                const account = this.account ();
                account['total'] = this.safeFloat (balance, 'balance');
                account['free'] = this.safeFloat (balance, 'balance');
                account['used'] = 0;
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            undefined, // 5 is quoteVolume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'end': this.seconds (),
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        const defaultType = this.safeString2 (this.options, 'GetOhlcv', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3GetOhlcv' : 'futuresv2GetOhlcv';
        const response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market['id'].toUpperCase (), timeframe, since, limit);
    }

    async fetchTradingFees (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = symbol ? this.market (symbol) : undefined;
        const request = {
            'symbol': market ? market['id'].toUpperCase () : undefined,
        };
        const defaultType = this.safeString2 (this.options, 'GetTradingFees', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserFees' : 'futuresv2privateGetUserFees';
        const response = await this[method] (this.extend (request));
        if (!symbol) {
            return {
                'info': response,
            };
        }
        return {
            'info': response,
            'maker': this.safeFloat (response[0], 'makerFee'),
            'taker': this.safeFloat (response[0], 'takerFee'),
        };
    }

    async createOrder (symbol, orderType, side, size, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'].toUpperCase (),
            'side': side.toUpperCase (),
            'size': parseFloat (size),
            'time_in_force': 'GTC',
        };
        let priceToPrecision = undefined;
        if (price !== undefined) {
            priceToPrecision = parseFloat (price);
        }
        const oType = orderType.toUpperCase ();
        if (oType === 'LIMIT') {
            request['type'] = 'LIMIT';
            request['txType'] = 'LIMIT';
            request['price'] = priceToPrecision;
        } else if (oType === 'MARKET') {
            request['type'] = 'MARKET';
            if (params['currency']) {
                request['price'] = '';
                request['currency'] = params['currency'];
            }
        } else if (oType === 'STOP') {
            request['txType'] = 'STOP';
            request['stopPrice'] = priceToPrecision;
        } else if (oType === 'TRAILINGSTOP') {
            request['trailValue'] = priceToPrecision;
        } else {
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + orderType + ', only limit, market, stop, trailingStop, or takeProfit orders are supported');
        }
        const defaultType = this.safeString2 (this.options, 'PostOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privatePostOrder' : 'futuresv2privatePostOrder';
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response[0]);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderID': id,
            'clOrderID': undefined,
        };
        const defaultType = this.safeString2 (this.options, 'DeleteOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateDeleteOrder' : 'futuresv2privateDeleteOrder';
        const response = await this[method] (this.extend (request, params));
        if (response[0]['message'] === 'ALL_ORDER_CANCELLED_SUCCESS') {
            return response[0];
        }
        return this.parseOrder (response[0]);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            return this.cancelOrder (undefined, symbol);
        }
        const request = {
            'timeout': params['timeout'] ? params['timeout'] : 0,
        };
        const defaultType = this.safeString2 (this.options, 'OrderCancelAllAfter', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privatePostOrderCancelAllAfter' : 'futuresv2privatePostOrderCancelAllAfter';
        const response = await this[method] (this.extend (request, params));
        return this.safeValue (response, 'result', {});
    }

    parseOrderStatus (status) {
        const statuses = {
            '2': 'created',
            '4': 'closed',
            '5': 'open',
            '6': 'canceled',
            '9': 'created',
            '10': 'open',
            '15': 'rejected',
            '16': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            '76': 'limit',
            '77': 'market',
            '80': 'peg',
        };
        return this.safeString (types, type, type);
    }

    findSymbol (marketId, market) {
        if (market === undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                return marketId;
            }
        }
        return market['symbol'];
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeValue (order, 'timestamp');
        const filled = this.safeFloat (order, 'fillSize');
        const amount = this.safeFloat (order, 'size');
        const remaining = amount - filled;
        const average = this.safeFloat (order, 'averageFillPrice');
        const price = this.safeFloat2 (order, 'price', 'triggerPrice', average);
        let cost = undefined;
        if (filled !== 0 && price !== undefined) {
            cost = filled * price;
        }
        return {
            'id': this.safeString (order, 'orderID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.findSymbol (this.safeString (order, 'symbol'), market),
            'type': this.parseOrderType (this.safeString (order, 'orderType')),
            'side': this.safeString (order, 'side'),
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
            'info': order,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a `symbol` argument');
        }
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        if (since !== undefined) {
            request['orderID'] = since;
        }
        const defaultType = this.safeString2 (this.options, 'GetUserOpenOrders', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'spotv3privateGetUserOpenOrders' : 'futuresv2privateGetUserOpenOrders';
        const response = await this[method] (this.extend (request, params));
        const length = response.length;
        return length ? response.map (this.parseOrder.bind (this)) : [];
    }

    async createDepositAddress (currency, params = {}) {
        await this.loadMarkets ();
        const request = {
            currency,
        };
        const response = await this.spotv3privatePostUserWalletAddress (this.extend (request, params));
        return {
            'currency': currency,
            'address': response[0]['address'].split (':')[0],
            'tag': response[0]['address'].split (':')[1],
            'info': response,
        };
    }

    async fetchDepositAddress (currency, params = {}) {
        await this.loadMarkets ();
        const request = {
            currency,
        };
        const response = await this.spotv3privateGetUserWalletAddress (this.extend (request, params));
        return {
            'currency': currency,
            'address': response[0]['address'].split (':')[0],
            'tag': response[0]['address'].split (':')[1],
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount.toString (),
            'address': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.spotv3privatePostUserWalletWithdraw (this.extend (request, params));
        return {
            'id': response['withdrawId:'],
            'info': response,
        };
    }

    sign (path, api = 'api', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let bodyText = undefined;
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'spotv3private' || api === 'futuresv2private') {
            this.checkRequiredCredentials ();
            bodyText = this.json (params);
            const signaturePath = this.cleanSignaturePath (api, this.urls['api'][api] + '/' + path);
            headers = this.signHeaders (method, signaturePath, headers, bodyText);
        }
        body = (method === 'GET') ? undefined : bodyText;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    signHeaders (method, signaturePath, headers = {}, bodyText = undefined) {
        const nonce = this.nonce ();
        let signature = this.createSignature (this.secret, nonce, signaturePath);
        if (!(method === 'GET' || method === 'DELETE')) {
            signature = this.createSignature (this.secret, nonce, signaturePath, bodyText);
        }
        headers['btse-nonce'] = nonce;
        headers['btse-api'] = this.apiKey;
        headers['btse-sign'] = signature;
        headers['Content-Type'] = 'application/json';
        return headers;
    }

    createSignature (key, nonce, path, body = undefined) {
        const content = body === undefined ? this.encode ('/' + path + nonce) : this.encode ('/' + path + nonce + body);
        return this.hmac (content, key, 'sha384');
    }

    cleanSignaturePath (api, url) {
        if (api === 'spotv3private') {
            return url.replace ('https://api.btse.com/spot/', '');
        }
        return url.replace ('https://api.btse.com/futures/', '');
    }
};
