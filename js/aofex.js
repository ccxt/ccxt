'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class aofex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aofex',
            'name': 'AOFEX',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://openapi.aofex.com/openApi',
                    'private': 'https://openapi.aofex.com/openApi',
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
                    '20501': BadSymbol, // {"errno":20501,"errmsg":"base symbol error"}
                },
                'broad': {
                },
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
            const makerFee = this.safeFloat (market, 'maker_fee');
            const takerFee = this.safeFloat (market, 'taker_fee');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': undefined,
                'maker': makerFee / 1000,
                'taker': takerFee / 1000,
                'precision': {
                    'amount': this.safeInteger (precision, 'amount'),
                    'price': this.safeInteger (precision, 'price'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_size'),
                        'max': this.safeFloat (market, 'max_size'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
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
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'amount'),
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
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': 'BTC,ETH',
            'show_all': '1', // required to show zero balances
        };
        const response = await this.privateGetWalletList (this.extend (request, params));
        process.exit ();
        const result = { 'info': response };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeValue (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'onOrders');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const fees = await this.privatePostReturnFeeInfo (params);
        return {
            'info': fees,
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
            'withdraw': {},
            'deposit': {},
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
        return this.parseOrderBook (result, timestamp);
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
        const open = this.safeFloat (ticker, 'open');
        const last = this.safeFloat (ticker, 'close');
        let change = undefined;
        if (symbol !== undefined) {
            change = parseFloat (this.priceToPrecision (symbol, last - open));
        } else {
            change = last - open;
        }
        const average = this.sum (last, open) / 2;
        const percentage = change / open * 100;
        const baseVolume = this.safeFloat (ticker, 'amount');
        const quoteVolume = this.safeFloat (ticker, 'vol');
        let vwap = undefined;
        if (quoteVolume !== undefined) {
            if (baseVolume !== undefined) {
                if (baseVolume > 0) {
                    vwap = parseFloat (this.priceToPrecision (symbol, quoteVolume / baseVolume));
                }
            }
        }
        return {
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
            let market = undefined;
            let symbol = marketId;
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                    symbol = market['symbol'];
                } else {
                    const [ baseId, quoteId ] = marketId.split ('-');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
            const data = this.safeValue (tickers[i], 'data', {});
            const ticker = this.parseTicker (data, market);
            ticker['symbol'] = symbol;
            result[symbol] = ticker;
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
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'ts');
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'direction');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
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
            'fee': undefined,
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = { 'currencyPair': pair };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.sum (this.seconds (), 1); // adding 1 is a fix for #3411
        }
        // limit is disabled (does not really work as expected)
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        //
        // specific market (symbol defined)
        //
        //     [
        //         {
        //             globalTradeID: 394700861,
        //             tradeID: 45210354,
        //             date: '2018-10-23 18:01:58',
        //             type: 'buy',
        //             rate: '0.03117266',
        //             amount: '0.00000652',
        //             total: '0.00000020'
        //         },
        //         {
        //             globalTradeID: 394698946,
        //             tradeID: 45210255,
        //             date: '2018-10-23 17:28:55',
        //             type: 'sell',
        //             rate: '0.03114126',
        //             amount: '0.00018753',
        //             total: '0.00000583'
        //         }
        //     ]
        //
        // all markets (symbol undefined)
        //
        //     {
        //         BTC_BCH: [{
        //             globalTradeID: 394131412,
        //             tradeID: '5455033',
        //             date: '2018-10-16 18:05:17',
        //             rate: '0.06935244',
        //             amount: '1.40308443',
        //             total: '0.09730732',
        //             fee: '0.00100000',
        //             orderNumber: '104768235081',
        //             type: 'sell',
        //             category: 'exchange'
        //         }, {
        //             globalTradeID: 394126818,
        //             tradeID: '5455007',
        //             date: '2018-10-16 16:55:34',
        //             rate: '0.06935244',
        //             amount: '0.00155709',
        //             total: '0.00010798',
        //             fee: '0.00200000',
        //             orderNumber: '104768179137',
        //             type: 'sell',
        //             category: 'exchange'
        //         }],
        //     }
        //
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                const ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id) {
                        market = this.markets_by_id[id];
                        const trades = this.parseTrades (response[id], market);
                        for (let j = 0; j < trades.length; j++) {
                            result.push (trades[j]);
                        }
                    } else {
                        const [ quoteId, baseId ] = id.split ('_');
                        const base = this.safeCurrencyCode (baseId);
                        const quote = this.safeCurrencyCode (quoteId);
                        const symbol = base + '/' + quote;
                        const trades = response[id];
                        for (let j = 0; j < trades.length; j++) {
                            const market = {
                                'symbol': symbol,
                                'base': base,
                                'quote': quote,
                            };
                            result.push (this.parseTrade (trades[j], market));
                        }
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'Partially filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOpenOrder
        //
        //     {
        //         status: 'Open',
        //         rate: '0.40000000',
        //         amount: '1.00000000',
        //         currencyPair: 'BTC_ETH',
        //         date: '2018-10-17 17:04:50',
        //         total: '0.40000000',
        //         type: 'buy',
        //         startingAmount: '1.00000',
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         orderNumber: '514514894224',
        //         type: 'buy',
        //         rate: '0.00001000',
        //         startingAmount: '100.00000000',
        //         amount: '100.00000000',
        //         total: '0.00100000',
        //         date: '2018-10-23 17:38:53',
        //         margin: 0,
        //     }
        //
        // createOrder
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'currencyPair': 'BTC_MANA',
        //         // ---------------------------------------------------------
        //         // the following fields are injected by createOrder
        //         'timestamp': timestamp,
        //         'status': 'open',
        //         'type': type,
        //         'side': side,
        //         'price': price,
        //         'amount': amount,
        //     }
        //
        let timestamp = this.safeInteger (order, 'timestamp');
        if (!timestamp) {
            timestamp = this.parse8601 (order['date']);
        }
        let trades = undefined;
        if ('resultingTrades' in order) {
            trades = this.parseTrades (order['resultingTrades'], market);
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'currencyPair');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat2 (order, 'price', 'rate');
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount');
        let filled = undefined;
        let cost = 0;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                if (price !== undefined) {
                    cost = filled * price;
                }
            }
        } else {
            amount = remaining;
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let average = undefined;
        let lastTradeTimestamp = undefined;
        if (filled === undefined) {
            if (trades !== undefined) {
                filled = 0;
                cost = 0;
                const tradesLength = trades.length;
                if (tradesLength > 0) {
                    lastTradeTimestamp = trades[0]['timestamp'];
                    for (let i = 0; i < tradesLength; i++) {
                        const trade = trades[i];
                        const tradeAmount = trade['amount'];
                        const tradePrice = trade['price'];
                        filled = this.sum (filled, tradeAmount);
                        cost = this.sum (cost, tradePrice * tradeAmount);
                        lastTradeTimestamp = Math.max (lastTradeTimestamp, trade['timestamp']);
                    }
                }
                remaining = Math.max (amount - filled, 0);
                if (filled >= amount) {
                    status = 'closed';
                }
            }
        }
        if ((filled !== undefined) && (cost !== undefined) && (filled > 0)) {
            average = cost / filled;
        }
        let type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side', type);
        if (type === side) {
            type = undefined;
        }
        const id = this.safeString (order, 'orderNumber');
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'fee');
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
        };
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const pair = market ? market['id'] : 'all';
        const request = {
            'currencyPair': pair,
        };
        const response = await this.privatePostReturnOpenOrders (this.extend (request, params));
        let openOrders = [];
        if (market !== undefined) {
            openOrders = this.parseOpenOrders (response, market, openOrders);
        } else {
            const marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const orders = response[marketId];
                const m = this.markets_by_id[marketId];
                openOrders = this.parseOpenOrders (orders, m, openOrders);
            }
        }
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        const openOrdersIndexedById = this.indexBy (openOrders, 'id');
        const cachedOrderIds = Object.keys (this.orders);
        const result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            const id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed',
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (order['cost'] === undefined) {
                        if (order['filled'] !== undefined) {
                            order['cost'] = order['filled'] * order['price'];
                        }
                    }
                    this.orders[id] = order;
                }
            }
            const order = this.orders[id];
            if (market !== undefined) {
                if (order['symbol'] === symbol) {
                    result.push (order);
                }
            } else {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const since = this.safeValue (params, 'since');
        const limit = this.safeValue (params, 'limit');
        const request = this.omit (params, [ 'since', 'limit' ]);
        const orders = await this.fetchOrders (symbol, since, limit, request);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] === id) {
                return orders[i];
            }
        }
    }

    filterOrdersByStatus (orders, status) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status) {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': amount,
        };
        // remember the timestamp before issuing the request
        const timestamp = this.milliseconds ();
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         'orderNumber': '9805453960',
        //         'resultingTrades': [
        //             {
        //                 'amount': '200.00000000',
        //                 'date': '2019-12-15 16:04:10',
        //                 'rate': '0.00000355',
        //                 'total': '0.00071000',
        //                 'tradeID': '119871',
        //                 'type': 'buy',
        //                 'takerAdjustment': '200.00000000',
        //             },
        //         ],
        //         'fee': '0.00000000',
        //         'currencyPair': 'BTC_MANA',
        //     }
        //
        const order = this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market);
        const id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        const request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
            const newid = response['orderNumber'];
            this.orders[newid] = this.extend (this.orders[id], {
                'id': newid,
                'price': price,
                'status': 'open',
            });
            if (amount !== undefined) {
                this.orders[newid]['amount'] = amount;
            }
            result = this.extend (this.orders[newid], { 'info': response });
        } else {
            let market = undefined;
            if (symbol !== undefined) {
                market = this.market (symbol);
            }
            result = this.parseOrder (response, market);
            this.orders[result['id']] = result;
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCancelOrder (this.extend ({
            'orderNumber': id,
        }, params));
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
        }
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        const response = await this.privatePostCancelAllOrders (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "message": "Orders canceled",
        //         "orderNumbers": [
        //             503749,
        //             888321,
        //             7315825,
        //             7316824
        //         ]
        //     }
        //
        const orderIds = this.safeValue (response, 'orderNumbers', []);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i].toString ();
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
            }
        }
        return response;
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        id = id.toString ();
        const response = await this.privatePostReturnOrderStatus (this.extend ({
            'orderNumber': id,
        }, params));
        //
        //     {
        //         success: 1,
        //         result: {
        //             '6071071': {
        //                 status: 'Open',
        //                 rate: '0.40000000',
        //                 amount: '1.00000000',
        //                 currencyPair: 'BTC_ETH',
        //                 date: '2018-10-17 17:04:50',
        //                 total: '0.40000000',
        //                 type: 'buy',
        //                 startingAmount: '1.00000',
        //             },
        //         },
        //     }
        //
        const result = this.safeValue (response['result'], id);
        const order = this.parseOrder (result);
        order['id'] = id;
        this.orders[id] = order;
        return order;
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const orders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        const indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
        };
        const trades = await this.privatePostReturnOrderTrades (this.extend (request, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGenerateNewAddress (this.extend (request, params));
        let address = undefined;
        let tag = undefined;
        if (response['success'] === 1) {
            address = this.safeString (response, 'response');
        }
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privatePostReturnDepositAddresses (params);
        const currencyId = currency['id'];
        let address = this.safeString (response, currencyId);
        let tag = undefined;
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawalNumber'),
        };
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds ();
        const start = (since !== undefined) ? parseInt (since / 1000) : now - 10 * year;
        const request = {
            'start': start, // UNIX timestamp, required
            'end': now, // UNIX timestamp, required
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        //
        //     {    deposits: [ {      currency: "BTC",
        //                              address: "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //                               amount: "0.01063000",
        //                        confirmations:  1,
        //                                 txid: "952b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //                            timestamp:  1507916888,
        //                               status: "COMPLETE"                                                          },
        //                      {      currency: "ETH",
        //                              address: "0x20108ba20b65c04d82909e91df06618107460197",
        //                               amount: "4.00000000",
        //                        confirmations:  38,
        //                                 txid: "0x4be260073491fe63935e9e0da42bd71138fdeb803732f41501015a2d46eb479d",
        //                            timestamp:  1525060430,
        //                               status: "COMPLETE"                                                            }  ],
        //       withdrawals: [ { withdrawalNumber:  8224394,
        //                                currency: "EMC2",
        //                                 address: "EYEKyCrqTNmVCpdDV8w49XvSKRP9N3EUyF",
        //                                  amount: "63.10796020",
        //                                     fee: "0.01000000",
        //                               timestamp:  1510819838,
        //                                  status: "COMPLETE: d37354f9d02cb24d98c8c4fc17aa42f475530b5727effdf668ee5a43ce667fd6",
        //                               ipAddress: "5.220.220.200"                                                               },
        //                      { withdrawalNumber:  9290444,
        //                                currency: "ETH",
        //                                 address: "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                                  amount: "0.15500000",
        //                                     fee: "0.00500000",
        //                               timestamp:  1514099289,
        //                                  status: "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                               ipAddress: "5.228.227.214"                                                                 },
        //                      { withdrawalNumber:  11518260,
        //                                currency: "BTC",
        //                                 address: "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                                  amount: "0.20000000",
        //                                     fee: "0.00050000",
        //                               timestamp:  1527918155,
        //                                  status: "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                               ipAddress: "211.8.195.26"                                                                }    ] }
        //
        return response;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        const deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        const transactions = this.arrayConcat (deposits, withdrawals);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        return this.filterByCurrencySinceLimit (withdrawals, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        return this.filterByCurrencySinceLimit (deposits, code, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //     {
        //         "txid": "f49d489616911db44b740612d19464521179c76ebe9021af85b6de1e2f8d68cd",
        //         "type": "deposit",
        //         "amount": "49798.01987021",
        //         "status": "COMPLETE",
        //         "address": "DJVJZ58tJC8UeUv9Tqcdtn6uhWobouxFLT",
        //         "currency": "DOGE",
        //         "timestamp": 1524321838,
        //         "confirmations": 3371,
        //         "depositNumber": 134587098
        //     }
        //
        // withdrawals
        //
        //     {
        //         "fee": "0.00050000",
        //         "type": "withdrawal",
        //         "amount": "0.40234387",
        //         "status": "COMPLETE: fbabb2bf7d81c076f396f3441166d5f60f6cea5fdfe69e02adcc3b27af8c2746",
        //         "address": "1EdAqY4cqHoJGAgNfUFER7yZpg1Jc9DUa3",
        //         "currency": "BTC",
        //         "canCancel": 0,
        //         "ipAddress": "185.230.101.31",
        //         "paymentID": null,
        //         "timestamp": 1523834337,
        //         "canResendEmail": 0,
        //         "withdrawalNumber": 11162900
        //     }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.safeString (transaction, 'status', 'pending');
        let txid = this.safeString (transaction, 'txid');
        if (status !== undefined) {
            const parts = status.split (': ');
            const numParts = parts.length;
            status = parts[0];
            if ((numParts > 1) && (txid === undefined)) {
                txid = parts[1];
            }
            status = this.parseTransactionStatus (status);
        }
        const type = this.safeString (transaction, 'type');
        const id = this.safeString2 (transaction, 'withdrawalNumber', 'depositNumber');
        let amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost === undefined) {
            // according to https://poloniex.com/fees/
            feeCost = 0; // FIXME: remove hardcoded value that may change any time
        }
        if (type === 'withdrawal') {
            // poloniex withdrawal amount includes the fee
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
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
            console.log (stringToSign);
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
