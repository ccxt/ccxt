'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, OrderNotFound, ArgumentsRequired, BadSymbol, BadRequest, RequestTimeout, RateLimitExceeded, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bhex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bhex',
            'name': 'BlueHelix Exchange',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome39'],
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'has': {
                'CORS': false,
                'fetchTickers': false,
                'fetchTicker': true,
                'fetchDepositAddress': false,
                'fetchOHLCV': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTradingLimits': true,
                'fetchMyTrades': true,
                'withdraw': false,
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '4h': '4hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1mon',
                '1y': '1year',
            },
            'urls': {
                'logo': 'https://static.bhfastime.com/bhop/image/TeQv9ZmFEzsLEaZkhrU2lIm9SppCC0_b7rcxAAhWqvA.png', // 交易所LOGO
                'api': {
                    'market': 'https://www.bhex.us/openapi/quote',  // 市场API数据端点
                    'contract': 'https://www.bhex.us/openapi/contract', // 合约API数据端点
                    'public': 'https://www.bhex.us/openapi', // 公共API数据端点
                    'private': 'https://www.bhex.us/openapi', // 私有API数据端点
                    'zendesk': 'https://bhex.zendesk.com/hc/en-us/articles',
                },
                'www': 'https://www.bhex.com', // 公司主页
                'referral': 'https://www.bhex.com/register/HH6PGQ', // 邀请链接
                'doc': 'https://github.com/bhexopen/BHEX-OpenApi/tree/master/doc', // openapi文档地址
                'fees': 'https://bhex.zendesk.com/hc/zh-cn/articles/360009274694', // 费率介绍
            },
            'api': {
                'public': {
                    'get': [
                        'brokerInfo', // 查询当前broker交易规则和symbol信息
                    ],
                },
                'market': {
                    'get': [
                        'depth', // 获取深度
                        'trades', // 获取当前最新成交
                        'klines', // 获取K线数据
                        'ticker/24hr', // 获取24小时价格变化数据
                        'contract/index', // 获取合约标的指数价格
                        'contract/depth', // 获取合约深度
                        'contract/trades', // 获取合约最近成交,
                        'contract/klines', // 获取合约的K线数据
                    ],
                },
                'contract': {
                    'get': [
                        'fundingRate', // 获取资金费率信息
                        'account', // 查询合约账户信息
                        'getOrder', // 查询合约订单详情
                        'openOrders', // 查询合约当前委托
                        'historyOrders', // 查询合约历史委托
                        'myTrades', // 查询合约历史成交
                        'positions', // 查询合约当前持仓
                    ],
                    'post': [
                        'order', // 创建合约订单
                        'modifyMargin', // 修改保证金
                    ],
                    'delete': [
                        'order', // 取消合约订单
                    ],
                },
                'private': {
                    'get': [
                        'account', // 获取当前账户信息
                        'order', // 查询订单
                        'openOrders', // 查询当前委托
                        'historyOrders', // 查询历史委托
                        'myTrades', // 查询历史成交
                    ],
                    'post': [
                        'order', // 创建新订单
                    ],
                    'delete': [
                        'order', // 取消订单
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.002, // MAKER费率
                    'taker': 0.002, // TAKER费率
                },
            },
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError,
                    '-1001': ExchangeError,
                    '-1002': AuthenticationError,
                    '-1003': RateLimitExceeded,
                    '-1004': BadRequest,
                    '-1005': PermissionDenied,
                    '-1007': RequestTimeout,
                    '-1015': RateLimitExceeded,
                    '-1016': ExchangeError,
                    '-1020': PermissionDenied,
                    '-1121': BadSymbol,
                    '-2013': OrderNotFound,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const brokerInfo = await this.publicGetBrokerInfo ();
        const symbols = this.safeValue (brokerInfo, 'symbols');
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const filters = this.safeValue (market, 'filters');
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': Math.floor (Math.log10 (1 / this.safeFloat (market, 'baseAssetPrecision'))),
                'amount': Math.floor (Math.log10 (1 / this.safeFloat (market, 'quotePrecision'))),
            };
            // get limits
            let amountMin = undefined;
            let amountMax = undefined;
            let priceMin = undefined;
            let priceMax = undefined;
            let costMin = undefined;
            for (let j = 0; j < filters.length; j++) {
                const filter = filters[j];
                const filterType = this.safeString (filter, 'filterType');
                if (filterType === 'LOT_SIZE') {
                    amountMin = this.safeFloat (filter, 'minQty');
                    amountMax = this.safeFloat (filter, 'maxQty');
                }
                if (filterType === 'PRICE_FILTER') {
                    priceMin = this.safeFloat (filter, 'minPrice');
                    priceMax = this.safeFloat (filter, 'maxPrice');
                }
            }
            if (amountMin !== undefined && priceMin !== undefined) {
                costMin = amountMin * priceMin;
            }
            const limits = {
                'amount': {
                    'min': amountMin,
                    'max': amountMax,
                },
                'price': {
                    'min': priceMin,
                    'max': priceMax,
                },
                'cost': {
                    'min': costMin,
                    'max': undefined,
                },
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetDepth (this.extend (request, params));
        const result = this.parseOrderBook (response);
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.marketGetTicker24hr (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.privateGetAccount (query);
        const balances = this.safeValue (response, 'balances');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                const account = this.account ();
                const free = this.safeFloat (balance, 'free');
                const locked = this.safeFloat (balance, 'locked');
                account['free'] = free;
                account['total'] = free + locked;
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.marketGetTrades (this.extend (request, params));
        let result = [];
        for (let i = 0; i < response.length; i++) {
            const trade = this.parsePublicTrade (response[i], market);
            result.push (trade);
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = parseInt (since);
        }
        const response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'side': side.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        return await this.privateDeleteOrder (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const response = await this.privateGetOpenOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const response = await this.privateGetHistoryOrders (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
            'timestamp': this.milliseconds (),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'time');
        const bid = this.safeFloat (ticker, 'bestBidPrice');
        const ask = this.safeFloat (ticker, 'bestAskPrice');
        const open = this.safeFloat (ticker, 'openPrice');
        const close = this.safeFloat (ticker, 'lastPrice');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((open !== undefined) && (close !== undefined)) {
            change = close - open;
            average = this.sum (open, close) / 2;
            if ((close !== undefined) && (close > 0)) {
                percentage = (change / open) * 100;
            }
        }
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let vwap = undefined;
        if (baseVolume !== undefined && quoteVolume !== undefined && baseVolume > 0) {
            vwap = quoteVolume / baseVolume;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parsePublicTrade (trade, market) {
        const timestamp = this.safeFloat (trade, 'time');
        const takerOrMaker = this.safeValue (trade, 'isBuyerMaker');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
        };
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeFloat (trade, 'time');
        const type = undefined;
        const side = this.safeStringLower (trade, 'type');
        const orderId = this.safeString (trade, 'orderId');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const isMaker = this.safeValue (trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker) {
            takerOrMaker = 'taker';
        } else {
            takerOrMaker = 'maker';
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'order': orderId,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    parseOrder (order, market = undefined) {
        const id = this.safeInteger (order, 'orderId');
        const timestamp = this.safeInteger (order, 'time');
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId !== undefined) {
                marketId = marketId.toUpperCase ();
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const amount = this.safeFloat (order, 'origQty');
        const filled = this.safeFloat (order, 'executedQty');
        let remaining = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avgPrice'),
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'CANCELED': 'canceled',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const timestamp = this.milliseconds ();
        if (api === 'private' || api === 'contract') {
            this.checkRequiredCredentials ();
            const requestParams = this.extend ({
                'timestamp': timestamp,
            }, query);
            // 准备待签名数据
            const signBaseData = this.encode (this.urlencode (requestParams));
            const signSecret = this.encode (this.secret);
            const signature = this.hmac (signBaseData, signSecret, 'sha256');
            const finalRequestParams = this.extend ({
                'signature': signature,
            }, requestParams);
            // 设置header
            headers = {
                'X-BH-APIKEY': this.apiKey,
            };
            if (method === 'POST') {
                body = this.urlencode (finalRequestParams);
                headers = this.extend ({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }, headers);
            } else {
                url += '?' + this.urlencode (finalRequestParams);
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const code = this.safeString (response, 'code');
            if (code !== '0') {
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions['exact'];
                if (code in exceptions) {
                    throw new exceptions[code] (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
