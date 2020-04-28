'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, OrderNotFound, ArgumentsRequired, BadSymbol, BadRequest, RequestTimeout, RateLimitExceeded, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class hbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hbtc',
            'name': 'HBTC Exchange',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTime': true,
                'fetchBidAsk': true,
                'fetchBidsAsks': true,
                'fetchTickers': true,
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
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://static.bhfastime.com/bhop/image/LNGLqbeLy3Fii-j6cYHcPP2l4rt5pboW_FF_ER4uExg.png', // 交易所LOGO
                'api': {
                    'quote': 'https://api.hbtc.com/openapi/quote', // 市场API数据端点
                    'contract': 'https://api.hbtc.com/openapi/contract', // 合约API数据端点
                    'option': 'https://api.hbtc.com/openapi/option', // 合约API数据端点
                    'public': 'https://api.hbtc.com/openapi', // 公共API数据端点
                    'private': 'https://api.hbtc.com/openapi', // 私有API数据端点
                    'zendesk': 'https://hbtc.zendesk.com/hc/en-us',
                },
                'www': 'https://www.hbtc.com', // 公司主页
                'referral': 'https://www.hbtc.com/register/HH6PGQ', // 邀请链接
                'doc': 'https://github.com/bhexopen/BHEX-OpenApi/tree/master/doc', // openapi文档地址
                'fees': 'https://hbtc.zendesk.com/hc/zh-cn/articles/360009274694', // 费率介绍
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'brokerInfo', // 查询当前broker交易规则和symbol信息
                        'getOptions',
                    ],
                },
                'quote': {
                    'get': [
                        'depth', // 获取深度
                        'depth/merged',
                        'trades', // 获取当前最新成交
                        'klines', // 获取K线数据
                        'ticker/24hr', // 获取24小时价格变化数据
                        'ticker/price',
                        'ticker/bookTicker',
                        'contract/index', // 获取合约标的指数价格
                        'contract/depth', // 获取合约深度
                        'contract/depth/merged',
                        'contract/trades', // 获取合约最近成交,
                        'contract/klines', // 获取合约的K线数据
                        'contract/ticker/24hr',
                        'option/index',
                        'option/depth',
                        'option/depth/merged',
                        'option/trades',
                        'option/klines',
                        'option/ticker/24hr',
                    ],
                },
                'contract': {
                    'get': [
                        // public
                        'insurance',
                        'fundingRate', // 获取资金费率信息
                        // private
                        'openOrders', // 查询合约当前委托
                        'historyOrders', // 查询合约历史委托
                        'getOrder', // 查询合约订单详情
                        'myTrades', // 查询合约历史成交
                        'positions', // 查询合约当前持仓
                        'account', // 查询合约账户信息
                    ],
                    'post': [
                        'order', // 创建合约订单
                        'modifyMargin', // 修改保证金
                    ],
                    'delete': [
                        'order/cancel', // 取消合约订单
                        'order/batchCancel',
                    ],
                },
                'option': {
                    'get': [
                        'openOrders',
                        'positions',
                        'historyOrders',
                        'getOrder',
                        'myTrades',
                        'settlements',
                        'account',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order/cancel',
                    ],
                },
                'private': {
                    'get': [
                        'order', // 查询订单
                        'openOrders', // 查询当前委托
                        'historyOrders', // 查询历史委托
                        'account', // 获取当前账户信息
                        'myTrades', // 查询历史成交
                        'depositOrders',
                    ],
                    'post': [
                        'order', // 创建新订单
                        'order/test',
                        'userDataStream',
                        'subAccount/query',
                        'transfer',
                        'balance_flow',
                        'user/transfer',
                    ],
                    'put': [
                        'userDataStream',
                    ],
                    'delete': [
                        'order', // 取消订单
                        'userDataStream',
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
            // exchange-specific options
            'options': {
                'fetchTickers': {
                    'method': 'quoteGetTicker24hr',
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "serverTime": 1527777538000
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    parseMarket (market, type = 'spot') {
        const filters = this.safeValue (market, 'filters', []);
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let spot = true;
        let contract = false;
        let swap = false;
        let option = false;
        if (type === 'contract') {
            symbol = id;
            spot = false;
            contract = true;
            swap = true; // ?
        } else if (type === 'option') {
            symbol = id;
            spot = false;
            option = true;
        }
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
            if (filterType === 'MIN_NOTIONAL') {
                costMin = this.safeFloat (filter, 'minNotional');
            }
        }
        if ((costMin === undefined) && (amountMin !== undefined) && (priceMin !== undefined)) {
            costMin = amountMin * priceMin;
        }
        const precision = {
            'price': this.safeFloat2 (market, 'quotePrecision', 'quoteAssetPrecision'),
            'amount': this.safeFloat (market, 'baseAssetPrecision'),
        };
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
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': type,
            'spot': spot,
            'contract': contract,
            'swap': swap,
            'option': option,
            'precision': precision,
            'limits': limits,
            'info': market,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetBrokerInfo (params);
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":"1588015885118",
        //         "brokerFilters":[],
        //         "symbols":[
        //             {
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000.00000000","tickSize":"0.01","filterType":"PRICE_FILTER"},
        //                     {"minQty":"0.0005","maxQty":"100000.00000000","stepSize":"0.000001","filterType":"LOT_SIZE"},
        //                     {"minNotional":"5","filterType":"MIN_NOTIONAL"}
        //                 ],
        //                 "exchangeId":"301",
        //                 "symbol":"BTCUSDT",
        //                 "symbolName":"BTCUSDT",
        //                 "status":"TRADING",
        //                 "baseAsset":"BTC",
        //                 "baseAssetPrecision":"0.000001",
        //                 "quoteAsset":"USDT",
        //                 "quotePrecision":"0.01",
        //                 "icebergAllowed":false
        //             },
        //         ],
        //         "options":[
        //             {
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000.00000000","tickSize":"0.01","filterType":"PRICE_FILTER"},
        //                     {"minQty":"0.01","maxQty":"100000.00000000","stepSize":"0.001","filterType":"LOT_SIZE"},
        //                     {"minNotional":"1","filterType":"MIN_NOTIONAL"}
        //                 ],
        //                 "exchangeId":"301",
        //                 "symbol":"BTC0501CS8500",
        //                 "symbolName":"BTC0501CS8500",
        //                 "status":"TRADING",
        //                 "baseAsset":"BTC0501CS8500",
        //                 "baseAssetPrecision":"0.001",
        //                 "quoteAsset":"BUSDT",
        //                 "quotePrecision":"0.01",
        //                 "icebergAllowed":false
        //             },
        //         ],
        //         "contracts":[
        //             {
        //                 "filters":[
        //                     {"minPrice":"0.1","maxPrice":"100000.00000000","tickSize":"0.1","filterType":"PRICE_FILTER"},
        //                     {"minQty":"1","maxQty":"100000.00000000","stepSize":"1","filterType":"LOT_SIZE"},
        //                     {"minNotional":"0.000001","filterType":"MIN_NOTIONAL"}
        //                 ],
        //                 "exchangeId":"301",
        //                 "symbol":"BTC-PERP-REV",
        //                 "symbolName":"BTC-PERP-REV",
        //                 "status":"TRADING",
        //                 "baseAsset":"BTC-PERP-REV",
        //                 "baseAssetPrecision":"1",
        //                 "quoteAsset":"USDT",
        //                 "quoteAssetPrecision":"0.1",
        //                 "icebergAllowed":false,
        //                 "inverse":true,
        //                 "index":"BTCUSDT",
        //                 "marginToken":"TBTC",
        //                 "marginPrecision":"0.00000001",
        //                 "contractMultiplier":"1.0",
        //                 "underlying":"TBTC",
        //                 "riskLimits":[
        //                     {"riskLimitId":"200000001","quantity":"1000000.0","initialMargin":"0.01","maintMargin":"0.005"},
        //                     {"riskLimitId":"200000002","quantity":"2000000.0","initialMargin":"0.02","maintMargin":"0.01"},
        //                     {"riskLimitId":"200000003","quantity":"3000000.0","initialMargin":"0.03","maintMargin":"0.015"},
        //                     {"riskLimitId":"200000004","quantity":"4000000.0","initialMargin":"0.04","maintMargin":"0.02"}
        //                 ]
        //             },
        //             {
        //                 "filters":[
        //                     {"minPrice":"0.1","maxPrice":"100000.00000000","tickSize":"0.1","filterType":"PRICE_FILTER"},
        //                     {"minQty":"1","maxQty":"100000.00000000","stepSize":"1","filterType":"LOT_SIZE"},
        //                     {"minNotional":"0.000001","filterType":"MIN_NOTIONAL"}
        //                 ],
        //                 "exchangeId":"301",
        //                 "symbol":"BTC-SWAP",
        //                 "symbolName":"BTC-SWAP",
        //                 "status":"TRADING",
        //                 "baseAsset":"BTC-SWAP",
        //                 "baseAssetPrecision":"1",
        //                 "quoteAsset":"USDT",
        //                 "quoteAssetPrecision":"0.1",
        //                 "icebergAllowed":false,
        //                 "inverse":true,
        //                 "index":"BTCUSDT",
        //                 "marginToken":"BTC",
        //                 "marginPrecision":"0.00000001",
        //                 "contractMultiplier":"1.0",
        //                 "underlying":"BTC",
        //                 "riskLimits":[
        //                     {"riskLimitId":"500000001","quantity":"1000000.0","initialMargin":"0.01","maintMargin":"0.005"},
        //                     {"riskLimitId":"500000002","quantity":"2000000.0","initialMargin":"0.02","maintMargin":"0.01"},
        //                     {"riskLimitId":"500000003","quantity":"3000000.0","initialMargin":"0.03","maintMargin":"0.015"},
        //                     {"riskLimitId":"500000004","quantity":"4000000.0","initialMargin":"0.04","maintMargin":"0.02"}
        //                 ]
        //             },
        //             {
        //                 "filters":[
        //                     {"minPrice":"0.1","maxPrice":"100000.00000000","tickSize":"0.1","filterType":"PRICE_FILTER"},
        //                     {"minQty":"1","maxQty":"100000.00000000","stepSize":"1","filterType":"LOT_SIZE"},
        //                     {"minNotional":"0.000000001","filterType":"MIN_NOTIONAL"}
        //                 ],
        //                 "exchangeId":"301",
        //                 "symbol":"BTC-PERP-BUSDT",
        //                 "symbolName":"BTC-PERP-BUSDT",
        //                 "status":"TRADING",
        //                 "baseAsset":"BTC-PERP-BUSDT",
        //                 "baseAssetPrecision":"1",
        //                 "quoteAsset":"BUSDT",
        //                 "quoteAssetPrecision":"0.1",
        //                 "icebergAllowed":false,
        //                 "inverse":false,
        //                 "index":"BTCUSDT",
        //                 "marginToken":"BUSDT",
        //                 "marginPrecision":"0.0001",
        //                 "contractMultiplier":"0.0001",
        //                 "underlying":"TBTC",
        //                 "riskLimits":[
        //                     {"riskLimitId":"600000132","quantity":"1000000.0","initialMargin":"0.01","maintMargin":"0.005"},
        //                     {"riskLimitId":"600000133","quantity":"2000000.0","initialMargin":"0.02","maintMargin":"0.01"},
        //                     {"riskLimitId":"600000134","quantity":"3000000.0","initialMargin":"0.03","maintMargin":"0.015"},
        //                     {"riskLimitId":"600000135","quantity":"4000000.0","initialMargin":"0.04","maintMargin":"0.02"}
        //                 ]
        //             },
        //         ]
        //     }
        //
        const result = [];
        const symbols = this.safeValue (response, 'symbols', []);
        for (let i = 0; i < symbols.length; i++) {
            const market = this.parseMarket (symbols[i], 'spot');
            result.push (market);
        }
        const options = this.safeValue (response, 'options', []);
        for (let i = 0; i < options.length; i++) {
            const market = this.parseMarket (options[i], 'option');
            result.push (market);
        }
        const contracts = this.safeValue (response, 'contracts', []);
        for (let i = 0; i < contracts.length; i++) {
            const market = this.parseMarket (contracts[i], 'contract');
            result.push (market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 40, max 40
        }
        const response = await this.quoteGetDepth (this.extend (request, params));
        //
        //     {
        //         "time":1588068913453,
        //         "bids":[
        //             ["0.025278","0.0202"],
        //             ["0.025277","16.1132"],
        //             ["0.025276","7.9056"],
        //         ]
        //         "asks":[
        //             ["0.025302","5.9999"],
        //             ["0.025303","34.9151"],
        //             ["0.025304","92.391"],
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.quoteGetTicker24hr (this.extend (request, params));
        //
        //     {
        //         "time":1588069860794,
        //         "symbol":"BNB0501PS16",
        //         "bestBidPrice":"0.2129",
        //         "bestAskPrice":"0.3163",
        //         "volume":"33547",
        //         "quoteVolume":"10801.987",
        //         "lastPrice":"0.2625",
        //         "highPrice":"0.3918",
        //         "lowPrice":"0.2625",
        //         "openPrice":"0.362",
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchBidAsk (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.quoteGetTickerBookTicker (this.extend (request, params));
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "bidPrice": "4.00000000",
        //         "bidQty": "431.00000000",
        //         "askPrice": "4.00000200",
        //         "askQty": "9.00000000"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.quoteGetTickerBookTicker (params);
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "bidPrice": "4.00000000",
        //             "bidQty": "431.00000000",
        //             "askPrice": "4.00000200",
        //             "askQty": "9.00000000"
        //         },
        //         {
        //             "symbol": "ETHBTC",
        //             "bidPrice": "0.07946700",
        //             "bidQty": "9.00000000",
        //             "askPrice": "100000.00000000",
        //             "askQty": "1000.00000000"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultMethod = this.safeString (options, 'method', 'quoteGetTicker24hr');
        const defaultType = this.safeString (options, 'type', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = defaultMethod;
        if (type === 'contract') {
            method = 'quoteGetContractTicker24hr';
        } else if (type === 'option') {
            method = 'quoteGetOptionTicker24hr';
        }
        const response = await this[method] (query);
        //
        //     [
        //         {
        //             "time": 1538725500422,
        //             "symbol": "ETHBTC",
        //             "lastPrice": "4.00000200",
        //             "openPrice": "99.00000000",
        //             "highPrice": "100.00000000",
        //             "lowPrice": "0.10000000",
        //             "volume": "8913.30000000"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const defaultType = this.safeString (options, 'type', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        let method = 'privateGetAccount';
        if (type === 'contract') {
            method = 'contractGetAccount';
        } else if (type === 'option') {
            method = 'optionGetAccount';
        }
        const response = await this[method] (query);
        //
        // spot
        //
        //     {
        //         'balances': [
        //             {
        //                 'asset': 'ALGO',
        //                 'free': '0',
        //                 'locked': '0'
        //             },
        //             {
        //                 'asset': 'BHT',
        //                 'free': '0',
        //                 'locked': '0'
        //             }
        //         ]
        //     }
        //
        // contract
        //
        //     {
        //         "BUSDT":{
        //             "total":"1000",
        //             "availableMargin":"1000",
        //             "positionMargin":"0",
        //             "orderMargin":"0",
        //             "tokenId":"BUSDT"
        //         },
        //         "TBTC":{
        //             "total":"0.5",
        //             "availableMargin":"0.5",
        //             "positionMargin":"0",
        //             "orderMargin":"0",
        //             "tokenId":"TBTC"
        //         }
        //     }
        //
        // option
        //
        //     {
        //         "optionAsset":"",
        //         "balances":[
        //             {
        //                 "tokenName":"USDT",
        //                 "free":"0.0",
        //                 "locked":"0.0",
        //                 "margin":"0.0"
        //             },
        //             {
        //                 "tokenName":"BUSDT",
        //                 "free":"0.0",
        //                 "locked":"0.0",
        //                 "margin":"0.0"
        //             }
        //         ]
        //     }
        //
        const balances = this.safeValue (response, 'balances');
        const result = { 'info': response };
        if (balances !== undefined) {
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString2 (balance, 'asset', 'tokenName');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeFloat (balance, 'free');
                account['used'] = this.safeFloat (balance, 'locked');
                result[code] = account;
            }
        } else {
            const currencyIds = Object.keys (response);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const code = this.safeCurrencyCode (currencyId);
                const balance = response[currencyId];
                const account = this.account ();
                account['free'] = this.safeFloat (balance, 'availableMargin');
                account['total'] = this.safeFloat (balance, 'total');
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
        const response = await this.quoteGetTrades (this.extend (request, params));
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
            'orderId': id,
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
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "time":1588069860794,
        //         "symbol":"BNB0501PS16",
        //         "bestBidPrice":"0.2129",
        //         "bestAskPrice":"0.3163",
        //         "volume":"33547",
        //         "quoteVolume":"10801.987",
        //         "lastPrice":"0.2625",
        //         "highPrice":"0.3918",
        //         "lowPrice":"0.2625",
        //         "openPrice":"0.362",
        //     }
        //
        // fetchBidAsk, fetchBidAsks
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "bidPrice": "4.00000000",
        //         "bidQty": "431.00000000",
        //         "askPrice": "4.00000200",
        //         "askQty": "9.00000000"
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'time');
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
            'bid': this.safeFloat2 (ticker, 'bestBidPrice', 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQty'),
            'ask': this.safeFloat2 (ticker, 'bestAskPrice', 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQty'),
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
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'takerOrMaker': takerOrMaker ? 'taker' : 'maker',
            'price': price,
            'amount': amount,
            'side': undefined,
            'cost': undefined,
            'type': undefined,
            'order': undefined,
            'fee': undefined,
        };
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeFloat (trade, 'time');
        const type = undefined;
        const orderId = this.safeString (trade, 'orderId');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
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
        const isBuyer = this.safeValue (trade, 'isBuyer');
        const side = isBuyer ? 'BUY' : 'SELL';
        let fee = undefined;
        const commission = this.safeFloat (trade, 'commission');
        const commissionAsset = this.safeString (trade, 'commissionAsset');
        if (commission !== undefined && commissionAsset !== undefined) {
            fee = {
                'cost': commission,
                'currency': commissionAsset,
            };
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
            'fee': fee,
        };
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        let timestamp = this.safeInteger (order, 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (order, 'transactTime');
        }
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
        const cost = this.safeFloat (order, 'executedAmount');
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
            'cost': cost,
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
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const isPublicContract = (api === 'contract') && ((path === 'insurance') || (path === 'fundingRate'));
        if ((api === 'public') || (api === 'quote') || isPublicContract) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            const timestamp = this.milliseconds ();
            this.checkRequiredCredentials ();
            const requestParams = this.extend ({
                'timestamp': timestamp,
            }, query);
            // 准备待签名数据
            const auth = this.urlencode (requestParams);
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
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
