'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, BadSymbol, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError, PermissionDenied, ExchangeNotAvailable, RequestTimeout } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class coinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinex',
            'name': 'CoinEx',
            'version': 'v1',
            'countries': [ 'CN' ],
            'rateLimit': 50, // Normal limit frequency is single IP：200 times / 10 seconds
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg',
                'api': {
                    'public': 'https://api.coinex.com',
                    'private': 'https://api.coinex.com',
                    'perpetualPublic': 'https://api.coinex.com/perpetual',
                    'perpetualPrivate': 'https://api.coinex.com/perpetual',
                },
                'www': 'https://www.coinex.com',
                'doc': 'https://github.com/coinexcom/coinex_exchange_api/wiki',
                'fees': 'https://www.coinex.com/fees',
                'referral': 'https://www.coinex.com/register?refer_code=yw5fz',
            },
            'api': {
                'public': {
                    'get': {
                        'amm/market': 1,
                        'common/currency/rate': 1,
                        'common/asset/config': 1,
                        'common/maintain/info': 1,
                        'common/temp-maintain/info': 1,
                        'margin/market': 1,
                        'market/info': 1,
                        'market/list': 1,
                        'market/ticker': 1,
                        'market/ticker/all': 1,
                        'market/depth': 1,
                        'market/deals': 1,
                        'market/kline': 1,
                        'market/detail': 1,
                    },
                },
                'private': {
                    'get': {
                        'account/amm/balance': 1,
                        'account/investment/balance': 1,
                        'account/balance/history': 1,
                        'account/market/fee': 1,
                        'balance/coin/deposit': 1,
                        'balance/coin/withdraw': 1,
                        'balance/info': 1,
                        'balance/deposit/address/{coin_type}': 1,
                        'contract/transfer/history': 1,
                        'credit/info': 1,
                        'credit/balance': 1,
                        'investment/transfer/history': 1,
                        'margin/account': 1,
                        'margin/config': 1,
                        'margin/loan/history': 1,
                        'margin/market': 1,
                        'margin/transfer': 1,
                        'margin/transfer/history': 1,
                        'order/deals': 1,
                        'order/finished': 1,
                        'order/pending': 1,
                        'order/status': 1,
                        'order/status/batch': 1,
                        'order/user/deals': 1,
                        'order/stop/finished': 1,
                        'order/stop/pending': 1,
                        'order/user/trade/fee': 1,
                        'order/market/trade/info': 1,
                        'sub_account/balance': 1,
                        'sub_account/transfer/history': 1,
                        'sub_account/auth/api/{user_auth_id}': 1,
                    },
                    'post': {
                        'balance/coin/withdraw': 1,
                        'contract/balance/transfer': 1,
                        'margin/flat': 1,
                        'margin/loan': 1,
                        'margin/transfer': 1,
                        'order/limit/batch': 1,
                        'order/ioc': 1,
                        'order/limit': 1,
                        'order/market': 1,
                        'order/stop/limit': 1,
                        'order/stop/market': 1,
                        'sub_account/transfer': 1,
                        'sub_account/register': 1,
                        'sub_account/unfrozen': 1,
                        'sub_account/frozen': 1,
                        'sub_account/auth/api': 1,
                    },
                    'put': {
                        'balance/deposit/address/{coin_type}': 1,
                        'sub_account/auth/api/{user_auth_id}': 1,
                        'v1/account/settings': 1,
                    },
                    'delete': {
                        'balance/coin/withdraw': 1,
                        'order/pending/batch': 1,
                        'order/pending': 1,
                        'order/stop/pending': 1,
                        'order/stop/pending/{id}': 1,
                        'sub_account/auth/api/{user_auth_id}': 1,
                    },
                },
                'perpetualPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'market/list': 1,
                        'market/limit_config': 1,
                        'market/ticker': 1,
                        'market/ticker/all': 1,
                        'market/depth': 1,
                        'market/deals': 1,
                        'market/funding_history': 1,
                        'market/user_deals': 1,
                        'market/kline': 1,
                    },
                },
                'perpetualPrivate': {
                    'get': {
                        'asset/query': 1,
                        'order/pending': 1,
                        'order/finished': 1,
                        'order/stop_pending': 1,
                        'order/status': 1,
                        'order/stop_status': 1,
                        'position/pending': 1,
                        'position/funding': 1,
                    },
                    'post': {
                        'market/adjust_leverage': 1,
                        'market/position_expect': 1,
                        'order/put_limit': 1,
                        'order/put_market': 1,
                        'order/put_stop_limit': 1,
                        'order/put_stop_market': 1,
                        'order/cancel': 1,
                        'order/cancel_all': 1,
                        'order/cancel_stop': 1,
                        'order/cancel_stop_all': 1,
                        'order/close_limit': 1,
                        'order/close_market': 1,
                        'position/adjust_margin': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'accountsByType': {
                    'spot': 0,
                    'margin': 'margin',
                    'future': 'future',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'defaultType': 'spot', // spot, swap, margin
                'defaultSubType': 'linear', // linear, inverse
                'defaultMarginMode': 'isolated', // isolated, cross
            },
            'commonCurrencies': {
                'ACM': 'Actinium',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const getMarginData = this.checkRequiredCredentials (false);
        let promises = [];
        promises.push (this.publicGetMarketInfo (params));
        promises.push (this.publicGetMarginMarket (params));
        if (getMarginData) {
            promises.push (this.privateGetMarginConfig (params));
        }
        promises = await Promise.all (promises);
        //
        //     publicGetMarketInfo
        //     {
        //         "code": 0,
        //         "data": {
        //             "WAVESBTC": {
        //                 "name": "WAVESBTC",
        //                 "min_amount": "1",
        //                 "maker_fee_rate": "0.001",
        //                 "taker_fee_rate": "0.001",
        //                 "pricing_name": "BTC",
        //                 "pricing_decimal": 8,
        //                 "trading_name": "WAVES",
        //                 "trading_decimal": 8
        //             }
        //             ...
        //         }
        //     }
        //
        //     publicGetMarginMarket
        //     {
        //         "code": 0,
        //         "data": {
        //             "BTCUSDT": 1,
        //             "BCHUSDT": 2,
        //             ...
        //         },
        //         "message": "Ok"
        //     }
        //
        //     privateGetMarginConfig
        //     {
        //         code: 0,
        //         data: [
        //             {
        //                 market: 'BTCUSDT',
        //                 leverage: 10,
        //                 BTC: { min_amount: '0.002', max_amount: '100', day_rate: '0.001' },
        //                 USDT: { min_amount: '50', max_amount: '5000000', day_rate: '0.001' }
        //             },
        //             ...
        //         ],
        //     }
        //
        const leverages = {};
        const marketInfoResponse = this.safeValue (promises, 0, {});
        const marginMarketResponse = this.safeValue (promises, 1, {});
        const marginMarkets = this.safeValue (marginMarketResponse, 'data', []);
        const marginConfigResponse = this.safeValue (promises, 2, {});
        const marginConfigData = this.safeValue (marginConfigResponse, 'data', []);
        for (let i = 0; i < marginConfigData.length; i++) {
            const config = marginConfigData[i];
            const marketId = this.safeString (config, 'market');
            leverages[marketId] = this.safeNumber (config, 'leverage');
        }
        const markets = this.safeValue (marketInfoResponse, 'data', {});
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const id = this.safeString (market, 'name');
            const tradingName = this.safeString (market, 'trading_name');
            const baseId = tradingName;
            const quoteId = this.safeString (market, 'pricing_name');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (tradingName === id) {
                symbol = id;
            }
            const leverage = this.safeNumber (leverages, id);
            result.push ({
                'id': id,
                'accountId': this.safeNumber (marginMarkets, id),
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': leverage !== undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'taker_fee_rate'),
                'maker': this.safeNumber (market, 'maker_fee_rate'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'trading_decimal'),
                    'price': this.safeInteger (market, 'pricing_decimal'),
                },
                'limits': {
                    'leverage': {
                        'min': leverage ? this.parseNumber ('1') : undefined,
                        'max': leverage,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
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
        return result;
    }

    async fetchContractMarkets (params) {
        const response = await this.perpetualPublicGetMarketList (params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "name": "BTCUSD",
        //                 "type": 2, // 1: USDT-M Contracts, 2: Coin-M Contracts
        //                 "leverages": ["3", "5", "8", "10", "15", "20", "30", "50", "100"],
        //                 "stock": "BTC",
        //                 "money": "USD",
        //                 "fee_prec": 5,
        //                 "stock_prec": 8,
        //                 "money_prec": 1,
        //                 "amount_prec": 0,
        //                 "amount_min": "10",
        //                 "multiplier": "1",
        //                 "tick_size": "0.1", // Min. Price Increment
        //                 "available": true
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const fees = this.fees;
            const leverages = this.safeValue (entry, 'leverages', []);
            const subType = this.safeInteger (entry, 'type');
            const linear = (subType === 1) ? true : false;
            const inverse = (subType === 2) ? true : false;
            const id = this.safeString (entry, 'name');
            const baseId = this.safeString (entry, 'stock');
            const quoteId = this.safeString (entry, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settleId = (subType === 1) ? 'USDT' : baseId;
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': this.safeString (entry, 'available'),
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (entry, 'stock_prec'),
                    'price': this.safeInteger (entry, 'money_prec'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeString (leverages, 0),
                        'max': this.safeString (leverages, leverages.length - 1),
                    },
                    'amount': {
                        'min': this.safeString (entry, 'amount_min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': entry,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // Spot fetchTicker, fetchTickers
        //
        //     {
        //         "vol": "293.19415130",
        //         "low": "38200.00",
        //         "open": "39514.99",
        //         "high": "39530.00",
        //         "last": "38649.57",
        //         "buy": "38640.20",
        //         "buy_amount": "0.22800000",
        //         "sell": "38640.21",
        //         "sell_amount": "0.02828439"
        //     }
        //
        // Swap fetchTicker, fetchTickers
        //
        //     {
        //         "vol": "7714.2175",
        //         "low": "38200.00",
        //         "open": "39569.23",
        //         "high": "39569.23",
        //         "last": "38681.37",
        //         "buy": "38681.36",
        //         "period": 86400,
        //         "funding_time": 462,
        //         "position_amount": "296.7552",
        //         "funding_rate_last": "0.00009395",
        //         "funding_rate_next": "0.00000649",
        //         "funding_rate_predict": "-0.00007176",
        //         "insurance": "16464465.09431942163278132918",
        //         "sign_price": "38681.93",
        //         "index_price": "38681.69500000",
        //         "sell_total": "16.6039",
        //         "buy_total": "19.8481",
        //         "buy_amount": "4.6315",
        //         "sell": "38681.37",
        //         "sell_amount": "11.4044"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date');
        const symbol = this.safeSymbol (undefined, market);
        ticker = this.safeValue (ticker, 'ticker', {});
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'vol', 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const method = market['swap'] ? 'perpetualPublicGetMarketTicker' : 'publicGetMarketTicker';
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651306913414,
        //             "ticker": {
        //                 "vol": "293.19415130",
        //                 "low": "38200.00",
        //                 "open": "39514.99",
        //                 "high": "39530.00",
        //                 "last": "38649.57",
        //                 "buy": "38640.20",
        //                 "buy_amount": "0.22800000",
        //                 "sell": "38640.21",
        //                 "sell_amount": "0.02828439"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651306641500,
        //             "ticker": {
        //                 "vol": "7714.2175",
        //                 "low": "38200.00",
        //                 "open": "39569.23",
        //                 "high": "39569.23",
        //                 "last": "38681.37",
        //                 "buy": "38681.36",
        //                 "period": 86400,
        //                 "funding_time": 462,
        //                 "position_amount": "296.7552",
        //                 "funding_rate_last": "0.00009395",
        //                 "funding_rate_next": "0.00000649",
        //                 "funding_rate_predict": "-0.00007176",
        //                 "insurance": "16464465.09431942163278132918",
        //                 "sign_price": "38681.93",
        //                 "index_price": "38681.69500000",
        //                 "sell_total": "16.6039",
        //                 "buy_total": "19.8481",
        //                 "buy_amount": "4.6315",
        //                 "sell": "38681.37",
        //                 "sell_amount": "11.4044"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTickers', undefined, params);
        const method = (marketType === 'swap') ? 'perpetualPublicGetMarketTickerAll' : 'publicGetMarketTickerAll';
        const response = await this[method] (query);
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651519857284,
        //             "ticker": {
        //                 "PSPUSDT": {
        //                     "vol": "127131.55227034",
        //                     "low": "0.0669",
        //                     "open": "0.0688",
        //                     "high": "0.0747",
        //                     "last": "0.0685",
        //                     "buy": "0.0676",
        //                     "buy_amount": "702.70117866",
        //                     "sell": "0.0690",
        //                     "sell_amount": "686.76861562"
        //                 },
        //             }
        //         },
        //         "message": "Ok"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "date": 1651520268644,
        //             "ticker": {
        //                 "KAVAUSDT": {
        //                     "vol": "834924",
        //                     "low": "3.9418",
        //                     "open": "4.1834",
        //                     "high": "4.4328",
        //                     "last": "4.0516",
        //                     "buy": "4.0443",
        //                     "period": 86400,
        //                     "funding_time": 262,
        //                     "position_amount": "16111",
        //                     "funding_rate_last": "-0.00069514",
        //                     "funding_rate_next": "-0.00061009",
        //                     "funding_rate_predict": "-0.00055812",
        //                     "insurance": "16532425.53026084124483989548",
        //                     "sign_price": "4.0516",
        //                     "index_price": "4.0530",
        //                     "sell_total": "59446",
        //                     "buy_total": "62423",
        //                     "buy_amount": "959",
        //                     "sell": "4.0466",
        //                     "sell_amount": "141"
        //                 },
        //             }
        //         },
        //         "message": "Ok"
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'date');
        const tickers = this.safeValue (data, 'ticker');
        const marketIds = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseTicker ({
                'date': timestamp,
                'ticker': tickers[marketId],
            }, market);
            ticker['symbol'] = symbol;
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = 20, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': this.marketId (symbol),
            'merge': '0.0000000001',
            'limit': limit.toString (),
        };
        const method = market['swap'] ? 'perpetualPublicGetMarketDepth' : 'publicGetMarketDepth';
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "asks": [
        //                 ["41056.33", "0.31727613"],
        //                 ["41056.34", "1.05657294"],
        //                 ["41056.35", "0.02346648"]
        //             ],
        //             "bids": [
        //                 ["41050.61", "0.40618608"],
        //                 ["41046.98", "0.13800000"],
        //                 ["41046.56", "0.22579234"]
        //             ],
        //             "last": "41050.61",
        //             "time": 1650573220346
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "asks": [
        //                 ["40620.90", "0.0384"],
        //                 ["40625.50", "0.0219"],
        //                 ["40625.90", "0.3506"]
        //             ],
        //             "bids": [
        //                 ["40620.89", "19.6861"],
        //                 ["40620.80", "0.0012"],
        //                 ["40619.87", "0.0365"]
        //             ],
        //             "last": "40620.89",
        //             "time": 1650587672406,
        //             "sign_price": "40619.32",
        //             "index_price": "40609.93"
        //         },
        //         "message": "OK"
        //     }
        //
        const result = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (result, 'time');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    parseTrade (trade, market = undefined) {
        //
        // Spot and Swap fetchTrades (public)
        //
        //      {
        //          "id":  2611511379,
        //          "type": "buy",
        //          "price": "192.63",
        //          "amount": "0.02266931",
        //          "date":  1638990110,
        //          "date_ms":  1638990110518
        //      },
        //
        // Spot fetchMyTrades (private)
        //
        //      {
        //          "id": 2611520950,
        //          "order_id": 63286573298,
        //          "account_id": 0,
        //          "create_time": 1638990636,
        //          "type": "sell",
        //          "role": "taker",
        //          "price": "192.29",
        //          "amount": "0.098",
        //          "fee": "0.03768884",
        //          "fee_asset": "USDT",
        //          "market": "AAVEUSDT",
        //          "deal_money": "18.84442"
        //      }
        //
        // Swap fetchMyTrades (private)
        //
        //     {
        //         "amount": "0.0012",
        //         "deal_fee": "0.0237528",
        //         "deal_insurance": "0",
        //         "deal_margin": "15.8352",
        //         "deal_order_id": 17797031903,
        //         "deal_profit": "0",
        //         "deal_stock": "47.5056",
        //         "deal_type": 1,
        //         "deal_user_id": 2969195,
        //         "fee_asset": "",
        //         "fee_discount": "0",
        //         "fee_price": "0",
        //         "fee_rate": "0.0005",
        //         "fee_real_rate": "0.0005",
        //         "id": 379044296,
        //         "leverage": "3",
        //         "margin_amount": "15.8352",
        //         "market": "BTCUSDT",
        //         "open_price": "39588",
        //         "order_id": 17797092987,
        //         "position_amount": "0.0012",
        //         "position_id": 62052321,
        //         "position_type": 1,
        //         "price": "39588",
        //         "role": 2,
        //         "side": 2,
        //         "time": 1650675936.016103,
        //         "user_id": 3620173
        //     }
        //
        let timestamp = this.safeTimestamp2 (trade, 'create_time', 'time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'date_ms');
        }
        const tradeId = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const costString = this.safeString (trade, 'deal_money');
        let fee = undefined;
        const feeCostString = this.safeString2 (trade, 'fee', 'deal_fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_asset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString (trade, 'role');
        if (takerOrMaker === '1') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === '2') {
            takerOrMaker = 'taker';
        }
        let side = undefined;
        if (market['type'] === 'swap') {
            side = this.safeInteger (trade, 'side');
            if (side === 1) {
                side = 'sell';
            } else if (side === 2) {
                side = 'buy';
            }
            if (side === undefined) {
                side = this.safeString (trade, 'type');
            }
        } else {
            side = this.safeString (trade, 'type');
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'last_id': 0,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = market['swap'] ? 'perpetualPublicGetMarketDeals' : 'publicGetMarketDeals';
        const response = await this[method] (this.extend (request, params));
        //
        // Spot and Swap
        //
        //      {
        //          "code":    0,
        //          "data": [
        //              {
        //                  "id":  2611511379,
        //                  "type": "buy",
        //                  "price": "192.63",
        //                  "amount": "0.02266931",
        //                  "date":  1638990110,
        //                  "date_ms":  1638990110518
        //                  },
        //              ],
        //          "message": "OK"
        //      }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketDetail (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //           "name": "BTCUSDC",
        //           "min_amount": "0.0005",
        //           "maker_fee_rate": "0.002",
        //           "taker_fee_rate": "0.002",
        //           "pricing_name": "USDC",
        //           "pricing_decimal": 2,
        //           "trading_name": "BTC",
        //           "trading_decimal": 8
        //         },
        //         "message": "OK"
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTradingFee (data);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketInfo (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "WAVESBTC": {
        //                 "name": "WAVESBTC",
        //                 "min_amount": "1",
        //                 "maker_fee_rate": "0.001",
        //                 "taker_fee_rate": "0.001",
        //                 "pricing_name": "BTC",
        //                 "pricing_decimal": 8,
        //                 "trading_name": "WAVES",
        //                 "trading_decimal": 8
        //             }
        //             ...
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (data, market['id'], {});
            result[symbol] = this.parseTradingFee (fee, market);
        }
        return result;
    }

    parseTradingFee (fee, market = undefined) {
        const marketId = this.safeValue (fee, 'name');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'maker_fee_rate'),
            'taker': this.safeNumber (fee, 'taker_fee_rate'),
            'percentage': true,
            'tierBased': true,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591484400,
        //         "0.02505349",
        //         "0.02506988",
        //         "0.02507000",
        //         "0.02505304",
        //         "343.19716223",
        //         "8.6021323866383196",
        //         "ETHBTC"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = market['swap'] ? 'perpetualPublicGetMarketKline' : 'publicGetMarketKline';
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             [1591484400, "0.02505349", "0.02506988", "0.02507000", "0.02505304", "343.19716223", "8.6021323866383196", "ETHBTC"],
        //             [1591484700, "0.02506990", "0.02508109", "0.02508109", "0.02506979", "91.59841581", "2.2972047780447000", "ETHBTC"],
        //             [1591485000, "0.02508106", "0.02507996", "0.02508106", "0.02507500", "65.15307697", "1.6340597822306000", "ETHBTC"],
        //         ],
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             [1650569400, "41524.64", "41489.31", "41564.61", "41480.58", "29.7060", "1233907.099562"],
        //             [1650569700, "41489.31", "41438.29", "41489.31", "41391.87", "42.4115", "1756154.189061"],
        //             [1650570000, "41438.29", "41482.21", "41485.05", "41427.31", "22.2892", "924000.317861"]
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchMarginBalance (params = {}) {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        let marketId = this.safeString (params, 'market');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            marketId = market['id'];
        } else if (marketId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMarginBalance() fetching a margin account requires a market parameter or a symbol parameter');
        }
        params = this.omit (params, [ 'symbol', 'market' ]);
        const request = {
            'market': marketId,
        };
        const response = await this.privateGetMarginAccount (this.extend (request, params));
        //
        //      {
        //          "code":    0,
        //           "data": {
        //              "account_id":    126,
        //              "leverage":    3,
        //              "market_type":   "AAVEUSDT",
        //              "sell_asset_type":   "AAVE",
        //              "buy_asset_type":   "USDT",
        //              "balance": {
        //                  "sell_type": "0.3",     // borrowed
        //                  "buy_type": "30"
        //                  },
        //              "frozen": {
        //                  "sell_type": "0",
        //                  "buy_type": "0"
        //                  },
        //              "loan": {
        //                  "sell_type": "0.3", // loan
        //                  "buy_type": "0"
        //                  },
        //              "interest": {
        //                  "sell_type": "0.0000125",
        //                  "buy_type": "0"
        //                  },
        //              "can_transfer": {
        //                  "sell_type": "0.02500646",
        //                  "buy_type": "4.28635738"
        //                  },
        //              "warn_rate":   "",
        //              "liquidation_price":   ""
        //              },
        //          "message": "Success"
        //      }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', {});
        const free = this.safeValue (data, 'can_transfer', {});
        const total = this.safeValue (data, 'balance', {});
        //
        const sellAccount = this.account ();
        const sellCurrencyId = this.safeString (data, 'sell_asset_type');
        const sellCurrencyCode = this.safeCurrencyCode (sellCurrencyId);
        sellAccount['free'] = this.safeString (free, 'sell_type');
        sellAccount['total'] = this.safeString (total, 'sell_type');
        result[sellCurrencyCode] = sellAccount;
        //
        const buyAccount = this.account ();
        const buyCurrencyId = this.safeString (data, 'buy_asset_type');
        const buyCurrencyCode = this.safeCurrencyCode (buyCurrencyId);
        buyAccount['free'] = this.safeString (free, 'buy_type');
        buyAccount['total'] = this.safeString (total, 'buy_type');
        result[buyCurrencyCode] = buyAccount;
        //
        return this.safeBalance (result);
    }

    async fetchSpotBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalanceInfo (params);
        //
        //     {
        //       "code": 0,
        //       "data": {
        //         "BCH": {                     # BCH account
        //           "available": "13.60109",   # Available BCH
        //           "frozen": "0.00000"        # Frozen BCH
        //         },
        //         "BTC": {                     # BTC account
        //           "available": "32590.16",   # Available BTC
        //           "frozen": "7000.00"        # Frozen BTC
        //         },
        //         "ETH": {                     # ETH account
        //           "available": "5.06000",    # Available ETH
        //           "frozen": "0.00000"        # Frozen ETH
        //         }
        //       },
        //       "message": "Ok"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchSwapBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.perpetualPrivateGetAssetQuery (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "USDT": {
        //                 "available": "37.24817690383456000000",
        //                 "balance_total": "37.24817690383456000000",
        //                 "frozen": "0.00000000000000000000",
        //                 "margin": "0.00000000000000000000",
        //                 "profit_unreal": "0.00000000000000000000",
        //                 "transfer": "37.24817690383456000000"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            account['total'] = this.safeString (balance, 'balance_total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        const accountType = this.safeString (params, 'type', 'main');
        params = this.omit (params, 'type');
        if (accountType === 'margin') {
            return await this.fetchMarginBalance (params);
        } else if (accountType === 'swap') {
            return await this.fetchSwapBalance (params);
        } else {
            return await this.fetchSpotBalance (params);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'not_deal': 'open',
            'part_deal': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //     {
        //         "amount": "0.1",
        //         "asset_fee": "0.22736197736197736197",
        //         "avg_price": "196.85000000000000000000",
        //         "create_time": 1537270135,
        //         "deal_amount": "0.1",
        //         "deal_fee": "0",
        //         "deal_money": "19.685",
        //         "fee_asset": "CET",
        //         "fee_discount": "0.5",
        //         "id": 1788259447,
        //         "left": "0",
        //         "maker_fee_rate": "0",
        //         "market": "ETHUSDT",
        //         "order_type": "limit",
        //         "price": "170.00000000",
        //         "status": "done",
        //         "taker_fee_rate": "0.0005",
        //         "type": "sell",
        //     }
        //
        // Spot createOrder, cancelOrder, fetchOrder
        //
        //      {
        //          "amount":"1.5",
        //          "asset_fee":"0",
        //          "avg_price":"0.14208538",
        //          "client_id":"",
        //          "create_time":1650993819,
        //          "deal_amount":"10.55703267",
        //          "deal_fee":"0.0029999999971787292",
        //          "deal_money":"1.4999999985893646",
        //          "fee_asset":null,
        //          "fee_discount":"1",
        //          "finished_time":null,
        //          "id":74556296907,
        //          "left":"0.0000000014106354",
        //          "maker_fee_rate":"0",
        //          "market":"DOGEUSDT",
        //          "money_fee":"0.0029999999971787292",
        //          "order_type":"market",
        //          "price":"0",
        //          "status":"done",
        //          "stock_fee":"0",
        //          "taker_fee_rate":"0.002",
        //          "type":"buy"
        //      }
        //
        // Swap createOrder, cancelOrder, fetchOrder
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651004578.618224,
        //         "deal_asset_fee": "0.00000000000000000000",
        //         "deal_fee": "0.00000000000000000000",
        //         "deal_profit": "0.00000000000000000000",
        //         "deal_stock": "0.00000000000000000000",
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "last_deal_amount": "0.00000000000000000000",
        //         "last_deal_id": 0,
        //         "last_deal_price": "0.00000000000000000000",
        //         "last_deal_role": 0,
        //         "last_deal_time": 0,
        //         "last_deal_type": 0,
        //         "left": "0.0005",
        //         "leverage": "3",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18221659097,
        //         "position_id": 0,
        //         "position_type": 1,
        //         "price": "30000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "stop_id": 0,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651004578.618224,
        //         "user_id": 3620173
        //     }
        //
        // Stop order createOrder
        //
        //     {"status":"success"}
        //
        // Swap Stop cancelOrder, fetchOrder
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651034023.008771,
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18256915101,
        //         "price": "31000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "state": 1,
        //         "stop_price": "31500.00",
        //         "stop_type": 1,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651034397.193624,
        //         "user_id": 3620173
        //     }
        //
        //
        // Spot fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "account_id": 0,
        //         "amount": "0.0005",
        //         "asset_fee": "0",
        //         "avg_price": "0.00",
        //         "client_id": "",
        //         "create_time": 1651089247,
        //         "deal_amount": "0",
        //         "deal_fee": "0",
        //         "deal_money": "0",
        //         "fee_asset": null,
        //         "fee_discount": "1",
        //         "finished_time": 0,
        //         "id": 74660190839,
        //         "left": "0.0005",
        //         "maker_fee_rate": "0.002",
        //         "market": "BTCUSDT",
        //         "money_fee": "0",
        //         "order_type": "limit",
        //         "price": "31000",
        //         "status": "not_deal",
        //         "stock_fee": "0",
        //         "taker_fee_rate": "0.002",
        //         "type": "buy"
        //     }
        //
        // Swap fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651030414.088431,
        //         "deal_asset_fee": "0",
        //         "deal_fee": "0.00960069",
        //         "deal_profit": "0.009825",
        //         "deal_stock": "19.20138",
        //         "effect_type": 0,
        //         "fee_asset": "",
        //         "fee_discount": "0",
        //         "left": "0",
        //         "leverage": "3",
        //         "maker_fee": "0",
        //         "market": "BTCUSDT",
        //         "order_id": 18253447431,
        //         "position_id": 0,
        //         "position_type": 1,
        //         "price": "0",
        //         "side": 1,
        //         "source": "web",
        //         "stop_id": 0,
        //         "taker_fee": "0.0005",
        //         "target": 0,
        //         "type": 2,
        //         "update_time": 1651030414.08847,
        //         "user_id": 3620173
        //     }
        //
        // Spot Stop fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "account_id": 0,
        //         "amount": "155",
        //         "client_id": "",
        //         "create_time": 1651089182,
        //         "fee_asset": null,
        //         "fee_discount": "1",
        //         "maker_fee": "0.002",
        //         "market": "BTCUSDT",
        //         "order_id": 74660111965,
        //         "order_type": "market",
        //         "price": "0",
        //         "state": 0,
        //         "stop_price": "31500",
        //         "taker_fee": "0.002",
        //         "type": "buy"
        //     }
        //
        // Swap Stop fetchOpenOrders
        //
        //     {
        //         "amount": "0.0005",
        //         "client_id": "",
        //         "create_time": 1651089147.321691,
        //         "effect_type": 1,
        //         "fee_asset": "",
        //         "fee_discount": "0.00000000000000000000",
        //         "maker_fee": "0.00030",
        //         "market": "BTCUSDT",
        //         "order_id": 18332143848,
        //         "price": "31000.00",
        //         "side": 2,
        //         "source": "api.v1",
        //         "state": 1,
        //         "stop_price": "31500.00",
        //         "stop_type": 1,
        //         "taker_fee": "0.00050",
        //         "target": 0,
        //         "type": 1,
        //         "update_time": 1651089147.321691,
        //         "user_id": 3620173
        //     }
        //
        const timestamp = this.safeTimestamp (order, 'create_time');
        const priceString = this.safeString (order, 'price');
        const costString = this.safeString (order, 'deal_money');
        const amountString = this.safeString (order, 'amount');
        const filledString = this.safeString (order, 'deal_amount');
        const averageString = this.safeString (order, 'avg_price');
        const remainingString = this.safeString (order, 'left');
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const feeCurrencyId = this.safeString (order, 'fee_asset');
        let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        if (feeCurrency === undefined) {
            feeCurrency = market['quote'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let side = this.safeInteger (order, 'side');
        if (side === 1) {
            side = 'sell';
        } else if (side === 2) {
            side = 'buy';
        } else {
            side = this.safeString (order, 'type');
        }
        let type = this.safeString (order, 'order_type');
        if (type === undefined) {
            type = this.safeInteger (order, 'type');
            if (type === 1) {
                type = 'limit';
            } else if (type === 2) {
                type = 'market';
            }
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'id', 'order_id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeTimestamp (order, 'update_time'),
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': priceString,
            'stopPrice': this.safeString (order, 'stop_price'),
            'cost': costString,
            'average': averageString,
            'amount': amountString,
            'filled': filledString,
            'remaining': remainingString,
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeString (order, 'deal_fee'),
            },
            'info': order,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const stopPrice = this.safeString2 (params, 'stopPrice', 'stop_price');
        const postOnly = this.safeValue (params, 'postOnly', false);
        const positionId = this.safeInteger2 (params, 'position_id', 'positionId'); // Required for closing swap positions
        let timeInForce = this.safeString (params, 'timeInForce'); // Spot: IOC, FOK, PO, GTC, ... NORMAL (default), MAKER_ONLY
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        if (reduceOnly !== undefined) {
            if (market['type'] !== 'swap') {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduceOnly for ' + market['type'] + ' orders, reduceOnly orders are supported for swap markets only');
            }
        }
        let method = undefined;
        const request = {
            'market': market['id'],
        };
        if (swap) {
            method = 'perpetualPrivatePostOrderPut' + this.capitalize (type);
            side = (side === 'buy') ? 2 : 1;
            if (stopPrice !== undefined) {
                const stopType = this.safeInteger (params, 'stop_type'); // 1: triggered by the latest transaction, 2: mark price, 3: index price
                if (stopType === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() swap stop orders require a stop_type parameter');
                }
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                request['stop_type'] = this.priceToPrecision (symbol, stopType);
                request['amount'] = this.amountToPrecision (symbol, amount);
                request['side'] = side;
                if (type === 'limit') {
                    method = 'perpetualPrivatePostOrderPutStopLimit';
                    request['price'] = this.priceToPrecision (symbol, price);
                } else if (type === 'market') {
                    method = 'perpetualPrivatePostOrderPutStopMarket';
                }
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            if ((type !== 'market') || (stopPrice !== undefined)) {
                if ((timeInForce !== undefined) || (postOnly !== undefined)) {
                    let isMakerOrder = false;
                    if ((timeInForce === 'PO') || (postOnly)) {
                        isMakerOrder = true;
                    }
                    if (isMakerOrder) {
                        request['option'] = 1;
                    } else {
                        if (timeInForce === 'IOC') {
                            timeInForce = 2;
                        } else if (timeInForce === 'FOK') {
                            timeInForce = 3;
                        } else {
                            timeInForce = 1;
                        }
                        if (timeInForce !== undefined) {
                            request['effect_type'] = timeInForce; // exchange takes 'IOC' and 'FOK'
                        }
                    }
                }
            }
            if (type === 'limit' && stopPrice === undefined) {
                if (reduceOnly) {
                    method = 'perpetualPrivatePostOrderCloseLimit';
                    request['position_id'] = positionId;
                } else {
                    request['side'] = side;
                }
                request['price'] = this.priceToPrecision (symbol, price);
                request['amount'] = this.amountToPrecision (symbol, amount);
            } else if (type === 'market' && stopPrice === undefined) {
                if (reduceOnly) {
                    method = 'perpetualPrivatePostOrderCloseMarket';
                    request['position_id'] = positionId;
                } else {
                    request['side'] = side;
                    request['amount'] = this.amountToPrecision (symbol, amount);
                }
            }
        } else {
            method = 'privatePostOrder' + this.capitalize (type);
            request['type'] = side;
            if ((type === 'market') && (side === 'buy')) {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        const amountString = this.amountToPrecision (symbol, amount);
                        const priceString = this.priceToPrecision (symbol, price);
                        const costString = Precise.stringMul (amountString, priceString);
                        const costNumber = this.parseNumber (costString);
                        request['amount'] = this.costToPrecision (symbol, costNumber);
                    }
                } else {
                    request['amount'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            if ((type === 'limit') || (type === 'ioc')) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (stopPrice !== undefined) {
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                if (type === 'limit') {
                    method = 'privatePostOrderStopLimit';
                } else if (type === 'market') {
                    method = 'privatePostOrderStopMarket';
                }
            }
            if ((type !== 'market') || (stopPrice !== undefined)) {
                // following options cannot be applied to vanilla market orders (but can be applied to stop-market orders)
                if ((timeInForce !== undefined) || (postOnly !== undefined)) {
                    let isMakerOrder = false;
                    if ((timeInForce === 'PO') || (postOnly)) {
                        isMakerOrder = true;
                    }
                    if ((isMakerOrder || (timeInForce !== 'IOC')) && ((type === 'limit') && (stopPrice !== undefined))) {
                        throw new InvalidOrder (this.id + ' createOrder() only supports the IOC option for stop-limit orders');
                    }
                    if (isMakerOrder) {
                        request['option'] = 'MAKER_ONLY';
                    } else {
                        if (timeInForce !== undefined) {
                            request['option'] = timeInForce; // exchange takes 'IOC' and 'FOK'
                        }
                    }
                }
            }
        }
        params = this.omit (params, [ 'reduceOnly', 'position_id', 'positionId', 'timeInForce', 'postOnly', 'stopPrice', 'stop_price', 'stop_type' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "asset_fee": "0",
        //             "avg_price": "0.00",
        //             "client_id": "",
        //             "create_time": 1650951627,
        //             "deal_amount": "0",
        //             "deal_fee": "0",
        //             "deal_money": "0",
        //             "fee_asset": null,
        //             "fee_discount": "1",
        //             "finished_time": null,
        //             "id": 74510932594,
        //             "left": "0.0005",
        //             "maker_fee_rate": "0.002",
        //             "market": "BTCUSDT",
        //             "money_fee": "0",
        //             "order_type": "limit",
        //             "price": "30000",
        //             "status": "not_deal",
        //             "stock_fee": "0",
        //             "taker_fee_rate": "0.002",
        //             "type": "buy"
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Stop Order
        //
        //     {"code":0,"data":{"status":"success"},"message":"OK"}
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async createReduceOnlyOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const request = {
            'reduceOnly': true,
        };
        return await this.createOrder (symbol, type, side, amount, price, this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        const swap = market['swap'];
        const request = {
            'market': market['id'],
        };
        const idRequest = swap ? 'order_id' : 'id';
        request[idRequest] = id;
        let method = swap ? 'perpetualPrivatePostOrderCancel' : 'privateDeleteOrderPending';
        if (stop) {
            if (swap) {
                method = 'perpetualPrivatePostOrderCancelStop';
            } else {
                method = 'privateDeleteOrderStopPendingId';
            }
        }
        const query = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "asset_fee": "0",
        //             "avg_price": "0.00",
        //             "client_id": "",
        //             "create_time": 1650951627,
        //             "deal_amount": "0",
        //             "deal_fee": "0",
        //             "deal_money": "0",
        //             "fee_asset": null,
        //             "fee_discount": "1",
        //             "finished_time": null,
        //             "id": 74510932594,
        //             "left": "0.0005",
        //             "maker_fee_rate": "0.002",
        //             "market": "BTCUSDT",
        //             "money_fee": "0",
        //             "order_type": "limit",
        //             "price": "30000",
        //             "status": "not_deal",
        //             "stock_fee": "0",
        //             "taker_fee_rate": "0.002",
        //             "type": "buy"
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651034023.008771,
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18256915101,
        //             "price": "31000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "state": 1,
        //             "stop_price": "31500.00",
        //             "stop_type": 1,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651034397.193624,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        // Spot Stop
        //
        //     {"code":0,"data":{},"message":"Success"}
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancellAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const accountId = this.safeString (market, 'accountId', '0');
        const request = {
            'market': marketId,
            // 'account_id': accountId, // SPOT, main account ID: 0, margin account ID: See < Inquire Margin Account Market Info >, future account ID: See < Inquire Future Account Market Info >
            // 'side': 0, // SWAP, 0: All, 1: Sell, 2: Buy
        };
        const swap = market['swap'];
        const stop = this.safeValue (params, 'stop');
        let method = undefined;
        if (swap) {
            method = 'perpetualPrivatePostOrderCancelAll';
            if (stop) {
                method = 'perpetualPrivatePostOrderCancelStopAll';
            }
        } else {
            method = 'privateDeleteOrderPending';
            if (stop) {
                method = 'privateDeleteOrderStopPending';
            }
            request['account_id'] = accountId;
        }
        params = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {"code": 0, "data": null, "message": "Success"}
        //
        // Swap
        //
        //     {"code": 0, "data": {"status":"success"}, "message": "OK"}
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const stop = this.safeValue (params, 'stop');
        const request = {
            'market': market['id'],
            // 'id': id, // SPOT
            // 'order_id': id, // SWAP
        };
        const idRequest = swap ? 'order_id' : 'id';
        request[idRequest] = id;
        let method = undefined;
        if (swap) {
            method = stop ? 'perpetualPrivateGetOrderStopStatus' : 'perpetualPrivateGetOrderStatus';
        } else {
            method = 'privateGetOrderStatus';
        }
        params = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.1",
        //             "asset_fee": "0.22736197736197736197",
        //             "avg_price": "196.85000000000000000000",
        //             "create_time": 1537270135,
        //             "deal_amount": "0.1",
        //             "deal_fee": "0",
        //             "deal_money": "19.685",
        //             "fee_asset": "CET",
        //             "fee_discount": "0.5",
        //             "id": 1788259447,
        //             "left": "0",
        //             "maker_fee_rate": "0",
        //             "market": "ETHUSDT",
        //             "order_type": "limit",
        //             "price": "170.00000000",
        //             "status": "done",
        //             "taker_fee_rate": "0.0005",
        //             "type": "sell",
        //         },
        //         "message": "Ok"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651004578.618224,
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "deal_fee": "0.00000000000000000000",
        //             "deal_profit": "0.00000000000000000000",
        //             "deal_stock": "0.00000000000000000000",
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "last_deal_amount": "0.00000000000000000000",
        //             "last_deal_id": 0,
        //             "last_deal_price": "0.00000000000000000000",
        //             "last_deal_role": 0,
        //             "last_deal_time": 0,
        //             "last_deal_type": 0,
        //             "left": "0.0005",
        //             "leverage": "3",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18221659097,
        //             "position_id": 0,
        //             "position_type": 1,
        //             "price": "30000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "stop_id": 0,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651004578.618224,
        //             "user_id": 3620173
        //         },
        //         "message": "OK"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0005",
        //             "client_id": "",
        //             "create_time": 1651034023.008771,
        //             "effect_type": 1,
        //             "fee_asset": "",
        //             "fee_discount": "0.00000000000000000000",
        //             "maker_fee": "0.00030",
        //             "market": "BTCUSDT",
        //             "order_id": 18256915101,
        //             "price": "31000.00",
        //             "side": 2,
        //             "source": "api.v1",
        //             "state": 1,
        //             "stop_price": "31500.00",
        //             "stop_type": 1,
        //             "taker_fee": "0.00050",
        //             "target": 0,
        //             "type": 1,
        //             "update_time": 1651034397.193624,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        limit = (limit === undefined) ? 100 : limit;
        const request = {
            'limit': limit,
            // 'page': 1, // SPOT
            // 'offset': 0, // SWAP
            // 'side': 0, // SWAP, 0: All, 1: Sell, 2: Buy
        };
        const stop = this.safeValue (params, 'stop');
        const side = this.safeInteger (params, 'side');
        params = this.omit (params, 'stop');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrdersByStatus', market, params);
        let method = undefined;
        if (marketType === 'swap') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus() requires a symbol argument for swap markets');
            }
            method = 'perpetualPrivateGetOrder' + this.capitalize (status);
            if (stop) {
                method = 'perpetualPrivateGetOrderStopPending';
            }
            if (side !== undefined) {
                request['side'] = side;
            } else {
                request['side'] = 0;
            }
            request['offset'] = 0;
        } else {
            method = 'privateGetOrder' + this.capitalize (status);
            if (stop) {
                method = 'privateGetOrderStop' + this.capitalize (status);
            }
            request['page'] = 1;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "count": 1,
        //             "curr_page": 1,
        //             "data": [
        //                 {
        //                     "account_id": 0,
        //                     "amount": "0.0005",
        //                     "asset_fee": "0",
        //                     "avg_price": "0.00",
        //                     "client_id": "",
        //                     "create_time": 1651089247,
        //                     "deal_amount": "0",
        //                     "deal_fee": "0",
        //                     "deal_money": "0",
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "finished_time": 0,
        //                     "id": 74660190839,
        //                     "left": "0.0005",
        //                     "maker_fee_rate": "0.002",
        //                     "market": "BTCUSDT",
        //                     "money_fee": "0",
        //                     "order_type": "limit",
        //                     "price": "31000",
        //                     "status": "not_deal",
        //                     "stock_fee": "0",
        //                     "taker_fee_rate": "0.002",
        //                     "type": "buy"
        //                 }
        //             ],
        //             "has_next": false,
        //             "total": 1
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0005",
        //                     "client_id": "",
        //                     "create_time": 1651030414.088431,
        //                     "deal_asset_fee": "0",
        //                     "deal_fee": "0.00960069",
        //                     "deal_profit": "0.009825",
        //                     "deal_stock": "19.20138",
        //                     "effect_type": 0,
        //                     "fee_asset": "",
        //                     "fee_discount": "0",
        //                     "left": "0",
        //                     "leverage": "3",
        //                     "maker_fee": "0",
        //                     "market": "BTCUSDT",
        //                     "order_id": 18253447431,
        //                     "position_id": 0,
        //                     "position_type": 1,
        //                     "price": "0",
        //                     "side": 1,
        //                     "source": "web",
        //                     "stop_id": 0,
        //                     "taker_fee": "0.0005",
        //                     "target": 0,
        //                     "type": 2,
        //                     "update_time": 1651030414.08847,
        //                     "user_id": 3620173
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        // Spot Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "count": 1,
        //             "curr_page": 1,
        //             "data": [
        //                 {
        //                     "account_id": 0,
        //                     "amount": "155",
        //                     "client_id": "",
        //                     "create_time": 1651089182,
        //                     "fee_asset": null,
        //                     "fee_discount": "1",
        //                     "maker_fee": "0.002",
        //                     "market": "BTCUSDT",
        //                     "order_id": 74660111965,
        //                     "order_type": "market",
        //                     "price": "0",
        //                     "state": 0,
        //                     "stop_price": "31500",
        //                     "taker_fee": "0.002",
        //                     "type": "buy"
        //                 }
        //             ],
        //             "has_next": false,
        //             "total": 0
        //         },
        //         "message": "Success"
        //     }
        //
        // Swap Stop
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0005",
        //                     "client_id": "",
        //                     "create_time": 1651089147.321691,
        //                     "effect_type": 1,
        //                     "fee_asset": "",
        //                     "fee_discount": "0.00000000000000000000",
        //                     "maker_fee": "0.00030",
        //                     "market": "BTCUSDT",
        //                     "order_id": 18332143848,
        //                     "price": "31000.00",
        //                     "side": 2,
        //                     "source": "api.v1",
        //                     "state": 1,
        //                     "stop_price": "31500.00",
        //                     "stop_type": 1,
        //                     "taker_fee": "0.00050",
        //                     "target": 0,
        //                     "type": 1,
        //                     "update_time": 1651089147.321691,
        //                     "user_id": 3620173
        //                 }
        //             ],
        //             "total": 1
        //         },
        //         "message": "OK"
        //     }
        //
        const tradeRequest = (marketType === 'swap') ? 'records' : 'data';
        const data = this.safeValue (response, 'data');
        const orders = this.safeValue (data, tradeRequest, []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('pending', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('finished', symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'market': market['id'], // SPOT and SWAP
            'limit': limit, // SPOT and SWAP
            'offset': 0, // SWAP, means query from a certain record
            // 'page': 1, // SPOT
            // 'side': 2, // SWAP, 0 for no limit, 1 for sell, 2 for buy
            // 'start_time': since, // SWAP
            // 'end_time': 1524228297, // SWAP
        };
        let method = undefined;
        if (swap) {
            method = 'perpetualPublicGetMarketUserDeals';
            const side = this.safeInteger (params, 'side');
            if (side === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a side parameter for swap markets');
            }
            if (since !== undefined) {
                request['start_time'] = since;
            }
            request['side'] = side;
            params = this.omit (params, 'side');
        } else {
            method = 'privateGetOrderUserDeals';
            request['page'] = 1;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //      {
        //          "code": 0,
        //          "data": {
        //              "data": [
        //                  {
        //                      "id": 2611520950,
        //                      "order_id": 63286573298,
        //                      "account_id": 0,
        //                      "create_time": 1638990636,
        //                      "type": "sell",
        //                      "role": "taker",
        //                      "price": "192.29",
        //                      "amount": "0.098",
        //                      "fee": "0.03768884",
        //                      "fee_asset": "USDT",
        //                      "market": "AAVEUSDT",
        //                      "deal_money": "18.84442"
        //                          },
        //                      ],
        //              "curr_page": 1,
        //              "has_next": false,
        //              "count": 3
        //              },
        //          "message": "Success"
        //      }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0012",
        //                     "deal_fee": "0.0237528",
        //                     "deal_insurance": "0",
        //                     "deal_margin": "15.8352",
        //                     "deal_order_id": 17797031903,
        //                     "deal_profit": "0",
        //                     "deal_stock": "47.5056",
        //                     "deal_type": 1,
        //                     "deal_user_id": 2969195,
        //                     "fee_asset": "",
        //                     "fee_discount": "0",
        //                     "fee_price": "0",
        //                     "fee_rate": "0.0005",
        //                     "fee_real_rate": "0.0005",
        //                     "id": 379044296,
        //                     "leverage": "3",
        //                     "margin_amount": "15.8352",
        //                     "market": "BTCUSDT",
        //                     "open_price": "39588",
        //                     "order_id": 17797092987,
        //                     "position_amount": "0.0012",
        //                     "position_id": 62052321,
        //                     "position_type": 1,
        //                     "price": "39588",
        //                     "role": 2,
        //                     "side": 2,
        //                     "time": 1650675936.016103,
        //                     "user_id": 3620173
        //                 }
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const tradeRequest = swap ? 'records' : 'data';
        const data = this.safeValue (response, 'data');
        const trades = this.safeValue (data, tradeRequest, []);
        return this.parseTrades (trades, market, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeValue (accountsByType, fromAccount, fromAccount);
        const toId = this.safeValue (accountsByType, toAccount, toAccount);
        const request = {
            'coin_type': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        let method = undefined;
        if (fromId === 'margin' || toId === 'margin') {
            method = 'privatePostMarginTransfer';
            let marketId = this.safeString (params, 'market');
            let market = undefined;
            if (marketId === undefined) {
                const symbol = this.safeString (params, 'symbol');
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' transfer() requires an exchange-specific market parameter or a unified symbol parameter');
                } else {
                    params = this.omit (params, 'symbol');
                    market = this.market (symbol);
                    marketId = market['id'];
                    request['market'] = marketId;
                }
            } else {
                if (this.markets_by_id !== undefined && (marketId in this.markets_by_id)) {
                    market = this.markets_by_id[marketId];
                } else {
                    throw new ExchangeError (this.id + ' transfer() market ' + marketId + ' not found');
                }
            }
            const accountId = this.safeString (market, 'accountId');
            if (fromId === 'margin') {
                request['from_account'] = accountId;
                request['to_account'] = toId;
            } else if (toId === 'margin') {
                request['from_account'] = fromId;
                request['to_account'] = accountId;
            }
        } else if (fromId === 'future' && toId === 0) {
            method = 'privatePostContractBalanceTransfer';
            request['transfer_side'] = 'out';
        } else if (fromId === 0 && toId === 'future') {
            method = 'privatePostContractBalanceTransfer';
            request['transfer_side'] = 'in';
        } else if (fromAccount === 'main') {
            method = 'privatePostSubAccountTransfer';
            request['transfer_side'] = 'out';
            request['transfer_account'] = toAccount;
        } else if (toAccount === 'main') {
            method = 'privatePostSubAccountTransfer';
            request['transfer_side'] = 'in';
            request['transfer_account'] = fromAccount;
        } else {
            throw new ExchangeError (this.id + ' transfer() Only allows between main account and sub accounts, between spot and future account and between spot and margin.');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {"code": 0, "data": null, "message": "Success"}
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
        }
        return transfer;
    }
    
    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            let symbol = undefined;
            if (Array.isArray (symbols)) {
                const symbolsLength = symbols.length;
                if (symbolsLength > 1) {
                    throw new BadRequest (this.id + ' fetchPositions() symbols argument cannot contain more than 1 symbol');
                }
                symbol = symbols[0];
            } else {
                symbol = symbols;
            }
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.perpetualPrivateGetPositionPending (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "adl_sort": 3396,
        //                 "adl_sort_val": "0.00007786",
        //                 "amount": "0.0005",
        //                 "amount_max": "0.0005",
        //                 "amount_max_margin": "6.42101333333333333333",
        //                 "bkr_price": "25684.05333333333333346175",
        //                 "bkr_price_imply": "0.00000000000000000000",
        //                 "close_left": "0.0005",
        //                 "create_time": 1651294226.110899,
        //                 "deal_all": "19.26000000000000000000",
        //                 "deal_asset_fee": "0.00000000000000000000",
        //                 "fee_asset": "",
        //                 "finish_type": 1,
        //                 "first_price": "38526.08",
        //                 "insurance": "0.00000000000000000000",
        //                 "latest_price": "38526.08",
        //                 "leverage": "3",
        //                 "liq_amount": "0.00000000000000000000",
        //                 "liq_order_price": "0",
        //                 "liq_order_time": 0,
        //                 "liq_price": "25876.68373333333333346175",
        //                 "liq_price_imply": "0.00000000000000000000",
        //                 "liq_profit": "0.00000000000000000000",
        //                 "liq_time": 0,
        //                 "mainten_margin": "0.005",
        //                 "mainten_margin_amount": "0.09631520000000000000",
        //                 "maker_fee": "0.00000000000000000000",
        //                 "margin_amount": "6.42101333333333333333",
        //                 "market": "BTCUSDT",
        //                 "open_margin": "0.33333333333333333333",
        //                 "open_margin_imply": "0.00000000000000000000",
        //                 "open_price": "38526.08000000000000000000",
        //                 "open_val": "19.26304000000000000000",
        //                 "open_val_max": "19.26304000000000000000",
        //                 "position_id": 65847227,
        //                 "profit_clearing": "-0.00963152000000000000",
        //                 "profit_real": "-0.00963152000000000000",
        //                 "profit_unreal": "0.00",
        //                 "side": 2,
        //                 "stop_loss_price": "0.00000000000000000000",
        //                 "stop_loss_type": 0,
        //                 "sys": 0,
        //                 "take_profit_price": "0.00000000000000000000",
        //                 "take_profit_type": 0,
        //                 "taker_fee": "0.00000000000000000000",
        //                 "total": 4661,
        //                 "type": 1,
        //                 "update_time": 1651294226.111196,
        //                 "user_id": 3620173
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const position = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i], market));
        }
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.perpetualPrivateGetPositionPending (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "adl_sort": 3396,
        //                 "adl_sort_val": "0.00007786",
        //                 "amount": "0.0005",
        //                 "amount_max": "0.0005",
        //                 "amount_max_margin": "6.42101333333333333333",
        //                 "bkr_price": "25684.05333333333333346175",
        //                 "bkr_price_imply": "0.00000000000000000000",
        //                 "close_left": "0.0005",
        //                 "create_time": 1651294226.110899,
        //                 "deal_all": "19.26000000000000000000",
        //                 "deal_asset_fee": "0.00000000000000000000",
        //                 "fee_asset": "",
        //                 "finish_type": 1,
        //                 "first_price": "38526.08",
        //                 "insurance": "0.00000000000000000000",
        //                 "latest_price": "38526.08",
        //                 "leverage": "3",
        //                 "liq_amount": "0.00000000000000000000",
        //                 "liq_order_price": "0",
        //                 "liq_order_time": 0,
        //                 "liq_price": "25876.68373333333333346175",
        //                 "liq_price_imply": "0.00000000000000000000",
        //                 "liq_profit": "0.00000000000000000000",
        //                 "liq_time": 0,
        //                 "mainten_margin": "0.005",
        //                 "mainten_margin_amount": "0.09631520000000000000",
        //                 "maker_fee": "0.00000000000000000000",
        //                 "margin_amount": "6.42101333333333333333",
        //                 "market": "BTCUSDT",
        //                 "open_margin": "0.33333333333333333333",
        //                 "open_margin_imply": "0.00000000000000000000",
        //                 "open_price": "38526.08000000000000000000",
        //                 "open_val": "19.26304000000000000000",
        //                 "open_val_max": "19.26304000000000000000",
        //                 "position_id": 65847227,
        //                 "profit_clearing": "-0.00963152000000000000",
        //                 "profit_real": "-0.00963152000000000000",
        //                 "profit_unreal": "0.00",
        //                 "side": 2,
        //                 "stop_loss_price": "0.00000000000000000000",
        //                 "stop_loss_type": 0,
        //                 "sys": 0,
        //                 "take_profit_price": "0.00000000000000000000",
        //                 "take_profit_type": 0,
        //                 "taker_fee": "0.00000000000000000000",
        //                 "total": 4661,
        //                 "type": 1,
        //                 "update_time": 1651294226.111196,
        //                 "user_id": 3620173
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePosition (data[0], market);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "adl_sort": 3396,
        //         "adl_sort_val": "0.00007786",
        //         "amount": "0.0005",
        //         "amount_max": "0.0005",
        //         "amount_max_margin": "6.42101333333333333333",
        //         "bkr_price": "25684.05333333333333346175",
        //         "bkr_price_imply": "0.00000000000000000000",
        //         "close_left": "0.0005",
        //         "create_time": 1651294226.110899,
        //         "deal_all": "19.26000000000000000000",
        //         "deal_asset_fee": "0.00000000000000000000",
        //         "fee_asset": "",
        //         "finish_type": 1,
        //         "first_price": "38526.08",
        //         "insurance": "0.00000000000000000000",
        //         "latest_price": "38526.08",
        //         "leverage": "3",
        //         "liq_amount": "0.00000000000000000000",
        //         "liq_order_price": "0",
        //         "liq_order_time": 0,
        //         "liq_price": "25876.68373333333333346175",
        //         "liq_price_imply": "0.00000000000000000000",
        //         "liq_profit": "0.00000000000000000000",
        //         "liq_time": 0,
        //         "mainten_margin": "0.005",
        //         "mainten_margin_amount": "0.09631520000000000000",
        //         "maker_fee": "0.00000000000000000000",
        //         "margin_amount": "6.42101333333333333333",
        //         "market": "BTCUSDT",
        //         "open_margin": "0.33333333333333333333",
        //         "open_margin_imply": "0.00000000000000000000",
        //         "open_price": "38526.08000000000000000000",
        //         "open_val": "19.26304000000000000000",
        //         "open_val_max": "19.26304000000000000000",
        //         "position_id": 65847227,
        //         "profit_clearing": "-0.00963152000000000000",
        //         "profit_real": "-0.00963152000000000000",
        //         "profit_unreal": "0.00",
        //         "side": 2,
        //         "stop_loss_price": "0.00000000000000000000",
        //         "stop_loss_type": 0,
        //         "sys": 0,
        //         "take_profit_price": "0.00000000000000000000",
        //         "take_profit_type": 0,
        //         "taker_fee": "0.00000000000000000000",
        //         "total": 4661,
        //         "type": 1,
        //         "update_time": 1651294226.111196,
        //         "user_id": 3620173
        //     }
        //
        const marketId = this.safeString (position, 'market');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const positionId = this.safeInteger (position, 'position_id');
        const marginModeInteger = this.safeInteger (position, 'type');
        const marginMode = (marginModeInteger === 1) ? 'isolated' : 'cross';
        const liquidationPrice = this.safeString (position, 'liq_price');
        const entryPrice = this.safeString (position, 'open_price');
        const unrealizedPnl = this.safeString (position, 'profit_unreal');
        const contractSize = this.safeString (position, 'amount');
        const sideInteger = this.safeInteger (position, 'side');
        const side = (sideInteger === 1) ? 'short' : 'long';
        const timestamp = this.safeTimestamp (position, 'update_time');
        const maintenanceMargin = this.safeString (position, 'mainten_margin_amount');
        const maintenanceMarginPercentage = this.safeString (position, 'mainten_margin');
        const collateral = this.safeString (position, 'margin_amount');
        const leverage = this.safeNumber (position, 'leverage');
        return {
            'info': position,
            'id': positionId,
            'symbol': symbol,
            'notional': undefined,
            'marginMode': marginMode,
            'marginType': marginMode, // deprecated
            'liquidationPrice': liquidationPrice,
            'entryPrice': entryPrice,
            'unrealizedPnl': unrealizedPnl,
            'percentage': undefined,
            'contracts': undefined,
            'contractSize': contractSize,
            'markPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'marginRatio': undefined,
        };
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new BadRequest (this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setMarginMode() supports swap contracts only');
        }
        const defaultMarginMode = this.safeString2 (this.options, 'defaultMarginMode', marginMode);
        let defaultPositionType = undefined;
        if (defaultMarginMode === 'isolated') {
            defaultPositionType = 1;
        } else if (defaultMarginMode === 'cross') {
            defaultPositionType = 2;
        }
        const leverage = this.safeInteger (params, 'leverage');
        const maxLeverage = this.safeInteger (market['limits']['leverage'], 'max', 100);
        const positionType = this.safeInteger (params, 'position_type', defaultPositionType);
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter');
        }
        if (positionType === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a position_type parameter that will transfer margin to the specified trading pair');
        }
        if ((leverage < 3) || (leverage > maxLeverage)) {
            throw new BadRequest (this.id + ' setMarginMode() leverage should be between 3 and ' + maxLeverage.toString () + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'leverage': leverage.toString (),
            'position_type': positionType, // 1: isolated, 2: cross
        };
        return await this.perpetualPrivatePostMarketAdjustLeverage (this.extend (request, params));
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const defaultMarginMode = this.safeString2 (this.options, 'defaultMarginMode', 'marginMode');
        let defaultPositionType = undefined;
        if (defaultMarginMode === 'isolated') {
            defaultPositionType = 1;
        } else if (defaultMarginMode === 'cross') {
            defaultPositionType = 2;
        }
        const positionType = this.safeInteger (params, 'position_type', defaultPositionType);
        if (positionType === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a position_type parameter that will transfer margin to the specified trading pair');
        }
        const market = this.market (symbol);
        const maxLeverage = this.safeInteger (market['limits']['leverage'], 'max', 100);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        }
        if ((leverage < 3) || (leverage > maxLeverage)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 3 and ' + maxLeverage.toString () + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'leverage': leverage.toString (),
            'position_type': positionType, // 1: isolated, 2: cross
        };
        return await this.perpetualPrivatePostMarketAdjustLeverage (this.extend (request, params));
    }

    async modifyMarginHelper (symbol, amount, addOrReduce, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'type': addOrReduce,
        };
        const response = await this.perpetualPrivatePostPositionAdjustMargin (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "adl_sort": 1,
        //             "adl_sort_val": "0.00004320",
        //             "amount": "0.0005",
        //             "amount_max": "0.0005",
        //             "amount_max_margin": "6.57352000000000000000",
        //             "bkr_price": "16294.08000000000000011090",
        //             "bkr_price_imply": "0.00000000000000000000",
        //             "close_left": "0.0005",
        //             "create_time": 1651202571.320778,
        //             "deal_all": "19.72000000000000000000",
        //             "deal_asset_fee": "0.00000000000000000000",
        //             "fee_asset": "",
        //             "finish_type": 1,
        //             "first_price": "39441.12",
        //             "insurance": "0.00000000000000000000",
        //             "latest_price": "39441.12",
        //             "leverage": "3",
        //             "liq_amount": "0.00000000000000000000",
        //             "liq_order_price": "0",
        //             "liq_order_time": 0,
        //             "liq_price": "16491.28560000000000011090",
        //             "liq_price_imply": "0.00000000000000000000",
        //             "liq_profit": "0.00000000000000000000",
        //             "liq_time": 0,
        //             "mainten_margin": "0.005",
        //             "mainten_margin_amount": "0.09860280000000000000",
        //             "maker_fee": "0.00000000000000000000",
        //             "margin_amount": "11.57352000000000000000",
        //             "market": "BTCUSDT",
        //             "open_margin": "0.58687582908396110455",
        //             "open_margin_imply": "0.00000000000000000000",
        //             "open_price": "39441.12000000000000000000",
        //             "open_val": "19.72056000000000000000",
        //             "open_val_max": "19.72056000000000000000",
        //             "position_id": 65171206,
        //             "profit_clearing": "-0.00986028000000000000",
        //             "profit_real": "-0.00986028000000000000",
        //             "profit_unreal": "0.00",
        //             "side": 2,
        //             "stop_loss_price": "0.00000000000000000000",
        //             "stop_loss_type": 0,
        //             "sys": 0,
        //             "take_profit_price": "0.00000000000000000000",
        //             "take_profit_type": 0,
        //             "taker_fee": "0.00000000000000000000",
        //             "total": 3464,
        //             "type": 1,
        //             "update_time": 1651202638.911212,
        //             "user_id": 3620173
        //         },
        //         "message":"OK"
        //     }
        //
        const status = this.safeString (response, 'message');
        const type = (addOrReduce === 1) ? 'add' : 'reduce';
        return this.extend (this.parseModifyMargin (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
            'status': status,
        });
    }

    parseModifyMargin (data, market = undefined) {
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': market['quote'],
            'symbol': this.safeSymbol (undefined, market),
            'status': undefined,
        };
    }

    async addMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 1, params);
    }

    async reduceMargin (symbol, amount, params = {}) {
        return await this.modifyMarginHelper (symbol, amount, 2, params);
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        limit = (limit === undefined) ? 100 : limit;
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'limit': limit,
            // 'offset': 0,
            // 'end_time': 1638990636000,
            // 'windowtime': 1638990636000,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.perpetualPrivateGetPositionFunding (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "limit": 100,
        //             "offset": 0,
        //             "records": [
        //                 {
        //                     "amount": "0.0012",
        //                     "asset": "USDT",
        //                     "funding": "-0.0095688273996",
        //                     "funding_rate": "0.00020034",
        //                     "market": "BTCUSDT",
        //                     "position_id": 62052321,
        //                     "price": "39802.45",
        //                     "real_funding_rate": "0.00020034",
        //                     "side": 2,
        //                     "time": 1650729623.933885,
        //                     "type": 1,
        //                     "user_id": 3620173,
        //                     "value": "47.76294"
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'records', []);
        const result = [];
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeTimestamp (entry, 'time');
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': code,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeNumber (entry, 'position_id'),
                'amount': this.safeNumber (entry, 'funding'),
            });
        }
        return result;
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'market': market['id'],
        };
        const response = await this.perpetualPublicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //          "code": 0,
        //         "data":
        //         {
        //             "date": 1650678472474,
        //             "ticker": {
        //                 "vol": "6090.9430",
        //                 "low": "39180.30",
        //                 "open": "40474.97",
        //                 "high": "40798.01",
        //                 "last": "39659.30",
        //                 "buy": "39663.79",
        //                 "period": 86400,
        //                 "funding_time": 372,
        //                 "position_amount": "270.1956",
        //                 "funding_rate_last": "0.00022913",
        //                 "funding_rate_next": "0.00013158",
        //                 "funding_rate_predict": "0.00016552",
        //                 "insurance": "16045554.83969682659674035672",
        //                 "sign_price": "39652.48",
        //                 "index_price": "39648.44250000",
        //                 "sell_total": "22.3913",
        //                 "buy_total": "19.4498",
        //                 "buy_amount": "12.8942",
        //                 "sell": "39663.80",
        //                 "sell_amount": "0.9388"
        //             }
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const ticker = this.safeValue (data, 'ticker', {});
        return this.parseFundingRate (ticker, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        // fetchFundingRate
        //
        //     {
        //         "vol": "6090.9430",
        //         "low": "39180.30",
        //         "open": "40474.97",
        //         "high": "40798.01",
        //         "last": "39659.30",
        //         "buy": "39663.79",
        //         "period": 86400,
        //         "funding_time": 372,
        //         "position_amount": "270.1956",
        //         "funding_rate_last": "0.00022913",
        //         "funding_rate_next": "0.00013158",
        //         "funding_rate_predict": "0.00016552",
        //         "insurance": "16045554.83969682659674035672",
        //         "sign_price": "39652.48",
        //         "index_price": "39648.44250000",
        //         "sell_total": "22.3913",
        //         "buy_total": "19.4498",
        //         "buy_amount": "12.8942",
        //         "sell": "39663.80",
        //         "sell_amount": "0.9388"
        //     }
        //
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'markPrice': this.safeString (contract, 'sign_price'),
            'indexPrice': this.safeString (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeString (contract, 'funding_rate_next'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': this.safeString (contract, 'funding_rate_predict'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeString (contract, 'funding_rate_last'),
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag) {
            address = address + ':' + tag;
        }
        const request = {
            'coin_type': currency['id'],
            'coin_address': address, // must be authorized, inter-user transfer by a registered mobile phone number or an email address is supported
            'actual_amount': parseFloat (amount), // the actual amount without fees, https://www.coinex.com/fees
            'transfer_method': 'onchain', // onchain, local
        };
        const response = await this.privatePostBalanceCoinWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "actual_amount": "1.00000000",
        //             "amount": "1.00000000",
        //             "coin_address": "1KAv3pazbTk2JnQ5xTo6fpKK7p1it2RzD4",
        //             "coin_type": "BCH",
        //             "coin_withdraw_id": 206,
        //             "confirmations": 0,
        //             "create_time": 1524228297,
        //             "status": "audit",
        //             "tx_fee": "0",
        //             "tx_id": ""
        //         },
        //         "message": "Ok"
        //     }
        //
        const transaction = this.safeValue (response, 'data', {});
        return this.parseTransaction (transaction, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'audit': 'pending',
            'pass': 'pending',
            'processing': 'pending',
            'confirming': 'pending',
            'not_pass': 'failed',
            'cancel': 'canceled',
            'finish': 'ok',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = 100, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'limit': limit,
            'offset': 0,
            // 'end_time': 1638990636,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.perpetualPublicGetMarketFundingHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "offset": 0,
        //             "limit": 3,
        //             "records": [
        //                 {
        //                     "time": 1650672021.6230309,
        //                     "market": "BTCUSDT",
        //                     "asset": "USDT",
        //                     "funding_rate": "0.00022913",
        //                     "funding_rate_real": "0.00022913"
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = this.safeValue (data, 'records');
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'market');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeTimestamp (entry, 'time');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeString (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "actual_amount": "120.00000000",
        //         "actual_amount_display": "120",
        //         "add_explorer": "XXX",
        //         "amount": "120.00000000",
        //         "amount_display": "120",
        //         "coin_address": "XXXXXXXX",
        //         "coin_address_display": "XXXXXXXX",
        //         "coin_deposit_id": 1866,
        //         "coin_type": "USDT",
        //         "confirmations": 0,
        //         "create_time": 1539595701,
        //         "explorer": "",
        //         "remark": "",
        //         "status": "finish",
        //         "status_display": "finish",
        //         "transfer_method": "local",
        //         "tx_id": "",
        //         "tx_id_display": "XXXXXXXXXX"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "actual_amount": "0.10000000",
        //         "amount": "0.10000000",
        //         "coin_address": "15sr1VdyXQ6sVLqeJUJ1uPzLpmQtgUeBSB",
        //         "coin_type": "BCH",
        //         "coin_withdraw_id": 203,
        //         "confirmations": 11,
        //         "create_time": 1515806440,
        //         "status": "finish",
        //         "tx_fee": "0",
        //         "tx_id": "896371d0e23d64d1cac65a0b7c9e9093d835affb572fec89dd4547277fbdd2f6"
        //     }
        //
        const id = this.safeString2 (transaction, 'coin_withdraw_id', 'coin_deposit_id');
        const address = this.safeString (transaction, 'coin_address');
        let tag = this.safeString (transaction, 'remark'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'tx_id');
        if (txid !== undefined) {
            if (txid.length < 1) {
                txid = undefined;
            }
        }
        const currencyId = this.safeString (transaction, 'coin_type');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'create_time');
        const type = ('coin_withdraw_id' in transaction) ? 'withdraw' : 'deposit';
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let amount = this.safeNumber (transaction, 'amount');
        let feeCost = this.safeNumber (transaction, 'tx_fee');
        if (type === 'deposit') {
            feeCost = 0;
        }
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        // https://github.com/ccxt/ccxt/issues/8321
        if (amount !== undefined) {
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeValue (accountsByType, fromAccount, fromAccount);
        const toId = this.safeValue (accountsByType, toAccount, toAccount);
        const request = {
            'coin_type': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
        };
        let method = undefined;
        if (fromId === 'margin' || toId === 'margin') {
            method = 'privatePostMarginTransfer';
            let marketId = this.safeString (params, 'market');
            let market = undefined;
            if (marketId === undefined) {
                const symbol = this.safeString (params, 'symbol');
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' transfer() requires an exchange-specific market parameter or a unified symbol parameter');
                } else {
                    params = this.omit (params, 'symbol');
                    market = this.market (symbol);
                    marketId = market['id'];
                    request['market'] = marketId;
                }
            } else {
                if (this.markets_by_id !== undefined && (marketId in this.markets_by_id)) {
                    market = this.markets_by_id[marketId];
                } else {
                    throw new ExchangeError (this.id + ' transfer() market ' + marketId + ' not found');
                }
            }
            const accountId = this.safeString (market, 'accountId');
            if (fromId === 'margin') {
                request['from_account'] = accountId;
                request['to_account'] = toId;
            } else if (toId === 'margin') {
                request['from_account'] = fromId;
                request['to_account'] = accountId;
            }
        } else if (fromId === 'future' && toId === 0) {
            method = 'privatePostContractBalanceTransfer';
            request['transfer_side'] = 'out';
        } else if (fromId === 0 && toId === 'future') {
            method = 'privatePostContractBalanceTransfer';
            request['transfer_side'] = 'in';
        } else if (fromAccount === 'main') {
            method = 'privatePostSubAccountTransfer';
            request['transfer_side'] = 'out';
            request['transfer_account'] = toAccount;
        } else if (toAccount === 'main') {
            method = 'privatePostSubAccountTransfer';
            request['transfer_side'] = 'in';
            request['transfer_account'] = fromAccount;
        } else {
            throw new ExchangeError (this.id + ' transfer() Only allows between main account and sub accounts, between spot and future account and between spot and margin.');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {"code": 0, "data": null, "message": "Success"}
        //
        const transfer = this.parseTransfer (response, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeValue (transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
        }
        return transfer;
    }

    parseTransferStatus (status) {
        const statuses = {
            '0': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // fetchTransfers
        //
        //     {
        //         "amount": "10",
        //         "asset": "USDT",
        //         "transfer_type": "transfer_out", // from swap to spot
        //         "created_at": 1651633422
        //     },
        //
        const timestamp = this.safeTimestamp (transfer, 'created_at');
        const transferType = this.safeString (transfer, 'transfer_type');
        let fromAccount = undefined;
        let toAccount = undefined;
        if (transferType === 'transfer_out') {
            fromAccount = 'swap';
            toAccount = 'spot';
        } else if (transferType === 'transfer_in') {
            fromAccount = 'spot';
            toAccount = 'swap';
        }
        const currencyId = this.safeString (transfer, 'asset');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (this.safeString (transfer, 'code')),
        };
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'page': 1,
            'limit': limit,
            // 'asset': 'USDT',
            // 'start_time': since,
            // 'end_time': 1515806440,
            // 'transfer_type': 'transfer_in', // transfer_in: from Spot to Swap Account, transfer_out: from Swap to Spot Account
        };
        const page = this.safeInteger (params, 'page');
        if (page !== undefined) {
            request['page'] = page;
        }
        if (code !== undefined) {
            currency = this.safeCurrencyCode (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        params = this.omit (params, 'page');
        const response = await this.privateGetContractTransferHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "records": [
        //                 {
        //                     "amount": "10",
        //                     "asset": "USDT",
        //                     "transfer_type": "transfer_out",
        //                     "created_at": 1651633422
        //                 },
        //             ],
        //             "total": 5
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transfers = this.safeValue (data, 'records', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "has_next": true,
        //             "curr_page": 1,
        //             "count": 10,
        //             "data": [
        //                 {
        //                     "coin_withdraw_id": 203,
        //                     "create_time": 1513933541,
        //                     "actual_amount": "0.00100000",
        //                     "actual_amount_display": "***",
        //                     "amount": "0.00100000",
        //                     "amount_display": "******",
        //                     "coin_address": "1GVVx5UBddLKrckTprNi4VhHSymeQ8tsLF",
        //                     "app_coin_address_display": "**********",
        //                     "coin_address_display": "****************",
        //                     "add_explorer": "https://explorer.viawallet.com/btc/address/1GVVx5UBddLKrckTprNi4VhHSymeQ8tsLF",
        //                     "coin_type": "BTC",
        //                     "confirmations": 6,
        //                     "explorer": "https://explorer.viawallet.com/btc/tx/1GVVx5UBddLKrckTprNi4VhHSymeQ8tsLF",
        //                     "fee": "0",
        //                     "remark": "",
        //                     "smart_contract_name": "BTC",
        //                     "status": "finish",
        //                     "status_display": "finish",
        //                     "transfer_method": "onchain",
        //                     "tx_fee": "0",
        //                     "tx_id": "896371d0e23d64d1cac65a0b7c9e9093d835affb572fec89dd4547277fbdd2f6"
        //                 }, /* many more data points */
        //             ],
        //             "total": ***,
        //             "total_page":***
        //         },
        //         "message": "Success"
        //     }
        //
        let data = this.safeValue (response, 'data');
        if (!Array.isArray (data)) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinDeposit (this.extend (request, params));
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "actual_amount": "4.65397682",
        //                 "actual_amount_display": "4.65397682",
        //                 "add_explorer": "https://etherscan.io/address/0x361XXXXXX",
        //                 "amount": "4.65397682",
        //                 "amount_display": "4.65397682",
        //                 "coin_address": "0x36dabcdXXXXXX",
        //                 "coin_address_display": "0x361X*****XXXXX",
        //                 "coin_deposit_id": 966191,
        //                 "coin_type": "ETH",
        //                 "confirmations": 30,
        //                 "create_time": 1531661445,
        //                 "explorer": "https://etherscan.io/tx/0x361XXXXXX",
        //                 "remark": "",
        //                 "status": "finish",
        //                 "status_display": "finish",
        //                 "transfer_method": "onchain",
        //                 "tx_id": "0x361XXXXXX",
        //                 "tx_id_display": "0x361XXXXXX"
        //             }
        //         ],
        //         "message": "Ok"
        //     }
        //
        let data = this.safeValue (response, 'data');
        if (!Array.isArray (data)) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        this.checkRequiredCredentials ();
        const nonce = this.nonce ().toString ();
        if (api === 'perpetualPrivate' || url === 'https://api.coinex.com/perpetual/v1/market/user_deals') {
            query = this.extend ({
                'access_id': this.apiKey,
                'timestamp': nonce,
            }, query);
            query = this.keysort (query);
            const urlencoded = this.rawencode (query);
            const signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret), 'sha256');
            headers = {
                'Authorization': signature.toLowerCase (),
                'AccessId': this.apiKey,
            };
            if ((method === 'GET')) {
                url += '?' + urlencoded;
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = urlencoded;
            }
        } else if (api === 'public' || api === 'perpetualPublic') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            query = this.extend ({
                'access_id': this.apiKey,
                'tonce': nonce,
            }, query);
            query = this.keysort (query);
            const urlencoded = this.rawencode (query);
            const signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret));
            headers = {
                'Authorization': signature.toUpperCase (),
                'Content-Type': 'application/json',
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + urlencoded;
            } else {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const code = this.safeString (response, 'code');
        const data = this.safeValue (response, 'data');
        const message = this.safeString (response, 'message');
        if ((code !== '0') || ((message !== 'Success') && (message !== 'Succeeded') && (message !== 'Ok') && !data)) {
            const responseCodes = {
                // https://github.com/coinexcom/coinex_exchange_api/wiki/013error_code
                '23': PermissionDenied, // IP Prohibited
                '24': AuthenticationError,
                '25': AuthenticationError,
                '34': AuthenticationError, // Access id is expires
                '35': ExchangeNotAvailable, // Service unavailable
                '36': RequestTimeout, // Service timeout
                '107': InsufficientFunds,
                '600': OrderNotFound,
                '601': InvalidOrder,
                '602': InvalidOrder,
                '606': InvalidOrder,
            };
            const ErrorClass = this.safeValue (responseCodes, code, ExchangeError);
            throw new ErrorClass (response['message']);
        }
    }
};
