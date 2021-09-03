'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require('./base/Exchange');
const { BadRequest, ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, OrderNotFound, ExchangeNotAvailable, RateLimitExceeded, PermissionDenied, InvalidOrder, InvalidAddress, OnMaintenance, RequestTimeout, AccountSuspended } = require('./base/errors');
const Precise = require('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class mexc extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'mexc',
            'name': 'MEXC',
            // 'country': [ 'US', 'EU', 'CN', 'RU' ],
            'rateLimit': 1000,
            'version': '2',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': 'https://www.mexc.com/open/api',
                'www': 'https://www.mexc.com',
                'doc': 'https://mxcdevelop.github.io/APIDoc',
            },
            'api': {
                'public': {
                    'get': [
                        'market/symbols', // 所有交易对信息
                        'common/timestamp', // 当前系统时间
                        'common/ping', // Ping
                        'market/ticker', // 获取市场行情
                        'market/depth', // 获取市场深度
                        'market/deals', // 获取市场成交
                        'market/kline', // 获取K线数据
                        'market/coin/list', // 获取币种列表
                    ],
                },
                'private': {
                    'get': [
                        'account/info', // 获取账户信息
                        'order/list', // 所有订单
                        'order/query', // 查询订单
                        'order/open_orders', // 当前挂单
                        'order/deals', // 个人成交记录
                        'order/deal_detail', // 成交明细
                    ],
                    'post': [
                        'order/place', // 创建订单
                        'order/place_batch', // 批量下单
                    ],
                    'delete': [
                        'order/cancel', // 取消订单
                        'order/cancel_by_symbol', // 按交易对撤销订单
                    ],
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '60m': '60m',
                '1h': '1h',
                '1M': '1M',
            },
        });
    }

    async fetchMarkets(params = {}) {
        const response = await this.publicGetMarketSymbols(params);
        const markets = this.safeValue(response, 'data', []);
        // {
        //   "code": 200,
        //   "data": [
        //     {
        //       "symbol": "QTM_USDT",
        //       "state": "ENABLED",
        //       "price_scale": 4,
        //       "quantity_scale": 4,
        //       "min_amount": "5",
        //       "max_amount": "10000000",
        //       "maker_fee_rate": "0.001",
        //       "taker_fee_rate": "0.001"
        //     }
        //   ]
        // }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'symbol');
            const [baseId, quoteId] = id.split('_');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            const amountPrecisionString = this.safeString(market, 'quantity_scale');
            const pricePrecisionString = this.safeString(market, 'price_scale');
            const amountLimit = this.parsePrecision(amountPrecisionString);
            const priceLimit = this.parsePrecision(pricePrecisionString);
            const costLimitMin = this.safeString(market, 'min_amount');
            const costLimitMax = this.safeString(market, 'max_amount');
            const state = this.safeString(market, 'state');
            const active = state === 'ENABLED';
            const precision = {
                'amount': parseInt(amountPrecisionString),
                'price': parseInt(pricePrecisionString),
            };
            result.push({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber(amountLimit),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber(priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber(costLimitMin),
                        'max': this.parseNumber(costLimitMax),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker(this.extend(request, params));
        // {
        //   "code": 200,
        //   "data": [
        //       {
        //            "symbol": "ETH_USDT",
        //            "volume": "0",
        //            "high": "182.4117576",
        //            "low": "182.4117576",
        //            "bid": "182.0017985",
        //            "ask": "183.1983186",
        //            "open": "182.4117576",
        //            "last": "182.4117576",
        //            "time": 1574668200000,
        //            "change_rate": "0.00027307"
        //       }
        //   ]
        // }
        const data = this.safeValue(response, 'data', []);
        const ticker = data[0];
        return this.parseTicker(ticker, market);
    }

    parseTicker(ticker, market = undefined) {
        // {
        //   "symbol": "ETH_USDT",
        //   "volume": "0",
        //   "high": "182.4117576",
        //   "low": "182.4117576",
        //   "bid": "182.0017985",
        //   "ask": "183.1983186",
        //   "open": "182.4117576",
        //   "last": "182.4117576",
        //   "time": 1574668200000,
        //   "change_rate": "0.00027307"
        // }
        const timestamp = this.safeInteger(ticker, 'time', this.milliseconds());
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const openString = this.safeValue(ticker, 'open');
        const closeString = this.safeValue(ticker, 'last');
        const open = this.parseNumber(openString);
        const last = this.parseNumber(closeString);
        const change = Precise.stringSub(closeString, openString);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'high'),
            'low': this.safeNumber(ticker, 'low'),
            'bid': this.safeNumber(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber(ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeNumber(ticker, 'change_rate'),
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook(symbol, limit = 2000, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'depth': limit,
        };
        const response = await this.publicGetMarketDepth(this.extend(request, params));
        // {
        //     "code": 200,
        //     "data": {
        //         "asks": [
        //             {
        //                 "price": "183.1683154",
        //                 "quantity": "128.5"
        //             },
        //             {
        //                 "price": "183.1983186",
        //                 "quantity": "101.6"
        //             }
        //         ],
        //         "bids": [
        //             {
        //                 "price": "182.4417544",
        //                 "quantity": "115.5"
        //             },
        //             {
        //                 "price": "182.4217568",
        //                 "quantity": "135.7"
        //             }
        //         ]
        //     }
        // }
        const orderBook = this.safeValue(response, 'data', {});
        return this.parseOrderBook(orderBook, symbol, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketDeals(this.extend(request, params));
        // {
        //     "code": 200,
        //     "data": [
        //         {
        //             "trade_time": 1573267931530,
        //             "trade_price": "183.1683154",
        //             "trade_quantity": "5",
        //             "trade_type": "BID"
        //         },
        //         {
        //             "trade_time": 1573266717841,
        //             "trade_price": "183.1683154",
        //             "trade_quantity": "0.5",
        //             "trade_type": "ASK"
        //         },
        //         {
        //             "trade_time": 1573013871967,
        //             "trade_price": "183.1183105",
        //             "trade_quantity": "128.6",
        //             "trade_type": "BID"
        //         }
        //     ]
        // }
        const trades = this.safeValue(response, 'data', []);
        return this.parseTrades(trades, market, since, limit);
    }

    parseTrade(trade, market = undefined) {
        // {
        //     "trade_time": 1573267931530,
        //     "trade_price": "183.1683154",
        //     "trade_quantity": "5",
        //     "trade_type": "BID"
        // },
        // {
        //     "trade_time": 1573266717841,
        //     "trade_price": "183.1683154",
        //     "trade_quantity": "0.5",
        //     "trade_type": "ASK"
        // },
        // {
        //     "trade_time": 1573013871967,
        //     "trade_price": "183.1183105",
        //     "trade_quantity": "128.6",
        //     "trade_type": "BID"
        // }
        const timestamp = this.safeInteger(trade, 'trade_time');
        let side = this.safeString(trade, 'trade_type');
        side = (side === 'BID') ? 'buy' : 'sell';
        const priceString = this.safeString(trade, 'trade_price');
        const amountString = this.safeString(trade, 'trade_quantity');
        const costString = Precise.stringMul(priceString, amountString);
        const price = this.parseNumber(priceString);
        const amount = this.parseNumber(amountString);
        const cost = this.parseNumber(costString);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = Math.floor(since / 1000);
        }
        const response = await this.publicGetMarketKline(this.extend(request, params));
        // {
        //     "code": 200,
        //     "data": [
        //         [
        //             1557728040,    //timestamp in seconds
        //             "7054.7",      //open
        //             "7056.26",     //close
        //             "7056.29",     //high
        //             "7054.16",     //low
        //             "9.817734",    //vol
        //             "6926.521"     //amount
        //         ],
        //         [
        //             1557728100,
        //             "7056.26",
        //             "7042.17",
        //             "7056.98",
        //             "7042.16",
        //             "23.69423",
        //             "1677.931"
        //         ]
        //     ]
        // }
        const ohlcvs = this.safeValue(response, 'data', []);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV(ohlcv, market = undefined) {
        // [
        //     1557728040,    //timestamp in seconds
        //     "7054.7",      //open
        //     "7056.26",     //close
        //     "7056.29",     //high
        //     "7054.16",     //low
        //     "9.817734",    //vol
        //     "6926.521"     //amount
        // ]
        const timestamp = this.safeTimestamp(ohlcv, 0);
        const open = this.safeNumber(ohlcv, 1);
        const close = this.safeNumber(ohlcv, 2);
        const high = this.safeNumber(ohlcv, 3);
        const low = this.safeNumber(ohlcv, 4);
        const volume = this.safeNumber(ohlcv, 5);
        return [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ];
    }

    async fetchCurrencies(params = {}) {
        const response = await this.publicGetMarketCoinList(params);
        // unified format
        // {
        //     'id':       'btc',       // string literal for referencing within an exchange
        //     'code':     'BTC',       // uppercase unified string literal code the currency
        //     'name':     'Bitcoin',   // string, human-readable name, if specified
        //     'active':    true,       // boolean, currency status (tradeable and withdrawable)
        //     'fee':       0.123,      // withdrawal fee, flat
        //     'precision': 8,          // number of decimal digits "after the dot" (depends on exchange.precisionMode)
        //     'limits': {              // value limits when placing orders on this market
        //         'amount': {
        //             'min': 0.01,     // order amount should be > min
        //             'max': 1000,     // order amount should be < max
        //         },
        //         'withdraw': { ... }, // withdrawal limits
        //     },
        //     'info': { ... }, // the original unparsed currency info from the exchange
        // }
        const currencies = this.safeValue(response, 'data', {});
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = currency['currency'];
            const code = this.safeCurrencyCode(id);
            const name = this.safeString(currency, 'full_name');
            const precision = undefined;
            let isWithdrawEnabled = false;
            let isDepositEnabled = false;
            const fees = {};
            const networks = this.safeValue(currency, 'coins', []);
            const networkCount = networks.length;
            let fee = undefined;
            for (let j = 0; j < networkCount; j++) {
                const networkItem = networks[j];
                const network = this.safeString(networkItem, 'chain');
                const withdrawFee = this.safeNumber(networkItem, 'fee');
                const depositEnable = this.safeValue(networkItem, 'is_deposit_enabled');
                const withdrawEnable = this.safeValue(networkItem, 'is_withdraw_enabled');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
                if (networkCount === 1) {
                    fee = withdrawFee;
                }
            }
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': currency,
                'active': active,
                'fee': fee,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }

    async getp() {
        return this.privateGetAccountInfo();
    }

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        const version = this.version;
        url += '/v' + version + '/' + path;
        if (api === 'public') {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        } else {
            this.checkRequiredCredentials();
            headers = (headers === undefined) ? {} : headers;
            const apiKey = this.apiKey;
            const secret = this.secret;
            const reqTime = this.milliseconds();
            const queryString = this.urlencode(this.keysort(params));
            url += '?' + queryString;
            let signString = apiKey + reqTime;

            headers = this.extend({
                'ApiKey': apiKey,
                'Request-Time': reqTime,
            }, headers);

            if (method === 'GET') {
                signString += queryString;
            } else {
                headers['Content-Type'] = 'application/json';
                const jsonData = JSON.stringify(body);
                body = jsonData;
                signString += jsonData;
            }
            headers['Signature'] = this.hmac(this.encode(signString), this.encode(secret), 'sha256', 'hex');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
