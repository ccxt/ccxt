'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, ExchangeNotAvailable, InvalidOrder, OrderNotFound, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class huobipro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobipro',
            'name': 'Huobi Pro',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome39'],
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'api.huobi.pro',
            'has': {
                'CORS': false,
                'fetchDepositAddress': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTradingLimits': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchCurrencies': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '1d': '1day',
                '1w': '1week',
                '1M': '1mon',
                '1y': '1year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'https://api.huobi.pro',
                'www': 'https://www.huobi.pro',
                'referral': 'https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
                'fees': 'https://www.huobi.pro/about/fee/',
            },
            'api': {
                'market': {
                    'get': [
                        'history/kline', // 获取K线数据
                        'detail/merged', // 获取聚合行情(Ticker)
                        'depth', // 获取 Market Depth 数据
                        'trade', // 获取 Trade Detail 数据
                        'history/trade', // 批量获取最近的交易记录
                        'detail', // 获取 Market Detail 24小时成交量数据
                    ],
                },
                'public': {
                    'get': [
                        'common/symbols', // 查询系统支持的所有交易对
                        'common/currencys', // 查询系统支持的所有币种
                        'common/timestamp', // 查询系统当前时间
                        'common/exchange', // order limits
                        'settings/currencys', // ?language=en-US
                    ],
                },
                'private': {
                    'get': [
                        'account/accounts', // 查询当前用户的所有账户(即account-id)
                        'account/accounts/{id}/balance', // 查询指定账户的余额
                        'order/orders/{id}', // 查询某个订单详情
                        'order/orders/{id}/matchresults', // 查询某个订单的成交明细
                        'order/orders', // 查询当前委托、历史委托
                        'order/matchresults', // 查询当前成交、历史成交
                        'dw/withdraw-virtual/addresses', // 查询虚拟币提现地址
                        'dw/deposit-virtual/addresses',
                        'query/deposit-withdraw',
                        'margin/loan-orders', // 借贷订单
                        'margin/accounts/balance', // 借贷账户详情
                    ],
                    'post': [
                        'order/orders/place', // 创建并执行一个新订单 (一步下单， 推荐使用)
                        'order/orders', // 创建一个新的订单请求 （仅创建订单，不执行下单）
                        'order/orders/{id}/place', // 执行一个订单 （仅执行已创建的订单）
                        'order/orders/{id}/submitcancel', // 申请撤销一个订单请求
                        'order/orders/batchcancel', // 批量撤销订单
                        'dw/balance/transfer', // 资产划转
                        'dw/withdraw/api/create', // 申请提现虚拟币
                        'dw/withdraw-virtual/create', // 申请提现虚拟币
                        'dw/withdraw-virtual/{id}/place', // 确认申请虚拟币提现
                        'dw/withdraw-virtual/{id}/cancel', // 申请取消提现虚拟币
                        'dw/transfer-in/margin', // 现货账户划入至借贷账户
                        'dw/transfer-out/margin', // 借贷账户划出至现货账户
                        'margin/orders', // 申请借贷
                        'margin/orders/{id}/repay', // 归还借贷
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'account-frozen-balance-insufficient-error': InsufficientFunds, // {"status":"error","err-code":"account-frozen-balance-insufficient-error","err-msg":"trade account balance is not enough, left: `0.0027`","data":null}
                'invalid-amount': InvalidOrder, // eg "Paramemter `amount` is invalid."
                'order-limitorder-amount-min-error': InvalidOrder, // limit order amount error, min: `0.001`
                'order-marketorder-amount-min-error': InvalidOrder, // market order amount error, min: `0.01`
                'order-limitorder-price-min-error': InvalidOrder, // limit order price error
                'order-orderstate-error': OrderNotFound, // canceling an already canceled order
                'order-queryorder-invalid': OrderNotFound, // querying a non-existent order
                'order-update-error': ExchangeNotAvailable, // undocumented error
                'api-signature-check-failed': AuthenticationError,
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarketsMethod': 'publicGetCommonSymbols',
                'fetchBalanceMethod': 'privateGetAccountAccountsIdBalance',
                'createOrderMethod': 'privatePostOrderOrdersPlace',
                'language': 'en-US',
            },
        });
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        let info = {};
        let limits = {};
        if (typeof symbols === 'undefined')
            symbols = this.symbols;
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            let market = this.market (symbol);
            let response = await this.publicGetCommonExchange (this.extend ({
                'symbol': market['id'],
            }));
            let limit = this.parseTradingLimits (response);
            info[symbol] = response;
            limits[symbol] = limit;
        }
        return {
            'limits': limits,
            'info': info,
        };
    }

    parseTradingLimits (response, symbol = undefined, params = {}) {
        let data = response['data'];
        if (typeof data === 'undefined') {
            return undefined;
        }
        return {
            'amount': {
                'min': data['limit-order-must-greater-than'],
                'max': data['limit-order-must-less-than'],
            },
        };
    }

    async fetchMarkets () {
        let method = this.options['fetchMarketsMethod'];
        let response = await this[method] ();
        let markets = response['data'];
        let numMarkets = markets.length;
        if (numMarkets < 1)
            throw new ExchangeError (this.id + ' publicGetCommonSymbols returned empty response: ' + this.json (markets));
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let baseId = market['base-currency'];
            let quoteId = market['quote-currency'];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            let id = baseId + quoteId;
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['amount-precision'],
                'price': market['price-precision'],
            };
            let lot = Math.pow (10, -precision['amount']);
            let maker = (base === 'OMG') ? 0 : 0.2 / 100;
            let taker = (base === 'OMG') ? 0 : 0.2 / 100;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'lot': lot,
                'active': true,
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = this.milliseconds ();
        if ('ts' in ticker)
            timestamp = ticker['ts'];
        let bid = undefined;
        let ask = undefined;
        let bidVolume = undefined;
        let askVolume = undefined;
        if ('bid' in ticker) {
            if (Array.isArray (ticker['bid'])) {
                bid = this.safeFloat (ticker['bid'], 0);
                bidVolume = this.safeFloat (ticker['bid'], 1);
            }
        }
        if ('ask' in ticker) {
            if (Array.isArray (ticker['ask'])) {
                ask = this.safeFloat (ticker['ask'], 0);
                askVolume = this.safeFloat (ticker['ask'], 1);
            }
        }
        let open = this.safeFloat (ticker, 'open');
        let close = this.safeFloat (ticker, 'close');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((typeof open !== 'undefined') && (typeof close !== 'undefined')) {
            change = close - open;
            average = this.sum (open, close) / 2;
            if ((typeof close !== 'undefined') && (close > 0))
                percentage = (change / open) * 100;
        }
        let baseVolume = this.safeFloat (ticker, 'amount');
        let quoteVolume = this.safeFloat (ticker, 'vol');
        let vwap = undefined;
        if (typeof baseVolume !== 'undefined' && typeof quoteVolume !== 'undefined' && baseVolume > 0)
            vwap = quoteVolume / baseVolume;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetDepth (this.extend ({
            'symbol': market['id'],
            'type': 'step0',
        }, params));
        if ('tick' in response) {
            if (!response['tick']) {
                throw new ExchangeError (this.id + ' fetchOrderBook() returned empty response: ' + this.json (response));
            }
            let orderbook = response['tick'];
            let timestamp = orderbook['ts'];
            orderbook['nonce'] = orderbook['version'];
            return this.parseOrderBook (orderbook, timestamp);
        }
        throw new ExchangeError (this.id + ' fetchOrderBook() returned unrecognized response: ' + this.json (response));
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.marketGetDetailMerged (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response['tick'], market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (trade, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.safeInteger2 (trade, 'ts', 'created-at');
        let order = this.safeString (trade, 'order-id');
        let side = this.safeString (trade, 'direction');
        let type = this.safeString (trade, 'type');
        if (typeof type !== 'undefined') {
            let typeParts = type.split ('-');
            side = typeParts[0];
            type = typeParts[1];
        }
        let amount = this.safeFloat2 (trade, 'filled-amount', 'amount');
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': amount,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrderMatchresults (params);
        let trades = this.parseTrades (response['data'], undefined, since, limit);
        if (typeof symbol !== 'undefined') {
            let market = this.market (symbol);
            trades = this.filterBySymbol (trades, market['symbol']);
        }
        return trades;
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['size'] = limit;
        let response = await this.marketGetHistoryTrade (this.extend (request, params));
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let trades = data[i]['data'];
            for (let j = 0; j < trades.length; j++) {
                let trade = this.parseTrade (trades[j], market);
                result.push (trade);
            }
        }
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['id'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['amount'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (typeof limit !== 'undefined') {
            request['size'] = limit;
        }
        let response = await this.marketGetHistoryKline (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async loadAccounts (reload = false) {
        if (reload) {
            this.accounts = await this.fetchAccounts ();
        } else {
            if (this.accounts) {
                return this.accounts;
            } else {
                this.accounts = await this.fetchAccounts ();
                this.accountsById = this.indexBy (this.accounts, 'id');
            }
        }
        return this.accounts;
    }

    async fetchAccounts () {
        await this.loadMarkets ();
        let response = await this.privateGetAccountAccounts ();
        return response['data'];
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetSettingsCurrencys (this.extend ({
            'language': this.options['language'],
        }, params));
        let currencies = response['data'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            //
            //  {                     name: "ctxc",
            //              'display-name': "CTXC",
            //        'withdraw-precision':  8,
            //             'currency-type': "eth",
            //        'currency-partition': "pro",
            //             'support-sites':  null,
            //                'otc-enable':  0,
            //        'deposit-min-amount': "2",
            //       'withdraw-min-amount': "4",
            //            'show-precision': "8",
            //                      weight: "2988",
            //                     visible:  true,
            //              'deposit-desc': "Please don’t deposit any other digital assets except CTXC t…",
            //             'withdraw-desc': "Minimum withdrawal amount: 4 CTXC. !>_<!For security reason…",
            //           'deposit-enabled':  true,
            //          'withdraw-enabled':  true,
            //    'currency-addr-with-tag':  false,
            //             'fast-confirms':  15,
            //             'safe-confirms':  30                                                             }
            //
            let id = this.safeValue (currency, 'name');
            let precision = this.safeInteger (currency, 'withdraw-precision');
            let code = this.commonCurrencyCode (id.toUpperCase ());
            let active = currency['visible'] && currency['deposit-enabled'] && currency['withdraw-enabled'];
            result[code] = {
                'id': id,
                'code': code,
                'type': 'crypto',
                // 'payin': currency['deposit-enabled'],
                // 'payout': currency['withdraw-enabled'],
                // 'transfer': undefined,
                'name': currency['display-name'],
                'active': active,
                'fee': undefined, // todo need to fetch from fee endpoint
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
                    'deposit': {
                        'min': this.safeFloat (currency, 'deposit-min-amount'),
                        'max': Math.pow (10, precision),
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdraw-min-amount'),
                        'max': Math.pow (10, precision),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let method = this.options['fetchBalanceMethod'];
        let response = await this[method] (this.extend ({
            'id': this.accounts[0]['id'],
        }, params));
        let balances = response['data']['list'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let uppercase = balance['currency'].toUpperCase ();
            let currency = this.commonCurrencyCode (uppercase);
            let account = undefined;
            if (currency in result)
                account = result[currency];
            else
                account = this.account ();
            if (balance['type'] === 'trade')
                account['free'] = parseFloat (balance['balance']);
            if (balance['type'] === 'frozen')
                account['used'] = parseFloat (balance['balance']);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrdersByStates (states, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'states': states,
        };
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let response = await this.privateGetOrderOrders (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('pre-submitted,submitted,partial-filled,filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('pre-submitted,submitted,partial-filled', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStates ('filled,partial-canceled,canceled', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrderOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response['data']);
    }

    parseOrderStatus (status) {
        if (status === 'partial-filled') {
            return 'open';
        } else if (status === 'partial-canceled') {
            return 'canceled';
        } else if (status === 'filled') {
            return 'closed';
        } else if (status === 'canceled') {
            return 'canceled';
        } else if (status === 'submitted') {
            return 'open';
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        let type = undefined;
        let status = undefined;
        if ('type' in order) {
            let orderType = order['type'].split ('-');
            side = orderType[0];
            type = orderType[1];
            status = this.parseOrderStatus (order['state']);
        }
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if ('symbol' in order) {
                if (order['symbol'] in this.markets_by_id) {
                    let marketId = order['symbol'];
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = order['created-at'];
        let amount = this.safeFloat (order, 'amount');
        let filled = parseFloat (order['field-amount']);
        let remaining = amount - filled;
        let price = this.safeFloat (order, 'price');
        let cost = parseFloat (order['field-cash-amount']);
        let average = 0;
        if (filled)
            average = parseFloat (cost / filled);
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = this.market (symbol);
        let order = {
            'account-id': this.accounts[0]['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'symbol': market['id'],
            'type': side + '-' + type,
        };
        if (this.options['createMarketBuyOrderRequiresPrice']) {
            if ((type === 'market') && (side === 'buy')) {
                if (typeof price === 'undefined') {
                    throw new InvalidOrder (this.id + " market buy order requires price argument to calculate cost (total amount of quote currency to spend for buying, amount * price). To switch off this warning exception and specify cost in the amount argument, set .options['createMarketBuyOrderRequiresPrice'] = false. Make sure you know what you're doing.");
                } else {
                    order['amount'] = this.priceToPrecision (symbol, parseFloat (amount) * parseFloat (price));
                }
            }
        }
        if (type === 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let method = this.options['createOrderMethod'];
        let response = await this[method] (this.extend (order, params));
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': response['data'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderOrdersIdSubmitcancel ({ 'id': id });
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetDwDepositVirtualAddresses (this.extend ({
            'currency': currency['id'].toLowerCase (),
        }, params));
        let address = this.safeString (response, 'data');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    feeToPrecision (currency, fee) {
        return parseFloat (this.decimalToPrecision (fee, 0, this.currencies[currency]['precision']));
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (market[key], cost)),
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        let currency = this.currency (code);
        let request = {
            'address': address, // only supports existing addresses in your withdraw address list
            'amount': amount,
            'currency': currency['id'].toLowerCase (),
        };
        if (typeof tag !== 'undefined')
            request['addr-tag'] = tag; // only for XRP?
        let response = await this.privatePostDwWithdrawApiCreate (this.extend (request, params));
        let id = undefined;
        if ('data' in response) {
            id = response['data'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        if (api === 'market')
            url += api;
        else
            url += this.version;
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let timestamp = this.ymdhms (this.milliseconds (), 'T');
            let request = this.keysort (this.extend ({
                'SignatureMethod': 'HmacSHA256',
                'SignatureVersion': '2',
                'AccessKeyId': this.apiKey,
                'Timestamp': timestamp,
            }, query));
            let auth = this.urlencode (request);
            // unfortunately, PHP demands double quotes for the escaped newline symbol
            // eslint-disable-next-line quotes
            let payload = [ method, this.hostname, url, auth ].join ("\n");
            let signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            auth += '&' + this.urlencode ({ 'Signature': signature });
            url += '?' + auth;
            if (method === 'POST') {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            } else {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('status' in response) {
                //
                //     {"status":"error","err-code":"order-limitorder-amount-min-error","err-msg":"limit order amount error, min: `0.001`","data":null}
                //
                let status = this.safeString (response, 'status');
                if (status === 'error') {
                    const code = this.safeString (response, 'err-code');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
