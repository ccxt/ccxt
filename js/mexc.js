'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, BadSymbol, DDoSProtection, InvalidNonce, ArgumentsRequired, AuthenticationError, InsufficientFunds, InvalidOrder, OrderNotFound } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class mexc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mexc',
            'name': 'MEXC',
            'country': ['CN'],
            'rateLimit': 1000,
            'version': '2',
            'urls': {
                'logo': 'https://www.mexc.com/email/logo.png',
                'api': 'https://www.mexc.com/open/api',
                'www': 'https://www.mexc.com',
                'doc': 'https://mxcdevelop.github.io/APIDoc',
            },
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'withdraw': true,
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
                        // assets
                        'asset/deposit/address/list', // 获取充币地址
                        'asset/deposit/list', // 充值记录查询
                        'asset/address/list',  // 提币地址列表查询
                        'asset/withdraw/list', // 提现记录查询
                    ],
                    'post': [
                        'order/place', // 创建订单
                        'order/place_batch', // 批量下单
                        '/asset/withdraw', // 提币
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
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Invalid parameter
                    '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    '429': DDoSProtection, // Too many requests, rate limit rule is violated
                    '10072': AuthenticationError, // Invalid access key
                    '10073': InvalidNonce, // Invalid request time
                    '30000': InvalidOrder, // Trading is suspended for the requested symbol
                    '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    '30004': InsufficientFunds, // Insufficient balance
                    '30005': InsufficientFunds, // Oversell error
                    '30010': InvalidOrder, // Price out of allowed range
                    '30016': BadSymbol, // Market is closed
                    '30019': BadRequest, // Orders count over limit for batch processing
                    '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    '30021': BadSymbol, // Invalid symbol
                },
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': true, // controls the adjustment logic upon instantiation
                'enums': {
                    // 'open', 'closed', 'canceled', 'expired'
                    'orderState': {
                        'NEW': 'open', // New order, waiting to be filled
                        'FILLED': 'closed', // Order fully filled
                        'PARTIALLY_FILLED': 'open', // Order partially filled
                        'CANCELED': 'canceled', // Order canceled
                        'PARTIALLY_CANCELED': 'canceled', // Order filled partially, and then the rest of the order is canceled
                    },
                    'orderType': {
                        'LIMIT_ORDER': 'limit', // Limit price order
                        'POST_ONLY': 'limit', // Post only maker order
                        'IMMEDIATE_OR_CANCEL': 'limit', // Immediate or cancel
                    },
                    'tradeType': {
                        'BID': 'buy', // Buy
                        'ASK': 'sell', // Sell
                        'buy': 'BID',
                        'sell': 'ASK',
                    },
                },
            },
        });
    }

    async loadTimeDifference (params = {}) {
        const response = await this.publicGetCommonTimestamp (params);
        const serverTime = this.safeInteger (response, 'data');
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetMarketSymbols (params);
        const markets = this.safeValue (response, 'data', []);
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
            const id = this.safeString (market, 'symbol');
            const [baseId, quoteId] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const amountPrecisionString = this.safeString (market, 'quantity_scale');
            const pricePrecisionString = this.safeString (market, 'price_scale');
            const amountLimit = this.parsePrecision (amountPrecisionString);
            const priceLimit = this.parsePrecision (pricePrecisionString);
            const costLimitMin = this.safeString (market, 'min_amount');
            const costLimitMax = this.safeString (market, 'max_amount');
            const state = this.safeString (market, 'state');
            const active = state === 'ENABLED';
            const precision = {
                'amount': parseInt (amountPrecisionString),
                'price': parseInt (pricePrecisionString),
            };
            result.push ({
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
                        'min': this.parseNumber (amountLimit),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (costLimitMin),
                        'max': this.parseNumber (costLimitMax),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        const ticker = data[0];
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
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
        const timestamp = this.safeInteger (ticker, 'time', this.milliseconds ());
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const openString = this.safeValue (ticker, 'open');
        const closeString = this.safeValue (ticker, 'last');
        const open = this.parseNumber (openString);
        const last = this.parseNumber (closeString);
        const change = Precise.stringSub (closeString, openString);
        const average = Precise.stringDiv (Precise.stringAdd (openString, closeString), '2');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.parseNumber (change),
            'percentage': Precise.stringMul (this.safeString (ticker, 'change_rate'), '100'),
            'average': this.parseNumber (average),
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = 2000, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'depth': limit,
        };
        const response = await this.publicGetMarketDepth (this.extend (request, params));
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
        const orderBook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (orderBook, symbol, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketDeals (this.extend (request, params));
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
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // ------------ Recent Trades ------------
        // {
        //     "trade_time": 1573266717841,
        //     "trade_price": "183.1683154",
        //     "trade_quantity": "0.5",
        //     "trade_type": "ASK"
        // },
        // ------------ Personal Trades ------------
        // {
        //     "symbol": "ETH_USDT",
        //     "order_id": "a39ea6b7afcf4f5cbba1e515210ff827",
        //     "quantity": "54.1",
        //     "price": "182.6317377",
        //     "amount": "9880.37700957",
        //     "fee": "9.88037700957",
        //     "trade_type": "BID",
        //     "fee_currency": "USDT",
        //     "is_taker": true,
        //     "create_time": 1572693911000
        // }
        let timestamp = undefined;
        let symbol = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        let price = undefined;
        let amount = undefined;
        let cost = undefined;
        let fee = undefined;
        const id = undefined;
        const orderId = this.safeString (trade, 'order_id');
        const type = undefined;
        const tradeTypes = this.options['enums']['tradeType'];
        if (orderId === undefined) {
            // Recent trades
            timestamp = this.safeInteger (trade, 'trade_time');
            side = tradeTypes[this.safeString (trade, 'trade_type')];
            const priceString = this.safeString (trade, 'trade_price');
            const amountString = this.safeString (trade, 'trade_quantity');
            // calculate cost from price and amount
            const costString = Precise.stringMul (priceString, amountString);
            price = this.parseNumber (priceString);
            amount = this.parseNumber (amountString);
            cost = this.parseNumber (costString);
        } else {
            // Personal trades
            timestamp = this.safeInteger (trade, 'create_time');
            side = tradeTypes[this.safeString (trade, 'trade_type')];
            price = this.safeNumber (trade, 'price');
            amount = this.safeNumber (trade, 'quantity');
            cost = this.safeNumber (trade, 'amount');
            const isTaker = this.safeValue (trade, 'is_taker');
            takerOrMaker = (isTaker) ? 'taker' : 'maker';
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            const feeCost = this.safeNumber (trade, 'fee');
            const marketId = this.safeString (trade, 'symbol');
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': undefined,
            };
            if (market === undefined) {
                market = this.safeMarket (marketId, undefined, undefined);
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = Math.floor (since / 1000);
        }
        const response = await this.publicGetMarketKline (this.extend (request, params));
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
        const ohlcvs = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // [
        //     1557728040,    //timestamp in seconds
        //     "7054.7",      //open
        //     "7056.26",     //close
        //     "7056.29",     //high
        //     "7054.16",     //low
        //     "9.817734",    //vol
        //     "6926.521"     //amount
        // ]
        const timestamp = this.safeTimestamp (ohlcv, 0);
        const open = this.safeNumber (ohlcv, 1);
        const close = this.safeNumber (ohlcv, 2);
        const high = this.safeNumber (ohlcv, 3);
        const low = this.safeNumber (ohlcv, 4);
        const volume = this.safeNumber (ohlcv, 5);
        return [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ];
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetMarketCoinList (params);
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
        const currencies = this.safeValue (response, 'data', {});
        // code int 状态码
        // message string 错误描述（如有）
        // currency string 币种
        // full_name string 币种全称
        // chain string 链名称
        // precision string 币种精度
        // is_withdraw_enabled string 是否可提现
        // is_deposit_enabled string 是否可充值
        // deposit_minconfirm number 充值区块最小确认数
        // withdraw_limit_max number 单次最大提币数量
        // withdraw_limit_min number 单次最小提币数量
        // fee string 提币手续费数量
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = currency['currency'];
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'full_name');
            let precision = undefined;
            let isWithdrawEnabled = false;
            let isDepositEnabled = false;
            const fees = {};
            const precisions = {};
            const networks = this.safeValue (currency, 'coins', []);
            const networkCount = networks.length;
            let fee = undefined;
            for (let j = 0; j < networkCount; j++) {
                const networkItem = networks[j];
                const network = this.safeString (networkItem, 'chain');
                const withdrawFee = this.safeNumber (networkItem, 'fee');
                const depositEnable = this.safeValue (networkItem, 'is_deposit_enabled');
                const withdrawEnable = this.safeValue (networkItem, 'is_withdraw_enabled');
                const networkPrecision = this.safeNumber (networkItem, 'precision');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
                precisions[network] = networkPrecision;
                if (networkCount === 1) {
                    fee = withdrawFee;
                    precision = networkPrecision;
                }
            }
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'precisions': precisions,
                'info': currency,
                'active': active,
                'fee': fee,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountInfo (params);
        const balances = this.safeValue (response, 'data', {});
        // {
        //     "code": 200,
        //     "data": {
        //         "BTC": {
        //             "frozen": "0",
        //             "available": "140"
        //         },
        //         "ETH": {
        //             "frozen": "8471.296525048",
        //             "available": "483280.9653659222035"
        //         },
        //         "USDT": {
        //             "frozen": "0",
        //             "available": "27.3629"
        //         },
        //         "MX": {
        //             "frozen": "30.9863",
        //             "available": "450.0137"
        //         }
        //     }
        // }
        const result = {
            'info': balances,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencys = Object.keys (balances);
        for (let i = 0; i < currencys.length; i++) {
            // {
            //    "frozen": "30.9863",
            //    "available": "450.0137"
            // }
            const currencyId = currencys[i];
            const balance = balances[currencyId];
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            result[currencyId] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a `symbol` argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a `type` argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a `side` argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a `amount` argument');
        }
        if (type === 'limit') {
            type = 'LIMIT_ORDER';
        } else {
            throw new InvalidOrder (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const tradeTypes = this.options['enums']['tradeType'];
        const request = {
            'price': this.priceToPrecision (symbol, price),
            'quantity': this.amountToPrecision (symbol, amount),
            'trade_type': tradeTypes[side],
            'order_type': type,
            'symbol': this.marketId (symbol),
        };
        const response = await this.privatePostOrderPlace (this.extend (request, params));
        const data = this.safeValue (response, 'data', '');
        return {
            'info': data,
            'id': data,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + 'cancelOrder() requires an id argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_ids': id.toString (),
        };
        const response = await this.privateDeleteOrderCancel (this.extend (request, params));
        return this.safeValue (response, 'data', {});
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrder() requires an `id` argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_ids': id,
        };
        const response = await this.privateGetOrderQuery (this.extend (request, params));
        const orders = this.safeValue (response, 'data', []);
        const orderCount = orders.length;
        if (orderCount === 0) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (orders[0], undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Unable to get all status orders at once due to the MEXC Exchange
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrders() requires a `symbol` argument');
        }
        const states = params['states'];
        if (states === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrders() requires a `params.states` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // symbol string Y symbol name
            // start_time string N start time the default is the last 7 days, and the maximum query is 30 days.
            // limit string N number of records to be returned 1~1000，default to 50
            // trade_type string Y order type BID，ASK
            // states string Y state to be quired NEW：Unfilled ；FILLED：Filled；PARTIALLY_FILLED：Partially filled；CANCELED：Canceled；PARTIALLY_CANCELED：Partially canceled
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = Math.floor (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderList (this.extend (request, params));
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOpenOrders() requires a symbol argument');
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
            request['start_time'] = Math.floor (since / 1000);
        }
        const response = await this.privateGetOrderOpenOrders (this.extend (request, params));
        // {
        //     "code": 200,
        //     "data": [
        //         {
        //             "id": "e5bb6963250146edb2f8677fcfcc97aa",
        //             "symbol": "MX_ETH",
        //             "price": "0.000907",
        //             "quantity": "300000",
        //             "state": "NEW",
        //             "type": "BID",
        //             "remain_quantity": "300000",
        //             "remain_amount": "272.1",
        //             "create_time": 1574338341797
        //         }
        //     ]
        // }
        const orders = this.safeValue (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'states': 'FILLED' }, params));
    }

    parseOrder (order, market = undefined) {
        // ---------- with `remain_quantity` and `remain_amount` ----------
        // {
        //     "id": "e5bb6963250146edb2f8677fcfcc97aa",
        //     "symbol": "MX_ETH",
        //     "price": "0.000907",
        //     "quantity": "300000",
        //     "state": "NEW",
        //     "type": "BID",
        //     "remain_quantity": "300000",
        //     "remain_amount": "272.1",
        //     "create_time": 1574338341797
        // }
        // ---------- with `deal_quantity` and `deal_amount` ---------
        // {
        //     "id": "72872b6ae721480ca4fe0f265d29dfee",
        //     "symbol": "MX_ETH",
        //     "price": "0.000907",
        //     "quantity": "300000",
        //     "state": "NEW",
        //     "type": "ASK",
        //     "deal_quantity": "0",
        //     "deal_amount": "0",
        //     "create_time": 1573117267000
        // }
        const tradeTypes = this.options['enums']['tradeType'];
        // const orderTypes = this.options['enums']['orderType'];
        const side = tradeTypes[this.safeString (order, 'type')];
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const timestamp = this.safeInteger (order, 'create_time');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'quantity');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        // 剩余数量
        const remainBaseAmount = this.safeNumber (order, 'remain_quantity');
        // 剩余金额
        const remianQuoteAmount = this.safeNumber (order, 'remain_amount');
        let filled = this.safeNumber (order, 'deal_quantity');
        let cost = this.safeNumber (order, 'deal_amount');
        let remaining = remainBaseAmount;
        if (filled === undefined) {
            // 总量 - 余量
            const filledString = Precise.stringSub (amount.toString (), remainBaseAmount.toString ());
            filled = this.parseNumber (filledString);
        }
        if (cost === undefined) {
            // 挂单金额 * 数量 - 余量
            const totalCostString = Precise.stringMul (price.toString (), amount.toString ());
            const costString = Precise.stringSub (totalCostString, remianQuoteAmount.toString ());
            cost = this.parseNumber (costString);
        }
        if (remaining === undefined) {
            const remainingString = Precise.stringSub (amount.toString (), filled.toString ());
            remaining = this.parseNumber (remainingString);
        }
        const orderType = this.safeString (order, 'order_type');
        const postOnly = (orderType === 'POST_ONLY');
        const timeInForce = (orderType === 'IMMEDIATE_OR_CANCEL');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp, // order placing/opening Unix timestamp in milliseconds
            'datetime': this.iso8601 (timestamp), // ISO8601 datetime of 'timestamp' with milliseconds
            'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
            'symbol': symbol,
            // mexc only has 'limit' order type: LIMIT_ORDER, POST_ONLY and IMMEDIATE_OR_CANCEL
            'type': 'limit', // 'market', 'limit'
            'timeInForce': timeInForce, // 'GTC', 'IOC', 'FOK', 'PO'
            'postOnly': postOnly,
            'side': side, // 'buy', 'sell'
            'price': price, // float price in quote currency (may be empty for market orders)
            'stopPrice': undefined,
            'average': undefined, // float average filling price
            'status': status, // 'open', 'closed', 'canceled', 'expired'
            // -----
            'cost': cost, // 'filled' * 'price' (filling price used where available)
            'amount': amount, // ordered amount of base currency
            'filled': filled, // filled amount of base currency
            'remaining': remaining, // remaining amount to fill
            'fee': undefined,
            'trades': undefined, // a list of order trades/executions
        });
    }

    parseOrderStatus (status) {
        const statuses = this.options['enums']['orderState'];
        return this.safeString (statuses, status, status);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // symbol string 是 交易对名称
            // limit string 否 返回条数 1~1000，默认值50
            // start_time string 否 查询起始时间
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = Math.floor (since / 1000);
        }
        const response = await this.privateGetOrderDeals (this.extend (request, params));
        // {
        //     "code": 200,
        //     "data": [
        //         {
        //             "symbol": "ETH_USDT",
        //             "order_id": "a39ea6b7afcf4f5cbba1e515210ff827",
        //             "quantity": "54.1",
        //             "price": "182.6317377",
        //             "amount": "9880.37700957",
        //             "fee": "9.88037700957",
        //             "trade_type": "BID",
        //             "fee_currency": "USDT",
        //             "is_taker": true,
        //             "create_time": 1572693911000
        //         }
        //     ]
        // }
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async privateGetDepositAddresses (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetAssetDepositAddressList (this.extend (request, params));
        // {
        //     "code": "200",
        //     "data": {
        //         "currency": "USDT",
        //         "chains": [{
        //             "chain": "TRC-20",
        //             "address": "TEPNhuMWFVYi4Tt5vi6C13ReVEokKRGmES"
        //         }, {
        //             "chain": "ERC-20",
        //             "address": "0x44718503f05c0ec16fc65c49d1f533d6fd0fc895"
        //         }]
        //     }
        // }
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '200') {
            const message = this.safeString2 (response, 'message', 'msg');
            throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + message);
        }
        const data = this.safeValue (response, 'data', {});
        const addresses = this.safeValue (data, 'chains', []);
        const formattedAddress = [];
        for (let i = 0; i < addresses.length; i++) {
            formattedAddress.push (this.extend ({ 'currency': code }, addresses[i]));
        }
        return formattedAddress;
    }

    async fetchDepositAddress (code, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a `code` argument');
        }
        const addresses = await this.privateGetDepositAddresses (code, params);
        // mexc does not support specifying parameter `network`, return the first address by default
        return this.parseDepositAddress (addresses[0], code);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        // {
        //    "currency": "USDT",
        //    "chain": "TRC-20",
        //    "address": "TEPNhuMWFVYi4Tt5vi6C13ReVEokKRGmES"
        // }
        return {
            'currency': (currency === undefined) ? this.safeString (depositAddress, 'currency') : currency,
            'address': this.safeString (depositAddress, 'address'),
            'tag': undefined,
            'info': depositAddress,
            // extra
            'network': this.safeString (depositAddress, 'chain'),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a `code` argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a `amount` argument');
        }
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a `address` argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyInfo = this.safeValue (currency, 'info', {});
        const coins = this.safeValue (currencyInfo, 'coins', []);
        if (coins.length > 1) {
            const paramChain = this.safeString (params, 'chain');
            if (paramChain === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() ' + code + ' requires a `chain` in params');
            } else {
                let hasParamChain = false;
                for (let i = 0; i < coins.length; i++) {
                    const chain = this.safeString (coins[i], 'chain');
                    if (chain === paramChain) {
                        hasParamChain = true;
                    }
                }
                if (!hasParamChain) {
                    throw new ArgumentsRequired (this.id + ' withdraw() ' + code + ' chain `' + paramChain + '` not supported');
                }
            }
        }
        if (tag !== undefined) {
            address += ':' + tag;
        }
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        const response = await this.privatePostAssetWithdraw (this.extend (request, params));
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '200') {
            const message = this.safeString2 (response, 'message', 'msg');
            throw new ExchangeError (this.id + ' withdraw failed: ' + message);
        }
        const data = this.safeValue (response, 'data', {});
        const withdrawId = this.safeString (data, 'withdrawId');
        return {
            'info': response,
            'id': withdrawId,
        };
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        const version = this.version;
        url += '/v' + version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = (headers === undefined) ? {} : headers;
            const apiKey = this.apiKey;
            const secret = this.secret;
            const reqTime = this.nonce ();
            const queryString = this.urlencode (this.keysort (params));
            url += '?' + queryString;
            let signString = apiKey + reqTime;
            headers = this.extend ({
                'ApiKey': apiKey,
                'Request-Time': reqTime,
                'Content-Type': 'application/json',
            }, headers);
            if (method === 'GET' || method === 'DELETE') {
                signString += queryString;
            } else {
                const jsonData = this.json (params);
                body = jsonData;
                signString += jsonData;
            }
            const signature = this.hmac (this.encode (signString), this.encode (secret), 'sha256', 'hex');
            headers['Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        let message = this.safeString2 (response, 'message', 'msg');
        if (message === undefined) {
            message = body;
        }
        message = this.id + ' ' + message;
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, message);
    }
};
