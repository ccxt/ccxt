'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, BadSymbol, InvalidOrder, PermissionDenied, InvalidAddress, AuthenticationError, InvalidNonce, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class aofex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aofex',
            'name': 'AOFEX',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'hostname': 'openapi.aofex.com',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchClosedOrder': true,
                'fetchOrderTrades': true,
                'fetchTradingFee': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/77670271-056d1080-6f97-11ea-9ac2-4268e9ed0c1f.jpg',
                'api': {
                    'public': 'https://{hostname}/openApi',
                    'private': 'https://{hostname}/openApi',
                },
                'www': 'https://aofex.com',
                'doc': 'https://aofex.zendesk.com/hc/en-us/sections/360005576574-API',
                'fees': 'https://aofex.zendesk.com/hc/en-us/articles/360025814934-Fees-on-AOFEX',
                'referral': 'https://aofex.com/#/register?key=9763840',
            },
            'api': {
                'public': {
                    'get': [
                        'market/symbols',
                        'market/trade',
                        'market/depth',
                        'market/kline',
                        'market/precision',
                        'market/24kline',
                        'market/gears_depth',
                        'market/detail',
                    ],
                },
                'private': {
                    'get': [
                        'entrust/currentList',
                        'entrust/historyList',
                        'entrust/rate',
                        'wallet/list',
                        'entrust/detail',
                    ],
                    'post': [
                        'entrust/add',
                        'entrust/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0019,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'exact': {
                    '20001': ExchangeError, // request failure
                    '20401': PermissionDenied, // no permission
                    '20500': ExchangeError, // system error
                    '20501': BadSymbol, // base symbol error
                    '20502': ExchangeError, // base currency error
                    '20503': ExchangeError, // base date error
                    '20504': InsufficientFunds, // account frozen balance insufficient error
                    '20505': BadRequest, // bad argument
                    '20506': AuthenticationError, // api signature not valid
                    '20507': ExchangeError, // gateway internal error
                    '20508': InvalidAddress, // ad ethereum addresss
                    '20509': InsufficientFunds, // order accountbalance error
                    '20510': InvalidOrder, // order limitorder price error
                    '20511': InvalidOrder, // order limitorder amount error
                    '20512': InvalidOrder, // order orderprice precision error
                    '20513': InvalidOrder, // order orderamount precision error
                    '20514': InvalidOrder, // order marketorder amount error
                    '20515': InvalidOrder, // order queryorder invalid
                    '20516': InvalidOrder, // order orderstate error
                    '20517': InvalidOrder, // order datelimit error
                    '50518': InvalidOrder, // order update error
                    '20519': InvalidNonce, // the nonce has been used
                    '20520': InvalidNonce, // nonce expires, please verify server time
                    '20521': BadRequest, // incomplete header parameters
                    '20522': ExchangeError, // not getting the current user
                    '20523': AuthenticationError, // please authenticate
                    '20524': PermissionDenied, // btc account lockout
                    '20525': AuthenticationError, // get API Key error
                    '20526': PermissionDenied, // no query permission
                    '20527': PermissionDenied, // no deal permission
                    '20528': PermissionDenied, // no withdrawal permission
                    '20529': AuthenticationError, // API Key expired
                    '20530': PermissionDenied, // no permission
                },
                'broad': {
                },
            },
            'options': {
                'fetchBalance': {
                    'show_all': '0', // '1' to show zero balances
                },
            },
            'commonCurrencies': {
                'CPC': 'Consensus Planet Coin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarketSymbols (params);
        //
        //     {
        //         errno: 0,
        //         errmsg: 'success',
        //         result: [
        //             {
        //                 id: 2,
        //                 symbol: 'BTC-USDT',
        //                 base_currency: 'BTC',
        //                 quote_currency: 'USDT',
        //                 min_size: 0.00008,
        //                 max_size: 1300,
        //                 min_price: 1000,
        //                 max_price: 110000,
        //                 maker_fee: 1,
        //                 taker_fee: 1,
        //                 isHot: null,
        //                 isNew: null,
        //                 crown: null
        //             },
        //         ]
        //     }
        //
        let precisions = await this.publicGetMarketPrecision ();
        //
        //     {
        //         errno: 0,
        //         errmsg: 'success',
        //         result: {
        //             'MANA-USDT': {
        //                 amount: '2',
        //                 minQuantity: '32',
        //                 maxQuantity: '46000000',
        //                 price: '4',
        //                 minPrice: '0.003',
        //                 maxPrice: '0.35'
        //             },
        //         }
        //     }
        //
        precisions = this.safeValue (precisions, 'result', {});
        markets = this.safeValue (markets, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const numericId = this.safeInteger (market, 'id');
            const precision = this.safeValue (precisions, id, {});
            const makerFeeString = this.safeString (market, 'maker_fee');
            const takerFeeString = this.safeString (market, 'taker_fee');
            const makerFee = this.parseNumber (Precise.stringDiv (makerFeeString, '1000'));
            const takerFee = this.parseNumber (Precise.stringDiv (takerFeeString, '1000'));
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': undefined,
                'maker': makerFee,
                'taker': takerFee,
                'precision': {
                    'amount': this.safeInteger (precision, 'amount'),
                    'price': this.safeInteger (precision, 'price'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'min_size'),
                        'max': this.safeNumber (market, 'max_size'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
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

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         id:  1584950100,
        //         amount: "329.196",
        //         count:  81,
        //         open: "0.021155",
        //         close: "0.021158",
        //         low: "0.021144",
        //         high: "0.021161",
        //         vol: "6.963557767"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'id'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'amount'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 150; // default 150, max 2000
        }
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
            'size': limit, // default 150, max 2000
        };
        const response = await this.publicGetMarketKline (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: "success",
        //         result: {
        //             ts:  1584950139003,
        //             symbol: "ETH-BTC",
        //             period: "1min",
        //             data: [
        //                 {
        //                     id:  1584950100,
        //                     amount: "329.196",
        //                     count:  81,
        //                     open: "0.021155",
        //                     close: "0.021158",
        //                     low: "0.021144",
        //                     high: "0.021161",
        //                     vol: "6.963557767"
        //                 },
        //                 {
        //                     id:  1584950040,
        //                     amount: "513.265",
        //                     count:  151,
        //                     open: "0.021165",
        //                     close: "0.021155",
        //                     low: "0.021151",
        //                     high: "0.02118",
        //                     vol: "10.862806573"
        //                 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseOHLCVs (data, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const showAll = this.safeValue (options, 'show_all', '0');
        const request = {
            // 'currency': 'BTC',
            'show_all': showAll, // required to show zero balances
        };
        const response = await this.privateGetWalletList (this.extend (request, params));
        //
        //     {
        //         "errno": 0,
        //         "errmsg": "success",
        //         "result": [
        //             { "available": "0", "frozen": "0", "currency": "BTC" }
        //         ]
        //     }
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeValue (response, 'result', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetEntrustRate (this.extend (request, params));
        //
        //     {
        //         "errno":0,
        //         "errmsg":"success",
        //         "result": {
        //             "toFee":"0.002","fromFee":"0.002"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'symbol': symbol,
            'maker': this.safeNumber (result, 'fromFee'),
            'taker': this.safeNumber (result, 'toFee'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: "success",
        //         result: {
        //             buyType: 1,
        //             sellType: 1,
        //             ts: 1584950701050,
        //             symbol: "ETH-BTC",
        //             asks: [
        //                 ["0.021227", "0.182"],
        //                 ["0.021249", "0.035"],
        //                 ["0.021253", "0.058"],
        //             ],
        //             bids: [
        //                 ["0.021207", "0.039"],
        //                 ["0.021203", "0.051"],
        //                 ["0.02117", "2.326"],
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.safeInteger (result, 'ts');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         id: 1584890087,
        //         amount: '150032.919',
        //         count: 134538,
        //         open: '0.021394',
        //         close: '0.021177',
        //         low: '0.021053',
        //         high: '0.021595',
        //         vol: '3201.72451442'
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'id');
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const open = this.safeNumber (ticker, 'open');
        const last = this.safeNumber (ticker, 'close');
        let change = undefined;
        if (symbol !== undefined) {
            change = this.parseNumber (this.priceToPrecision (symbol, last - open));
        } else {
            change = last - open;
        }
        const average = this.sum (last, open) / 2;
        const percentage = change / open * 100;
        const baseVolume = this.safeNumber (ticker, 'amount');
        const quoteVolume = this.safeNumber (ticker, 'vol');
        let vwap = this.vwap (baseVolume, quoteVolume);
        if (vwap !== undefined) {
            vwap = this.parseNumber (this.priceToPrecision (symbol, vwap));
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['symbol'] = ids.join (',');
        }
        const response = await this.publicGetMarket24kline (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: "success",
        //         result: [
        //             {
        //                 symbol: "HB-AQ",
        //                 data: {
        //                     id:  1584893403,
        //                     amount: "4753751.243400354852648809",
        //                     count:  4724,
        //                     open: "6.3497",
        //                     close: "6.3318",
        //                     low: "6.011",
        //                     high: "6.5",
        //                     vol: "29538384.7873528796542891343493"
        //                 }
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const marketId = this.safeString (tickers[i], 'symbol');
            const market = this.safeMarket (marketId, undefined, '-');
            const symbol = market['symbol'];
            const data = this.safeValue (tickers[i], 'data', {});
            result[symbol] = this.parseTicker (data, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDetail (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: 'success',
        //         result: {
        //             id: 1584890087,
        //             amount: '150032.919',
        //             count: 134538,
        //             open: '0.021394',
        //             close: '0.021177',
        //             low: '0.021053',
        //             high: '0.021595',
        //             vol: '3201.72451442'
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         id: 1584948803298490,
        //         amount: "2.737",
        //         price: "0.021209",
        //         direction: "sell",
        //         ts: 1584948803
        //     }
        //
        // fetchOrder trades
        //
        //     {
        //         "id":null,
        //         "ctime":"2020-03-23 20:07:17",
        //         "price":"123.9",
        //         "number":"0.010688626311541565",
        //         "total_price":"1.324320799999999903",
        //         "fee":"0.000021377252623083"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const ctime = this.parse8601 (this.safeString (trade, 'ctime'));
        const timestamp = this.safeTimestamp (trade, 'ts', ctime) - 28800000; // 8 hours, adjust to UTC;
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'direction');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'amount', 'number');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        let cost = this.safeNumber (trade, 'total_price');
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                if (side === 'buy') {
                    feeCurrencyCode = market['base'];
                } else if (side === 'sell') {
                    feeCurrencyCode = market['quote'];
                }
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
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
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTrade (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: "success",
        //         result: {
        //             symbol: "ETH-BTC",
        //             ts: 1584948805439,
        //             data: [
        //                 {
        //                     id: 1584948803300883,
        //                     amount: "0.583",
        //                     price: "0.021209",
        //                     direction: "buy",
        //                     ts: 1584948803
        //                 },
        //                 {
        //                     id: 1584948803298490,
        //                     amount: "2.737",
        //                     price: "0.021209",
        //                     direction: "sell",
        //                     ts: 1584948803
        //                 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'open', // partially filled
            '3': 'closed',
            '4': 'canceled', // canceling
            '5': 'canceled', // partially canceled
            '6': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     { order_sn: 'BM7442641584965237751ZMAKJ5' }
        //
        // fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order_sn": "BL74426415849672087836G48N1",
        //         "symbol": "ETH-USDT",
        //         "ctime": "2020-03-23 20:40:08",
        //         "type": 2,
        //         "side": "buy",
        //         "price": "90", // undefined for market orders
        //         "number": "0.1",
        //         "total_price": "9.0", // 0 for market orders
        //         "deal_number": null,
        //         "deal_price": null,
        //         "status": 1,
        //     }
        //
        // fetchOrder
        //
        //     {
        //         order_sn: 'BM7442641584965237751ZMAKJ5',
        //         symbol: 'ETH-USDT',
        //         ctime: '2020-03-23 20:07:17',
        //         type: 1,
        //         side: 'buy',
        //         price: '0',
        //         number: '10',
        //         total_price: '0',
        //         deal_number: '0.080718626311541565',
        //         deal_price: '123.890000000000000000',
        //         status: 3,
        //         // the trades field is injected by fetchOrder
        //         trades: [
        //             {
        //                 id: null,
        //                 ctime: '2020-03-23 20:07:17',
        //                 price: '123.9',
        //                 number: '0.010688626311541565',
        //                 total_price: '1.324320799999999903',
        //                 fee: '0.000021377252623083'
        //             }
        //         ]
        //     }
        //
        const id = this.safeString (order, 'order_sn');
        const orderStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (orderStatus);
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        let timestamp = this.parse8601 (this.safeString (order, 'ctime'));
        if (timestamp !== undefined) {
            timestamp -= 28800000; // 8 hours, adjust to UTC
        }
        const orderType = this.safeString (order, 'type');
        const type = (orderType === '2') ? 'limit' : 'market';
        const side = this.safeString (order, 'side');
        // const amount = this.safeNumber (order, 'number');
        // const price = this.safeNumber (order, 'price');
        let cost = undefined;
        let price = undefined;
        let amount = undefined;
        let average = undefined;
        const number = this.safeNumber (order, 'number');
        const totalPrice = this.safeNumber (order, 'total_price');
        if (type === 'limit') {
            amount = number;
            price = this.safeNumber (order, 'price');
        } else {
            average = this.safeNumber (order, 'deal_price');
            if (side === 'buy') {
                amount = this.safeNumber (order, 'deal_number');
            } else {
                amount = number;
            }
        }
        // all orders except new orders and canceled orders
        const rawTrades = this.safeValue (order, 'trades', []);
        for (let i = 0; i < rawTrades.length; i++) {
            rawTrades[i]['direction'] = side;
        }
        const trades = this.parseTrades (rawTrades, market, undefined, undefined, {
            'symbol': market['symbol'],
            'order': id,
            'type': type,
        });
        if (type === 'limit') {
            cost = totalPrice;
        } else if (side === 'buy') {
            cost = number;
        }
        let filled = undefined;
        if ((type === 'limit') && (orderStatus === '3')) {
            filled = amount;
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'trades': trades,
            'fee': undefined,
        });
    }

    async fetchClosedOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_sn': id,
        };
        const response = await this.privateGetEntrustDetail (this.extend (request, params));
        //
        //     {
        //         "errno": 0,
        //         "errmsg": "success",
        //         "result": {
        //             "trades": [
        //                 {
        //                     "id":null,
        //                     "ctime":"2020-03-23 20:07:17",
        //                     "price":"123.9",
        //                     "number":"0.010688626311541565",
        //                     "total_price":"1.324320799999999903",
        //                     "fee":"0.000021377252623083"
        //                 },
        //             ],
        //             "entrust":{
        //                 "order_sn":"BM7442641584965237751ZMAKJ5",
        //                 "symbol":"ETH-USDT",
        //                 "ctime":"2020-03-23 20:07:17",
        //                 "type":1,
        //                 "side":"buy",
        //                 "price":"0",
        //                 "number":"10",
        //                 "total_price":"0",
        //                 "deal_number":"0.080718626311541565",
        //                 "deal_price":"123.890000000000000000",
        //                 "status":3
        //             }
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        const order = this.safeValue (result, 'entrust', {});
        order['trades'] = trades;
        return this.parseOrder (order);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchClosedOrder (id, symbol, params);
        return this.safeValue (response, 'trades', []);
    }

    async fetchOrdersWithMethod (method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'from': 'BM7442641584965237751ZMAKJ5', // query start order_sn
            'direct': 'prev', // next
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "errno": 0,
        //         "errmsg": "success",
        //         "result": [
        //             {
        //                 "order_sn": "BL74426415849672087836G48N1",
        //                 "symbol": "ETH-USDT",
        //                 "ctime": "2020-03-23 20:40:08",
        //                 "type": 2,
        //                 "side": "buy",
        //                 "price": "90",
        //                 "number": "0.1",
        //                 "total_price": "9.0",
        //                 "deal_number": null,
        //                 "deal_price": null,
        //                 "status": 1,
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('privateGetEntrustCurrentList', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('privateGetEntrustHistoryList', symbol, since, limit, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = side + '-' + type;
        const request = {
            'symbol': market['id'],
            'type': orderType,
        };
        if (type === 'limit') {
            request['amount'] = this.amountToPrecision (symbol, amount);
            request['price'] = this.priceToPrecision (symbol, price);
        } else if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                let cost = amount;
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        cost = amount * price;
                    } else {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument");
                    }
                }
                const precision = market['precision']['price'];
                request['amount'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
        }
        const response = await this.privatePostEntrustAdd (this.extend (request, params));
        //
        //     {
        //         errno: 0,
        //         errmsg: 'success',
        //         result: { order_sn: 'BM7442641584965237751ZMAKJ5' }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const order = this.parseOrder (result, market);
        const timestamp = this.milliseconds ();
        return this.extend (order, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'amount': amount,
            'price': price,
            'type': type,
            'side': side,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_ids': id,
        };
        const response = await this.privatePostEntrustCancel (this.extend (request, params));
        //
        //     {
        //         "errno": 0,
        //         "errmsg": "success",
        //         "result": {
        //             "success": [ "avl12121", "bl3123123" ],
        //             "failed": [ "sd24564", "sdf6564564" ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const success = this.safeValue (result, 'success', []);
        if (!this.inArray (id, success)) {
            throw new OrderNotFound (this.id + ' order id ' + id + ' not found in successfully canceled orders: ' + this.json (response));
        }
        const timestamp = undefined;
        return {
            'info': response,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'canceled',
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'clientOrderId': undefined,
        };
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostEntrustCancel (this.extend (request, params));
        //
        //     {
        //         "errno": 0,
        //         "errmsg": "success",
        //         "result": {
        //             "success": [ "avl12121", "bl3123123" ],
        //             "failed": [ "sd24564", "sdf6564564" ]
        //         }
        //     }
        //
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        let keys = Object.keys (params);
        const keysLength = keys.length;
        if (api === 'public') {
            if (keysLength > 0) {
                url += '?' + this.urlencode (params);
            }
        } else {
            const nonce = this.nonce ().toString ();
            const uuid = this.uuid ();
            const randomString = uuid.slice (0, 5);
            const nonceString = nonce + '_' + randomString;
            const auth = {};
            auth[this.apiKey] = this.apiKey;
            auth[this.secret] = this.secret;
            auth[nonceString] = nonceString;
            for (let i = 0; i < keysLength; i++) {
                const key = keys[i];
                auth[key] = key + '=' + params[key];
            }
            const keysorted = this.keysort (auth);
            let stringToSign = '';
            keys = Object.keys (keysorted);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                stringToSign += keysorted[key];
            }
            const signature = this.hash (this.encode (stringToSign), 'sha1');
            headers = {
                'Nonce': nonceString,
                'Token': this.apiKey,
                'Signature': signature,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                if (keysLength > 0) {
                    body = this.urlencode (params);
                }
            } else {
                if (keysLength > 0) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"errno":20501,"errmsg":"base symbol error"}
        //
        const error = this.safeString (response, 'errno');
        if ((error !== undefined) && (error !== '0')) {
            const message = this.safeString (response, 'errmsg');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
