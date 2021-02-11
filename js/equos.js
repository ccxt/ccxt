'use strict';

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, BadSymbol, OrderNotFound } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');
//  ---------------------------------------------------------------------------

module.exports = class equos extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'equos',
            'name': 'Equos',
            'countries': [ 'US', 'SG' ], // United States, Singapore
            'rateLimit': 10,
            'certified': false,
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchAllOrders': true,
                'fetchBalance': true,
                'fetchCancelledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': false,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 2,
                '15m': 3,
                '1h': 4,
                '6h': 5,
                '1d': 6,
                '7d': 7,
            },
            'urls': {
                'logo': 'https://equos.io/assets/img/logo.svg',
                'test': {
                    'public': 'https://testnet.equos.io/api',
                    'private': 'https://testnet.equos.io/api',
                },
                'api': {
                    'public': 'https://equos.io/api',
                    'private': 'https://equos.io/api',
                },
                'www': 'https://equos.io',
                'doc': [
                    'https://developer.equos.io',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'health',
                        'getInstruments',
                        'getInstrumentPairs',
                        'getOrderBook',
                        'getRisk',
                        'getTradeHistory',
                        'getFundingRateHistory',
                        'getChart',
                        'getExchangeInfo', // not documented
                    ],
                },
                'private': {
                    'post': [
                        'logon',
                        'order',
                        'cancelOrder',
                        'cancelReplaceOrder',
                        'getOrder',
                        'getOrders',
                        'getOrderStatus',
                        'getOrderHistory',
                        'userTrades',
                        'getPositions',
                        'cancelAll',
                        'getUserHistory',
                        'getRisk',
                        'getDepositAddresses',
                        'getDepositHistory', // not documented
                        'getWithdrawRequests',
                        'sendWithdrawRequest',
                        'getTransferHistory',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'verbose': true,
        };
        const response = await this.publicGetGetInstrumentPairs (this.extend (request, params));
        //
        //     {
        //         "instrumentPairs":[
        //             {
        //                 "instrumentId":52,
        //                 "symbol":"BTC/USDC",
        //                 "quoteId":1,
        //                 "baseId":3,
        //                 "price_scale":2,
        //                 "quantity_scale":6,
        //                 "securityStatus":1,
        //                 "securityDesc":"BTC/USDC", // "BTC/USDC[F]"
        //                 "assetType":"PAIR", // "PERPETUAL_SWAP"
        //                 "currency":"BTC",
        //                 "contAmtCurr":"USDC",
        //                 "settlCurrency":"USDC",
        //                 "commCurrency":"USDC",
        //                 "cfiCode":"XXXXXX",
        //                 "securityExchange":"XXXX",
        //                 "instrumentPricePrecision":2,
        //                 "minPriceIncrement":1.0,
        //                 "minPriceIncrementAmount":1.0,
        //                 "roundLot":1,
        //                 "minTradeVol":0.001000,
        //                 "maxTradeVol":0.000000
        //                 // contracts onlye
        //                 "qtyType":0,
        //                 "contractMultiplier":1.0,
        //                 "issueDate":1598608087000
        //             },
        //         ]
        //     }
        //
        const instrumentPairs = this.safeValue (response, 'instrumentPairs', []);
        const markets = [];
        for (let i = 0; i < instrumentPairs.length; i++) {
            const market = this.parseMarket (instrumentPairs[i]);
            markets.push (market);
        }
        return markets;
    }

    parseMarket (market) {
        //
        //     {
        //         "instrumentId":52,
        //         "symbol":"BTC/USDC", // "BTC/USDC[F]"
        //         "quoteId":1,
        //         "baseId":3,
        //         "price_scale":2,
        //         "quantity_scale":6,
        //         "securityStatus":1,
        //         "securityDesc":"BTC/USDC", // "BTC/USDC[F]"
        //         "assetType":"PAIR", // "PERPETUAL_SWAP"
        //         "currency":"BTC",
        //         "contAmtCurr":"USDC",
        //         "settlCurrency":"USDC",
        //         "commCurrency":"USDC",
        //         "cfiCode":"XXXXXX",
        //         "securityExchange":"XXXX",
        //         "instrumentPricePrecision":2,
        //         "minPriceIncrement":1.0,
        //         "minPriceIncrementAmount":1.0,
        //         "roundLot":1,
        //         "minTradeVol":0.001000,
        //         "maxTradeVol":0.000000
        //         // contracts onlye
        //         "qtyType":0,
        //         "contractMultiplier":1.0,
        //         "issueDate":1598608087000
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const numericId = this.safeInteger (market, 'instrumentId');
        const assetType = this.safeString (market, 'assetType');
        const spot = (assetType === 'PAIR');
        const swap = (assetType === 'PERPETUAL_SWAP');
        const type = swap ? 'swap' : 'spot';
        const baseId = this.safeString (market, 'currency');
        const quoteId = this.safeString (market, 'contAmtCurr');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = swap ? id : (base + '/' + quote);
        const status = this.safeInteger (market, 'securityStatus');
        const active = (status === 1);
        const precision = {
            'amount': this.safeInteger (market, 'quantity_scale'),
            'price': this.safeInteger (market, 'price_scale'),
        };
        return {
            'id': id,
            'numericId': numericId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': type,
            'spot': spot,
            'swap': swap,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': this.safeFloat (market, 'minTradeVol'),
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
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        //
        //     {
        //         "instruments": [
        //             [
        //                 3,     // id
        //                 "BTC", // symbol
        //                 2,     // price_scale
        //                 6,     // amount_scale
        //                 1,     // status
        //                 0,     // withdraw_fee
        //                 "BTC", // name
        //                 true,  // withdrawal_pct
        //             ],
        //         ]
        //     }
        //
        const currencies = {};
        const instruments = this.safeValue (response, 'instruments', []);
        for (let i = 0; i < instruments.length; i++) {
            const currency = this.parseCurrency (instruments[i]);
            const code = currency['code'];
            currencies[code] = currency;
        }
        return currencies;
    }

    parseCurrency (currency) {
        //
        //     [
        //         3,     // 0 id
        //         "BTC", // 1 symbol
        //         2,     // 2 price_scale
        //         6,     // 3 amount_scale
        //         1,     // 4 status
        //         0,     // 5 withdraw_fee
        //         "BTC", // 6 name
        //         true,  // 7 withdrawal_pct
        //     ],
        //
        const numericId = this.safeInteger (currency, 0);
        const id = this.safeString (currency, 1);
        const code = this.safeCurrencyCode (id);
        const priceScale = this.safeInteger (currency, 2);
        const amountScale = this.safeInteger (currency, 3);
        const precision = Math.max (priceScale, amountScale);
        const name = this.safeString (currency, 6);
        const status = this.safeInteger (currency, 4);
        const active = (status === 1);
        const fee = this.safeFloat (currency, 5); // withdraw_fee
        return {
            'id': id,
            'info': currency,
            'numericId': numericId,
            'code': code,
            'name': name,
            'precision': precision,
            'fee': fee,
            'active': active,
            'limits': {
                'amount': {
                    'min': undefined,
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
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairId': market['numericId'],
            'timespan': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetGetChart (this.extend (request, params));
        //
        //     {
        //         "pairId":57,
        //         "t":1,
        //         "s":"ETH/BTC",
        //         "lastPx":44099,
        //         "lastQty":100000,
        //         "o":0.043831000000000016,
        //         "h":0.04427100000000002,
        //         "l":0.032000000000000015,
        //         "c":0.04409900000000002,
        //         "v":0.21267333000000016,
        //         "q":4.850000000000001,
        //         "chart":[
        //             [1612519260000,44099,44099,44099,44099,0,441],
        //             [1612519200000,44099,44099,44099,44099,0,440],
        //             [1612519140000,44269,44271,44269,44271,0,439],
        //         ]
        //     }
        //
        const chart = this.safeValue (response, 'chart', []);
        return this.parseOHLCVs (chart, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1612519260000, // timestamp
        //         44099,         // open
        //         44099,         // high
        //         44099,         // low
        //         44099,         // close
        //         0,             // base volume
        //         441,           // seqNumber
        //     ]
        //
        const timestamp = this.safeInteger (ohlcv, 0);
        const open = this.convertFromScale (ohlcv[1], market['precision']['price']);
        const high = this.convertFromScale (ohlcv[2], market['precision']['price']);
        const low = this.convertFromScale (ohlcv[3], market['precision']['price']);
        const close = this.convertFromScale (ohlcv[4], market['precision']['price']);
        const volume = this.convertFromScale (ohlcv[5], market['precision']['amount']);
        // volume = ohlcv[5];
        return [timestamp, open, high, low, close, volume];
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, market = undefined) {
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' parseBidAsk() requires a market argument');
        }
        const price = this.safeFloat (bidask, priceKey);
        const amount = this.safeFloat (bidask, amountKey);
        return [
            this.convertFromScale (price, market['precision']['price']),
            this.convertFromScale (amount, market['precision']['amount']),
        ];
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        const result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        const sides = [ bidsKey, asksKey ];
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            const orders = [];
            const bidasks = this.safeValue (orderbook, side);
            for (let k = 0; k < bidasks.length; k++) {
                orders.push (this.parseBidAsk (bidasks[k], priceKey, amountKey, market));
            }
            result[side] = orders;
        }
        result[bidsKey] = this.sortBy (result[bidsKey], 0, true);
        result[asksKey] = this.sortBy (result[asksKey], 0);
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairId': market['numericId'],
        };
        // // apply limit though does not work with API
        // if (limit !== undefined) {
        //     request = this.extend ({ 'limit': limit }, request);
        // }
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "bids":[
        //             [4000480,30000,1612644984667],
        //             [3999304,200000,1612644984667],
        //             [3998862,50000,1612644984667],
        //         ],
        //         "asks":[
        //             [4001962,1790000,1612644984667],
        //             [4002616,1000,1612644984667],
        //             [4003889,1000,1612644984667],
        //         ],
        //         "usdMark":40011.02,
        //         "marketStatus":0,
        //         "estFundingRate":0.0,
        //         "fundingRateTime":0,
        //         "auctionPrice":0.0,
        //         "auctionVolume":0.0
        //     }
        //
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 0, 1, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairId': market['numericId'],
        };
        const response = await this.publicGetGetTradeHistory (this.extend (request, params));
        //
        //     {
        //         "trades":[
        //             [4022800,47000,"20210206-21:39:12.886",256323,1],
        //             [4023066,1000,"20210206-21:38:55.030",256322,1],
        //             [4022406,50000,"20210206-21:36:56.334",256321,1],
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     [
        //         4022800,                 // 0 price
        //         47000,                   // 1 quantity
        //         "20210206-21:39:12.886", // 2 timestamp
        //         256323,                  // 3 sequence number
        //         1                        // 4 taker side 1 = buy, 2 = sell
        //     ]
        //
        // private fetchMyTrades
        //
        //     ...
        //
        let id = undefined;
        let timestamp = undefined;
        let orderId = undefined;
        let type = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        let price = undefined;
        let amount = undefined;
        let cost = undefined;
        let fee = undefined;
        if (Array.isArray (trade)) {
            id = this.safeString (trade, 3);
            price = this.convertFromScale (this.safeInteger (trade, 0), market['precision']['price']);
            amount = this.convertFromScale (this.safeInteger (trade, 1), market['precision']['amount']);
            timestamp = this.toMilliseconds (this.safeString (trade, 2));
            const takerSide = this.safeInteger (trade, 4);
            if (takerSide === 1) {
                side = 'buy';
            } else if (takerSide === 2) {
                side = 'sell';
            }
        } else {
            id = this.safeString (trade, 'id');
            timestamp = this.safeInteger (trade, 'time');
            const marketId = this.safeString (trade, 'symbol');
            market = this.safeMarket (marketId, market, '/');
            orderId = this.safeString (trade, 'orderId');
            side = this.safeStringLower (trade, 'side');
            type = this.parseOrderType (this.safeString (trade, 'ordType'));
            const isMaker = this.safeValue (trade, 'maker');
            if (isMaker === true) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'qty');
            const feeCost = this.safeFloat (trade, 'commission');
            const feeCurrency = this.safeString (trade, 'commissionAsset');
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': undefined,
            };
        }
        const symbol = market ? market['symbol'] : undefined;
        if (cost === undefined) {
            if ((amount !== undefined) && (price !== undefined)) {
                cost = amount * price;
            }
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetPositions (params);
        //     {
        //         "positions":[
        //             {
        //                 "instrumentId":1,
        //                 "userId":3583,
        //                 "quantity":0,
        //                 "availableQuantity":0,
        //                 "quantity_scale":6,
        //                 "symbol":"USDC",
        //                 "assetType":"ASSET",
        //                 "usdCostBasis":0.0,
        //                 "usdAvgCostBasis":0.0,
        //                 "usdValue":0.0,
        //                 "usdUnrealized":0.0,
        //                 "usdRealized":0.0,
        //                 "baseUsdMark":1.0,
        //                 "settleCoinUsdMark":0.0,
        //                 "settleCoinUnrealized":0.0,
        //                 "settleCoinRealized":0.0
        //             },
        //         ]
        //     }
        const positions = this.safeValue (response, 'positions', []);
        const result = {
            'info': response,
        };
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const assetType = this.safeString (position, 'assetType');
            if (assetType === 'ASSET') {
                const currencyId = this.safeString (position, 'symbol');
                const code = this.safeCurrencyCode (currencyId);
                const quantity = this.safeFloat (position, 'quantity');
                const availableQuantity = this.safeFloat (position, 'availableQuantity');
                const scale = this.safeInteger (position, 'quantity_scale');
                const account = this.account ();
                account['free'] = this.convertFromScale (availableQuantity, scale);
                account['total'] = this.convertFromScale (quantity, scale);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === undefined || side === undefined || amount === undefined) {
            throw new ArgumentsRequired (this.id + ': Order does not have enough arguments');
        }
        const request = this.createOrderRequest (market, type, side, amount, price, params);
        const order = await this.privatePostOrder (request);
        return {
            'info': order,
            'id': this.safeInteger (order, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': this.safeString (order, 'status'),
            'fee': undefined,
        };
    }

    createOrderRequest (market, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            price = 0;
        }
        const amount_scale = this.getScale (amount);
        const price_scale = this.getScale (price);
        let ordType = 1;
        let requestSide = 1;
        if (type === 'limit') {
            ordType = 2;
        }
        if (side === 'sell') {
            requestSide = 2;
        }
        const request = {
            'id': 0,
            'instrumentId': market['id'],
            'symbol': market['symbol'],
            'side': requestSide,
            'ordType': ordType,
            'price': this.convertToScale (price, price_scale),
            'price_scale': price_scale,
            'quantity': this.convertToScale (amount, amount_scale),
            'quantity_scale': amount_scale,
        };
        return this.extend (request, params);
    }

    createEditOrderRequest (orgOrder, market, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            price = 0;
        }
        const amount_scale = this.getScale (amount);
        const price_scale = this.getScale (price);
        let ordType = 1;
        let requestSide = 1;
        if (type === 'limit') {
            ordType = 2;
        }
        if (side === 'sell') {
            requestSide = 2;
        }
        const request = {
            'id': 0,
            'origOrderId': this.safeValue (orgOrder, 'info'),
            'clOrdId': this.safeValue (orgOrder, 'clOrdId'),
            'instrumentId': market['id'],
            'symbol': market['symbol'],
            'side': requestSide,
            'ordType': ordType,
            'price': this.safeValue (orgOrder, 'price'),
            'price_scale': this.safeValue (orgOrder, 'price_scale'),
            'quantity': this.safeValue (orgOrder, 'quantity'),
            'quantity_scale': this.safeValue (orgOrder, 'quantity_scale'),
            'price2': this.convertToScale (price, price_scale),
            'price2_scale': price_scale,
            'quantity2': this.convertToScale (amount, amount_scale),
            'quantity2_scale': amount_scale,
        };
        return this.extend (request, params);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const order = await this.fetchOrder (id, symbol, params);
        if (this.safeString (order, 'status') !== 'open') {
            throw new OrderNotFound (this.id + ': order id ' + id + ' is not found in open order');
        }
        const request = this.safeValue (order, 'info');
        request['origOrderId'] = this.safeValue (request, 'orderId');
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        const order = await this.fetchOrder (id, symbol, params);
        if (this.safeString (order, 'status') !== 'open') {
            throw new OrderNotFound (this.id + ': order id ' + id + ' is not found in open order');
        }
        const market = this.market (symbol);
        if (type === undefined || side === undefined || amount === undefined) {
            throw new ArgumentsRequired (this.id + ': Order does not have enough arguments');
        }
        const orgOrder = this.safeValue (order, 'info');
        const newOrderRequest = this.createEditOrderRequest (orgOrder, market, type, side, amount, price, params);
        const response = await this.privatePostCancelReplaceOrder (this.extend (newOrderRequest));
        return this.extend ({ 'info': response });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        request['orderId'] = id;
        const response = await this.privatePostGetOrderStatus (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return order;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostGetOrders (this.extend (request, params));
        const orders = this.parseOrders (this.safeValue (response, 'orders', []), market, since, limit, params);
        return orders;
    }

    async fetchAllOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const openOrders = this.filterByValueSinceLimit (orders, 'status', 'open', since, limit);
        return openOrders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const closeOrders = this.filterByValueSinceLimit (orders, 'status', 'closed', since, limit);
        return closeOrders;
    }

    async fetchCancelledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        const canceledOrders = this.filterByValueSinceLimit (orders, 'status', 'canceled', since, limit);
        return canceledOrders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privatePostUserTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'instrumentId': currency['numericId'],
        };
        const response = await this.privatePostGetDepositAddresses (this.extend (request, params));
        //
        //     {
        //         "addresses":[
        //             {"instrumentId":1,"userId":3583,"symbol":"USDC","address":"0xdff47af071ea3c537e57278290516cda32a78b97","status":1}
        //         ]
        //     }
        //
        const addresses = this.safeValue (response, 'addresses', []);
        const address = this.safeValue (addresses, 0);
        return this.parseDepositAddress (address, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "instrumentId":1,
        //         "userId":3583,
        //         "symbol":"USDC",
        //         "address":"0xdff47af071ea3c537e57278290516cda32a78b97",
        //         "status":1
        //     }
        //
        const currencyId = this.safeString (depositAddress, 'symbol');
        currency = this.safeCurrency (currencyId, currency);
        const code = currency['code'];
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': depositAddress,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['instrumentId'] = currency['id'];
        }
        const response = await this.privatePostGetDepositHistory (this.extend (request, params));
        const deposits = this.safeValue (response, 'deposits', []);
        for (let i = 0; i < deposits.length; i++) {
            const deposit = deposits[i];
            deposit['type'] = 'deposit';
        }
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['instrumentId'] = currency['id'];
        }
        // getWithdrawRequests
        const response = await this.privatePostGetWithdrawRequests (this.extend (request, params));
        const withdrawals = this.safeValue (response, 'addresses', []);
        for (let i = 0; i < withdrawals.length; i++) {
            const deposit = withdrawals[i];
            deposit['type'] = 'withdrawal';
        }
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const scale = this.getScale (amount);
        const quantity = this.convertToScale (amount, scale);
        const instrumentId = currency['id'];
        const symbol = currency['code'];
        const request = {
            'instrumentId': instrumentId,
            'symbol': symbol,
            'quantity': quantity,
            'quantity_scale': scale,
            'address': address,
        };
        // sendWithdrawRequest
        const response = await this.privatePostSendWithdrawRequest (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    async fetchTradingFees (params = {}) {
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const tradingFees = this.safeValue (response, 'spotFees', []);
        const taker = {};
        const maker = {};
        for (let i = 0; i < tradingFees.length; i++) {
            const tradingFee = tradingFees[i];
            if (this.safeString (tradingFee, 'tier') !== undefined) {
                taker[tradingFee['tier']] = this.safeFloat (tradingFee, 'taker');
                maker[tradingFee['tier']] = this.safeFloat (tradingFee, 'maker');
            }
        }
        return {
            'info': tradingFees,
            'tierBased': true,
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const tradingLimits = this.safeValue (response, 'tradingLimits', []);
        // To-do parsing response when available
        return {
            'info': tradingLimits,
            'limits': {
                'amount': {
                    'min': undefined,
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
        };
    }

    async fetchFundingLimits (params = {}) {
        // getExchangeInfo
        const response = await this.publicGetGetExchangeInfo (params);
        const withdrawLimits = this.safeValue (response, 'withdrawLimits', []);
        // TO-DO parse response when available
        return {
            'info': withdrawLimits,
            'withdraw': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['instrumentId'] = currency['id'];
        }
        const _format = {};
        _format['format'] = 'json';
        _format['type'] = 'position';
        request['_format'] = _format;
        // getUserHistory
        const response = await this.privatePostGetUserHistory (this.extend (request, params));
        const positions = this.safeValue (response, 'postionHistory', []);
        return this.parseLedger (positions, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (order);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (order, 'instrumentId');
            if (this.safeValue (this.markets_by_id, marketId) !== undefined) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const timestamp = this.parse8601 (this.convertToISO8601Date (this.safeString (order, 'timeStamp')));
        const lastTradeTimestamp = timestamp;
        let price = this.convertFromScale (this.safeInteger (order, 'lastPx', 0), this.safeInteger (order, 'lastPx_scale', 0));
        const amount = this.convertFromScale (this.safeInteger (order, 'quantity', 0), this.safeInteger (order, 'quantity_scale', 0));
        const filled = this.convertFromScale (this.safeInteger (order, 'cumQty', 0), this.safeInteger (order, 'cumQty_scale', 0));
        const remaining = this.convertFromScale (this.safeInteger (order, 'leavesQty', 0), this.safeInteger (order, 'leavesQty_scale', 0));
        const average = this.convertFromScale (this.safeInteger (order, 'price', 0), this.safeInteger (order, 'price_scale', 0));
        let cost = undefined;
        if (filled !== 0) {
            if (average > 0) {
                cost = average * filled;
            } else if (price > 0) {
                cost = price * filled;
            }
        }
        if (price <= 0) {
            price = average;
        }
        let currencyCode = undefined;
        const currencyId = this.safeInteger (order, 'feeInstrumentId');
        if (currencyId !== undefined) {
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            if (currency !== undefined) {
                currencyCode = currency['code'];
            }
        }
        let feeTotal = undefined;
        if (this.safeInteger (order, 'feeTotal') !== undefined && this.safeInteger (order, 'fee_scale') !== undefined) {
            feeTotal = this.convertFromScale (this.safeInteger (order, 'feeTotal'), this.safeInteger (order, 'fee_scale'));
        }
        const fee = {                         // fee info, if available
            'currency': currencyCode,        // which currency the fee is (usually quote)
            'cost': feeTotal,           // the fee amount in that currency
            'rate': undefined,           // the fee rate (if available)
        };
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clOrdId');
        const type = this.parseOrderType (this.safeStringLower (order, 'ordType'));
        const side = this.parserOrderSide (this.safeStringLower (order, 'side'));
        const trades = this.parseTrades (this.safeValue (order, 'trades', []));
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = undefined;
        let datetime = undefined;
        let open = undefined;
        let high = undefined;
        let low = undefined;
        let close = undefined;
        // let volume = undefined;
        if (ticker !== undefined) {
            timestamp = ticker[0];
            datetime = this.iso8601 (timestamp);
            open = this.convertFromScale (ticker[1], market['precision']['price']);
            high = this.convertFromScale (ticker[2], market['precision']['price']);
            low = this.convertFromScale (ticker[3], market['precision']['price']);
            close = this.convertFromScale (ticker[4], market['precision']['price']);
            // volume = this.convertToScale (chart[5], market['precision']['amount'])
        }
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': datetime,
            'bid': undefined,
            'ask': undefined,
            'last': close,
            'high': high,
            'low': low,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    isOpenOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const leavesQty = this.safeValue (order, 'leavesQty');
        const ordType = this.safeValue (order, 'ordType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        if (execType === 'F' && leavesQty !== 0 && ordType !== '1') {
            conditionOne = true;
        }
        if (execType !== 'F' && execType !== '4' && execType !== '8' && execType !== 'B' && execType !== 'C' && ordType !== '1') {
            conditionTwo = true;
        }
        if ((conditionOne || conditionTwo) && ordStatus !== '8') {
            return true;
        } else {
            return false;
        }
    }

    isClosedOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const ordType = this.safeValue (order, 'ordType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        const cumQty = this.safeValue (order, 'cumQty');
        if (execType !== '4' && execType !== '8' && ordStatus !== '8' && ordType === '1') {
            conditionOne = true;
        }
        if (execType === 'F' || execType === 'B' || execType === 'C') {
            conditionTwo = true;
        }
        if (conditionOne || (conditionTwo && cumQty !== 0)) {
            return true;
        } else {
            return false;
        }
    }

    isCancelledOrder (order) {
        let conditionOne = false;
        let conditionTwo = false;
        const execType = this.safeValue (order, 'execType');
        const ordStatus = this.safeValue (order, 'ordStatus');
        const cumQty = this.safeValue (order, 'cumQty');
        if (execType === '4' || execType === '8' || ordStatus === '8') {
            conditionOne = true;
        }
        if ((execType === 'B' || execType === 'C') && cumQty === 0) {
            conditionTwo = true;
        }
        if (conditionOne || conditionTwo) {
            return true;
        } else {
            return false;
        }
    }

    parseOrderStatus (order) {
        if (this.isOpenOrder (order)) {
            return 'open';
        } else if (this.isClosedOrder (order)) {
            return 'closed';
        } else if (this.isCancelledOrder (order)) {
            return 'canceled';
        } else {
            return undefined;
        }
        // const statuses = {
        //     '0': 'open',
        //     '1': 'partially filled',
        //     '2': 'filled',
        //     '3': 'done for day',
        //     '4': 'cancelled',
        //     '5': 'replaced',
        //     '6': 'pending cancel',
        //     '7': 'stopped',
        //     '8': 'rejected',
        //     '9': 'suspended',
        //     'A': 'pending New',
        //     'B': 'calculated',
        //     'C': 'expired',
        //     'D': ' accepted for bidding',
        //     'E': 'pending Replace',
        //     'F': 'trade', // (partial fill or fill)
        // };
        // return this.safeString (statuses, status, status);
    }

    parserOrderSide (side) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseOrderType (type) {
        const types = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stop limit',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'transactionId');
        const datetime = this.convertToISO8601Date (this.safeString (transaction, 'timestamp', ' '));
        const timestamp = this.parse8601 (datetime);
        const address = this.safeString (transaction, 'address');
        const type = this.safeString (transaction, 'type');
        const amount = this.safeFloat (transaction, 'balance_change');
        const code = this.safeString (transaction, 'symbol');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,    // the JSON response from the exchange as is
            'id': id,    // exchange-specific transaction id, string
            'txid': txid,
            'timestamp': timestamp,             // timestamp in milliseconds
            'datetime': datetime, // ISO8601 string of the timestamp
            'addressFrom': undefined, // sender
            'address': address, // "from" or "to"
            'addressTo': undefined, // receiver
            'tagFrom': undefined, // "tag" or "memo" or "payment_id" associated with the sender
            'tag': undefined, // "tag" or "memo" or "payment_id" associated with the address
            'tagTo': undefined, // "tag" or "memo" or "payment_id" associated with the receiver
            'type': type,   // or 'withdrawal', string
            'amount': amount,     // float (does not include the fee)
            'currency': code,       // a common unified currency code, string
            'status': status,   // 'ok', 'failed', 'canceled', string
            'updated': undefined,  // UTC timestamp of most recent status change in ms
            'comment': undefined,
            'fee': {                 // the entire fee structure may be undefined
                'currency': undefined,   // a unified fee currency code
                'cost': undefined,      // float
                'rate': undefined,   // approximately, fee['cost'] / amount, float
            },
        };
    }

    parseLedgerEntry (entry, currency = undefined) {
        const id = this.safeString (entry, 'reportid');
        const currencyId = this.safeInteger (entry, 'instrumentId1');
        const referenceId = this.safeString (entry, 'transactionid');
        const timestamp = this.safeInteger (entry, 'publishtime');
        const txnType = this.safeString (entry, 'txnType');
        const execId = this.safeInteger (entry, 'execId');
        const orderId = this.safeInteger (entry, 'orderId');
        const type = this.parseLedgerEntryType (txnType, execId, orderId);
        let currencyCode = undefined;
        let direction = undefined;
        let amount = 0;
        let before = 0;
        let after = 0;
        if (currencyId !== undefined) {
            const currency = this.currencies_by_id[currencyId];
            if (currency !== undefined) {
                currencyCode = currency['code'];
                amount = this.convertFromScale (this.safeInteger (entry, 'change1', 0), currency['precision']);
                after = this.convertFromScale (this.safeInteger (entry, 'qty1', 0), currency['precision']);
            }
            before = after - amount;
            if (amount < 0) {
                direction = 'out';
                amount = -amount;
            } else {
                direction = 'in';
            }
        }
        return {
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': currencyCode,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': after,
            'status': 'ok',
            'fee': undefined,
            'info': entry,
        };
    }

    parseLedgerEntryType (type, execId, orderId) {
        if ((execId > 0 && orderId > 0) || type === '4019') {
            return 'trade';
        }
        const types = {
            '4011': 'deposit', // TX_DEPOSIT
            '4012': 'withdraw', // TX_WITHDRAW
            '4013': 'deposit', // TX_ADMIN_DEPOSIT
            '4014': 'withdraw', // TX_ADMIN_WITHDRAW
            '4015': 'fee', // TX_FEE
            '4016': 'transaction', // TX_ADJUSTMENT
            '4017': 'transaction', // TX_INVEST_FUND
            '4018': 'transaction', // TX_DIVEST_FUND
            '4019': 'transaction', // TX_TRADE_FILL
            '4020': 'transaction', // TX_FUNDING_RATE
            '4021': 'transaction', // TX_RESTAT
            '4022': 'transaction', // TX_COLLATERAL_SWAP
            '4023': 'transaction', // TX_COLLATRAL_SWAP_ADJ
            '4024': 'transaction', // TX_ADMIN_WITHDRAW_REJECTED
            '4025': 'transaction', // TX_FROM_BANKRUPT_REMAINDER
            '4026': 'transaction', // TX_TO_BANKRUPT_REMAINDER
            '4027': 'transaction', // TX_BALANCE_ADMIN_INVALID_USER_REJECTED
            '4028': 'transaction', // TX_EXPIRE_SETTLED
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status) {
        return status;
    }

    toMilliseconds (dateString) {
        if (dateString === undefined) {
            return dateString;
        }
        // '20200328-10:31:01.575' -> '2020-03-28 12:42:48.000'
        const splits = dateString.split ('-');
        const partOne = this.safeString (splits, 0);
        const partTwo = this.safeString (splits, 1);
        if (partOne === undefined || partTwo === undefined) {
            return undefined;
        }
        if (partOne.length !== 8) {
            return undefined;
        }
        const date = partOne.slice (0, 4) + '-' + partOne.slice (4, 6) + '-' + partOne.slice (6, 8);
        return this.parse8601 (date + ' ' + partTwo);
    }

    convertFromScale (number, scale) {
        return this.fromWei (number, scale);
    }

    getScale (num) {
        const s = this.numberToString (num);
        return this.precisionFromString (s);
    }

    convertToScale (number, scale) {
        return parseInt (this.toWei (number, scale));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            // const format = this.safeValue (params, '_format');
            // if (format !== undefined) {
            //     query += '?' + this.urlencode (format);
            //     // params = this.omit (params, '_format');
            // }
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend (query, {
                'userId': this.uid,
                'nonce': nonce,
            });
            params['nonce'] = this.nonce ();
            body = this.json (query);
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'application/json',
                'requestToken': this.apiKey,
                'signature': signature,
            };
        }
        url = this.urls['api'][api] + '/' + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
