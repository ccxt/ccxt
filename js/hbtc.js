'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, OrderNotFound, ArgumentsRequired, BadSymbol, BadRequest, NullResponse, InvalidOrder, BadResponse, NotSupported, ExchangeNotAvailable, RequestTimeout, RateLimitExceeded, PermissionDenied, InsufficientFunds, InvalidAddress } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class hbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hbtc',
            'name': 'HBTC',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidAsk': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingLimits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
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
                'logo': 'https://user-images.githubusercontent.com/51840849/80134449-70663300-85a7-11ea-8942-e204cdeaab5d.jpg', // 交易所LOGO
                'api': {
                    'quote': 'https://api.hbtc.com/openapi/quote', // 市场API数据端点
                    'contract': 'https://api.hbtc.com/openapi/contract', // 合约API数据端点
                    'option': 'https://api.hbtc.com/openapi/option', // 合约API数据端点
                    'public': 'https://api.hbtc.com/openapi', // 公共API数据端点
                    'private': 'https://api.hbtc.com/openapi', // 私有API数据端点
                    'zendesk': 'https://hbtc.zendesk.com/hc/en-us',
                },
                'www': 'https://www.hbtc.com', // 公司主页
                'referral': 'https://www.hbtc.com/register/O2S8NS', // 邀请链接
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
                        // 'getOrder',
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
                        'withdrawalOrders',
                        'withdraw/detail',
                        'balance_flow',
                    ],
                    'post': [
                        'order', // 创建新订单
                        'order/test',
                        'userDataStream',
                        'subAccount/query',
                        'transfer',
                        'user/transfer',
                        'withdraw',
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
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
            'exceptions': {
                'exact': {
                    // general server or network errors
                    '-1000': ExchangeError, // An unknown error occured while processing the request
                    '-1001': ExchangeError, // Internal error, unable to process your request. Please try again
                    '-1002': AuthenticationError, // You are not authorized to execute this request. Request need API Key included in. We suggest that API Key be included in any request
                    '-1003': RateLimitExceeded, // Too many requests, please use the websocket for live updates
                    '-1004': BadRequest,
                    '-1005': PermissionDenied,
                    '-1006': BadResponse, // An unexpected response was received from the message bus. Execution status unknown. OPEN API server find some exception in execute request.Please report to Customer service
                    '-1007': RequestTimeout, // Timeout waiting for response from backend server. Send status unknown, execution status unknown
                    '-1014': InvalidOrder, // Unsupported order combination
                    '-1015': RateLimitExceeded, // Reach the rate limit.Please slow down your request speed
                    '-1016': ExchangeNotAvailable, // This service is no longer available
                    '-1020': NotSupported, // This operation is not supported
                    '-1021': BadRequest, // Timestamp for this request is outside of the recvWindow
                    '-1022': AuthenticationError, // Signature for this request is not valid
                    // request issues
                    '-1100': BadRequest, // Illegal characters found in a parameter
                    '-1101': BadRequest, // Too many parameters sent for this endpoint
                    '-1102': BadRequest, // A mandatory parameter was not sent, was empty/null, or malformed
                    '-1103': BadRequest, // An unknown parameter was sent
                    '-1104': BadRequest, // Not all sent parameters were read
                    '-1105': BadRequest, // A parameter was empty
                    '-1106': BadRequest, // A parameter was sent when not required
                    '-1111': BadRequest, // Precision is over the maximum defined for this asset
                    '-1112': NullResponse, // No orders on book for symbol
                    '-1114': InvalidOrder, // TimeInForce parameter sent when not required
                    '-1115': InvalidOrder, // Invalid timeInForce
                    '-1116': InvalidOrder, // Invalid orderType
                    '-1117': InvalidOrder, // Invalid side
                    '-1118': InvalidOrder, // New client order ID was empty
                    '-1119': InvalidOrder, // Original client order ID was empty
                    '-1120': BadRequest, // Invalid interval
                    '-1121': BadSymbol, // Invalid symbol
                    '-1125': AuthenticationError, // This listenKey does not exist
                    '-1127': BadRequest, // Lookup interval is too big
                    '-1128': BadRequest, // Combination of optional parameters invalid
                    '-1130': BadRequest, // Invalid data sent for a parameter
                    '-1131': InsufficientFunds,
                    '-1132': InvalidOrder, // Order price too high
                    '-1133': InvalidOrder, // Order price lower than the minimum,please check general broker info
                    '-1134': InvalidOrder, // Order price decimal too long,please check general broker info
                    '-1135': InvalidOrder, // Order quantity too large
                    '-1136': InvalidOrder, // Order quantity lower than the minimum
                    '-1137': InvalidOrder, // Order quantity decimal too long
                    '-1138': InvalidOrder, // Order price exceeds permissible range
                    '-1139': InvalidOrder, // Order has been filled
                    '-1140': InvalidOrder, // Transaction amount lower than the minimum
                    '-1141': InvalidOrder, // Duplicate clientOrderId
                    '-1142': InvalidOrder, // Order has been canceled
                    '-1143': OrderNotFound, // Cannot be found on order book
                    '-1144': InvalidOrder, // Order has been locked
                    '-1145': InvalidOrder, // This order type does not support cancellation
                    '-1146': RequestTimeout, // Order creation timeout
                    '-1147': RequestTimeout, // Order cancellation timeout
                    '-1149': InvalidOrder, // Create order failed
                    '-1187': InvalidAddress, // Withdrawal address not in whitelist
                    '-2010': InvalidOrder, // NEW_ORDER_REJECTED
                    '-2011': InvalidOrder, // CANCEL_REJECTED
                    '-2013': OrderNotFound, // Order does not exist
                    '-2014': AuthenticationError, // API-key format invalid
                    '-2015': AuthenticationError, // Invalid API-key, IP, or permissions for action
                    '-2016': ExchangeError, // No trading window could be found for the symbol. Try ticker/24hrs instead
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
        let baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        let base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let spot = true;
        let future = false;
        let option = false;
        let inverse = false;
        if (type === 'future') {
            symbol = id;
            spot = false;
            future = true;
            inverse = this.safeValue (market, 'inverse', false);
            baseId = this.safeString (market, 'underlying');
            base = this.safeCurrencyCode (baseId);
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
            'future': future,
            'option': option,
            'inverse': inverse,
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
            const market = this.parseMarket (contracts[i], 'future');
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
        if (type === 'future') {
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
        if (type === 'future') {
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
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.quoteGetTrades (this.extend (request, params));
        //
        //     [
        //         {"price":"0.025344","time":1588084082060,"qty":"1","isBuyerMaker":false},
        //         {"price":"0.02535","time":1588084086021,"qty":"0.553","isBuyerMaker":true},
        //         {"price":"0.025348","time":1588084097037,"qty":"1","isBuyerMaker":false},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1587906000000, // open time
        //         "0.1761", // open
        //         "0.1761", // high
        //         "0.1761", // low
        //         "0.1761", // close
        //         "0", // base volume
        //         0, // close time
        //         "0", // quote volume
        //         0, // number of trades
        //         "0", // taker buy base asset volume
        //         "0" // taker buy quote asset volume
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 500
        }
        const response = await this.quoteGetKlines (this.extend (request, params));
        //
        //     [
        //         [1587906000000,"0.1761","0.1761","0.1761","0.1761","0",0,"0",0,"0","0"],
        //         [1587906180000,"0.1761","0.1761","0.1761","0.1761","0",0,"0",0,"0","0"],
        //         [1587906360000,"0.1761","0.1848","0.1761","0.1848","53",0,"9.7944",1,"0","0"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // if only fromId is set，it will get orders < that fromId in descending order
            // if only toId is set, it will get orders > that toId in ascending order
            // if fromId is set and toId is set, it will get orders < that fromId and > that toId in descending order
            // if fromId is not set and toId it not set, most recent order are returned in descending order
            // 'fromId': '43287482374',
            // 'toId': '43287482374',
            // 'endTime': this.milliseconds (), // optional, spot only
        };
        const defaultType = this.safeString (this.options, 'type', 'spot');
        const options = this.safeValue (this.options, 'fetchMyTrades', {});
        const fetchMyTradesType = this.safeString (options, 'type', defaultType);
        let type = this.safeString (params, 'type', fetchMyTradesType);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            type = market['type'];
        }
        const query = this.omit (params, 'type');
        if (limit !== undefined) {
            // spot default 500, max 1000
            // futures and options default 20, max 1000
            request['limit'] = limit;
        }
        let method = 'privateGetMyTrades';
        if (type === 'future') {
            method = 'contractGetMyTrades';
        } else {
            if (type === 'option') {
                method = 'optionGetMyTrades';
            } else {
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument for ' + type + ' markets');
                }
                const market = this.market (symbol);
                request['symbol'] = market['id'];
                // spot only?
                if (since !== undefined) {
                    request['startTime'] = since;
                }
            }
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     [
        //         {
        //             "id":"616384027512920576",
        //             "symbol":"TBTCBUSDT",
        //             "orderId":"616384027202542080",
        //             "matchOrderId":"605124954767266560",
        //             "price":"6826.06",
        //             "qty":"0.1",
        //             "commission":"0.682606",
        //             "commissionAsset":"BUSDT",
        //             "time":"1588214701982",
        //             "isBuyer":false,
        //             "isMaker":false,
        //             "fee":{
        //                 "feeTokenId":"BUSDT",
        //                 "feeTokenName":"BUSDT",
        //                 "fee":"0.682606"
        //             }
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const orderType = type.toUpperCase ();
        const request = {
            'symbol': market['id'],
            // BUY or SELL for spot and options
            'side': orderSide,
            // GTC, FOK, IOC for spot and options
            // GTC, FOK, IOC, LIMIT_MAKER for futures
            // 'timeInForce': 'GTC',
        };
        let query = params;
        let method = 'privatePostOrder';
        if (market['type'] === 'future') {
            if ((orderSide !== 'BUY_OPEN') && (orderSide !== 'SELL_OPEN') && (orderSide !== 'BUY_CLOSE') && (orderSide !== 'SELL_CLOSE')) {
                throw new NotSupported (this.id + ' createOrder() does not support order side ' + side + ' for ' + market['type'] + ' markets, only BUY_OPEN, SELL_OPEN, BUY_CLOSE and SELL_CLOSE are supported');
            }
            if ((orderType !== 'LIMIT') && (orderType !== 'STOP')) {
                throw new NotSupported (this.id + ' createOrder() does not support order type ' + type + ' for ' + market['type'] + ' markets, only LIMIT and STOP are supported');
            }
            const clientOrderId = this.safeValue (params, 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a clientOrderId parameter for ' + market['type'] + ' markets, supply clientOrderId in the params argument');
            }
            const leverage = this.safeValue (params, 'leverage');
            if (leverage === undefined && (orderSide === 'BUY_OPEN' || orderSide === 'SELL_OPEN')) {
                throw new NotSupported (this.id + ' createOrder() requires a leverage parameter for ' + market['type'] + ' markets if orderSide is BUY_OPEN or SELL_OPEN');
            }
            method = 'contractPostOrder';
            const priceType = this.safeString (params, 'priceType');
            if (priceType === undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                request['priceType'] = priceType;
                if (priceType === 'INPUT') {
                    request['price'] = this.priceToPrecision (symbol, price);
                }
            }
            request['orderType'] = type.toUpperCase (); // LIMIT, STOP
            request['quantity'] = this.amountToPrecision (symbol, amount);
            // request['leverage'] = 1; // not required for closing orders
            request['leverage'] = leverage;
            request['clientOrderId'] = clientOrderId;
            // optional
            // request['priceType'] = 'INPUT', // INPUT, OPPONENT, QUEUE, OVER, MARKET
            // request['triggerPrice'] = 123.45;
        } else {
            if (market['type'] === 'option') {
                method = 'optionPostOrder';
            }
            const newClientOrderId = this.safeValue2 (params, 'clientOrderId', 'newClientOrderId');
            if (newClientOrderId !== undefined) {
                request['newClientOrderId'] = newClientOrderId;
            }
            request['type'] = orderType;
            if (type === 'limit') {
                request['price'] = this.priceToPrecision (symbol, price);
                request['quantity'] = this.amountToPrecision (symbol, amount);
            } else if (type === 'market') {
                // for market buy it requires the amount of quote currency to spend
                if (side === 'buy') {
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            amount = amount * price;
                        } else {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument (the exchange-specific behaviour)");
                        }
                    }
                    const precision = market['precision']['price'];
                    request['quantity'] = this.decimalToPrecision (amount, TRUNCATE, precision, this.precisionMode);
                } else {
                    request['quantity'] = this.amountToPrecision (symbol, amount);
                }
            }
        }
        query = this.omit (query, [ 'clientOrderId', 'newClientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "symbol":"TBTCBUSDT",
        //         "orderId":"616376654496877056",
        //         "clientOrderId":"158821382304516955",
        //         "transactTime":"1588213823080",
        //         "price":"0",
        //         "origQty":"1000",
        //         "executedQty":"0",
        //         "status":"NEW",
        //         "timeInForce":"GTC",
        //         "type":"MARKET",
        //         "side":"BUY"
        //     }
        //
        // contract
        //
        //     {
        //         'time': '1570759718825',
        //         'updateTime': '0',
        //         'orderId': '469961015902208000',
        //         'clientOrderId': '6423344174',
        //         'symbol': 'BTC-PERP-REV',
        //         'price': '8200',
        //         'leverage': '12.08',
        //         'origQty': '5',
        //         'executedQty': '0',
        //         'avgPrice': '0',
        //         'marginLocked': '0.00005047',
        //         'orderType': 'LIMIT',
        //         'side': 'BUY_OPEN',
        //         'fees': [],
        //         'timeInForce': 'GTC',
        //         'status': 'NEW',
        //         'priceType': 'INPUT'
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        const request = {};
        const defaultType = this.safeString (this.options, 'type', 'spot');
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const cancelOrderType = this.safeString (options, 'type', defaultType);
        let type = this.safeString (params, 'type', cancelOrderType);
        let query = this.omit (params, 'type');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
            query = this.omit (query, [ 'origClientOrderId', 'clientOrderId' ]);
        } else {
            request['orderId'] = id;
        }
        let method = 'privateDeleteOrder';
        const orderType = this.safeString (query, 'orderType');
        if (orderType !== undefined) {
            type = 'future';
        }
        if (type === 'future') {
            method = 'contractDeleteOrderCancel';
            if (orderType === undefined) {
                throw new ArgumentsRequired (this.id + " cancelOrder() requires an orderType parameter, pass the { 'orderType': 'LIMIT' } or { 'orderType': 'STOP' } in params argument");
            }
            request['orderType'] = orderType;
        } else {
            if (type === 'option') {
                method = 'optionDeleteOrderCancel';
            }
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         'exchangeId': '301',
        //         'symbol': 'BHTUSDT',
        //         'clientOrderId': '0',
        //         'orderId': '499890200602846976',
        //         'status': 'CANCELED'
        //     }
        //
        // futures
        //
        //     {
        //         "time":"1588353669383",
        //         "updateTime":"0",
        //         "orderId":"617549770304599296",
        //         "clientOrderId":"test-001",
        //         "symbol":"BTC-PERP-REV",
        //         "price":"10000",
        //         "leverage":"1",
        //         "origQty":"100",
        //         "executedQty":"0",
        //         "avgPrice":"0",
        //         "marginLocked":"0",
        //         "orderType":"LIMIT",
        //         "side":"SELL_OPEN",
        //         "fees":[],
        //         "timeInForce":"GTC",
        //         "status":"CANCELED",
        //         "priceType":"INPUT",
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // if orderId is set, it will get orders < that orderId otherwise most recent orders are returned
            // 'orderId': '43287482374',
        };
        const defaultType = this.safeString (this.options, 'type', 'spot');
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const fetchOpenOrdersType = this.safeString (options, 'type', defaultType);
        let type = this.safeString (params, 'type', fetchOpenOrdersType);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            type = market['type'];
        }
        const query = this.omit (params, 'type');
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        let method = 'privateGetOpenOrders';
        if (type === 'future') {
            method = 'contractGetOpenOrders';
        } else if (type === 'option') {
            method = 'optionGetOpenOrders';
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     [
        //         {
        //             'orderId': '499902955766523648',
        //             'clientOrderId': '157432907618453',
        //             'exchangeId': '301',
        //             'symbol': 'BHTUSDT',
        //             'price': '0.01',
        //             'origQty': '50',
        //             'executedQty': '0',
        //             'cummulativeQuoteQty': '0',
        //             'avgPrice': '0',
        //             'status': 'NEW',
        //             'timeInForce': 'GTC',
        //             'type': 'LIMIT',
        //             'side': 'BUY',
        //             'stopPrice': '0.0',
        //             'icebergQty': '0.0',
        //             'time': '1574329076202',
        //             'updateTime': '0',
        //             'isWorking': true
        //         }
        //     ]
        //
        // futures
        //
        //     [
        //         {
        //             "time":"1588353669383",
        //             "updateTime":"0",
        //             "orderId":"617549770304599296",
        //             "clientOrderId":"test-001",
        //             "symbol":"BTC-PERP-REV",
        //             "price":"10000",
        //             "leverage":"1",
        //             "origQty":"100",
        //             "executedQty":"0",
        //             "avgPrice":"0",
        //             "marginLocked":"0.01",
        //             "orderType":"LIMIT",
        //             "side":"SELL_OPEN",
        //             "fees":[],
        //             "timeInForce":"GTC",
        //             "status":"NEW",
        //             "priceType":"INPUT"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // if orderId is set, it will get orders < that orderId otherwise most recent orders are returned
            // 'orderId': '43287482374',
            // 'endTime': this.milliseconds (), // optional
        };
        const defaultType = this.safeString (this.options, 'type', 'spot');
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        const fetchClosedOrdersType = this.safeString (options, 'type', defaultType);
        let type = this.safeString (params, 'type', fetchClosedOrdersType);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            type = market['type'];
        }
        const query = this.omit (params, 'type');
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let method = 'privateGetHistoryOrders';
        if (type === 'future') {
            method = 'contractGetHistoryOrders';
        } else if (type === 'option') {
            method = 'optionGetHistoryOrders';
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     [
        //         {
        //             "orderId":"616384027202542080",
        //             "clientOrderId":"158821470194414688",
        //             "exchangeId":"301",
        //             "symbol":"TBTCBUSDT",
        //             "price":"0",
        //             "origQty":"0.1",
        //             "executedQty":"0.1",
        //             "cummulativeQuoteQty":"682.606",
        //             "avgPrice":"6826.06",
        //             "status":"FILLED",
        //             "timeInForce":"GTC",
        //             "type":"MARKET",
        //             "side":"SELL",
        //             "stopPrice":"0.0",
        //             "icebergQty":"0.0",
        //             "time":"1588214701974",
        //             "updateTime":"0",
        //             "isWorking":true
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        const request = {};
        const defaultType = this.safeString (this.options, 'type', 'spot');
        const options = this.safeValue (this.options, 'fetchOrder', {});
        const fetchOrderType = this.safeString (options, 'type', defaultType);
        const type = this.safeString (params, 'type', fetchOrderType);
        let query = this.omit (params, 'type');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
            query = this.omit (query, [ 'origClientOrderId', 'clientOrderId' ]);
        } else {
            request['orderId'] = id;
        }
        let method = 'privateGetOrder';
        if (type === 'future') {
            method = 'contractGetGetOrder';
        } else if (type === 'option') {
            method = 'optionGetGetOrder';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            // 'fromId': 'string', // if fromId is set, it will get deposits > that fromId, otherwise most recent deposits are returned
        };
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetDepositOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             'time': '1565769575929',
        //             'orderId': '428100569859739648',
        //             'token': 'USDT',
        //             'address': '',
        //             'addressTag': '',
        //             'fromAddress': '',
        //             'fromAddressTag': '',
        //             'quantity': '1100',
        //         },
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            // 'fromId': 'string', // if fromId is set, it will get deposits > that fromId, otherwise most recent deposits are returned
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['token'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetWithdrawalOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":"1536232111669",
        //             "orderId":"90161227158286336",
        //             "accountId":"517256161325920",
        //             "tokenId":"BHC",
        //             "tokenName":"BHC",
        //             "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //             "addressExt":"address tag",
        //             "quantity":"14", // Withdrawal qty
        //             "arriveQuantity":"14", // Arrived qty
        //             "statusCode":"PROCESSING_STATUS",
        //             "status":3,
        //             "txid":"",
        //             "txidUrl":"",
        //             "walletHandleTime":"1536232111669",
        //             "feeTokenId":"BHC",
        //             "feeTokenName":"BHC",
        //             "fee":"0.1",
        //             "requiredConfirmNum":0, // Required confirmations
        //             "confirmNum":0, // Confirmations
        //             "kernelId":"", // BEAM and GRIN only
        //             "isInternalTransfer": false // True if this transfer is internal
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const clientOrderId = this.safeString (params, 'clientOrderId', this.uuid ());
        const request = {
            'clientOrderId': clientOrderId,
            'tokenId': currency['id'],
            'address': address, // the withdrawal address must be in current tag list in your PC/APP client
            'withdrawQuantity': amount,
            // 'chainType': 'OMNI', // OMNI, ERC20, TRC20
        };
        if (tag !== undefined) {
            request['addressExt'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "success": true,
        //         "needBrokerAudit": false, // Whether this request needs broker auit
        //         "orderId": "423885103582776064" // Id for successful withdrawal
        //     }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'orderId'),
        };
    }

    async fetchAccounts (params = {}) {
        const response = await this.privatePostSubAccountQuery (params);
        //
        //     [
        //         {
        //             "accountId": "122216245228131",
        //             "accountName": "createSubAccountByCurl", // sub-account name
        //             "accountType": 1, // 1 token trading, 2 options, 3 futures
        //             "accountIndex": 1, // 0 main account, 1 sub-account
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const account = response[i];
            const accountId = this.safeString (account, 'accountId');
            const accountType = this.safeString (account, 'accountType');
            let type = accountType;
            if (accountType === '1') {
                type = 'spot';
            } else if (accountType === '2') {
                type = 'option';
            } else if (accountType === '3') {
                type = 'future';
            }
            result.push ({
                'id': accountId,
                'type': type,
                'currency': undefined,
                'info': account,
            });
        }
        return result;
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'accountType': 1, // spot 1, options 2, futures 3
            'accountIndex': 0, // main 0, sub-account 1
            'fromFlowId': '', // flowId to start from
            'endFlowId': '', // flowId to end with
            'endTime': 1588450533040,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['tokenId'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 500
        }
        const response = await this.privateGetBalanceFlow (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "539870570957903104",
        //             "accountId": "122216245228131",
        //             "tokenId": "BTC",
        //             "tokenName": "BTC",
        //             "flowTypeValue": 51,
        //             "flowType": "USER_ACCOUNT_TRANSFER",
        //             "flowName": "Transfer",
        //             "change": "-12.5",
        //             "total": "379.624059937852365", // after change
        //             "created": "1579093587214"
        //         },
        //         {
        //             "id": "536072393645448960",
        //             "accountId": "122216245228131",
        //             "tokenId": "USDT",
        //             "tokenName": "USDT",
        //             "flowTypeValue": 7,
        //             "flowType": "AIRDROP",
        //             "flowName": "Airdrop",
        //             "change": "-2000",
        //             "total": "918662.0917630848",
        //             "created": "1578640809195"
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "id": "539870570957903104",
        //         "accountId": "122216245228131",
        //         "tokenId": "BTC",
        //         "tokenName": "BTC",
        //         "flowTypeValue": 51,
        //         "flowType": "USER_ACCOUNT_TRANSFER",
        //         "flowName": "Transfer",
        //         "change": "-12.5",
        //         "total": "379.624059937852365", // after change
        //         "created": "1579093587214"
        //     }
        //
        //     {
        //         "id": "536072393645448960",
        //         "accountId": "122216245228131",
        //         "tokenId": "USDT",
        //         "tokenName": "USDT",
        //         "flowTypeValue": 7,
        //         "flowType": "AIRDROP",
        //         "flowName": "Airdrop",
        //         "change": "-2000",
        //         "total": "918662.0917630848",
        //         "created": "1578640809195"
        //     }
        //
        const currencyId = this.safeString (item, 'tokenId');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeFloat (item, 'change');
        const after = this.safeFloat (item, 'total');
        const direction = (amount < 0) ? 'out' : 'in';
        let before = undefined;
        if (after !== undefined && amount !== undefined) {
            const difference = (direction === 'out') ? amount : -amount;
            before = this.sum (after, difference);
        }
        const timestamp = this.safeInteger (item, 'created');
        const type = this.parseLedgerEntryType (this.safeString (item, 'flowType'));
        const id = this.safeString (item, 'id');
        const account = this.safeString (item, 'accountId');
        return {
            'id': id,
            'currency': code,
            'account': account,
            'referenceAccount': undefined,
            'referenceId': undefined,
            'status': undefined,
            'amount': amount,
            'before': before,
            'after': after,
            'fee': undefined,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': type,
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'TRADE': 'trade',
            'FEE': 'fee',
            'TRANSFER': 'transfer',
            'DEPOSIT': 'transaction',
            'MAKER_REWARD': 'rebate',
            'PNL': 'pnl',
            'SETTLEMENT': 'settlement',
            'LIQUIDATION': 'liquidation',
            'FUNDING_SETTLEMENT': 'settlement',
            'USER_ACCOUNT_TRANSFER': 'transfer',
            'OTC_BUY_COIN': 'trade',
            'OTC_SELL_COIN': 'trade',
            'OTC_FEE': 'fee',
            'OTC_TRADE': 'trade',
            'ACTIVITY_AWARD': 'referral',
            'INVITATION_REFERRAL_BONUS': 'referral',
            'REGISTER_BONUS': 'referral',
            'AIRDROP': 'airdrop',
            'MINE_REWARD': 'reward',
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'BROKER_AUDITING_STATUS': 'pending',
            'BROKER_REJECT_STATUS': 'failed',
            'AUDITING_STATUS': 'pending',
            'AUDIT_REJECT_STATUS': 'failed',
            'PROCESSING_STATUS': 'pending',
            'WITHDRAWAL_SUCCESS_STATUS': 'ok',
            'WITHDRAWAL_FAILURE_STATUS': 'failed',
            'BLOCK_MINING_STATUS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         'time': '1565769575929',
        //         'orderId': '428100569859739648',
        //         'token': 'USDT',
        //         'address': '',
        //         'addressTag': '',
        //         'fromAddress': '',
        //         'fromAddressTag': '',
        //         'quantity': '1100',
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "time":"1536232111669",
        //         "orderId":"90161227158286336",
        //         "accountId":"517256161325920",
        //         "tokenId":"BHC",
        //         "tokenName":"BHC",
        //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //         "addressExt":"address tag",
        //         "quantity":"14", // Withdrawal qty
        //         "arriveQuantity":"14", // Arrived qty
        //         "statusCode":"PROCESSING_STATUS",
        //         "status":3,
        //         "txid":"",
        //         "txidUrl":"",
        //         "walletHandleTime":"1536232111669",
        //         "feeTokenId":"BHC",
        //         "feeTokenName":"BHC",
        //         "fee":"0.1",
        //         "requiredConfirmNum":0, // Required confirmations
        //         "confirmNum":0, // Confirmations
        //         "kernelId":"", // BEAM and GRIN only
        //         "isInternalTransfer": false // True if this transfer is internal
        //     }
        //
        const id = this.safeString (transaction, 'orderId');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString2 (transaction, 'addressExt', 'addressTag');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const addressFrom = this.safeString (transaction, 'fromAddress');
        let tagFrom = this.safeString (transaction, 'fromAddressTag');
        if (tagFrom !== undefined) {
            if (tagFrom.length < 1) {
                tagFrom = undefined;
            }
        }
        const currencyId = this.safeString (transaction, 'tokenId');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'time');
        let txid = this.safeString (transaction, 'txid');
        if (txid === '') {
            txid = undefined;
        }
        let type = undefined;
        let status = this.parseTransactionStatus (this.safeString (transaction, 'statusCode'));
        if (status === undefined) {
            type = 'deposit';
            status = 'ok';
        } else {
            type = 'withdrawal';
        }
        const amount = this.safeFloat (transaction, 'quantity');
        const feeCost = this.safeFloat (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (transaction, 'feeTokenId');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'currency': feeCurrencyCode,
                'cost': feeCost,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': address,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
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
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
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
        const vwap = this.vwap (baseVolume, quoteVolume);
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

    parseTrade (trade, market) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "price":"0.025344",
        //         "time":1588084082060,
        //         "qty":"1",
        //         "isBuyerMaker":false
        //     }
        //
        // fetchMyTrades (private)
        //
        // spot
        //
        //     {
        //         "id":"616384027512920576",
        //         "symbol":"TBTCBUSDT",
        //         "orderId":"616384027202542080",
        //         "matchOrderId":"605124954767266560",
        //         "price":"6826.06",
        //         "qty":"0.1",
        //         "commission":"0.682606",
        //         "commissionAsset":"BUSDT",
        //         "time":"1588214701982",
        //         "isBuyer":false,
        //         "isMaker":false,
        //         "fee":{
        //             "feeTokenId":"BUSDT",
        //             "feeTokenName":"BUSDT",
        //             "fee":"0.682606"
        //         }
        //     }
        //
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
        let side = undefined;
        let takerOrMaker = undefined;
        if ('isBuyerMaker' in trade) {
            side = trade['isBuyerMaker'] ? 'sell' : 'buy';
        } else {
            const isMaker = this.safeValue (trade, 'isMaker');
            if (isMaker !== undefined) {
                takerOrMaker = isMaker ? 'maker' : 'taker';
            }
            const isBuyer = this.safeValue (trade, 'isBuyer');
            side = isBuyer ? 'buy' : 'sell';
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionAsset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
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
        //
        // createOrder
        //
        //     {
        //         "symbol":"TBTCBUSDT",
        //         "orderId":"616376654496877056",
        //         "clientOrderId":"158821382304516955",
        //         "transactTime":"1588213823080",
        //         "price":"0",
        //         "origQty":"1000",
        //         "executedQty":"0",
        //         "status":"NEW",
        //         "timeInForce":"GTC",
        //         "type":"MARKET",
        //         "side":"BUY"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        // spot
        //
        //     {
        //         "orderId":"616384027202542080",
        //         "clientOrderId":"158821470194414688",
        //         "exchangeId":"301",
        //         "symbol":"TBTCBUSDT",
        //         "price":"0",
        //         "origQty":"0.1",
        //         "executedQty":"0.1",
        //         "cummulativeQuoteQty":"682.606",
        //         "avgPrice":"6826.06",
        //         "status":"FILLED",
        //         "timeInForce":"GTC",
        //         "type":"MARKET",
        //         "side":"SELL",
        //         "stopPrice":"0.0",
        //         "icebergQty":"0.0",
        //         "time":"1588214701974",
        //         "updateTime":"0",
        //         "isWorking":true
        //     }
        //
        // future
        //
        //     {
        //         time: "1588353669383",
        //         updateTime: "0",
        //         orderId: "617549770304599296",
        //         clientOrderId: "test-001",
        //         symbol: "BTC-PERP-REV",
        //         price: "10000",
        //         leverage: "1",
        //         origQty: "100",
        //         executedQty: "0",
        //         avgPrice: "0",
        //         marginLocked: "0",
        //         orderType: "LIMIT",
        //         side: "SELL_OPEN",
        //         fees: [],
        //         timeInForce: "GTC",
        //         status: "CANCELED",
        //         priceType: "INPUT"
        //     }
        //
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        let timestamp = this.safeInteger (order, 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (order, 'transactTime');
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        let price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'avgPrice');
        let amount = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        let filled = undefined;
        let remaining = undefined;
        if (type === undefined) {
            type = this.safeStringLower (order, 'orderType');
            if ((market !== undefined) && market['inverse']) {
                cost = this.safeFloat (order, 'executedQty');
                amount = undefined;
            }
            if (cost === 0.0) {
                filled = 0;
            }
        } else {
            amount = this.safeFloat (order, 'origQty');
            if (type === 'market') {
                price = undefined;
                if (side === 'buy') {
                    amount = undefined;
                }
            }
            filled = this.safeFloat (order, 'executedQty');
            if (filled !== undefined) {
                if (amount !== undefined) {
                    remaining = amount - filled;
                }
            }
        }
        if (average === 0.0) {
            average = undefined;
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
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
            'trades': undefined,
            'fee': undefined,
            'fees': undefined,
        };
        const fees = this.safeValue (order, 'fees', []);
        const numFees = fees.length;
        if (numFees > 0) {
            result['fees'] = [];
            for (let i = 0; i < fees.length; i++) {
                const feeCost = this.safeFloat (fees[i], 'fee');
                if (feeCost !== undefined) {
                    const feeCurrencyId = this.safeString (fees[i], 'feeToken');
                    const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                    result['fees'].push ({
                        'cost': feeCost,
                        'currency': feeCurrencyCode,
                    });
                }
            }
        }
        return result;
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
            const request = this.extend ({
                'timestamp': timestamp,
            }, query);
            // 准备待签名数据
            const auth = this.urlencode (request);
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            request['signature'] = signature;
            headers = {
                'X-BH-APIKEY': this.apiKey,
            };
            if (method === 'POST') {
                body = this.urlencode (request);
                headers = this.extend ({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }, headers);
            } else {
                url += '?' + this.urlencode (request);
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
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
