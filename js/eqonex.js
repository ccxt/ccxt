'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class eqonex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'eqonex',
            'name': 'EQONEX',
            'countries': [ 'US', 'SG' ], // United States, Singapore
            'rateLimit': 10,
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': undefined,
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
                'logo': 'https://user-images.githubusercontent.com/51840849/122649755-1a076c80-d138-11eb-8f2e-9a9166a03d79.jpg',
                'test': {
                    'public': 'https://testnet.eqonex.com/api',
                    'private': 'https://testnet.eqonex.com/api',
                },
                'api': {
                    'public': 'https://eqonex.com/api',
                    'private': 'https://eqonex.com/api',
                },
                'www': 'https://eqonex.com',
                'doc': [
                    'https://developer.eqonex.com',
                ],
                'referral': 'https://eqonex.com?referredByCode=zpa8kij4ouvBFup3',
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
            'exceptions': {
                'broad': {
                    'symbol not found': BadSymbol,
                },
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
        const id = this.safeString (market, 'instrumentId');
        const uppercaseId = this.safeString (market, 'symbol');
        const assetType = this.safeString (market, 'assetType');
        const spot = (assetType === 'PAIR');
        const swap = (assetType === 'PERPETUAL_SWAP');
        const type = swap ? 'swap' : 'spot';
        const baseId = this.safeString (market, 'currency');
        const quoteId = this.safeString (market, 'contAmtCurr');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = swap ? uppercaseId : (base + '/' + quote);
        const status = this.safeInteger (market, 'securityStatus');
        const active = (status === 1);
        const precision = {
            'amount': this.safeInteger (market, 'quantity_scale'),
            'price': this.safeInteger (market, 'price_scale'),
        };
        return {
            'id': id,
            'uppercaseId': uppercaseId,
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
                    'min': this.safeNumber (market, 'minTradeVol'),
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
        const id = this.safeString (currency, 0);
        const uppercaseId = this.safeString (currency, 1);
        const code = this.safeCurrencyCode (uppercaseId);
        const priceScale = this.safeInteger (currency, 2);
        const amountScale = this.safeInteger (currency, 3);
        const precision = Math.max (priceScale, amountScale);
        const name = this.safeString (currency, 6);
        const status = this.safeInteger (currency, 4);
        const active = (status === 1);
        const fee = this.safeNumber (currency, 5); // withdraw_fee
        return {
            'id': id,
            'info': currency,
            'uppercaseId': uppercaseId,
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
            'pairId': parseInt (market['id']),
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
        const open = this.parseNumber (this.convertFromScale (this.safeString (ohlcv, 1), market['precision']['price']));
        const high = this.parseNumber (this.convertFromScale (this.safeString (ohlcv, 2), market['precision']['price']));
        const low = this.parseNumber (this.convertFromScale (this.safeString (ohlcv, 3), market['precision']['price']));
        const close = this.parseNumber (this.convertFromScale (this.safeString (ohlcv, 4), market['precision']['price']));
        const volume = this.parseNumber (this.convertFromScale (this.safeString (ohlcv, 5), market['precision']['amount']));
        return [timestamp, open, high, low, close, volume];
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, market = undefined) {
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' parseBidAsk() requires a market argument');
        }
        const priceString = this.safeString (bidask, priceKey);
        const amountString = this.safeString (bidask, amountKey);
        return [
            this.parseNumber (this.convertFromScale (priceString, market['precision']['price'])),
            this.parseNumber (this.convertFromScale (amountString, market['precision']['amount'])),
        ];
    }

    parseOrderBook (orderbook, symbol, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
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
            'pairId': parseInt (market['id']),
        };
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
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 0, 1, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairId': parseInt (market['id']),
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
        //     {
        //         "account":3583,
        //         "commission":"-0.015805",
        //         "commCurrency":"USDC",
        //         "execId":265757,
        //         "ordType":"2",
        //         "ordStatus":"2",
        //         "execType":"F",
        //         "aggressorIndicator":true,
        //         "orderId":388953019,
        //         "price":"1842.04",
        //         "qty":"0.010000",
        //         "lastPx":"1756.22",
        //         "avgPx":"1756.22",
        //         "cumQty":"0.010000",
        //         "quoteQty":"0.010000",
        //         "side":"BUY",
        //         "symbol":"ETH/USDC",
        //         "clOrdId":"1613106766970339107",
        //         "submitterId":3583,
        //         "targetStrategy":"0",
        //         "time":1613106766971,
        //         "date":"20210212-05:12:46.971"
        //     }
        //
        let id = undefined;
        let timestamp = undefined;
        let orderId = undefined;
        let type = undefined;
        let side = undefined;
        let priceString = undefined;
        let amountString = undefined;
        let fee = undefined;
        let symbol = undefined;
        if (Array.isArray (trade)) {
            id = this.safeString (trade, 3);
            priceString = this.convertFromScale (this.safeString (trade, 0), market['precision']['price']);
            amountString = this.convertFromScale (this.safeString (trade, 1), market['precision']['amount']);
            timestamp = this.toMilliseconds (this.safeString (trade, 2));
            const takerSide = this.safeInteger (trade, 4);
            if (takerSide === 1) {
                side = 'buy';
            } else if (takerSide === 2) {
                side = 'sell';
            }
        } else {
            id = this.safeString (trade, 'execId');
            timestamp = this.safeInteger (trade, 'time');
            const marketId = this.safeString (trade, 'symbol');
            symbol = this.safeSymbol (marketId, market);
            orderId = this.safeString (trade, 'orderId');
            side = this.safeStringLower (trade, 'side');
            type = this.parseOrderType (this.safeString (trade, 'ordType'));
            priceString = this.safeString (trade, 'lastPx');
            amountString = this.safeString (trade, 'qty');
            let feeCostString = this.safeString (trade, 'commission');
            if (feeCostString !== undefined) {
                feeCostString = Precise.stringNeg (feeCostString);
                const feeCurrencyId = this.safeString (trade, 'commCurrency');
                const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
                fee = {
                    'cost': feeCostString,
                    'currency': feeCurrencyCode,
                };
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
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
                const quantityString = this.safeString (position, 'quantity');
                const availableQuantityString = this.safeString (position, 'availableQuantity');
                const scale = this.safeInteger (position, 'quantity_scale');
                const account = this.account ();
                account['free'] = this.convertFromScale (availableQuantityString, scale);
                account['total'] = this.convertFromScale (quantityString, scale);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 1 : 2;
        const quantityScale = this.getScale (amount);
        const request = {
            // 'id': 0,
            // 'account': 0, // required for institutional users
            'instrumentId': parseInt (market['id']),
            'symbol': market['uppercaseId'],
            // 'clOrdId': '',
            'side': orderSide, // 1 = buy, 2 = sell
            // 'ordType': 1, // 1 = market, 2 = limit, 3 = stop market, 4 = stop limit
            // 'price': this.priceToPrecision (symbol, price), // required for limit and stop limit orders
            // 'price_scale': this.getScale (price),
            'quantity': this.convertToScale (this.numberToString (amount), quantityScale),
            'quantity_scale': quantityScale,
            // 'stopPx': this.priceToPrecision (symbol, stopPx),
            // 'stopPx_scale': this.getScale (stopPx),
            // 'targetStrategy': 0,
            // 'isHidden': false,
            // 'timeInForce': 1, // 1 = Good Till Cancel (GTC), 3 = Immediate or Cancel (IOC), 4 = Fill or Kill (FOK), 5 = Good Till Crossing (GTX), 6 = Good Till Date (GTD)
            // 'interval': 0,
            // 'intervalCount': 0,
            // 'intervalDelay': 0,
            // 'price2': 0,
            // 'price2_scale': this.getScale (price2),
            // 'blockWaitAck': 0, // 1 = wait for order acknowledgement, when set, response will include the matching engine "orderId" field
        };
        if (type === 'market') {
            request['ordType'] = 1;
        } else if (type === 'limit') {
            request['ordType'] = 2;
            const priceScale = this.getScale (price);
            request['price'] = this.convertToScale (this.numberToString (price), priceScale);
            request['priceScale'] = priceScale;
        } else {
            const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stopPx');
            params = this.omit (params, [ 'stopPrice', 'stopPx' ]);
            if (stopPrice === undefined) {
                if (type === 'stop') {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument or a stopPrice parameter or a stopPx parameter for ' + type + ' orders');
                    }
                    request['ordType'] = 3;
                    request['stopPx'] = this.convertToScale (this.numberToString (price), this.getScale (price));
                } else if (type === 'stop limit') {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPrice parameter or a stopPx parameter for ' + type + ' orders');
                }
            } else {
                if (type === 'stop') {
                    request['ordType'] = 3;
                    request['stopPx'] = this.convertToScale (this.numberToString (stopPrice), this.getScale (stopPrice));
                } else if (type === 'stop limit') {
                    request['ordType'] = 4;
                    const priceScale = this.getScale (price);
                    const stopPriceScale = this.getScale (stopPrice);
                    request['price_scale'] = priceScale;
                    request['stopPx_scale'] = stopPriceScale;
                    request['stopPx'] = this.convertToScale (this.numberToString (stopPrice), stopPriceScale);
                    request['price'] = this.convertToScale (this.numberToString (price), priceScale);
                }
            }
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "status":"sent",
        //         "id":385617863,
        //         "instrumentId":53,
        //         "clOrdId":"1613037510849637345",
        //         "userId":3583,
        //         "price":2000,
        //         "quantity":200,
        //         "ordType":2
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'origOrderId': parseInt (id),
            'instrumentId': parseInt (market['id']),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //     {
        //         "status":"sent",
        //         "id":0,
        //         "origOrderId":385613629,
        //         "instrumentId":53,
        //         "userId":3583,
        //         "price":0,
        //         "quantity":0,
        //         "ordType":0
        //     }
        //
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderSide = (side === 'buy') ? 1 : 2;
        const quantityScale = this.getScale (amount);
        const request = {
            // 'id': 0,
            'origOrderId': id,
            // 'account': 0, // required for institutional users
            'instrumentId': parseInt (market['id']),
            'symbol': market['uppercaseId'],
            // 'clOrdId': '',
            'side': orderSide, // 1 = buy, 2 = sell
            // 'ordType': 1, // 1 = market, 2 = limit, 3 = stop market, 4 = stop limit
            // 'price': this.priceToPrecision (symbol, price), // required for limit and stop limit orders
            // 'price_scale': this.getScale (price),
            'quantity': this.convertToScale (this.numberToString (amount), quantityScale),
            'quantity_scale': quantityScale,
            // 'stopPx': this.priceToPrecision (symbol, stopPx),
            // 'stopPx_scale': this.getScale (stopPx),
            // 'timeInForce': 1, // 1 = Good Till Cancel (GTC), 3 = Immediate or Cancel (IOC), 4 = Fill or Kill (FOK), 5 = Good Till Crossing (GTX), 6 = Good Till Date (GTD)
        };
        if (type === 'market') {
            request['ordType'] = 1;
        } else if (type === 'limit') {
            request['ordType'] = 2;
            request['price'] = this.convertToScale (this.numberToString (price), this.getScale (price));
        } else {
            const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stopPx');
            params = this.omit (params, [ 'stopPrice', 'stopPx' ]);
            if (stopPrice === undefined) {
                if (type === 'stop') {
                    if (price === undefined) {
                        throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument or a stopPrice parameter or a stopPx parameter for ' + type + ' orders');
                    }
                    request['ordType'] = 3;
                    request['stopPx'] = this.convertToScale (this.numberToString (price), this.getScale (price));
                } else if (type === 'stop limit') {
                    throw new ArgumentsRequired (this.id + ' editOrder() requires a stopPrice parameter or a stopPx parameter for ' + type + ' orders');
                }
            } else {
                if (type === 'stop') {
                    request['ordType'] = 3;
                    request['stopPx'] = this.convertToScale (this.numberToString (stopPrice), this.getScale (stopPrice));
                } else if (type === 'stop limit') {
                    request['ordType'] = 4;
                    const priceScale = this.getScale (price);
                    const stopPriceScale = this.getScale (stopPrice);
                    request['price_scale'] = priceScale;
                    request['stopPx_scale'] = stopPriceScale;
                    request['stopPx'] = this.convertToScale (this.numberToString (stopPrice), stopPriceScale);
                    request['price'] = this.convertToScale (this.numberToString (price), priceScale);
                }
            }
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "status":"sent",
        //         "id":385617863,
        //         "instrumentId":53,
        //         "clOrdId":"1613037510849637345",
        //         "userId":3583,
        //         "price":2000,
        //         "quantity":200,
        //         "ordType":2
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privatePostGetOrderStatus (this.extend (request, params));
        //
        //     {
        //         "orderId":388953019,
        //         "clOrdId":"1613106766970339107",
        //         "symbol":"ETH/USDC",
        //         "instrumentId":53,
        //         "side":"1",
        //         "userId":3583,
        //         "account":3583,
        //         "execType":"F",
        //         "ordType":"2",
        //         "ordStatus":"2",
        //         "timeInForce":"3",
        //         "timeStamp":"20210212-05:12:46.971",
        //         "execId":265757,
        //         "targetStrategy":0,
        //         "isHidden":false,
        //         "isReduceOnly":false,
        //         "isLiquidation":false,
        //         "fee":0,
        //         "fee_scale":6,
        //         "feeInstrumentId":1,
        //         "price":184204,
        //         "price_scale":2,
        //         "quantity":10000,
        //         "quantity_scale":6,
        //         "leavesQty":0,
        //         "leavesQty_scale":6,
        //         "cumQty":10000,
        //         "cumQty_scale":6,
        //         "lastPx":175622,
        //         "lastPx_scale":2,
        //         "avgPx":175622,
        //         "avgPx_scale":2,
        //         "lastQty":10000,
        //         "lastQty_scale":6
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'ordStatus': '2', // '0' = New, '1' = Partially filled, '2' = Filled, '4' = Cancelled, '8' = Rejected, 'C' = Expired
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'ordStatus': '4', // '0' = New, '1' = Partially filled, '2' = Filled, '4' = Cancelled, '8' = Rejected, 'C' = Expired
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'account': id, // for institutional users
            // 'symbol': marketSymbol, // cannot be used with instrumentId
            // 'instrumentId': market['numericId'],
            // 'limit': limit,
            // 'execType': execType, // '0' = New, '4' = Canceled, '5' = Replace, '8' = Rejected, 'C' = Expired, 'F' = Fill Status, 'I' = Order Status
            // 'ordStatus': ordStatus, // '0' = New, '1' = Partially filled, '2' = Filled, '4' = Cancelled, '8' = Rejected, 'C' = Expired
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = parseInt (market['id']);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostGetOrders (this.extend (request, params));
        //
        //     {
        //         "isInitialSnap":false,
        //         "orders":[
        //             {
        //                 "orderId":385613629,
        //                 "orderUpdateSeq":1,
        //                 "clOrdId":"1613037448945798198",
        //                 "symbol":"ETH/USDC",
        //                 "instrumentId":53,
        //                 "side":"1",
        //                 "userId":3583,
        //                 "account":3583,
        //                 "execType":"4",
        //                 "ordType":"2",
        //                 "ordStatus":"C",
        //                 "timeInForce":"3",
        //                 "timeStamp":"20210211-09:57:28.944",
        //                 "execId":0,
        //                 "targetStrategy":0,
        //                 "isHidden":false,
        //                 "isReduceOnly":false,
        //                 "isLiquidation":false,
        //                 "fee":0,
        //                 "feeTotal":0,
        //                 "fee_scale":0,
        //                 "feeInstrumentId":0,
        //                 "price":999,
        //                 "price_scale":2,
        //                 "quantity":10000000,
        //                 "quantity_scale":6,
        //                 "leavesQty":10000000,
        //                 "leavesQty_scale":6,
        //                 "cumQty":0,
        //                 "cumQty_scale":0,
        //                 "lastPx":0,
        //                 "lastPx_scale":2,
        //                 "avgPx":0,
        //                 "avgPx_scale":0,
        //                 "lastQty":0,
        //                 "lastQty_scale":6
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'account': 123, // for institutional users
            // 'instrumentId': market['id'],
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privatePostUserTrades (this.extend (request, params));
        //
        //     {
        //         "trades":[
        //             {
        //                 "account":3583,
        //                 "commission":"-0.015805",
        //                 "commCurrency":"USDC",
        //                 "execId":265757,
        //                 "ordType":"2",
        //                 "ordStatus":"2",
        //                 "execType":"F",
        //                 "aggressorIndicator":true,
        //                 "orderId":388953019,
        //                 "price":"1842.04",
        //                 "qty":"0.010000",
        //                 "lastPx":"1756.22",
        //                 "avgPx":"1756.22",
        //                 "cumQty":"0.010000",
        //                 "quoteQty":"0.010000",
        //                 "side":"BUY",
        //                 "symbol":"ETH/USDC",
        //                 "clOrdId":"1613106766970339107",
        //                 "submitterId":3583,
        //                 "targetStrategy":"0",
        //                 "time":1613106766971,
        //                 "date":"20210212-05:12:46.971"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'instrumentId': parseInt (currency['id']),
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
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['instrumentId'] = parseInt (currency['id']);
        }
        const response = await this.privatePostGetDepositHistory (this.extend (request, params));
        //
        //     {
        //         "deposits":[
        //             {
        //                 "id":4309,
        //                 "instrumentId":1,
        //                 "userId":3583,
        //                 "symbol":"USDC",
        //                 "address":"null",
        //                 "timestamp":"1613021112189",
        //                 "status":1,
        //                 "balance":0.0,
        //                 "balance_change":100.0,
        //                 "confirms":1,
        //                 "transactionId":"caba4500-489f-424e-abd7-b4dabc09a800"
        //             }
        //         ]
        //     }
        //
        const deposits = this.safeValue (response, 'deposits', []);
        return this.parseTransactions (deposits, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['instrumentId'] = parseInt (currency['id']);
        }
        const response = await this.privatePostGetWithdrawRequests (this.extend (request, params));
        //
        //     {
        //         "addresses":[
        //             {
        //                 "id":3841,
        //                 "instrumentId":3,
        //                 "userId":4245,
        //                 "symbol":"BTC",
        //                 "address":"XXXXXYYYYYZZZZZ",
        //                 "timestamp":"20200806-11:04:35.053",
        //                 "status":0,
        //                 "balance":1,
        //                 "balance_scale":3,
        //                 "confirms":0,
        //                 "transactionId":"null"
        //             }
        //         ]
        //     }
        //
        const withdrawals = this.safeValue (response, 'addresses', []);
        return this.parseTransactions (withdrawals, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits, fetchWithdrawals
        //
        //     {
        //         "id":4309,
        //         "instrumentId":1,
        //         "userId":3583,
        //         "symbol":"USDC",
        //         "address":"null",
        //         "timestamp":"1613021112189",
        //         "status":1,
        //         "balance":0.0,
        //         "balance_change":100.0,
        //         "confirms":1,
        //         "transactionId":"caba4500-489f-424e-abd7-b4dabc09a800"
        //     }
        //
        // withdraw
        //
        //     {
        //         "instrumentId": 1,
        //         "userId": 23750,
        //         "symbol": "USDC",
        //         "timestamp": "20200201-05:37:16.584",
        //         "status": 1,
        //         "userUuid": "b9e33713-c28f-468f-99bd-f6deab0dd854",
        //         "currencyCode": "USDC",
        //         "address": "2MvW97yT6E2Kq8bWc1aj1DqfbgMzjRNk2LE",
        //         "quantity": 20,
        //         "requestUuid": "56782b34-8a78-4f5f-b164-4b8f7d583b7f",
        //         "transactionUuid": "1004eb0f-41e1-41e9-9d48-8eefcc6c09f2",
        //         "transactionId": "WS23436",
        //         "destinationWalletAlias": "Test",
        //         "quantity_scale": 0
        //     }
        //
        const id = this.safeString (transaction, 'id', 'transactionId');
        const txid = this.safeString (transaction, 'transactionUuid');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        let address = this.safeString (transaction, 'address');
        if (address === 'null') {
            address = undefined;
        }
        const type = this.safeString (transaction, 'type');
        let amount = this.safeNumber (transaction, 'balance_change');
        if (amount === undefined) {
            amount = this.safeString (transaction, 'quantity');
            const amountScale = this.safeInteger (transaction, 'quantity_scale');
            amount = this.parseNumber (this.convertFromScale (amount, amountScale));
        }
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const scale = this.getScale (amount);
        const quantity = this.convertToScale (amount, scale);
        const request = {
            'instrumentId': parseInt (currency['id']),
            'symbol': currency['uppercaseId'],
            'quantity': quantity,
            'quantity_scale': scale,
            'address': address,
        };
        const response = await this.privatePostSendWithdrawRequest (this.extend (request, params));
        //
        //     {
        //         "instrumentId": 1,
        //         "userId": 23750,
        //         "symbol": "USDC",
        //         "timestamp": "20200201-05:37:16.584",
        //         "status": 1,
        //         "userUuid": "b9e33713-c28f-468f-99bd-f6deab0dd854",
        //         "currencyCode": "USDC",
        //         "address": "2MvW97yT6E2Kq8bWc1aj1DqfbgMzjRNk2LE",
        //         "quantity": 20,
        //         "requestUuid": "56782b34-8a78-4f5f-b164-4b8f7d583b7f",
        //         "transactionUuid": "1004eb0f-41e1-41e9-9d48-8eefcc6c09f2",
        //         "transactionId": "WS23436",
        //         "destinationWalletAlias": "Test",
        //         "quantity_scale": 0
        //     }
        //
        return this.parseTransaction (response, currency);
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
                taker[tradingFee['tier']] = this.safeNumber (tradingFee, 'taker');
                maker[tradingFee['tier']] = this.safeNumber (tradingFee, 'maker');
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

    parseOrder (order, market = undefined) {
        //
        // createOrder, editOrder, cancelOrder
        //
        //     {
        //         "status":"sent",
        //         "id":385617863,
        //         "instrumentId":53,
        //         "clOrdId":"1613037510849637345",
        //         "userId":3583,
        //         "price":2000,
        //         "quantity":200,
        //         "ordType":2
        //     }
        //
        // fetchOrders, fetchOrder
        //
        //     {
        //         "orderId":385613629,
        //         "orderUpdateSeq":1,
        //         "clOrdId":"1613037448945798198",
        //         "symbol":"ETH/USDC",
        //         "instrumentId":53,
        //         "side":"1",
        //         "userId":3583,
        //         "account":3583,
        //         "execType":"4",
        //         "ordType":"2",
        //         "ordStatus":"C",
        //         "timeInForce":"3",
        //         "timeStamp":"20210211-09:57:28.944",
        //         "execId":0,
        //         "targetStrategy":0,
        //         "isHidden":false,
        //         "isReduceOnly":false,
        //         "isLiquidation":false,
        //         "fee":0,
        //         "feeTotal":0,
        //         "fee_scale":0,
        //         "feeInstrumentId":0,
        //         "price":999,
        //         "price_scale":2,
        //         "quantity":10000000,
        //         "quantity_scale":6,
        //         "leavesQty":10000000,
        //         "leavesQty_scale":6,
        //         "cumQty":0,
        //         "cumQty_scale":0,
        //         "lastPx":0,
        //         "lastPx_scale":2,
        //         "avgPx":0,
        //         "avgPx_scale":0,
        //         "lastQty":0,
        //         "lastQty_scale":6
        //     }
        //
        let id = this.safeString2 (order, 'orderId', 'id');
        id = this.safeString (order, 'origOrderId', id);
        const clientOrderId = this.safeString (order, 'clOrdId');
        const type = this.parseOrderType (this.safeString (order, 'ordType'));
        const side = this.parseOrderSide (this.safeString (order, 'side'));
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const marketId = this.safeString (order, 'instrumentId');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.toMilliseconds (this.safeString (order, 'timeStamp'));
        const lastTradeTimestamp = undefined;
        let priceString = this.safeString (order, 'price');
        const priceScale = this.safeInteger (order, 'price_scale');
        priceString = this.convertFromScale (priceString, priceScale);
        let amountString = this.safeString (order, 'quantity');
        const amountScale = this.safeInteger (order, 'quantity_scale');
        amountString = this.convertFromScale (amountString, amountScale);
        let filledString = this.safeString (order, 'cumQty');
        const filledScale = this.safeInteger (order, 'cumQty_scale');
        filledString = this.convertFromScale (filledString, filledScale);
        let remainingString = this.safeString (order, 'leavesQty');
        const remainingScale = this.safeInteger (order, 'leavesQty_scale');
        remainingString = this.convertFromScale (remainingString, remainingScale);
        let fee = undefined;
        const currencyId = this.safeInteger (order, 'feeInstrumentId');
        const feeCurrencyCode = this.safeCurrencyCode (currencyId);
        let feeCostString = undefined;
        let feeCost = this.safeString (order, 'feeTotal');
        const feeScale = this.safeInteger (order, 'fee_scale');
        if (feeCost !== undefined) {
            feeCost = Precise.stringNeg (feeCost);
            feeCostString = this.convertFromScale (feeCost, feeScale);
        }
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrencyCode,
                'cost': feeCostString,
                'rate': undefined,
            };
        }
        let timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        if (timeInForce === '0') {
            timeInForce = undefined;
        }
        const stopPriceScale = this.safeInteger (order, 'stopPx_scale', 0);
        const stopPrice = this.parseNumber (this.convertFromScale (this.safeString (order, 'stopPx'), stopPriceScale));
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': priceString,
            'stopPrice': stopPrice,
            'amount': amountString,
            'cost': undefined,
            'average': undefined,
            'filled': filledString,
            'remaining': remainingString,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // 'partially filled',
            '2': 'closed', // 'filled',
            '3': 'open', // 'done for day',
            '4': 'canceled',
            '5': 'canceled', // 'replaced',
            '6': 'canceling', // 'pending cancel',
            '7': 'canceled', // 'stopped',
            '8': 'rejected', // 'rejected',
            '9': 'canceled', // 'suspended',
            'A': 'open', // 'pending new',
            'B': 'open', // 'calculated',
            'C': 'expired',
            'D': 'open', // 'accepted for bidding',
            'E': 'canceling', // 'pending replace',
            'F': 'open', // 'partial fill or fill',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (side) {
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

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            '1': 'GTC', // Good Till Canceled
            '3': 'IOC', // Immediate or Cancel
            '4': 'FOK', // Fill or Kill
            '5': 'GTX', // Good Till Crossing (GTX)
            '6': 'GTD', // Good Till Date
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
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
        if ((number === undefined) || (scale === undefined)) {
            return undefined;
        }
        const precise = new Precise (number);
        precise.decimals = precise.decimals + scale;
        precise.reduce ();
        return precise.toString ();
    }

    getScale (num) {
        const s = this.numberToString (num);
        return this.precisionFromString (s);
    }

    convertToScale (number, scale) {
        if ((number === undefined) || (scale === undefined)) {
            return undefined;
        }
        const precise = new Precise (number);
        precise.decimals = precise.decimals - scale;
        precise.reduce ();
        const preciseString = precise.toString ();
        return parseInt (preciseString);
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, error, feedback);
            this.throwBroadlyMatchedException (this.exceptions, body, feedback);
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            // special case for getUserHistory
            const format = this.safeValue (params, 'format');
            const type = this.safeValue (params, 'type');
            const extension = {};
            if (format !== undefined) {
                extension['format'] = format;
            }
            if (type !== undefined) {
                extension['type'] = type;
            }
            if (Object.keys (extension).length) {
                url += '?' + this.urlencode (extension);
            }
            params = this.omit (params, [ 'format', 'type' ]);
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
